// calc.js のテスト。期待値は出典資料に載っている計算例そのもの。
// 実行方法: python tests/run_tests.py
(function (root) {
    const C = root.FertCalc;
    const D = root.FERT_DATA;
    const results = [];
    const near = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol);
    function test(name, fn) {
        try { fn(); results.push({ name, ok: true }); }
        catch (e) { results.push({ name, ok: false, msg: String(e && e.message || e) }); }
    }
    function eq(actual, expected, tol, label) {
        const ok = (typeof expected === 'number') ? near(actual, expected, tol) : actual === expected;
        if (!ok) throw new Error(`${label || ''} expected ${expected}, got ${actual}`);
    }

    const soilBlank = { ph: NaN, ec: NaN, cao: NaN, mgo: NaN, k2o: NaN, p2o5: NaN, cec: NaN, no3n: NaN, nh4n: NaN };
    const soil = (o) => Object.assign({}, soilBlank, o);
    const other = D.soilTypes.find(s => s.id === 'other');

    // ---- 出典の計算例 ----
    test('[埼玉R7 p.12] 窒素: 作土深15cm・仮比重1.1・無機態N 5mg → 3.3kg/10a', () => {
        const r = C.residualNitrogen(soil({ no3n: 5 }), C.conversionFactor(15, 1.1), 'alluvial');
        eq(r.kg, 3.3, 1e-9);
    });
    test('[埼玉R7 p.13] リン酸: 基準18kg・有効態リン酸150mg → 40%減肥で10.8kg', () => {
        const r = C.design({ basal: { n: 0, p: 18, k: 0 } }, soil({ p2o5: 150 }), { depth: 15, bd: 1, soilType: other }, null);
        eq(r.p.rate, 0.4); eq(r.p.design, 10.8, 1e-9);
    });
    test('[埼玉R7 p.13] 加里: CEC16・作土深10cm・仮比重1・交換性カリ50mg・基準12kg → 6kg', () => {
        const r = C.design({ basal: { n: 0, p: 0, k: 12 } }, soil({ k2o: 50, cec: 16 }), { depth: 10, bd: 1, soilType: other }, null);
        eq(r.row.k2o[1], 34, 0, '上限');
        eq(r.k.design, 6, 1e-9);
    });
    test('[青森 p.35] 石灰: 235mg→300mg、作土10cm・仮比重0.7 → CaO 45.5kg/10a', () => {
        eq(C.baseRequirement(235, 300, C.conversionFactor(10, 0.7)), 45.5, 1e-9);
    });
    test('[青森 p.39 表25注] 深さ15cmの換算係数: 仮比重0.7→1.05、1.0→1.50、1.1→1.65', () => {
        eq(C.conversionFactor(15, 0.7), 1.05, 1e-9);
        eq(C.conversionFactor(15, 1.0), 1.5, 1e-9);
        eq(C.conversionFactor(15, 1.1), 1.65, 1e-9);
    });
    test('[埼玉R7 表18] 牛ふん堆肥1t(水分50%)の有効成分 N2.1・P6.2・K9.9kg', () => {
        const r = C.compostSupply({ type: 'cattle', tons: 1, moisture: 50 });
        eq(r.n, 2.1, 0.05); eq(r.p, 6.2, 0.05); eq(r.k, 9.9, 0.05); // 表18は小数2桁に丸めた値
    });
    test('[埼玉R7 表20] 水分70%堆肥は水分50%の1.68倍量で同じ成分（成分は0.6倍）', () => {
        const r50 = C.compostSupply({ type: 'swine', tons: 1, moisture: 50 });
        const r70 = C.compostSupply({ type: 'swine', tons: 1.68, moisture: 70 });
        eq(r70.k / r50.k, 1.008, 0.01);
    });

    test('[長野 表1] バーク堆肥・もみがら堆肥 現物1tの有効成分（表の「現物1t中成分例」）', () => {
        const bark = C.compostSupply({ type: 'bark', tons: 1, moisture: 70 }); // 水分では補正しない
        eq(bark.n, 0.3, 1e-9); eq(bark.p, 0.5, 1e-9); eq(bark.k, 0.7, 1e-9);
        const momi = C.compostSupply({ type: 'momigara', tons: 1 });
        eq(momi.n, 0.5, 1e-9); eq(momi.p, 3.0, 1e-9); eq(momi.k, 4.0, 1e-9);
    });

    // ---- 境界値・取り扱い ----
    test('リン酸減肥率の境界（80・100・200・300mg）', () => {
        eq(C.phosphateReductionRate(79.9), 0); eq(C.phosphateReductionRate(80), 0.2);
        eq(C.phosphateReductionRate(100), 0.4); eq(C.phosphateReductionRate(200), 0.6);
        eq(C.phosphateReductionRate(300), 1.0); eq(C.phosphateReductionRate(NaN), 0);
    });
    test('表8の行選択（最も近いCEC、等距離は小さい方、範囲外は端の行）', () => {
        eq(C.baseStandardRow(16).cec, 15); eq(C.baseStandardRow(17.5).cec, 15);
        eq(C.baseStandardRow(18).cec, 20); eq(C.baseStandardRow(5).cec, 10);
        eq(C.baseStandardRow(45).cec, 40); eq(C.baseStandardRow(NaN), null);
    });
    test('加里が下限−5mgを下回ると増肥（負の差し引き）', () => {
        const row = C.baseStandardRow(15); // K2O 15〜34
        eq(C.potassiumCredit(5, row, 1), -5, 1e-9);   // 下限-5=10 → 5mg不足
        eq(C.potassiumCredit(20, row, 1), 0);
        eq(C.potassiumCredit(44, row, 1), 0);          // 上限+10 ちょうどは差し引かない
    });
    test('[藤原2008] 黒ボク土EC0.3 → 硝酸態N 1.4mg（3mg未満なので差し引き0kg）', () => {
        const r = C.residualNitrogen(soil({ ec: 0.3 }), 1.05, 'kuroboku');
        eq(r.source, 'ec'); eq(r.no3, 1.4, 1e-9); eq(r.kg, 0);
    });
    test('硝酸態N・ECとも未入力なら窒素は差し引かない', () => {
        const r = C.residualNitrogen(soilBlank, 1.05, 'kuroboku');
        eq(r.source, 'none'); eq(r.kg, 0);
    });
    test('アンモニア態窒素も無機態窒素に含める', () => {
        eq(C.residualNitrogen(soil({ no3n: 4, nh4n: 2 }), 1, 'kuroboku').kg, 3, 1e-9);
    });
    test('土壌値が未入力の項目は差し引き・補正をしない', () => {
        const kuro = D.soilTypes.find(s => s.id === 'kuroboku_atsu_ta');
        const r = C.design({ basal: { n: 26, p: 43, k: 26 } }, soilBlank, { depth: 15, bd: 0.75, soilType: kuro }, null);
        eq(r.n.design, 26); eq(r.p.design, 43); eq(r.k.design, 26);
        eq(r.cecSource, 'soilType'); eq(isNaN(r.cao.design), true);
    });
    test('堆肥の供給が基準を上回るときは設計量0・超過量を返す', () => {
        const r = C.design({ basal: { n: 2, p: 7, k: 20 } }, soilBlank, { depth: 15, bd: 1, soilType: other }, { type: 'poultry', tons: 2, moisture: 50 });
        eq(r.p.design, 0); eq(r.p.overSupplied > 0, true);
    });
    test('当量比: CaO280・MgO56・K2O20 → Ca/Mg 3.59、Mg/K 6.54', () => {
        const b = C.baseBalance(280, 56, 20, 20);
        eq(b.caMg, 3.593, 0.001); eq(b.mgK, 6.545, 0.001);
    });
    test('作物データ: 県基準の作物は基肥・合計・出典ページを持つ', () => {
        D.crops.filter(c => c.source === 'saitama').forEach(c => {
            ['n', 'p', 'k'].forEach(k => {
                if (!(c.basal[k] <= c.total[k])) throw new Error(`${c.id} 基肥>合計 (${k})`);
            });
            if (!c.page) throw new Error(`${c.id} 出典ページなし`);
        });
        const ids = D.crops.map(c => c.id);
        if (new Set(ids).size !== ids.length) throw new Error('作物IDが重複');
        Object.values(D.legacyCropIds).forEach(id => { if (!ids.includes(id)) throw new Error('旧ID読替先なし ' + id); });
    });
    test('きゅうり促成の基肥は N26・P43・K26（野菜編 p.46）', () => {
        const c = D.crops.find(x => x.id === 'cucumber_sokusei');
        eq(c.basal.n, 26); eq(c.basal.p, 43); eq(c.basal.k, 26);
    });

    root.__TEST_RESULTS__ = results;
})(typeof globalThis !== 'undefined' ? globalThis : this);
