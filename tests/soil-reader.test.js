// soil-reader.js のテスト（写真読み取りの文字解析とClaudeの返事の整形）。
// 実行方法: python tests/run_tests.py
(function (root) {
    const R = root.SoilReader;
    const results = root.__TEST_RESULTS__ || [];
    function test(name, fn) {
        try { fn(); results.push({ name, ok: true }); }
        catch (e) { results.push({ name, ok: false, msg: String(e && e.message || e) }); }
    }
    function eq(actual, expected, label) {
        if (actual !== expected) throw new Error(`${label || ''} expected ${expected}, got ${actual}`);
    }
    const valueOf = (found, key) => (found[key] ? found[key].value : undefined);

    // Tesseract.js が日本語の結果票から返す文字の例（文字の間の空白・全角数字・Oと0の読み違いを含む）
    const ocrSample = [
        '土 壌 分 析 結 果 表',
        'pH (H2O)        6.3',
        'pH (KCl)        5.4',
        'EC (mS/cm)      ０．４５',
        '交 換 性 石 灰 (Ca0)  mg/100g   280',
        '交換性苦土 (MgO) mg/100g 32',
        '交換性加里 (K2O) mg/100g 58',
        '可給態リン酸 (P2O5) mg/100g 95',
        'リン酸吸収係数 1800',
        'CEC (me/100g) 25.0',
        '塩基飽和度 (%) 51',
        '石灰/苦土比 6.29',
        '苦土/加里比 1.29',
        '硝 酸 態 窒 素 (NO3-N) mg/100g 7.1',
        'アンモニア態窒素 (NH4-N) mg/100g 1.2'
    ].join('\n');

    test('OCR文字の解析: 12項目すべてを正しい値で拾う', () => {
        const f = R.parseOcrText(ocrSample);
        const expected = { ph: 6.3, ec: 0.45, cao: 280, mgo: 32, k2o: 58, p2o5: 95, cec: 25, base_sat: 51,
            cao_mgo_ratio: 6.29, mgo_k2o_ratio: 1.29, no3n: 7.1, nh4n: 1.2 };
        Object.keys(expected).forEach(k => eq(valueOf(f, k), expected[k], k));
    });
    test('OCR文字の解析: pH(KCl)・リン酸吸収係数の行は使わない', () => {
        const f = R.parseOcrText('pH(KCl) 5.4\nリン酸吸収係数 1800\npH(H2O) 6.1\n有効態リン酸 40');
        eq(valueOf(f, 'ph'), 6.1, 'ph'); eq(valueOf(f, 'p2o5'), 40, 'p2o5');
    });
    test('OCR文字の解析: 化学式の数字（K2O・NO3など）を値と間違えない', () => {
        const f = R.parseOcrText('K2O 35\nNO3-N 4.5');
        eq(valueOf(f, 'k2o'), 35, 'k2o'); eq(valueOf(f, 'no3n'), 4.5, 'no3n');
    });
    test('OCR文字の解析: かっこが落ちた pH2O・単位が続く EC でも値を拾う', () => {
        const f = R.parseOcrText('pH2O 6.4\nEC mS/cm 0.38');
        eq(valueOf(f, 'ph'), 6.4, 'ph'); eq(valueOf(f, 'ec'), 0.38, 'ec');
    });
    // JAの土壌診断カードの形（各欄に「(改良目標値)」と、その下の行に分析値。比は重量比）
    const cardSample = [
        '診断項目 (改良目標値) 分析値',
        'pH(H20) (6.00~6.50)', '6. 80',
        '電気伝導度(EC) (0.00~0.30)', '0.22 mS/cm',
        '石灰(Ca0) (370 ~ 610)', '530 mg/100g',
        '苦土(Mg0) ( 55 ~ 90)', '150 mg/100g',
        '加里(K20) ( 40 ~ 70)', '83 mg/100g',
        'トルオーグ燐酸 ( 20 ~ 40)', '310 mg/100g',
        'CEC(推定) ( 10 ~ 25)', '27 me',
        '塩基飽和度(%) ( 71 ~ 86)', '100 %',
        '石灰/苦土比(重) ( 7 ~ 10)', '3.5',
        '苦土/加里比(重) ( 1 ~ 2)', '1.8'
    ].join('\n');
    test('OCR文字の解析: 目標値の範囲は拾わず、次の行の分析値を拾う（土壌診断カードの形）', () => {
        const f = R.parseOcrText(cardSample);
        const expected = { ph: 6.8, ec: 0.22, cao: 530, mgo: 150, k2o: 83, p2o5: 310, cec: 27, base_sat: 100 };
        Object.keys(expected).forEach(k => eq(valueOf(f, k), expected[k], k));
    });
    test('OCR文字の解析: 重量比「(重)」の比は値を使わず空欄にする', () => {
        const f = R.parseOcrText(cardSample);
        eq(f.cao_mgo_ratio.value, null, 'cao_mgo_ratio'); eq(f.cao_mgo_ratio.note, '重量比のため空欄', 'note');
        eq(f.mgo_k2o_ratio.value, null, 'mgo_k2o_ratio');
        eq(f.no3n, undefined, 'no3n'); eq(f.nh4n, undefined, 'nh4n');
    });
    test('OCR文字の解析: 項目名がない文字からは何も拾わない', () => {
        eq(Object.keys(R.parseOcrText('試料番号 12\n採取日 2026/10/01')).length, 0, 'count');
    });

    test('AIの返事の形: 12項目と sample・warnings をすべて必須にしている', () => {
        eq(R.AI_SCHEMA.required.length, 14, 'required');
        eq(R.AI_SCHEMA.additionalProperties, false, 'additionalProperties');
        R.FIELDS.forEach(f => eq(!!R.AI_SCHEMA.properties[f.key], true, f.key));
    });
    test('AIの返事の整形: null は空欄、note は残す', () => {
        const r = R.normalizeAiResult({ sample: 'A-1', warnings: '', ph: { value: 6.2, note: '' },
            cao_mgo_ratio: { value: null, note: '重量比のため空欄' }, nh4n: { value: null, note: '' } });
        eq(r.values.ph.value, 6.2, 'ph'); eq(r.values.cao_mgo_ratio.value, null, 'ratio');
        eq(r.values.cao_mgo_ratio.note, '重量比のため空欄', 'note'); eq(r.values.nh4n, undefined, 'nh4n');
        eq(r.sample, 'A-1', 'sample');
    });

    root.__TEST_RESULTS__ = results;
})(globalThis);
