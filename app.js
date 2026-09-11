// 30品目を含む元肥ライブラリデータ
// category: fruit(果菜) / leafy(葉菜) / root(根菜) / bulb(りん茎) / tuber(いも類) / legume(豆類) / perennial(多年生)
// targetPh: その作物が好む目安pH（未指定は6.3を既定値として使用。参考情報として保持）
const fertilizerLibrary = {
    "version": "1.3",
    "crops": [
        { "id": "cucumber_greenhouse", "name": "キュウリ（ハウス栽培）", "emoji": "🥒", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 30.0, "p2o5": 15.0, "k2o": 40.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "tomato_greenhouse", "name": "トマト（ハウス）", "emoji": "🍅", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 25.0, "p2o5": 10.0, "k2o": 35.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.7, "k2o": 0.3 } },
        { "id": "eggplant", "name": "ナス", "emoji": "🍆", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 32.0, "p2o5": 12.0, "k2o": 38.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "bell_pepper", "name": "ピーマン", "emoji": "🫑", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 28.0, "p2o5": 11.0, "k2o": 32.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.7, "k2o": 0.3 } },
        { "id": "strawberry", "name": "イチゴ（高設・土耕）", "emoji": "🍓", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 18.0, "p2o5": 8.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "watermelon", "name": "スイカ", "emoji": "🍉", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 15.0, "p2o5": 8.0, "k2o": 20.0 }, "standard_basal_ratio": { "n": 0.5, "p2o5": 0.8, "k2o": 0.5 } },
        { "id": "melon", "name": "メロン", "emoji": "🍈", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 16.0, "p2o5": 9.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "pumpkin", "name": "カボチャ", "emoji": "🎃", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 18.0, "p2o5": 10.0, "k2o": 25.0 }, "standard_basal_ratio": { "n": 0.5, "p2o5": 0.8, "k2o": 0.5 } },
        { "id": "cabbage", "name": "キャベツ", "emoji": "🥬", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 24.0, "p2o5": 10.0, "k2o": 28.0 }, "standard_basal_ratio": { "n": 0.5, "p2o5": 0.8, "k2o": 0.5 } },
        { "id": "chinese_cabbage", "name": "ハクサイ", "emoji": "🥬", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 22.0, "p2o5": 9.0, "k2o": 30.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "spinach_ordinary", "name": "ホウレンソウ", "emoji": "🥬", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 18.0, "p2o5": 8.0, "k2o": 20.0 }, "standard_basal_ratio": { "n": 0.7, "p2o5": 1.0, "k2o": 0.7 } },
        { "id": "lettuce", "name": "レタス・サラダ菜", "emoji": "🥬", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 16.0, "p2o5": 7.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.5, "p2o5": 0.8, "k2o": 0.5 } },
        { "id": "broccoli", "name": "ブロッコリー", "emoji": "🥦", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 25.0, "p2o5": 12.0, "k2o": 28.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "radish", "name": "ダイコン", "emoji": "🫜", "category": "root", "nutrient_absorption_kg_10a": { "n": 20.0, "p2o5": 9.0, "k2o": 25.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "carrot", "name": "ニンジン", "emoji": "🥕", "category": "root", "nutrient_absorption_kg_10a": { "n": 16.0, "p2o5": 10.0, "k2o": 24.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "onion", "name": "タマネギ", "emoji": "🧅", "category": "bulb", "nutrient_absorption_kg_10a": { "n": 22.0, "p2o5": 10.0, "k2o": 24.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.8, "k2o": 0.3 } },
        { "id": "potato", "name": "ジャガイモ", "emoji": "🥔", "category": "tuber", "targetPh": 5.8, "nutrient_absorption_kg_10a": { "n": 18.0, "p2o5": 10.0, "k2o": 28.0 }, "standard_basal_ratio": { "n": 0.7, "p2o5": 1.0, "k2o": 0.7 } },
        { "id": "sweet_potato", "name": "サツマイモ", "emoji": "🍠", "category": "tuber", "nutrient_absorption_kg_10a": { "n": 10.0, "p2o5": 6.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.5, "k2o": 0.3 } },
        { "id": "taro", "name": "サトイモ", "emoji": "🫜", "category": "tuber", "nutrient_absorption_kg_10a": { "n": 22.0, "p2o5": 9.0, "k2o": 30.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "corn", "name": "スイートコーン", "emoji": "🌽", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 20.0, "p2o5": 8.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.5, "p2o5": 0.8, "k2o": 0.5 } },
        { "id": "edamame", "name": "エダマメ", "emoji": "🫛", "category": "legume", "nutrient_absorption_kg_10a": { "n": 15.0, "p2o5": 6.0, "k2o": 15.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.5, "k2o": 0.3 } },
        { "id": "kidney_bean", "name": "インゲンマメ", "emoji": "🫘", "category": "legume", "nutrient_absorption_kg_10a": { "n": 14.0, "p2o5": 6.0, "k2o": 16.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.6, "k2o": 0.3 } },
        { "id": "green_onion", "name": "ネギ（長ネギ）", "emoji": "🌱", "category": "bulb", "nutrient_absorption_kg_10a": { "n": 25.0, "p2o5": 12.0, "k2o": 28.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "garlic", "name": "ニンニク", "emoji": "🧄", "category": "bulb", "nutrient_absorption_kg_10a": { "n": 22.0, "p2o5": 10.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "ginger", "name": "ショウガ", "emoji": "🫚", "category": "tuber", "nutrient_absorption_kg_10a": { "n": 25.0, "p2o5": 10.0, "k2o": 30.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } },
        { "id": "celery", "name": "セロリ", "emoji": "🌿", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 35.0, "p2o5": 14.0, "k2o": 45.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.8, "k2o": 0.4 } },
        { "id": "aspalagus", "name": "アスパラガス", "emoji": "🌱", "category": "perennial", "nutrient_absorption_kg_10a": { "n": 22.0, "p2o5": 10.0, "k2o": 28.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.7, "k2o": 0.3 } },
        { "id": "chinese_chive", "name": "ニラ", "emoji": "🌿", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 20.0, "p2o5": 9.0, "k2o": 22.0 }, "standard_basal_ratio": { "n": 0.3, "p2o5": 0.7, "k2o": 0.3 } },
        { "id": "komatsuna", "name": "コマツナ", "emoji": "🥬", "category": "leafy", "nutrient_absorption_kg_10a": { "n": 15.0, "p2o5": 6.0, "k2o": 18.0 }, "standard_basal_ratio": { "n": 0.7, "p2o5": 1.0, "k2o": 0.7 } },
        { "id": "okra", "name": "オクラ", "emoji": "🌱", "category": "fruit", "nutrient_absorption_kg_10a": { "n": 18.0, "p2o5": 8.0, "k2o": 20.0 }, "standard_basal_ratio": { "n": 0.4, "p2o5": 0.7, "k2o": 0.4 } }
    ]
};

