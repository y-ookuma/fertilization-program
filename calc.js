// 施肥設計の計算ロジック（画面に依存しない純粋関数のみ）
// 計算の根拠は saitama-data.js の各データに付けた出典を参照。
(function (root) {
    'use strict';
    const D = root.FERT_DATA;

    const isNum = (v) => typeof v === 'number' && isFinite(v);

    // mg/100g → kg/10a の換算係数 … [埼玉R7] p.12・[青森] p.35-39
    //   10aの作土の重さ = 1,000㎡ × 作土深(m) × 仮比重 なので、1mg/100g = 作土深(cm)/10 × 仮比重 kg/10a
    function conversionFactor(depthCm, bulkDensity) {
        return (depthCm / 10) * bulkDensity;
    }

    // 表8の行を選ぶ。表のCECは5me刻みのため、最も近いCECの行を使う（等距離のときは小さい方）。
    //   [埼玉R7]の加里の診断例（CEC16 → 上限34mg = CEC15の行）と一致する取り扱い。
    function baseStandardRow(cec) {
        if (!isNum(cec)) return null;
        let best = D.baseStandard[0];
        D.baseStandard.forEach(row => {
            if (Math.abs(row.cec - cec) < Math.abs(best.cec - cec)) best = row;
        });
        return best;
    }

    // 交換性塩基(mg/100g)から当量比・塩基飽和度を求める … [埼玉R7] p.9
    function baseBalance(cao, mgo, k2o, cec) {
        const E = D.equivalentWeight;
        const caMe = isNum(cao) ? cao / E.cao : NaN;
        const mgMe = isNum(mgo) ? mgo / E.mgo : NaN;
        const kMe = isNum(k2o) ? k2o / E.k2o : NaN;
        return {
            caMg: caMe / mgMe,
            mgK: mgMe / kMe,
            baseSat: isNum(cec) && cec > 0 ? ((caMe + mgMe + kMe) / cec) * 100 : NaN
        };
    }

    // 土壌の残存窒素 … [埼玉R7] p.12（無機態N−3）×作土深÷10×仮比重
    //   硝酸態窒素の分析値がない場合はECから推定 … [藤原2008]
    function residualNitrogen(soil, factor, ecGroup) {
        const nh4 = isNum(soil.nh4n) ? soil.nh4n : 0;
        let no3, source, eq = null;
        if (isNum(soil.no3n)) {
            no3 = soil.no3n;
            source = 'measured';
        } else if (isNum(soil.ec)) {
            eq = D.ecToNitrate[ecGroup] || D.ecToNitrate.alluvial;
            no3 = Math.max(0, eq.a * soil.ec + eq.b);
            source = 'ec';
        } else {
            return { source: 'none', no3: NaN, inorganic: NaN, kg: 0 };
        }
        const inorganic = no3 + nh4;
        const kg = Math.max(0, inorganic - D.inorganicNBaseline) * factor;
        return { source, no3, nh4, inorganic, kg, eq };
    }

    // リン酸の減肥率 … [埼玉R7] p.13
    function phosphateReductionRate(p2o5) {
        if (!isNum(p2o5)) return 0;
        const row = D.phosphateReduction.find(r => p2o5 >= r.min && p2o5 < r.max);
        return row ? row.rate : 0;
    }

    // 加里の土壌による加減（kg/10a。正=肥料成分として差し引く量、負=増肥する量）… [埼玉R7] p.13
    function potassiumCredit(k2o, row, factor) {
        if (!isNum(k2o) || !row) return 0;
        const upper = row.k2o[1] + D.potassiumMargin.upper;
        const lower = row.k2o[0] - D.potassiumMargin.lower;
        if (k2o > upper) return (k2o - upper) * factor;
        if (k2o < lower) return -(lower - k2o) * factor;
        return 0;
    }

    // 石灰・苦土を目標値まで上げるのに必要な量（kg/10a）… [青森] p.35「不足石灰量を算出する方法」
    //   (目標 − 測定) mg/100g × 換算係数
    function baseRequirement(measured, target, factor) {
        if (!isNum(measured) || !isNum(target)) return NaN;
        return Math.max(0, target - measured) * factor;
    }

    // 堆肥から供給される有効成分（kg/10a）… [埼玉R7] 表17・18
    //   成分含量(水分50%現物) × (100−水分)/50 で現物水分に補正し、肥効率を掛ける
    function compostSupply(compost) {
        const zero = { n: 0, p: 0, k: 0 };
        if (!compost || !compost.type || !isNum(compost.tons) || compost.tons <= 0) return zero;
        let content, eff;
        if (compost.type === 'custom') {
            content = compost.content || {};
            eff = compost.eff || {};
        } else {
            const c = D.composts.find(x => x.id === compost.type);
            if (!c) return zero;
            const moisture = isNum(compost.moisture) ? compost.moisture : D.compostBaseMoisture;
            const adj = (100 - moisture) / (100 - D.compostBaseMoisture);
            content = { n: c.n * adj, p: c.p * adj, k: c.k * adj };
            eff = c.eff;
        }
        const kg = (key) => compost.tons * 1000 * ((content[key] || 0) / 100) * ((eff[key] || 0) / 100);
        return { n: kg('n'), p: kg('p'), k: kg('k') };
    }

    // 施肥設計（10aあたり）
    //   crop    … { basal: {n,p,k}, ecClass }
    //   soil    … { ph, ec, cao, mgo, k2o, p2o5, cec, no3n, nh4n }（未測定は NaN）
    //   field   … { depth(cm), bd(仮比重), soilType(saitama-data.jsのsoilTypes要素) }
    //   compost … { type, tons, moisture, content, eff }
    function design(crop, soil, field, compost) {
        const factor = conversionFactor(field.depth, field.bd);
        const soilType = field.soilType || {};
        const cec = isNum(soil.cec) ? soil.cec : (isNum(soilType.cec) ? soilType.cec : NaN);
        const cecSource = isNum(soil.cec) ? 'measured' : (isNum(cec) ? 'soilType' : 'none');
        const row = baseStandardRow(cec);
        const comp = compostSupply(compost);

        const nRes = residualNitrogen(soil, factor, soilType.ecGroup);
        const pRate = phosphateReductionRate(soil.p2o5);
        const kCredit = potassiumCredit(soil.k2o, row, factor);

        const basal = crop.basal;
        const n = { standard: basal.n, soilCredit: nRes.kg, compostCredit: comp.n };
        const p = { standard: basal.p, soilCredit: basal.p * pRate, compostCredit: comp.p, rate: pRate };
        const k = { standard: basal.k, soilCredit: kCredit, compostCredit: comp.k };
        [n, p, k].forEach(x => {
            const raw = x.standard - x.soilCredit - x.compostCredit;
            x.design = Math.max(0, raw);
            x.overSupplied = raw < 0 ? -raw : 0; // 堆肥・土壌の供給が基準を上回る量
        });

        const cao = { range: row ? row.cao : null, measured: soil.cao };
        cao.design = row ? baseRequirement(soil.cao, row.cao[0], factor) : NaN;
        const mgo = { range: row ? row.mgo : null, measured: soil.mgo };
        mgo.design = row ? baseRequirement(soil.mgo, row.mgo[0], factor) : NaN;

        return {
            factor, cec, cecSource, row, nitrogen: nRes, compost: comp,
            n, p, k, cao, mgo,
            balance: baseBalance(soil.cao, soil.mgo, soil.k2o, cec)
        };
    }

    // 土壌診断値の適正範囲（バッジ表示用）
    function diagnosisRanges(crop, soilType, row) {
        const std = D.diagnosisStandard;
        const paddy = crop.ecClass === 'paddy';
        const ecGroupRange = D.ecRange[soilType.ecGroup] || D.ecRange.alluvial;
        return {
            ph: std.ph,
            ec: paddy ? [0, std.paddyEcMax] : (ecGroupRange[crop.ecClass] || ecGroupRange.leafy),
            p2o5: [std.pLower, paddy ? Infinity : soilType.pUpper],
            cec: [soilType.cecMin, Infinity],
            cao: row ? row.cao : null,
            mgo: row ? row.mgo : null,
            k2o: row ? row.k2o : null,
            base_sat: row ? row.baseSat : null,
            cao_mgo_ratio: row ? row.caMg : null,
            mgo_k2o_ratio: row ? row.mgK : null
        };
    }

    // 値と範囲の比較（'ok' | 'low' | 'high' | null）
    function compareRange(value, range) {
        if (!isNum(value) || !range) return null;
        if (value < range[0]) return 'low';
        if (value > range[1]) return 'high';
        return 'ok';
    }

    root.FertCalc = {
        conversionFactor, baseStandardRow, baseBalance, residualNitrogen, phosphateReductionRate,
        potassiumCredit, baseRequirement, compostSupply, design, diagnosisRanges, compareRange
    };
})(typeof globalThis !== 'undefined' ? globalThis : this);
