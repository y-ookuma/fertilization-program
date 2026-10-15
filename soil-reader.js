// 土壌分析結果票の写真から、③ 土壌分析結果入力の12項目を読み取るための定義と処理。
// DOMに依存しない部分だけを置く（画面の操作・APIの呼び出しは app.js）。
//   - FIELDS        … 12項目（入力欄のIDの末尾 soil_xxx と、結果票での呼び名）
//   - parseOcrText  … ブラウザ内OCR（Tesseract.js）の文字から、項目名と同じ行の数値を拾う
//   - AI_PROMPT / AI_SCHEMA … AI画像認識（Gemini API・Claude API 共通）への指示文と、返してもらうJSONの形
//   - normalizeAiResult … AIの返事を { key: { value, note } } にそろえる
(function (root) {
    'use strict';

    // 項目の並びは入力欄 (1)〜(12) と同じ。
    // patterns は結果票での書き方のゆれ。OCRは「O」を「0」と読むことがあるので [O0] にしている。
    // 判定は match の順（比の行を石灰・苦土より先に、硝酸態・アンモニア態窒素を先に見る）で、1行は最初に当たった項目にだけ使う。
    const FIELDS = [
        { key: 'ph', no: 1, label: 'pH (H2O)', unit: '' },
        { key: 'ec', no: 2, label: '電気伝導度 (EC)', unit: 'mS/cm' },
        { key: 'cao', no: 3, label: '石灰 (CaO)', unit: 'mg/100g' },
        { key: 'mgo', no: 4, label: '苦土 (MgO)', unit: 'mg/100g' },
        { key: 'k2o', no: 5, label: '加里 (K2O)', unit: 'mg/100g' },
        { key: 'p2o5', no: 6, label: '有効態リン酸', unit: 'mg/100g' },
        { key: 'cec', no: 7, label: 'CEC', unit: 'me/100g' },
        { key: 'base_sat', no: 8, label: '塩基飽和度', unit: '%' },
        { key: 'cao_mgo_ratio', no: 9, label: '石灰/苦土比（当量比）', unit: '' },
        { key: 'mgo_k2o_ratio', no: 10, label: '苦土/加里比（当量比）', unit: '' },
        { key: 'no3n', no: 11, label: '硝酸態窒素', unit: 'mg/100g' },
        { key: 'nh4n', no: 12, label: 'アンモニア態窒素', unit: 'mg/100g' }
    ];

    const OCR_MATCH_ORDER = [
        { key: 'no3n', re: /硝酸態?窒素|硝酸性窒素|N[O0]3[-‐ー]?N/i },
        { key: 'nh4n', re: /アンモニ[アウ]ム?態?窒素|NH4[-‐ー]?N/i },
        { key: 'cao_mgo_ratio', re: /(石灰|Ca[O0]?)[\/／](苦土|Mg[O0]?)/i, ratio: true },
        { key: 'mgo_k2o_ratio', re: /(苦土|Mg[O0]?)[\/／](加里|カリ|K2?[O0]?)/i, ratio: true },
        { key: 'base_sat', re: /塩基飽和度/ },
        { key: 'cec', re: /CEC|陽イオン交換容量|塩基置換容量/i },
        { key: 'ec', re: /電気伝導度|(^|[^A-Za-z])EC/i }, // CEC は先に判定済み。空白を詰めると「ECmS/cm」のように単位が続く
        { key: 'ph', re: /p\s*H|酸度/i, skip: /KCl|KC1|塩化カリ/i },
        { key: 'cao', re: /石灰|Ca[O0]/i },
        { key: 'mgo', re: /苦土|Mg[O0]/i },
        { key: 'k2o', re: /加里|カリ|K2[O0]/i },
        { key: 'p2o5', re: /リン酸|燐酸|りん酸|P2[O0]5|トルオーグ/i, skip: /吸収係数/ }
    ];

    // 数値の前にある化学式・単位（中の数字を値と間違えないよう取り除く）
    const NOISE = /H2[O0]|K2[O0]|Ca[O0]|Mg[O0]|P2[O0]5|N[O0]3|NH4|KCl|mg\/100\s*g|me\/100\s*g|mS\/cm|dS\/m|\/100\s*g|1:5|1:2\.5/gi;

    // 改良目標値・適正範囲の「(6.00〜6.50)」「370 ~ 610」。分析値ではないので取り除く（かっこが欠けても取る）
    const RANGE = /\(?\s*-?\d+(?:\.\d+)?\s*[~〜～]\s*-?\d+(?:\.\d+)?\s*\)?/g;
    // 「石灰/苦土比(重)」のような重量比。アプリの(9)(10)は当量比なので値は使わない
    const WEIGHT_RATIO = /\(重|重量/;

    // 全角の英数字・記号を半角に、日本語の文字の間の空白を詰める（OCRは「硝 酸 態」のように空白を入れる）
    function normalizeLine(line) {
        let s = line.replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
            .replace(/　/g, ' ')
            .replace(/[．。]/g, '.')
            .replace(/[，、]/g, ',')
            .replace(/(\d)\. +(?=\d)/g, '$1.'); // OCRは「6. 80」のように小数点の後に空白を入れる
        // 数字どうしの間の空白は残し（隣の列の値と混ざらないように）、それ以外の空白は詰める
        s = s.replace(/ +(?=[^\d\s.\-])|(?<=[^\d\s.\-]) +/g, '');
        return s.trim();
    }

    function findLabel(line) {
        for (const m of OCR_MATCH_ORDER) {
            const hit = m.re.exec(line);
            if (hit) return { m, hit };
        }
        return null;
    }

    // 範囲・化学式・単位を除いた最初の数値（なければ null）
    function firstValue(s) {
        const num = s.replace(RANGE, ' ').replace(NOISE, ' ').match(/-?\d+(?:\.\d+)?/);
        return num ? parseFloat(num[0]) : null;
    }

    // OCRの文字から12項目の値を拾う。返り値は { key: { value, line, note } }（見つからない項目は入らない）。
    // 値は項目名と同じ行から拾い、同じ行になければ次の行から拾う（結果票は「目標値」の下に「分析値」を書く形が多い）。
    function parseOcrText(text) {
        const found = {};
        let pending = null; // 値がまだ見つかっていない、直前の行の項目
        String(text || '').split(/\r?\n/).forEach(raw => {
            const line = normalizeLine(raw);
            if (!line) return;
            const label = findLabel(line);
            if (!label) {
                if (pending && !found[pending.key]) {
                    const v = firstValue(line);
                    if (v !== null) found[pending.key] = { value: v, line: `${pending.raw} ／ ${raw.trim()}`, note: '' };
                }
                pending = null;
                return;
            }
            pending = null;
            const { m, hit } = label;
            if (m.skip && m.skip.test(line)) return; // pH(KCl)・リン酸吸収係数の行は使わない
            if (found[m.key]) return;
            if (m.ratio && WEIGHT_RATIO.test(line)) {
                found[m.key] = { value: null, line: raw.trim(), note: '重量比のため空欄' };
                return;
            }
            // 項目名の直後の (H2O)・(KCl) は、かっこが落ちて「pH2O」となっても取り除く
            const rest = line.slice(hit.index + hit[0].length).replace(/^\(?(H?2[O0]|KC[l1I])\)?/i, ' ');
            const v = firstValue(rest);
            if (v !== null) found[m.key] = { value: v, line: raw.trim(), note: '' };
            else pending = { key: m.key, raw: raw.trim() };
        });
        return found;
    }

    // ---------- AI画像認識（Gemini API・Claude API で共通） ----------
    const AI_PROMPT = [
        'この画像は土壌分析の結果票です。次の12項目の値を読み取ってください。',
        '',
        FIELDS.map(f => `(${f.no}) ${f.key}: ${f.label}${f.unit ? `（${f.unit}）` : ''}`).join('\n'),
        '',
        '読み取りのきまり：',
        '- 結果票に書かれている数値だけを返してください。書かれていない項目、読めない項目は value を null にしてください。推測したり、他の項目から計算したりしないでください。',
        '- 単位がかっこ内の単位と違う場合（例：mg/kg、dS/m）は、かっこ内の単位に換算した値を返し、note に元の値と単位、換算したことを書いてください（mg/kg は 10 で割ると mg/100g、dS/m は mS/cm と同じ値）。',
        '- pH は水で抽出した値（pH(H2O)）を使ってください。pH(KCl) しかない場合は null にして note に書いてください。',
        '- 表の各欄に、かっこ付きの範囲（例：(6.00〜6.50)、( 55 〜 90)）と分析値が並んでいることがあります。かっこ付きの範囲は「改良目標値」「適正範囲」で、分析値ではありません。必ず分析値のほうを読んでください。',
        '- 表の横のレーダーチャートなどのグラフの目盛りは読まないでください。',
        '- 石灰/苦土比・苦土/加里比は当量比だけを返してください。「石灰/苦土比(重)」のように「重」「重量」と書かれた比は重量比です。重量比しか書かれていない場合は null にして note に「重量比のため空欄」と書いてください。',
        '- 「CEC(推定)」のように推定値と書かれている場合は値を返し、note に「推定値」と書いてください。',
        '- 有効態リン酸は、トルオーグ法の値を優先してください。別の抽出法の値しかない場合は値を返し、note に抽出法を書いてください。',
        '- 硝酸態窒素・アンモニア態窒素は、窒素(N)としての値（NO3-N・NH4-N）を返してください。結果票にこれらの欄がない場合は null（note は空文字）にしてください。',
        '- 結果票に複数の試料（圃場）が載っている場合は、一番上（最初）の試料を読み、sample にその試料名を書き、warnings にほかの試料があることを書いてください。',
        '- 注意点がなければ note・warnings は空文字にしてください。'
    ].join('\n');

    const itemSchema = {
        type: 'object',
        properties: {
            value: { type: ['number', 'null'] },
            note: { type: 'string' }
        },
        required: ['value', 'note'],
        additionalProperties: false
    };
    const AI_SCHEMA = {
        type: 'object',
        properties: Object.assign(
            { sample: { type: 'string' }, warnings: { type: 'string' } },
            ...FIELDS.map(f => ({ [f.key]: itemSchema }))
        ),
        required: ['sample', 'warnings'].concat(FIELDS.map(f => f.key)),
        additionalProperties: false
    };

    // AIの返事（JSON）を { values: { key: { value, note } }, sample, warnings } にそろえる
    function normalizeAiResult(obj) {
        const values = {};
        FIELDS.forEach(f => {
            const item = obj && obj[f.key];
            const v = item && typeof item.value === 'number' && isFinite(item.value) ? item.value : null;
            const note = item && typeof item.note === 'string' ? item.note : '';
            if (v !== null || note) values[f.key] = { value: v, note };
        });
        return {
            values,
            sample: obj && typeof obj.sample === 'string' ? obj.sample : '',
            warnings: obj && typeof obj.warnings === 'string' ? obj.warnings : ''
        };
    }

    root.SoilReader = { FIELDS, parseOcrText, normalizeLine, AI_PROMPT, AI_SCHEMA, normalizeAiResult };
})(typeof window !== 'undefined' ? window : globalThis);