// 作物カテゴリー別の堆肥めやす（t/10a のレンジと一言メモ）
const compostRanges = {
    fruit: { min: 2, max: 3, note: "植付けの3週間以上前に施用してください。実つきを良くする土づくりの土台になります。" },
    leafy: { min: 1.5, max: 2, note: "窒素が効きすぎると軟弱徒長しやすいので、入れすぎに注意しましょう。" },
    root: { min: 1.5, max: 2, note: "未熟な堆肥は又根（またね）の原因になります。完熟堆肥を使い、前作からの持ち越しも意識してください。" },
    bulb: { min: 1.5, max: 2, note: "根の伸長を妨げないよう、植付け前によく耕うんしてください。" },
    tuber: { min: 1.5, max: 2, note: "窒素過多を避けて施用してください。" },
    legume: { min: 1, max: 1.5, note: "根粒菌が窒素を供給するため、堆肥は控えめで十分です。" },
    perennial: { min: 3, max: 4, note: "定植・株分け時にまとめて施し、以降は毎年株元に補うと生育が安定します。" }
};

const categoryLabel = {
    fruit: "果菜類", leafy: "葉菜類", root: "根菜類", bulb: "りん茎類",
    tuber: "いも類", legume: "豆類", perennial: "多年生"
};

// アイコン（SVG）
const ICONS = {
    n: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40C8 24 20 8 40 8C40 28 24 40 8 40Z"/><path d="M10 38C18 30 26 22 34 14"/></svg>',
    p: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6V22"/><path d="M24 22C24 22 14 26 12 40"/><path d="M24 22C24 22 34 26 36 40"/><path d="M24 22V42"/><circle cx="24" cy="6" r="3" fill="currentColor" stroke="none"/></svg>',
    k: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="4.5" fill="currentColor" stroke="none"/><circle cx="24" cy="11" r="6"/><circle cx="24" cy="37" r="6"/><circle cx="11" cy="24" r="6"/><circle cx="37" cy="24" r="6"/></svg>',
    cao: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 34L18 14H30L36 34L24 40L12 34Z"/><path d="M18 14L24 22L30 14"/></svg>',
    mgo: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6L38 20L24 42L10 20Z"/><path d="M10 20H38"/><path d="M17 20L24 6L31 20"/></svg>'
};

// ---- 定数 ----
const AREA_DEFAULT_M2 = 1000;      // 未入力時は10a(1,000㎡)として計算
const AREA_UNIT_FACTOR = { m2: 1, a: 100, ha: 10000 };
const MG100G_TO_KG10A = 0.15;      // mg/100g → kg/10a の簡易換算係数（P2O5・K2O・CaO・MgOで共通使用）
const TARGET_CAO_MG100G = 300;     // 石灰(CaO)の目安値 mg/100g
const TARGET_MGO_MG100G = 40;      // 苦土(MgO)の目安値 mg/100g
const EC_TO_NO3N_MG100G = 80;      // EC(mS/cm) → 推定硝酸態窒素(mg/100g) の簡易換算係数
const DEFAULT_EC = 0.3;            // ECが未入力の場合に仮定する値 (mS/cm)
const DEFAULT_TARGET_PH = 6.3;     // pHの目安値（作物にtargetPhの指定がない場合）
const FERT_COUNT = 8;

// 土壌分析結果の「過不足バッジ」用の目安値（N・P2O5・K2O・CaO・MgOは別途5養分の目標値を使用する）
const SOIL_ITEM_REFERENCE = {
    ec: 0.4,            // 電気伝導度 (mS/cm) の目安値
    cec: 15,            // CEC (me) の目安値
    base_sat: 75,       // 塩基飽和度 (%) の目安値
    cao_mgo_ratio: 5,   // 石灰/苦土比の目安値
    mgo_k2o_ratio: 2    // 苦土/加里比の目安値
};
const SOIL_BADGE_TOLERANCE_PCT = 5; // 目安値との差がこの割合未満なら「適正」とみなす

const NUTRIENT_DEFS = [
    { key: 'n',   label: '窒素 (N)',       sub: '葉と茎を育てる' },
    { key: 'p',   label: 'リン酸 (P2O5)',  sub: '根と花・実をつくる' },
    { key: 'k',   label: '加里 (K2O)',     sub: '株を丈夫にする' },
    { key: 'cao', label: '石灰 (CaO)',     sub: 'pHを整え根を守る' },
    { key: 'mgo', label: '苦土 (MgO)',     sub: '葉緑素をつくる' }
];

document.addEventListener('DOMContentLoaded', () => {
    const cropSelect = document.getElementById('cropSelect');

    // 作物セレクトボックスの構築
    fertilizerLibrary.crops.forEach(crop => {
        const option = document.createElement('option');
        option.value = crop.id;
        option.textContent = `${crop.emoji} ${crop.name}`;
        cropSelect.appendChild(option);
    });

    // 肥料入力欄（最大8種類）を組み立てる
    const fertRowsContainer = document.getElementById('fertRows');
    let fertRowsHtml = '';
    for (let i = 1; i <= FERT_COUNT; i++) {
        fertRowsHtml += `
            <div class="fert-row">
                <div class="fert-row-head"><span class="fert-index">${i}</span></div>
                <div class="fert-grid">
                    <div class="form-group fert-name-group">
                        <label for="fert_name_${i}">肥料名</label>
                        <input type="text" id="fert_name_${i}" placeholder="例: 化成肥料 8-8-8">
                    </div>
                    <div class="form-group">
                        <label for="fert_n_${i}">N (%)</label>
                        <input type="number" id="fert_n_${i}" step="0.1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="fert_p_${i}">P2O5 (%)</label>
                        <input type="number" id="fert_p_${i}" step="0.1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="fert_k_${i}">K2O (%)</label>
                        <input type="number" id="fert_k_${i}" step="0.1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="fert_cao_${i}">石灰 CaO (%)</label>
                        <input type="number" id="fert_cao_${i}" step="0.1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="fert_mgo_${i}">苦土 MgO (%)</label>
                        <input type="number" id="fert_mgo_${i}" step="0.1" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label for="fert_bagweight_${i}">1袋の重量(kg)</label>
                        <input type="number" id="fert_bagweight_${i}" step="0.1" placeholder="例: 20">
                    </div>
                    <div class="form-group">
                        <label for="fert_amount_${i}">今回投入量(kg)</label>
                        <input type="number" id="fert_amount_${i}" step="0.1" placeholder="例: 40">
                    </div>
                </div>
            </div>
        `;
    }
    fertRowsContainer.innerHTML = fertRowsHtml;

    // モーダル制御
    const modal = document.getElementById('helpModal');
    document.getElementById('helpBtn').addEventListener('click', () => modal.style.display = 'block');
    document.getElementById('closeModal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // ---------- READMEモーダル（README.mdをfetchしてMarkdownとして描画） ----------
    const readmeModal = document.getElementById('readmeModal');
    const readmeContent = document.getElementById('readmeContent');
    let readmeLoaded = false;

    function loadReadme() {
        readmeContent.innerHTML = '<p>読み込み中...</p>';
        fetch('README.md')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then(text => {
                if (typeof marked === 'undefined') {
                    throw new Error('marked.js not loaded');
                }
                readmeContent.innerHTML = marked.parse(text);
                readmeLoaded = true;
            })
            .catch(() => {
                readmeContent.innerHTML =
                    '<p>README.mdの読み込みに失敗しました。index.htmlと同じフォルダにREADME.mdがあるか、' +
                    'ローカルサーバー経由（file://ではなくhttp://）で開いているかをご確認ください。</p>';
            });
    }

    function openReadmeModal() {
        readmeModal.style.display = 'block';
        if (!readmeLoaded) loadReadme();
    }

    document.getElementById('readmeBtn').addEventListener('click', openReadmeModal);
    document.getElementById('readmeInlineLink').addEventListener('click', () => {
        modal.style.display = 'none';
        openReadmeModal();
    });
    document.getElementById('closeReadmeModal').addEventListener('click', () => readmeModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === readmeModal) readmeModal.style.display = 'none'; });

    // ---------- 作物別基肥一覧モーダル ----------
    const cropListModal = document.getElementById('cropListModal');

    function buildCropListTableHTML() {
        const rows = fertilizerLibrary.crops.map(crop => {
            const tN = crop.nutrient_absorption_kg_10a.n * crop.standard_basal_ratio.n;
            const tP = crop.nutrient_absorption_kg_10a.p2o5 * crop.standard_basal_ratio.p2o5;
            const tK = crop.nutrient_absorption_kg_10a.k2o * crop.standard_basal_ratio.k2o;
            return `
                <tr>
                    <td class="fert-name-cell">${crop.emoji} ${crop.name}</td>
                    <td>${categoryLabel[crop.category] || ''}</td>
                    <td>${tN.toFixed(1)}</td>
                    <td>${tP.toFixed(1)}</td>
                    <td>${tK.toFixed(1)}</td>
                </tr>
            `;
        }).join('');

        return `
            <table class="fert-table">
                <thead>
                    <tr>
                        <th>作物名</th>
                        <th>分類</th>
                        <th>目標N(kg)</th>
                        <th>目標P2O5(kg)</th>
                        <th>目標K2O(kg)</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }
    document.getElementById('cropListTable').innerHTML = buildCropListTableHTML();

    document.getElementById('cropListBtn').addEventListener('click', () => cropListModal.style.display = 'block');
    document.getElementById('closeCropListModal').addEventListener('click', () => cropListModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === cropListModal) cropListModal.style.display = 'none'; });

    // ---------- フロー図（1→2→3）の状態表示 ----------
    function setFlowStep(activeStep) {
        document.querySelectorAll('.flow-step').forEach(el => {
            const step = parseInt(el.dataset.step, 10);
            el.classList.remove('is-active', 'is-done');
            if (step < activeStep) el.classList.add('is-done');
            else if (step === activeStep) el.classList.add('is-active');
        });
    }

    // ---------- 面積の取得・換算 ----------
    function getAreaM2() {
        const val = parseFloat(document.getElementById('areaValue').value);
        const unit = document.getElementById('areaUnit').value;
        if (isNaN(val) || val <= 0) return AREA_DEFAULT_M2;
        return val * (AREA_UNIT_FACTOR[unit] || 1);
    }

    function updateAreaConvertedDisplay() {
        const areaM2 = getAreaM2();
        const a = areaM2 / 100;
        const ha = areaM2 / 10000;
        document.getElementById('areaConverted').textContent =
            `= ${areaM2.toLocaleString('ja-JP', { maximumFractionDigits: 1 })} ㎡ ／ ${a.toFixed(2)} a ／ ${ha.toFixed(3)} ha`;
    }
    document.getElementById('areaValue').addEventListener('input', updateAreaConvertedDisplay);
    document.getElementById('areaUnit').addEventListener('change', updateAreaConvertedDisplay);
    updateAreaConvertedDisplay();

    // ---------- ファイル名サニタイズ・日付 ----------
    function sanitizeFilename(name) {
        return name.replace(/[\\/:*?"<>|]/g, '').trim();
    }
    function todayStamp() {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // ---------- パラメータの保存・復元 ----------
    function collectParameterData() {
        const selectedCrop = fertilizerLibrary.crops.find(c => c.id === cropSelect.value);
        const fertilizers = [];
        for (let i = 1; i <= FERT_COUNT; i++) {
            fertilizers.push({
                name: document.getElementById(`fert_name_${i}`).value,
                n: document.getElementById(`fert_n_${i}`).value,
                p: document.getElementById(`fert_p_${i}`).value,
                k: document.getElementById(`fert_k_${i}`).value,
                cao: document.getElementById(`fert_cao_${i}`).value,
                mgo: document.getElementById(`fert_mgo_${i}`).value,
                bagWeight: document.getElementById(`fert_bagweight_${i}`).value,
                amount: document.getElementById(`fert_amount_${i}`).value
            });
        }
        return {
            savedAt: new Date().toISOString(),
            cropId: cropSelect.value,
            cropName: selectedCrop ? selectedCrop.name : '',
            soil: {
                ph: document.getElementById('soil_ph').value,
                ec: document.getElementById('soil_ec').value,
                cao: document.getElementById('soil_cao').value,
                mgo: document.getElementById('soil_mgo').value,
                k2o: document.getElementById('soil_k2o').value,
                p2o5: document.getElementById('soil_p2o5').value,
                cec: document.getElementById('soil_cec').value,
                base_sat: document.getElementById('soil_base_sat').value,
                cao_mgo_ratio: document.getElementById('soil_cao_mgo_ratio').value,
                mgo_k2o_ratio: document.getElementById('soil_mgo_k2o_ratio').value,
                no3n: document.getElementById('soil_no3n').value
            },
            area: {
                value: document.getElementById('areaValue').value,
                unit: document.getElementById('areaUnit').value,
                fieldName: document.getElementById('fieldName').value
            },
            fertilizers: fertilizers
        };
    }

    function applyParameterData(data) {
        if (!data.soil) throw new Error('invalid format');

        cropSelect.value = data.cropId || '';
        document.getElementById('soil_ph').value = data.soil.ph || '';
        document.getElementById('soil_ec').value = data.soil.ec || '';
        document.getElementById('soil_cao').value = data.soil.cao || '';
        document.getElementById('soil_mgo').value = data.soil.mgo || '';
        document.getElementById('soil_k2o').value = data.soil.k2o || '';
        document.getElementById('soil_p2o5').value = data.soil.p2o5 || '';
        document.getElementById('soil_cec').value = data.soil.cec || '';
        document.getElementById('soil_base_sat').value = data.soil.base_sat || '';
        document.getElementById('soil_cao_mgo_ratio').value = data.soil.cao_mgo_ratio || '';
        document.getElementById('soil_mgo_k2o_ratio').value = data.soil.mgo_k2o_ratio || '';
        document.getElementById('soil_no3n').value = data.soil.no3n || '';

        if (data.area) {
            document.getElementById('areaValue').value = data.area.value || '';
            document.getElementById('areaUnit').value = data.area.unit || 'm2';
            document.getElementById('fieldName').value = data.area.fieldName || '';
        }
        updateAreaConvertedDisplay();

        const fertilizers = Array.isArray(data.fertilizers) ? data.fertilizers : [];
        for (let i = 1; i <= FERT_COUNT; i++) {
            const f = fertilizers[i - 1] || {};
            document.getElementById(`fert_name_${i}`).value = f.name || '';
            document.getElementById(`fert_n_${i}`).value = f.n || '';
            document.getElementById(`fert_p_${i}`).value = f.p || '';
            document.getElementById(`fert_k_${i}`).value = f.k || '';
            document.getElementById(`fert_cao_${i}`).value = f.cao || '';
            document.getElementById(`fert_mgo_${i}`).value = f.mgo || '';
            document.getElementById(`fert_bagweight_${i}`).value = f.bagWeight || '';
            document.getElementById(`fert_amount_${i}`).value = f.amount || '';
        }
    }

    function saveParametersToFile() {
        const data = collectParameterData();
        const defaultName = `施肥パラメータ_${data.cropName || '未選択'}_${todayStamp()}`;
        let filename = prompt('保存するファイル名を入力してください（拡張子 .json は自動で付きます）', defaultName);
        if (filename === null) return;
        filename = sanitizeFilename(filename) || defaultName;
        if (!filename.toLowerCase().endsWith('.json')) filename += '.json';

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert(`「${filename}」として保存しました。`);
    }
    document.getElementById('saveBtn').addEventListener('click', saveParametersToFile);
    document.getElementById('saveBtnBottom').addEventListener('click', saveParametersToFile);

    const restoreFileInput = document.getElementById('restoreFileInput');
    function openRestoreDialog() { restoreFileInput.click(); }
    document.getElementById('restoreBtn').addEventListener('click', openRestoreDialog);
    document.getElementById('restoreBtnBottom').addEventListener('click', openRestoreDialog);

    restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                applyParameterData(data);
                alert(`「${file.name}」からパラメータを復元しました。`);
            } catch (err) {
                alert('ファイルの読み込みに失敗しました。正しい形式の.jsonファイルか確認してください。');
            } finally {
                restoreFileInput.value = '';
            }
        };
        reader.onerror = () => {
            alert('ファイルの読み込み中にエラーが発生しました。');
            restoreFileInput.value = '';
        };
        reader.readAsText(file);
    });

    // ---------- カードHTML生成 ----------
    function buildNpkCard(key, label, sub, target, residual, deficit) {
        const pct = target > 0 ? Math.min(100, (residual / target) * 100) : 0;
        const sufficient = deficit <= 0;
        return `
            <div class="npk-card npk-${key}">
                <div class="npk-card-head">
                    <span class="icon-circle">${ICONS[key]}</span>
                    <div>
                        <div class="npk-title">${label}</div>
                        <div class="npk-sub">${sub}</div>
                    </div>
                </div>
                <div class="npk-bar-track">
                    <div class="npk-bar-fill" style="width:${pct}%;"></div>
                </div>
                <div class="npk-numbers">
                    <span>目標 <strong>${target.toFixed(1)}</strong>kg</span>
                    <span>残存 <strong>${residual.toFixed(1)}</strong>kg</span>
                </div>
                <div class="npk-deficit-line">${sufficient ? '✅ 目標量に到達しています' : `🌾 不足量：${deficit.toFixed(1)} kg`}</div>
            </div>
        `;
    }

    function buildFinalNpkCard(key, label, sub, target, deficit, applied) {
        const pct = deficit > 0 ? Math.min(100, (applied / deficit) * 100) : 100;
        let statusLine;
        if (deficit <= 0) {
            statusLine = `✅ もともと目標量に達しています（今回投入 +${applied.toFixed(1)}kg）`;
        } else {
            const remaining = Math.max(0, deficit - applied);
            statusLine = remaining <= 0
                ? `✅ 不足分をカバーしています（余裕 +${(applied - deficit).toFixed(1)}kg）`
                : `⚠️ まだ ${remaining.toFixed(1)} kg 不足しています`;
        }
        return `
            <div class="npk-card npk-${key}">
                <div class="npk-card-head">
                    <span class="icon-circle">${ICONS[key]}</span>
                    <div>
                        <div class="npk-title">${label}</div>
                        <div class="npk-sub">${sub}</div>
                    </div>
                </div>
                <div class="npk-bar-track">
                    <div class="npk-bar-fill" style="width:${pct}%;"></div>
                </div>
                <div class="npk-numbers">
                    <span>目標 <strong>${target.toFixed(1)}</strong>kg</span>
                    <span>不足 <strong>${deficit.toFixed(1)}</strong>kg</span>
                </div>
                <div class="npk-numbers">
                    <span>今回投入量 <strong>${applied.toFixed(1)}</strong>kg</span>
                </div>
                <div class="npk-deficit-line">${statusLine}</div>
            </div>
        `;
    }

    // 石灰・苦土 資材の選び方アドバイス（石灰/苦土比ベース）
    function buildMaterialAdvice(caoMgoRatio) {
        if (isNaN(caoMgoRatio)) {
            return '石灰/苦土比(9)を入力すると、苦土石灰と炭酸カルシウムのどちらが適しているかをアドバイスします。';
        }
        if (caoMgoRatio > 8) {
            return `石灰/苦土比 ${caoMgoRatio.toFixed(1)} — 石灰に対して苦土（マグネシウム）が相対的に不足気味です。苦土石灰（ドロマイト）での補給がおすすめです。`;
        }
        if (caoMgoRatio < 3) {
            return `石灰/苦土比 ${caoMgoRatio.toFixed(1)} — 苦土に対して石灰が少なめです。炭酸カルシウムなど苦土を含まない石灰質資材が適しています。`;
        }
        return `石灰/苦土比 ${caoMgoRatio.toFixed(1)} — バランス良好です。通常の苦土石灰で問題ありません。`;
    }

    // 堆肥のめやすテキスト（面積に応じて実施用量も併記）
    function buildCompostText(crop, scale) {
        const range = compostRanges[crop.category] || compostRanges.leafy;
        const totalMin = (range.min * scale).toFixed(1);
        const totalMax = (range.max * scale).toFixed(1);
        return `【${categoryLabel[crop.category] || ''}】完熟堆肥 ${range.min}〜${range.max} t/10a が目安です（今回の面積では 約${totalMin}〜${totalMax} t）。${range.note}`;
    }

    // ---------- 土壌分析結果の過不足バッジ ----------
    // pH・EC・CEC・塩基飽和度・石灰/苦土比・苦土/加里比など、kg換算の意味を持たない項目用：
    // 目安値との差を%のみで表示する（適正範囲内なら「✓ 適正」）。
    function buildDeviationBadge(measured, target) {
        if (isNaN(measured) || isNaN(target) || target === 0) return '';
        const diffPct = ((measured - target) / target) * 100;
        if (Math.abs(diffPct) < SOIL_BADGE_TOLERANCE_PCT) {
            return '<span class="soil-badge soil-badge-ok">✓ 適正</span>';
        }
        return diffPct < 0
            ? `<span class="soil-badge soil-badge-low">↓${Math.abs(diffPct).toFixed(0)}%</span>`
            : `<span class="soil-badge soil-badge-high">↑${diffPct.toFixed(0)}%</span>`;
    }

    // N・P2O5・K2O・CaO・MgOなど、すでに目標・残存(kg/10a換算後)が計算済みの養分用：
    // %と合わせて不足・過剰のkgも表示する。nutrientScaled = { target, residual, deficit }（面積換算済み）
    function buildNutrientBadge(nutrientScaled) {
        if (!nutrientScaled || nutrientScaled.target <= 0) return '';
        const diffPct = ((nutrientScaled.residual - nutrientScaled.target) / nutrientScaled.target) * 100;
        const diffKg = nutrientScaled.residual - nutrientScaled.target;
        if (Math.abs(diffPct) < SOIL_BADGE_TOLERANCE_PCT) {
            return '<span class="soil-badge soil-badge-ok">✓ 適正</span>';
        }
        return diffPct < 0
            ? `<span class="soil-badge soil-badge-low">↓${Math.abs(diffPct).toFixed(0)}%(${Math.abs(diffKg).toFixed(1)}kg)</span>`
            : `<span class="soil-badge soil-badge-high">↑${diffPct.toFixed(0)}%(${diffKg.toFixed(1)}kg)</span>`;
    }

    // 残存窒素量を算出する。
    // (11)推定硝酸態窒素の入力があればそれを優先し、未入力の場合のみ電気伝導度(EC)から推定する。
    function estimateResidualNitrogen(no3nInput, ecInput) {
        const hasNo3n = !isNaN(no3nInput) && no3nInput >= 0;

        if (hasNo3n) {
            const no3n_mg100g = no3nInput;
            const residualN = no3n_mg100g * MG100G_TO_KG10A;
            return { source: 'measured', no3n_mg100g, residualN, ec: null, usedDefaultEc: false };
        }

        const usedDefaultEc = isNaN(ecInput) || ecInput <= 0;
        const ec = usedDefaultEc ? DEFAULT_EC : ecInput;
        const no3n_mg100g = ec * EC_TO_NO3N_MG100G;
        const residualN = no3n_mg100g * MG100G_TO_KG10A;
        return { source: 'ec', no3n_mg100g, residualN, ec, usedDefaultEc };
    }

    // 窒素残存量の算定方法アドバイス文
    function buildNitrogenAdviceText(nEstimate) {
        let methodText;
        if (nEstimate.source === 'measured') {
            methodText = `(11)推定硝酸態窒素の入力値 ${nEstimate.no3n_mg100g.toFixed(1)} mg/100g を使用しています`;
        } else if (nEstimate.usedDefaultEc) {
            methodText = `(11)推定硝酸態窒素・ECともに未入力のため、仮の値(EC=${DEFAULT_EC.toFixed(2)} mS/cm)で推定しています`;
        } else {
            methodText = `(11)推定硝酸態窒素が未入力のため、入力されたEC ${nEstimate.ec.toFixed(2)} mS/cm から推定しています`;
        }
        return `${methodText}。推定硝酸態窒素 約${nEstimate.no3n_mg100g.toFixed(1)} mg/100g → 残存窒素 約${nEstimate.residualN.toFixed(1)} kg/10a として計算に使用します。`;
    }

    // 作物・土壌値から5養分（N/P/K/CaO/MgO）の目標・残存・不足（10aあたり）を算出
    function calcBaseNutrients(crop, soil) {
        const nEstimate = estimateResidualNitrogen(soil.no3n, soil.ec);

        const targetN = crop.nutrient_absorption_kg_10a.n * crop.standard_basal_ratio.n;
        const targetP = crop.nutrient_absorption_kg_10a.p2o5 * crop.standard_basal_ratio.p2o5;
        const targetK = crop.nutrient_absorption_kg_10a.k2o * crop.standard_basal_ratio.k2o;
        const targetCaO = TARGET_CAO_MG100G * MG100G_TO_KG10A;
        const targetMgO = TARGET_MGO_MG100G * MG100G_TO_KG10A;

        const residualN = nEstimate.residualN;
        const residualP = soil.p2o5 * MG100G_TO_KG10A;
        const residualK = soil.k2o * MG100G_TO_KG10A;
        const residualCaO = soil.cao * MG100G_TO_KG10A;
        const residualMgO = soil.mgo * MG100G_TO_KG10A;

        return {
            nEstimate,
            n:   { target: targetN,   residual: residualN,   deficit: Math.max(0, targetN - residualN) },
            p:   { target: targetP,   residual: residualP,   deficit: Math.max(0, targetP - residualP) },
            k:   { target: targetK,   residual: residualK,   deficit: Math.max(0, targetK - residualK) },
            cao: { target: targetCaO, residual: residualCaO, deficit: Math.max(0, targetCaO - residualCaO) },
            mgo: { target: targetMgO, residual: residualMgO, deficit: Math.max(0, targetMgO - residualMgO) }
        };
    }

    function scaleNutrients(base, scale) {
        const out = {};
        NUTRIENT_DEFS.forEach(def => {
            const b = base[def.key];
            out[def.key] = {
                target: b.target * scale,
                residual: b.residual * scale,
                deficit: Math.max(0, b.target * scale - b.residual * scale)
            };
        });
        return out;
    }

    function renderNpkGrid(containerId, scaled) {
        const html = NUTRIENT_DEFS.map(def =>
            buildNpkCard(def.key, def.label, def.sub, scaled[def.key].target, scaled[def.key].residual, scaled[def.key].deficit)
        ).join('');
        document.getElementById(containerId).innerHTML = html;
    }

    // 肥料テーブルHTMLを生成（袋数計算結果 / 最終報告書で共用）
    function buildFertTableHTML(rows, totals) {
        const bodyRows = rows.map(r => `
            <tr>
                <td class="fert-name-cell">${r.name}</td>
                <td>${r.amount.toFixed(1)}</td>
                <td>${r.bags === null ? '—' : `${r.bags} 袋`}</td>
                <td>${r.suppliedN.toFixed(1)}</td>
                <td>${r.suppliedP.toFixed(1)}</td>
                <td>${r.suppliedK.toFixed(1)}</td>
                <td>${r.suppliedCaO.toFixed(1)}</td>
                <td>${r.suppliedMgO.toFixed(1)}</td>
            </tr>
        `).join('');

        return `
            <table class="fert-table">
                <thead>
                    <tr>
                        <th>肥料名</th>
                        <th>使用量(kg)</th>
                        <th>袋数</th>
                        <th>N(kg)</th>
                        <th>P2O5(kg)</th>
                        <th>K2O(kg)</th>
                        <th>CaO(kg)</th>
                        <th>MgO(kg)</th>
                    </tr>
                </thead>
                <tbody>
                    ${bodyRows}
                    <tr class="fert-total-row">
                        <td class="fert-name-cell">合計</td>
                        <td>${totals.amount.toFixed(1)}</td>
                        <td>—</td>
                        <td>${totals.n.toFixed(1)}</td>
                        <td>${totals.p.toFixed(1)}</td>
                        <td>${totals.k.toFixed(1)}</td>
                        <td>${totals.cao.toFixed(1)}</td>
                        <td>${totals.mgo.toFixed(1)}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    // 8種類の肥料入力欄を読み取り、使用量・袋数・供給養分を計算する
    function readFertilizerRows() {
        const rows = [];
        for (let i = 1; i <= FERT_COUNT; i++) {
            const name = document.getElementById(`fert_name_${i}`).value.trim();
            const n = parseFloat(document.getElementById(`fert_n_${i}`).value) || 0;
            const p = parseFloat(document.getElementById(`fert_p_${i}`).value) || 0;
            const k = parseFloat(document.getElementById(`fert_k_${i}`).value) || 0;
            const cao = parseFloat(document.getElementById(`fert_cao_${i}`).value) || 0;
            const mgo = parseFloat(document.getElementById(`fert_mgo_${i}`).value) || 0;
            const bagWeight = parseFloat(document.getElementById(`fert_bagweight_${i}`).value) || 0;
            const amount = parseFloat(document.getElementById(`fert_amount_${i}`).value) || 0;

            if (!name && amount <= 0) continue; // 未入力の行はスキップ

            rows.push({
                name: name || `肥料${i}`,
                amount,
                bagWeight,
                bags: bagWeight > 0 ? Math.ceil(amount / bagWeight) : null,
                suppliedN: amount * (n / 100),
                suppliedP: amount * (p / 100),
                suppliedK: amount * (k / 100),
                suppliedCaO: amount * (cao / 100),
                suppliedMgO: amount * (mgo / 100)
            });
        }
        return rows;
    }

    function sumFertilizerRows(rows) {
        const totals = { amount: 0, n: 0, p: 0, k: 0, cao: 0, mgo: 0 };
        rows.forEach(r => {
            totals.amount += r.amount;
            totals.n += r.suppliedN;
            totals.p += r.suppliedP;
            totals.k += r.suppliedK;
            totals.cao += r.suppliedCaO;
            totals.mgo += r.suppliedMgO;
        });
        return totals;
    }

    // ---------- 状態保持 ----------
    let lastCalc = null;      // (1)→(2) 施肥計算をする、時点の情報
    let lastFertCalc = null;  // (2) 投入量を計算する、時点の情報

    // ---------- (1) 施肥計算をする ----------
    document.getElementById('calcBtn').addEventListener('click', () => {
        const cropId = cropSelect.value;
        if (!cropId) {
            alert('作物を選択してください。');
            return;
        }
        const crop = fertilizerLibrary.crops.find(c => c.id === cropId);

        const soil = {
            ph: parseFloat(document.getElementById('soil_ph').value),
            ec: parseFloat(document.getElementById('soil_ec').value),
            cao: parseFloat(document.getElementById('soil_cao').value) || 0,
            mgo: parseFloat(document.getElementById('soil_mgo').value) || 0,
            k2o: parseFloat(document.getElementById('soil_k2o').value) || 0,
            p2o5: parseFloat(document.getElementById('soil_p2o5').value) || 0,
            cec: parseFloat(document.getElementById('soil_cec').value),
            base_sat: parseFloat(document.getElementById('soil_base_sat').value),
            cao_mgo_ratio: parseFloat(document.getElementById('soil_cao_mgo_ratio').value),
            mgo_k2o_ratio: parseFloat(document.getElementById('soil_mgo_k2o_ratio').value),
            no3n: parseFloat(document.getElementById('soil_no3n').value)
        };

        const soilSnapshot = {
            ph: document.getElementById('soil_ph').value || '-',
            ec: document.getElementById('soil_ec').value || '-',
            cao: document.getElementById('soil_cao').value || '-',
            mgo: document.getElementById('soil_mgo').value || '-',
            k2o: document.getElementById('soil_k2o').value || '-',
            p2o5: document.getElementById('soil_p2o5').value || '-',
            cec: document.getElementById('soil_cec').value || '-',
            base_sat: document.getElementById('soil_base_sat').value || '-',
            cao_mgo_ratio: document.getElementById('soil_cao_mgo_ratio').value || '-',
            mgo_k2o_ratio: document.getElementById('soil_mgo_k2o_ratio').value || '-',
            no3n: document.getElementById('soil_no3n').value || '-'
        };

        const base = calcBaseNutrients(crop, soil);
        const areaM2 = getAreaM2();
        const scale = areaM2 / AREA_DEFAULT_M2;
        const scaled = scaleNutrients(base, scale);

        // 作物バッジの更新
        document.getElementById('resultCropEmoji').textContent = crop.emoji;
        document.getElementById('resultCropName').textContent = crop.name;

        // 目標値・残存量・不足量カード
        renderNpkGrid('npkGrid', scaled);

        // 窒素算定・堆肥・石灰苦土資材アドバイス
        document.getElementById('nitrogenAdviceText').textContent = buildNitrogenAdviceText(base.nEstimate);
        document.getElementById('compostAdviceText').textContent = buildCompostText(crop, scale);
        document.getElementById('limeAdviceText').textContent = buildMaterialAdvice(soil.cao_mgo_ratio);

        lastCalc = { crop, soil, soilSnapshot, base };
        lastFertCalc = null;

        document.getElementById('section2').style.display = 'block';
        document.getElementById('section3').style.display = 'none';
        document.getElementById('fertResultArea').style.display = 'none';
        setFlowStep(2);
        document.getElementById('section2').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---------- (2) 投入量を計算する ----------
    document.getElementById('recalcBtn').addEventListener('click', () => {
        if (!lastCalc) {
            alert('先に「施肥計算をする」を実行してください。');
            return;
        }

        // 面積に応じて目標・残存・不足を再計算し、上部カードを更新
        const areaM2 = getAreaM2();
        const scale = areaM2 / AREA_DEFAULT_M2;
        const scaled = scaleNutrients(lastCalc.base, scale);
        renderNpkGrid('npkGrid', scaled);
        document.getElementById('compostAdviceText').textContent = buildCompostText(lastCalc.crop, scale);

        // 肥料入力欄を読み取り
        const rows = readFertilizerRows();
        if (rows.length === 0) {
            alert('少なくとも1つの肥料の「肥料名」または「今回投入量」を入力してください。');
            return;
        }
        const totals = sumFertilizerRows(rows);

        // 肥料ごとの使用量・袋数テーブル
        document.getElementById('fertResultTable').innerHTML = buildFertTableHTML(rows, totals);

        // 目標・投入・過不足カード
        const finalHtml = NUTRIENT_DEFS.map(def =>
            buildFinalNpkCard(def.key, def.label, def.sub, scaled[def.key].target, scaled[def.key].deficit, totals[def.key])
        ).join('');
        document.getElementById('finalNpkGrid').innerHTML = finalHtml;
        document.getElementById('fertResultArea').style.display = 'block';

        lastFertCalc = { areaM2, scale, scaled, rows, totals };

        document.getElementById('fertResultArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // ---------- (2)→(3) 施肥設計完了 ----------
    document.getElementById('completeBtn').addEventListener('click', () => {
        if (!lastCalc || !lastFertCalc) {
            alert('先に「投入量を計算する」を実行してください。');
            return;
        }

        const crop = lastCalc.crop;
        const { areaM2, scale, scaled, rows, totals } = lastFertCalc;
        const a = areaM2 / 100;
        const ha = areaM2 / 10000;
        const fieldName = document.getElementById('fieldName').value.trim();

        // バッジ・タイトル（作成日は栽培作物名の右側に表示し、PNG/PDF出力にも含まれる）
        document.getElementById('reportCropEmoji').textContent = crop.emoji;
        document.getElementById('reportCropName').textContent = fieldName ? `${crop.name}（${fieldName}）` : crop.name;
        document.getElementById('captureCropEmoji').textContent = crop.emoji;
        document.getElementById('captureCropName').textContent = `${crop.emoji} ${crop.name}`;
        document.getElementById('captureDateBadge').textContent = `作成日: ${todayStamp()}`;
        document.getElementById('captureAreaCaption').textContent =
            (fieldName ? `圃場名：${fieldName} ／ ` : '') +
            `面積：${areaM2.toLocaleString('ja-JP', { maximumFractionDigits: 1 })} ㎡（${a.toFixed(2)} a ／ ${ha.toFixed(3)} ha）`;

        // 土壌分析結果サマリー（各項目の右側に目安値との過不足バッジを表示）
        const targetPh = crop.targetPh || DEFAULT_TARGET_PH;
        const soilLabels = [
            { key: 'ph', label: 'pH (H2O)', badge: buildDeviationBadge(lastCalc.soil.ph, targetPh) },
            { key: 'ec', label: 'EC (mS/cm)', badge: buildDeviationBadge(lastCalc.soil.ec, SOIL_ITEM_REFERENCE.ec) },
            { key: 'cao', label: '石灰 CaO (mg/100g)', badge: buildNutrientBadge(scaled.cao) },
            { key: 'mgo', label: '苦土 MgO (mg/100g)', badge: buildNutrientBadge(scaled.mgo) },
            { key: 'k2o', label: '加里 K2O (mg/100g)', badge: buildNutrientBadge(scaled.k) },
            { key: 'p2o5', label: 'トルオーグ燐酸 (mg/100g)', badge: buildNutrientBadge(scaled.p) },
            { key: 'cec', label: 'CEC (me)', badge: buildDeviationBadge(lastCalc.soil.cec, SOIL_ITEM_REFERENCE.cec) },
            { key: 'base_sat', label: '塩基飽和度 (%)', badge: buildDeviationBadge(lastCalc.soil.base_sat, SOIL_ITEM_REFERENCE.base_sat) },
            { key: 'cao_mgo_ratio', label: '石灰/苦土比', badge: buildDeviationBadge(lastCalc.soil.cao_mgo_ratio, SOIL_ITEM_REFERENCE.cao_mgo_ratio) },
            { key: 'mgo_k2o_ratio', label: '苦土/加里比', badge: buildDeviationBadge(lastCalc.soil.mgo_k2o_ratio, SOIL_ITEM_REFERENCE.mgo_k2o_ratio) },
            { key: 'no3n', label: '推定硝酸態窒素 (mg/100g)', badge: buildNutrientBadge(scaled.n) }
        ];
        document.getElementById('soilSummaryGrid').innerHTML = soilLabels.map(item => `
            <div class="soil-summary-item">
                <span class="label">${item.label}</span>
                <div class="soil-summary-value-row">
                    <span class="value">${lastCalc.soilSnapshot[item.key]}</span>
                    ${item.badge}
                </div>
            </div>
        `).join('');
        document.getElementById('soilBadgeLegend').style.display = 'block';

        // 目標・不足・投入量カード
        const finalHtml = NUTRIENT_DEFS.map(def =>
            buildFinalNpkCard(def.key, def.label, def.sub, scaled[def.key].target, scaled[def.key].deficit, totals[def.key])
        ).join('');
        document.getElementById('finalReportNpkGrid').innerHTML = finalHtml;

        // 肥料の詳細テーブル
        document.getElementById('finalReportFertTable').innerHTML = buildFertTableHTML(rows, totals);

        // 堆肥のめやす
        document.getElementById('finalReportCompostText').textContent = buildCompostText(crop, scale);

        document.getElementById('section3').style.display = 'block';
        setFlowStep(3);
        document.getElementById('section3').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---------- 結果の画像化（PNG・PDF共通、A4レイアウトに合わせて出力） ----------
    const A4_WIDTH_MM = 210;  // A4縦
    const A4_HEIGHT_MM = 297; // A4縦
    const EXPORT_DPI = 200; // 出力解像度の目安（約200dpi）
    const PX_PER_MM = EXPORT_DPI / 25.4;
    const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * PX_PER_MM);

    // ライセンス表記(右下)をcanvasに印字する
    // 作成日は栽培作物名の右側（#captureDateBadge）としてHTML側に描画済みのため、
    // html2canvasでの撮影時に自動的に含まれる。ここでは重複させないためライセンス表記のみ追加する。
    function stampCaptureCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const padding = 5 * PX_PER_MM;
        const fontSize = 3.2 * PX_PER_MM;

        ctx.font = `bold ${fontSize}px "Noto Sans JP", "Hiragino Sans", Arial, sans-serif`;
        ctx.textAlign = 'right';

        // 右下：ライセンス表記
        const footerLines = [
            'This project is licensed under the BSD 3-Clause License.',
            'Copyright (c) 2026 y-ookuma'
        ];
        const lineHeight = 4.2 * PX_PER_MM;
        const bottomBlockHeight = lineHeight * footerLines.length + padding * 0.8;
        ctx.fillStyle = 'rgba(253, 254, 252, 0.94)';
        ctx.fillRect(0, canvas.height - bottomBlockHeight, canvas.width, bottomBlockHeight);

        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#2E3B2E';
        const rightX = canvas.width - padding;
        let y = canvas.height - padding;
        for (let i = footerLines.length - 1; i >= 0; i--) {
            ctx.fillText(footerLines[i], rightX, y);
            y -= lineHeight;
        }

        return canvas;
    }

    // captureAreaをA4の幅(px)で複製した、画面には表示されない複製要素を作る。
    // 複製をbodyへ直接追加することで、.containerのmax-width制約を受けずにA4幅へ広げられる。
    function buildA4Clone() {
        const source = document.getElementById('captureArea');
        const clone = source.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.add('a4-export');
        clone.style.width = `${A4_WIDTH_PX}px`;
        clone.style.maxWidth = 'none';
        clone.style.boxSizing = 'border-box';
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '-99999px';
        clone.style.margin = '0';
        document.body.appendChild(clone);
        return clone;
    }

    // captureAreaをA4幅で撮影し、スタンプ済みcanvasを返す（フォント読み込み待ち。読み込みが長引いても2秒でタイムアウトして進む）
    // 返されるcanvasは横幅がA4横(297mm)固定、縦はA4何ページ分に相当する内容の長さになる。
    function generateA4ReportCanvas() {
        const fontsReadyPromise = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
        const fontsReady = Promise.race([fontsReadyPromise, timeoutPromise]);

        console.log(`[施肥設計書] A4レイアウト(幅${A4_WIDTH_PX}px)で画像化を開始します…`);
        const clone = buildA4Clone();

        return fontsReady
            .then(() => {
                console.log('[施肥設計書] フォント待ち完了。html2canvasで撮影します…');
                return html2canvas(clone, {
                    backgroundColor: '#FDFEFC',
                    width: A4_WIDTH_PX,
                    windowWidth: A4_WIDTH_PX,
                    scale: 1
                });
            })
            .then(canvas => {
                document.body.removeChild(clone);
                console.log(`[施肥設計書] 撮影完了 (${canvas.width}x${canvas.height})。ライセンスを印字します…`);
                const stamped = stampCaptureCanvas(canvas);
                console.log('[施肥設計書] 印字完了。');
                return stamped;
            })
            .catch(err => {
                if (clone.parentNode) document.body.removeChild(clone);
                throw err;
            });
    }

    // ---------- PNG出力（A4横幅の画像。内容が長い場合は縦に長い画像になる） ----------
    document.getElementById('exportPngBtn').addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert('PNG出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        generateA4ReportCanvas()
            .then(canvas => {
                const link = document.createElement('a');
                const cropName = document.getElementById('reportCropName').textContent || 'result';
                link.download = `施肥設計書_${cropName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            })
            .catch(err => {
                console.error('PNG出力エラー:', err);
                alert('PNGの生成に失敗しました。もう一度お試しください。');
            });
    });

    // ---------- PDF出力（A4サイズで、内容が1ページに収まらない場合は複数ページに分割） ----------
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert('PDF出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            alert('PDF出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        generateA4ReportCanvas()
            .then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                const pxPerMm = canvas.width / A4_WIDTH_MM;
                const pageHeightPx = Math.floor(A4_HEIGHT_MM * pxPerMm);

                let renderedPx = 0;
                let pageIndex = 0;
                while (renderedPx < canvas.height) {
                    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = sliceHeightPx;
                    const pctx = pageCanvas.getContext('2d');
                    pctx.fillStyle = '#FDFEFC';
                    pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                    pctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

                    const sliceHeightMm = sliceHeightPx / pxPerMm;
                    if (pageIndex > 0) pdf.addPage();
                    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, sliceHeightMm);

                    renderedPx += sliceHeightPx;
                    pageIndex++;
                }

                const cropName = document.getElementById('reportCropName').textContent || 'result';
                pdf.save(`施肥設計書_${cropName}.pdf`);
            })
            .catch(err => {
                console.error('PDF出力エラー:', err);
                alert('PDFの生成に失敗しました。もう一度お試しください。');
            });
    });
});
