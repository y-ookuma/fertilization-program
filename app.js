// 画面の操作・表示。計算は calc.js（FertCalc）、基準データは saitama-data.js（FERT_DATA）にある。
const DATA = window.FERT_DATA;
const Calc = window.FertCalc;

// 「作物を直接入力する」を選んだ際に使う特別なcropSelectの値
const CUSTOM_CROP_VALUE = '__custom__';

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
const DEFAULT_DEPTH_CM = 15;       // 作土深の既定値
const LIME_CAO_PCT = 53;           // 炭酸カルシウムのCaO成分(%) … [青森] p.35
const FERT_COUNT = 8;

const NUTRIENT_DEFS = [
    { key: 'n',   label: '窒素 (N)',       sub: '葉と茎を育てる' },
    { key: 'p',   label: 'リン酸 (P2O5)',  sub: '根と花・実をつくる' },
    { key: 'k',   label: '加里 (K2O)',     sub: '株を丈夫にする' },
    { key: 'cao', label: '石灰 (CaO)',     sub: 'pHを整え根を守る' },
    { key: 'mgo', label: '苦土 (MgO)',     sub: '葉緑素をつくる' }
];

const SOIL_FIELDS = ['ph', 'ec', 'cao', 'mgo', 'k2o', 'p2o5', 'cec', 'base_sat', 'cao_mgo_ratio', 'mgo_k2o_ratio', 'no3n', 'nh4n'];

function cropLabel(crop) {
    return crop.cropType ? `${crop.name}（${crop.cropType}）` : crop.name;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

// 入力欄の数値を読む（空欄はNaN＝未測定として扱う）
function readNum(id) {
    const raw = document.getElementById(id).value;
    if (String(raw).trim() === '') return NaN;
    return parseFloat(raw);
}

const fmt1 = (v) => (isFinite(v) ? v.toFixed(1) : '-');

document.addEventListener('DOMContentLoaded', () => {
    const cropSelect = document.getElementById('cropSelect');
    let lastCalc = null;      // (1) 施肥計算をする、時点の情報
    let lastFertCalc = null;  // (2) 投入量を計算する、時点の情報
    const customCropFields = document.getElementById('customCropFields');
    const customCropHint = document.getElementById('customCropHint');

    // ---------- 作物セレクト（県基準は作物ごと、その他は参考値としてまとめる） ----------
    const customOption = document.createElement('option');
    customOption.value = CUSTOM_CROP_VALUE;
    customOption.textContent = '✏️ 作物・基肥量を直接入力する';
    cropSelect.appendChild(customOption);

    const groups = [];
    DATA.crops.forEach(crop => {
        const label = crop.source === 'saitama' ? `${crop.name}（埼玉県施肥基準）` : '参考値（県基準に掲載なし・出典未確認）';
        let group = groups.find(g => g.label === label);
        if (!group) { group = { label, crops: [] }; groups.push(group); }
        group.crops.push(crop);
    });
    groups.forEach(group => {
        const og = document.createElement('optgroup');
        og.label = group.label;
        group.crops.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.id;
            option.textContent = `${crop.emoji} ${cropLabel(crop)}`;
            og.appendChild(option);
        });
        cropSelect.appendChild(og);
    });

    function updateCustomCropVisibility() {
        const isCustom = cropSelect.value === CUSTOM_CROP_VALUE;
        customCropFields.style.display = isCustom ? 'grid' : 'none';
        customCropHint.style.display = isCustom ? 'block' : 'none';
        updateCropInfo();
    }
    cropSelect.addEventListener('change', updateCustomCropVisibility);

    // 選択中の作物（県基準の作物、参考値の作物、または任意入力の作物）
    function getSelectedCrop() {
        if (cropSelect.value === CUSTOM_CROP_VALUE) {
            const customName = document.getElementById('customCropName').value.trim();
            return {
                id: CUSTOM_CROP_VALUE,
                name: customName || '任意入力の作物',
                cropType: '',
                emoji: '✏️',
                ecClass: document.getElementById('customEcClass').value,
                basal: {
                    n: parseFloat(document.getElementById('customTargetN').value) || 0,
                    p: parseFloat(document.getElementById('customTargetP').value) || 0,
                    k: parseFloat(document.getElementById('customTargetK').value) || 0
                },
                compost: null,
                source: 'custom'
            };
        }
        return DATA.crops.find(c => c.id === cropSelect.value);
    }

    // 作物を選んだときに、県基準の基肥量と出典を表示する
    function updateCropInfo() {
        const info = document.getElementById('cropInfo');
        const crop = cropSelect.value && cropSelect.value !== CUSTOM_CROP_VALUE ? getSelectedCrop() : null;
        if (!crop) { info.style.display = 'none'; return; }
        const src = crop.source === 'saitama'
            ? `埼玉県主要農作物施肥基準（令和7年）${crop.page}`
            : '県基準に掲載のない作物のため、旧ライブラリの参考値（養分吸収量×標準元肥比率、出典未確認）';
        const total = crop.total ? `／ 合計（基肥＋追肥） N ${crop.total.n}・P2O5 ${crop.total.p}・K2O ${crop.total.k}` : '';
        info.innerHTML = `基肥 N <strong>${crop.basal.n}</strong>・P2O5 <strong>${crop.basal.p}</strong>・K2O <strong>${crop.basal.k}</strong> kg/10a ${total}<br><span class="crop-info-src">出典：${escapeHtml(src)}</span>`
            + (crop.note ? `<br><span class="crop-info-note">📌 ${escapeHtml(crop.note)}</span>` : '');
        info.classList.toggle('is-reference', crop.source !== 'saitama');
        info.style.display = 'block';
    }

    // ---------- 土壌タイプ（仮比重・代表CECを自動入力） ----------
    const soilTypeSelect = document.getElementById('soilType');
    DATA.soilTypes.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.name;
        soilTypeSelect.appendChild(option);
    });
    function getSoilType() {
        return DATA.soilTypes.find(t => t.id === soilTypeSelect.value) || DATA.soilTypes.find(t => t.id === 'other');
    }
    function applySoilTypeDefaults() {
        const t = getSoilType();
        document.getElementById('soilBd').value = t.bd;
        document.getElementById('soil_cec').placeholder = t.cec ? `未入力なら${t.cec}（土壌タイプの代表値）` : '例: 15.0（必須）';
        updateConversionPreview();
    }
    function getDepth() {
        const v = readNum('soilDepth');
        return v > 0 ? v : DEFAULT_DEPTH_CM;
    }
    function getBd() {
        const v = readNum('soilBd');
        return v > 0 ? v : getSoilType().bd;
    }
    function updateConversionPreview() {
        const factor = Calc.conversionFactor(getDepth(), getBd());
        document.getElementById('conversionPreview').textContent =
            `→ 土壌分析値 1 mg/100g ＝ ${factor.toFixed(2)} kg/10a（作土深 ${getDepth()}cm ÷ 10 × 仮比重 ${getBd()}）`;
    }
    soilTypeSelect.addEventListener('change', applySoilTypeDefaults);
    document.getElementById('soilDepth').addEventListener('input', updateConversionPreview);
    document.getElementById('soilBd').addEventListener('input', updateConversionPreview);

    // ---------- 堆肥（任意） ----------
    const compostTypeSelect = document.getElementById('compostType');
    DATA.composts.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        compostTypeSelect.insertBefore(option, compostTypeSelect.querySelector('option[value="custom"]'));
    });
    function updateCompostVisibility() {
        const type = compostTypeSelect.value;
        document.getElementById('compostAmountFields').style.display = type ? 'grid' : 'none';
        document.getElementById('compostCustomFields').style.display = type === 'custom' ? 'grid' : 'none';
        const preset = DATA.composts.find(c => c.id === type);
        document.getElementById('compostMoistureGroup').style.display = preset && !preset.asIs ? 'block' : 'none';
    }
    compostTypeSelect.addEventListener('change', updateCompostVisibility);
    function getCompostInput() {
        const type = compostTypeSelect.value;
        if (!type) return null;
        return {
            type,
            name: type === 'custom' ? '堆肥（成分を直接入力）' : DATA.composts.find(c => c.id === type).name,
            source: type === 'custom' ? '入力値' : (DATA.composts.find(c => c.id === type).source || '県基準 表17・18'),
            tons: readNum('compostTons'),
            moisture: readNum('compostMoisture'),
            content: { n: readNum('compostN') || 0, p: readNum('compostP') || 0, k: readNum('compostK') || 0 },
            eff: { n: readNum('compostEffN') || 0, p: readNum('compostEffP') || 0, k: readNum('compostEffK') || 0 }
        };
    }

    // ---------- 肥料入力欄（最大8種類） ----------
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
                        <div class="fert-csv-select-wrap">
                            <select id="fert_csv_select_${i}" class="fert-csv-select" disabled>
                                <option value="">CSVから選択（未読み込み）</option>
                            </select>
                        </div>
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

    // ---------- 肥料一覧CSVの読み込み（肥料名からN/P2O5/K2O/CaO/MgO/1袋の重量を自動入力） ----------
    // 見出し行の列名ゆらぎを吸収するためのエイリアス一覧
    const FERT_CSV_HEADER_ALIASES = {
        category: ['区分', '分類', 'category', 'カテゴリ'],
        name: ['名称', '肥料名', '品名', 'name'],
        n: ['n', '窒素'],
        p: ['p', 'p2o5', 'りん酸', '燐酸'],
        k: ['k', 'k2o', '加里', 'カリ'],
        cao: ['石灰', 'cao'],
        mgo: ['苦土', 'mgo'],
        bagWeight: ['1袋の重量(kg)', '1袋の重量', '袋重量', '重量(kg)', '重量', 'bagweight', 'bag_weight']
    };

    let fertilizerCsvList = []; // [{ category, name, n, p, k, cao, mgo, bagWeight }, ...]

    // 見出し文字列の正規化（全角/半角スペース・括弧・記号を除去し小文字化して比較しやすくする）
    function normalizeHeaderText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[\s　()（）%％]/g, '');
    }

    function detectFertCsvColumns(headerCells) {
        const normalizedHeaders = headerCells.map(normalizeHeaderText);
        const columnIndex = {};
        Object.keys(FERT_CSV_HEADER_ALIASES).forEach((field) => {
            const aliases = FERT_CSV_HEADER_ALIASES[field].map(normalizeHeaderText);
            const idx = normalizedHeaders.findIndex((h) => aliases.includes(h));
            if (idx !== -1) columnIndex[field] = idx;
        });
        return columnIndex;
    }

    // セル全体が数値（末尾の%は可、全角数字も可）の場合だけ読み取る。
    // "6〜8" のような範囲表記や "マンガン0.5%" のような文字列は空欄（null）として扱う。
    function extractNumberFromCell(text) {
        if (text === undefined || text === null) return null;
        const trimmed = String(text).trim()
            .replace(/[０-９．]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
            .replace(/[%％]$/, '').trim();
        if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
        return parseFloat(trimmed);
    }

    // 簡易CSVパーサー（ダブルクォート囲み・エスケープに対応）
    function parseCsvText(text) {
        const rows = [];
        let row = [];
        let cell = '';
        let inQuotes = false;
        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        for (let i = 0; i < normalized.length; i++) {
            const ch = normalized[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (normalized[i + 1] === '"') { cell += '"'; i++; }
                    else { inQuotes = false; }
                } else {
                    cell += ch;
                }
            } else if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                row.push(cell); cell = '';
            } else if (ch === '\n') {
                row.push(cell); cell = '';
                rows.push(row); row = [];
            } else {
                cell += ch;
            }
        }
        if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
        return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
    }

    function parseFertilizerCsv(text) {
        const rows = parseCsvText(text);
        if (rows.length < 2) throw new Error('empty');
        const columnIndex = detectFertCsvColumns(rows[0]);
        if (columnIndex.name === undefined) throw new Error('肥料名の列が見つかりません');

        let lastCategory = '';
        const items = [];
        for (let r = 1; r < rows.length; r++) {
            const cells = rows[r];
            const name = (cells[columnIndex.name] || '').trim();
            if (!name) continue;
            const category = columnIndex.category !== undefined && cells[columnIndex.category] && cells[columnIndex.category].trim()
                ? cells[columnIndex.category].trim()
                : lastCategory;
            lastCategory = category;
            const pick = (field) => columnIndex[field] !== undefined ? extractNumberFromCell(cells[columnIndex[field]]) : null;
            items.push({
                category: category || 'その他',
                name: name,
                n: pick('n'), p: pick('p'), k: pick('k'), cao: pick('cao'), mgo: pick('mgo'), bagWeight: pick('bagWeight')
            });
        }
        return items;
    }

    // 文字コード判定：UTF-8として読めるかを試し、文字化けが多い場合はShift_JIS(CP932)として読み直す
    function decodeFertCsvBuffer(buffer) {
        const bytes = new Uint8Array(buffer);
        const tryDecode = (encoding) => {
            try {
                return new TextDecoder(encoding, { fatal: false }).decode(bytes);
            } catch (e) {
                return null;
            }
        };
        const utf8Text = tryDecode('utf-8');
        const replacementCount = utf8Text ? (utf8Text.match(/�/g) || []).length : Infinity;
        if (utf8Text && replacementCount === 0) return utf8Text;

        const sjisText = tryDecode('shift_jis');
        if (sjisText) return sjisText;

        return utf8Text || '';
    }

    function populateFertCsvSelects() {
        const grouped = [];
        const groupIndexByCategory = {};
        fertilizerCsvList.forEach((item, idx) => {
            if (!(item.category in groupIndexByCategory)) {
                groupIndexByCategory[item.category] = grouped.length;
                grouped.push({ category: item.category, items: [] });
            }
            grouped[groupIndexByCategory[item.category]].items.push(idx);
        });

        let optionsHtml = '<option value="">CSVから選択してください</option>';
        grouped.forEach((group) => {
            optionsHtml += `<optgroup label="${escapeHtml(group.category)}">`;
            group.items.forEach((idx) => {
                optionsHtml += `<option value="${idx}">${escapeHtml(fertilizerCsvList[idx].name)}</option>`;
            });
            optionsHtml += '</optgroup>';
        });

        for (let i = 1; i <= FERT_COUNT; i++) {
            const select = document.getElementById(`fert_csv_select_${i}`);
            select.innerHTML = optionsHtml;
            select.disabled = false;
        }
    }

    function applyFertCsvSelection(rowIndex, itemIndex) {
        if (itemIndex === '' || itemIndex === null || itemIndex === undefined) return;
        const item = fertilizerCsvList[parseInt(itemIndex, 10)];
        if (!item) return;

        // 選択し直した場合に前の肥料の値が混在しないよう、先に各項目を初期化する
        ['name', 'n', 'p', 'k', 'cao', 'mgo', 'bagweight', 'amount'].forEach(f => {
            document.getElementById(`fert_${f}_${rowIndex}`).value = '';
        });

        document.getElementById(`fert_name_${rowIndex}`).value = item.name;
        if (item.n !== null) document.getElementById(`fert_n_${rowIndex}`).value = item.n;
        if (item.p !== null) document.getElementById(`fert_p_${rowIndex}`).value = item.p;
        if (item.k !== null) document.getElementById(`fert_k_${rowIndex}`).value = item.k;
        if (item.cao !== null) document.getElementById(`fert_cao_${rowIndex}`).value = item.cao;
        if (item.mgo !== null) document.getElementById(`fert_mgo_${rowIndex}`).value = item.mgo;
        if (item.bagWeight !== null) document.getElementById(`fert_bagweight_${rowIndex}`).value = item.bagWeight;
    }

    for (let i = 1; i <= FERT_COUNT; i++) {
        document.getElementById(`fert_csv_select_${i}`).addEventListener('change', (e) => {
            applyFertCsvSelection(i, e.target.value);
            invalidateStep3();
        });
    }

    const fertCsvFileInput = document.getElementById('fertCsvFileInput');
    const fertCsvStatus = document.getElementById('fertCsvStatus');
    document.getElementById('fertCsvLoadBtn').addEventListener('click', () => fertCsvFileInput.click());

    fertCsvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = decodeFertCsvBuffer(evt.target.result);
                const items = parseFertilizerCsv(text);
                if (items.length === 0) throw new Error('肥料データが見つかりません');
                fertilizerCsvList = items;
                populateFertCsvSelects();
                fertCsvStatus.textContent = `✅ 「${file.name}」を読み込みました（${items.length}件の肥料）。各行の「CSVから選択」で肥料名を選ぶと自動入力されます。`;
                fertCsvStatus.classList.add('is-loaded');
            } catch (err) {
                alert('CSVファイルの読み込みに失敗しました。見出し行に肥料名の列（例：名称、肥料名）があるか確認してください。');
                fertCsvStatus.textContent = '⚠️ 読み込みに失敗しました。ファイル形式をご確認のうえ、もう一度お試しください。';
                fertCsvStatus.classList.remove('is-loaded');
            } finally {
                fertCsvFileInput.value = '';
            }
        };
        reader.onerror = () => {
            alert('ファイルの読み込み中にエラーが発生しました。');
            fertCsvFileInput.value = '';
        };
        reader.readAsArrayBuffer(file);
    });

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
        const rows = DATA.crops.map(crop => {
            const t = crop.total;
            return `
                <tr${crop.source !== 'saitama' ? ' class="is-reference-row"' : ''}>
                    <td class="fert-name-cell">${crop.emoji} ${escapeHtml(crop.name)}</td>
                    <td>${escapeHtml(crop.cropType || '-')}</td>
                    <td>${crop.basal.n}</td>
                    <td>${crop.basal.p}</td>
                    <td>${crop.basal.k}</td>
                    <td>${t ? `${t.n} / ${t.p} / ${t.k}` : '-'}</td>
                    <td>${crop.source === 'saitama' ? escapeHtml(crop.page) : '参考値（出典未確認）'}</td>
                </tr>
            `;
        }).join('');

        return `
            <table class="fert-table">
                <thead>
                    <tr>
                        <th>作物名</th>
                        <th>作型</th>
                        <th>基肥N</th>
                        <th>基肥P2O5</th>
                        <th>基肥K2O</th>
                        <th>合計 N/P/K</th>
                        <th>出典</th>
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

    // ---------- ステップタブ（1→2→3）の状態表示・切り替え ----------
    function setFlowStep(activeStep) {
        document.querySelectorAll('.flow-step').forEach(el => {
            const step = parseInt(el.dataset.step, 10);
            el.classList.remove('is-active', 'is-done');
            el.setAttribute('aria-selected', step === activeStep ? 'true' : 'false');
            if (step < activeStep) el.classList.add('is-done');
            else if (step === activeStep) el.classList.add('is-active');
        });
    }

    // 指定ステップのセクションだけを表示するタブ切り替え（他は非表示）
    function showStep(step) {
        [1, 2, 3].forEach(n => {
            document.getElementById('section' + n).style.display = (n === step) ? 'block' : 'none';
        });
        setFlowStep(step);
        document.getElementById('section' + step).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function unlockStepTab(step) {
        const tab = document.querySelector('.flow-step[data-step="' + step + '"]');
        if (tab) {
            tab.disabled = false;
            tab.classList.remove('is-locked');
            tab.setAttribute('aria-disabled', 'false');
        }
    }

    function lockStepTab(step) {
        const tab = document.querySelector('.flow-step[data-step="' + step + '"]');
        if (tab) {
            tab.disabled = true;
            tab.classList.add('is-locked');
            tab.setAttribute('aria-disabled', 'true');
        }
    }

    document.querySelectorAll('.flow-step').forEach(tab => {
        tab.addEventListener('click', () => {
            const step = parseInt(tab.dataset.step, 10);
            if (tab.disabled) return;
            showStep(step);
        });
    });

    // ①の入力が変わったら、②・③の結果は古くなるのでロックし、再計算を促す
    function invalidateStep2() {
        if (!lastCalc) return;
        lastCalc = null;
        lastFertCalc = null;
        lockStepTab(2);
        lockStepTab(3);
        document.getElementById('staleNotice').style.display = 'block';
    }
    // ②の入力が変わったら、③の施肥設計書は古くなるのでロックする
    function invalidateStep3() {
        lockStepTab(3);
    }
    document.getElementById('section1').addEventListener('input', invalidateStep2);
    document.getElementById('section1').addEventListener('change', invalidateStep2);
    document.getElementById('section2').addEventListener('input', invalidateStep3);
    document.getElementById('section2').addEventListener('change', invalidateStep3);

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

    // ---------- 特筆事項（任意・最大400文字）の文字数カウンター ----------
    const SPECIAL_NOTES_MAX_LENGTH = 400;
    const specialNotesInput = document.getElementById('specialNotes');
    const specialNotesCounter = document.getElementById('specialNotesCounter');
    function updateSpecialNotesCounter() {
        const len = specialNotesInput.value.length;
        specialNotesCounter.textContent = `${len} / ${SPECIAL_NOTES_MAX_LENGTH}`;
        specialNotesCounter.classList.toggle('is-near-limit', len >= SPECIAL_NOTES_MAX_LENGTH * 0.9);
    }
    specialNotesInput.addEventListener('input', updateSpecialNotesCounter);

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
    const EXTRA_INPUT_IDS = ['soilType', 'soilDepth', 'soilBd', 'compostType', 'compostTons', 'compostMoisture',
        'compostN', 'compostP', 'compostK', 'compostEffN', 'compostEffP', 'compostEffK', 'customEcClass'];

    function collectParameterData() {
        const selectedCrop = getSelectedCrop();
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
        const soil = {};
        SOIL_FIELDS.forEach(f => { soil[f] = document.getElementById(`soil_${f}`).value; });
        const settings = {};
        EXTRA_INPUT_IDS.forEach(id => { settings[id] = document.getElementById(id).value; });
        return {
            version: 2,
            savedAt: new Date().toISOString(),
            cropId: cropSelect.value,
            cropName: selectedCrop ? cropLabel(selectedCrop) : '',
            customCrop: {
                name: document.getElementById('customCropName').value,
                targetN: document.getElementById('customTargetN').value,
                targetP: document.getElementById('customTargetP').value,
                targetK: document.getElementById('customTargetK').value
            },
            soil,
            settings,
            area: {
                value: document.getElementById('areaValue').value,
                unit: document.getElementById('areaUnit').value,
                fieldName: document.getElementById('fieldName').value
            },
            fertilizers: fertilizers,
            specialNotes: document.getElementById('specialNotes').value
        };
    }

    function applyParameterData(data) {
        if (!data.soil) throw new Error('invalid format');

        // 旧バージョンの作物IDは新しいIDへ読み替える
        const cropId = DATA.legacyCropIds[data.cropId] || data.cropId || '';
        cropSelect.value = cropId;
        if (cropSelect.value !== cropId) cropSelect.value = '';
        if (data.customCrop) {
            document.getElementById('customCropName').value = data.customCrop.name || '';
            document.getElementById('customTargetN').value = data.customCrop.targetN || '';
            document.getElementById('customTargetP').value = data.customCrop.targetP || '';
            document.getElementById('customTargetK').value = data.customCrop.targetK || '';
        }
        SOIL_FIELDS.forEach(f => { document.getElementById(`soil_${f}`).value = data.soil[f] || ''; });

        const settings = data.settings || {};
        if (settings.soilType) soilTypeSelect.value = settings.soilType;
        applySoilTypeDefaults();
        EXTRA_INPUT_IDS.forEach(id => {
            if (id !== 'soilType' && settings[id] !== undefined && settings[id] !== '') document.getElementById(id).value = settings[id];
        });
        updateCustomCropVisibility();
        updateCompostVisibility();
        updateConversionPreview();

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

        specialNotesInput.value = (data.specialNotes || '').slice(0, SPECIAL_NOTES_MAX_LENGTH);
        updateSpecialNotesCounter();
        return data.cropId && !cropSelect.value;
    }

    function saveParametersToFile() {
        const data = collectParameterData();
        const defaultName = `施肥パラメータ_${data.cropName || '未選択'}_${todayStamp()}`;
        let filename = prompt('保存するファイル名を入力してください（拡張子 .json は自動で付きます）', defaultName);
        if (filename === null) return;
        filename = sanitizeFilename(filename) || sanitizeFilename(defaultName);
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
                const cropMissing = applyParameterData(data);
                // 復元した内容はまだ計算に反映されていないため、②・③のタブを再度ロックし①からやり直してもらう
                lastCalc = null;
                lastFertCalc = null;
                lockStepTab(2);
                lockStepTab(3);
                document.getElementById('staleNotice').style.display = 'none';
                showStep(1);
                alert(`「${file.name}」からパラメータを復元しました。` +
                    (cropMissing ? '保存時の作物は現在の作物一覧にないため、作物を選び直してください。' : '') +
                    '内容を確認のうえ、①から「🌾 施肥計算をする」を押して再計算してください。');
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
    // 設計量カード。N・P・K：基準 − 土壌 − 堆肥 = 設計量。石灰・苦土：適正範囲の下限までの不足量。
    function buildDesignCard(def, item, scale) {
        const isBase = def.key === 'cao' || def.key === 'mgo';
        let pct, lines, status;
        if (isBase) {
            const range = item.range;
            const measured = item.measured;
            pct = range && isFinite(measured) ? Math.min(100, (measured / range[0]) * 100) : 0;
            lines = [
                `<span>適正 <strong>${range ? `${range[0]}〜${range[1]}` : '-'}</strong>mg</span>`,
                `<span>現状 <strong>${isFinite(measured) ? measured : '-'}</strong>mg</span>`
            ];
            if (!range) status = 'CECが不明のため算出できません';
            else if (!isFinite(measured)) status = '分析値が未入力のため算出していません';
            else if (item.design <= 0) status = measured > range[1] ? '⚠️ 適正範囲の上限を超えています' : '✅ 適正範囲内です';
            else status = `🌾 下限までの不足：${(item.design * scale).toFixed(1)} kg`;
        } else {
            const credit = item.soilCredit + item.compostCredit;
            pct = item.standard > 0 ? Math.max(0, Math.min(100, (credit / item.standard) * 100)) : 0;
            const soilText = item.soilCredit >= 0 ? `−${(item.soilCredit * scale).toFixed(1)}` : `＋${(-item.soilCredit * scale).toFixed(1)}`;
            lines = [
                `<span>基準 <strong>${(item.standard * scale).toFixed(1)}</strong>kg</span>`,
                `<span>土壌 <strong>${soilText}</strong></span>`,
                `<span>堆肥 <strong>−${(item.compostCredit * scale).toFixed(1)}</strong></span>`
            ];
            status = item.standard <= 0 && item.soilCredit >= 0
                ? '基肥の施用基準がありません（0kg）'
                : `🌾 設計量：${(item.design * scale).toFixed(1)} kg`;
            if (item.overSupplied > 0) status += `<br>⚠️ 土壌・堆肥からの供給が ${(item.overSupplied * scale).toFixed(1)}kg 上回っています`;
        }
        return `
            <div class="npk-card npk-${def.key}">
                <div class="npk-card-head">
                    <span class="icon-circle">${ICONS[def.key]}</span>
                    <div>
                        <div class="npk-title">${def.label}</div>
                        <div class="npk-sub">${def.sub}</div>
                    </div>
                </div>
                <div class="npk-bar-track">
                    <div class="npk-bar-fill" style="width:${pct}%;"></div>
                </div>
                <div class="npk-numbers npk-numbers-wrap">${lines.join('')}</div>
                <div class="npk-deficit-line">${status}</div>
            </div>
        `;
    }

    function buildFinalNpkCard(def, need, applied) {
        const deficit = isFinite(need) ? need : 0;
        const pct = deficit > 0 ? Math.min(100, (applied / deficit) * 100) : 100;
        let statusLine;
        if (deficit <= 0) {
            statusLine = applied > 0
                ? `⚠️ 設計量は0kgですが、${applied.toFixed(1)}kg 投入しています`
                : '✅ 施用の必要はありません';
        } else {
            const remaining = Math.max(0, deficit - applied);
            statusLine = remaining <= 0
                ? `✅ 設計量を満たしています（超過 +${(applied - deficit).toFixed(1)}kg）`
                : `⚠️ まだ ${remaining.toFixed(1)} kg 不足しています`;
        }
        return `
            <div class="npk-card npk-${def.key}">
                <div class="npk-card-head">
                    <span class="icon-circle">${ICONS[def.key]}</span>
                    <div>
                        <div class="npk-title">${def.label}</div>
                        <div class="npk-sub">${def.sub}</div>
                    </div>
                </div>
                <div class="npk-bar-track">
                    <div class="npk-bar-fill" style="width:${pct}%;"></div>
                </div>
                <div class="npk-numbers">
                    <span>設計量 <strong>${deficit.toFixed(1)}</strong>kg</span>
                    <span>投入量 <strong>${applied.toFixed(1)}</strong>kg</span>
                </div>
                <div class="npk-deficit-line">${statusLine}</div>
            </div>
        `;
    }

    // ---------- アドバイス文 ----------
    function buildConversionText(result, field) {
        const cecText = result.cecSource === 'measured' ? `分析値 ${result.cec}`
            : result.cecSource === 'soilType' ? `${result.cec}（土壌タイプの代表値。県基準 表5）`
            : '不明（CECを入力してください）';
        return `${field.soilType.name}、作土深 ${field.depth}cm、仮比重 ${field.bd} → 1 mg/100g ＝ ${result.factor.toFixed(2)} kg/10a。CEC：${cecText}` +
            (result.row ? `。適正塩基は県基準 表8のCEC ${result.row.cec}me の行を使用。` : '。');
    }

    function buildNitrogenAdviceText(nr, factor, ec) {
        if (nr.source === 'none') {
            return '硝酸態窒素・ECとも未入力のため、土壌の残存窒素は差し引いていません（基準量のまま）。';
        }
        const how = nr.source === 'measured'
            ? `硝酸態窒素の分析値 ${nr.no3.toFixed(1)} mg/100g`
            : `EC ${ec.toFixed(2)} mS/cm から${nr.eq.label}の式（${nr.eq.a}×EC${nr.eq.b}）で推定した硝酸態窒素 ${nr.no3.toFixed(1)} mg/100g`;
        const nh4 = nr.nh4 > 0 ? `＋アンモニア態窒素 ${nr.nh4.toFixed(1)}` : '';
        return `${how}${nh4} → 無機態窒素 ${nr.inorganic.toFixed(1)} mg/100g。3mgを超える分を肥料として数え、(${nr.inorganic.toFixed(1)}−3)×${factor.toFixed(2)} ＝ ${nr.kg.toFixed(1)} kg/10a を差し引きます（県基準 技術編p.12）。`
            + (nr.source === 'ec' ? ' ※ECからの推定は誤差が大きいため、硝酸態窒素の実測を推奨します。' : '');
    }

    function buildCompostText(crop, compostInput, supply, scale) {
        let rec;
        if (crop.compost) {
            const r = crop.compost;
            const t = r.min === r.max ? `${r.min}` : `${r.min}〜${r.max}`;
            rec = `${crop.source === 'saitama' ? '県基準' : '参考値'}では良質な堆肥 ${t} t/10a（今回の面積で約${(r.min * scale).toFixed(1)}${r.min === r.max ? '' : `〜${(r.max * scale).toFixed(1)}`} t）。`;
        } else if (crop.ecClass === 'paddy') {
            rec = '水稲は、家畜ふん堆肥(水分50%)を乾田で牛ふん・豚ぷん0.5t/10a、鶏ふん0.4t/10a程度、半湿田で0.2t/10a程度が目安です（県基準 技術編 表19）。';
        } else {
            rec = '堆肥の目安量は設定されていません。';
        }
        if (!compostInput || !(compostInput.tons > 0)) {
            return rec + ' 家畜ふん堆肥を使う場合は①で種類と量を入力すると、有効成分を基肥から差し引きます。';
        }
        return rec + ` 入力：${compostInput.name} ${compostInput.tons} t/10a → 有効成分 N ${supply.n.toFixed(1)}・P2O5 ${supply.p.toFixed(1)}・K2O ${supply.k.toFixed(1)} kg/10a を基肥から差し引きました（成分・肥効率：${compostInput.source}）。`;
    }

    function buildLimeAdviceText(result, soil, scale) {
        const row = result.row;
        if (!row) return 'CECが不明なため、石灰・苦土の適正範囲（県基準 表8）を判定できません。CECを入力するか土壌タイプを選んでください。';
        if (!isFinite(soil.cao) || !isFinite(soil.mgo)) return '石灰(CaO)・苦土(MgO)の分析値を入力すると、県基準 表8の適正範囲と比べて補正量を計算します。';
        const lowCa = result.cao.design > 0;
        const lowMg = result.mgo.design > 0;
        const areaNote = (kgs) => (scale !== 1 ? `（今回の面積では ${kgs.map(v => (v * scale).toFixed(1)).join('・')}kg）` : '');
        const msgs = [];
        if (lowCa && lowMg) msgs.push(`石灰・苦土とも下限未満です。苦土を含む石灰資材で補正し、CaO ${result.cao.design.toFixed(1)}kg・MgO ${result.mgo.design.toFixed(1)}kg/10a${areaNote([result.cao.design, result.mgo.design])} を目安にしてください。`);
        else if (lowCa) msgs.push(`石灰のみ下限未満です。苦土を含まない石灰資材で CaO ${result.cao.design.toFixed(1)}kg/10a${areaNote([result.cao.design])}（炭酸カルシウム CaO${LIME_CAO_PCT}%なら10aあたり約${(result.cao.design * 100 / LIME_CAO_PCT).toFixed(0)}kg）を目安にしてください。`);
        else if (lowMg) msgs.push(`苦土のみ下限未満です。苦土資材で MgO ${result.mgo.design.toFixed(1)}kg/10a${areaNote([result.mgo.design])} を目安にしてください。`);
        else msgs.push('石灰・苦土とも適正範囲の下限以上です。');
        const b = result.balance;
        const caMg = isFinite(soil.cao_mgo_ratio) ? soil.cao_mgo_ratio : b.caMg;
        const mgK = isFinite(soil.mgo_k2o_ratio) ? soil.mgo_k2o_ratio : b.mgK;
        if (isFinite(caMg) && caMg > row.caMg[1]) msgs.push(`石灰/苦土比(当量) ${caMg.toFixed(2)} が上限${row.caMg[1]}を超え、苦土が相対的に不足しています。`);
        if (isFinite(mgK) && mgK < row.mgK[0]) msgs.push(`苦土/加里比(当量) ${mgK.toFixed(2)} が下限${row.mgK[0]}未満で、加里に対して苦土が不足しています。`);
        const bs = isFinite(soil.base_sat) ? soil.base_sat : b.baseSat;
        if (isFinite(bs) && bs > row.baseSat[1]) msgs.push(`塩基飽和度 ${bs.toFixed(0)}% が上限${row.baseSat[1]}%を超えています。石灰質資材の施用は控えてください。`);
        if (isFinite(soil.ph) && soil.ph > DATA.diagnosisStandard.ph[1]) msgs.push(`pH ${soil.ph} が適正範囲(6.0〜6.5)を超えています。アルカリ分を含む資材はpHをさらに上げる点に注意してください。`);
        return msgs.join(' ');
    }

    // ---------- 土壌分析結果の適正範囲バッジ ----------
    function buildRangeBadge(value, range, unit) {
        const state = Calc.compareRange(value, range);
        if (!state) return '';
        if (state === 'ok') return '<span class="soil-badge soil-badge-ok">✓ 適正</span>';
        if (state === 'low') return `<span class="soil-badge soil-badge-low">↓ 下限${range[0]}まで ${(range[0] - value).toFixed(unit === 'ratio' || unit === 'ec' ? 2 : 1)}</span>`;
        return `<span class="soil-badge soil-badge-high">↑ 上限${range[1]}を ${(value - range[1]).toFixed(unit === 'ratio' || unit === 'ec' ? 2 : 1)} 超過</span>`;
    }

    function rangeText(range, unit) {
        if (!range) return '';
        const f = (v) => (unit === 'ph' ? v.toFixed(1) : String(v));
        if (range[1] === Infinity) return `（適正 ${f(range[0])}以上）`;
        if (range[0] === 0) return `（適正 ${f(range[1])}以下）`;
        return `（適正 ${f(range[0])}〜${f(range[1])}）`;
    }

    function renderDesignGrid(containerId, result, scale) {
        document.getElementById(containerId).innerHTML = NUTRIENT_DEFS.map(def => buildDesignCard(def, result[def.key], scale)).join('');
    }

    // 8種類の肥料入力欄を読み取り、使用量・袋数・供給養分を計算する
    function readFertilizerRows() {
        const rows = [];
        for (let i = 1; i <= FERT_COUNT; i++) {
            const name = document.getElementById(`fert_name_${i}`).value.trim();
            const pct = (f) => parseFloat(document.getElementById(`fert_${f}_${i}`).value) || 0;
            const bagWeight = pct('bagweight');
            const amount = pct('amount');

            if (!name && amount <= 0) continue; // 未入力の行はスキップ

            rows.push({
                name: name || `肥料${i}`,
                amount,
                bagWeight,
                bags: bagWeight > 0 ? Math.ceil(amount / bagWeight) : null,
                suppliedN: amount * (pct('n') / 100),
                suppliedP: amount * (pct('p') / 100),
                suppliedK: amount * (pct('k') / 100),
                suppliedCaO: amount * (pct('cao') / 100),
                suppliedMgO: amount * (pct('mgo') / 100)
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

    // 肥料テーブルHTMLを生成（袋数計算結果 / 最終報告書で共用）
    function buildFertTableHTML(rows, totals) {
        const bodyRows = rows.map(r => `
            <tr>
                <td class="fert-name-cell">${escapeHtml(r.name)}</td>
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

    function readSoil() {
        const soil = {};
        SOIL_FIELDS.forEach(f => { soil[f] = readNum(`soil_${f}`); });
        return soil;
    }

    // ---------- (1) 施肥計算をする ----------
    document.getElementById('calcBtn').addEventListener('click', () => {
        const cropId = cropSelect.value;
        if (!cropId) {
            alert('作物を選択してください。');
            return;
        }
        const crop = getSelectedCrop();
        if (cropId === CUSTOM_CROP_VALUE) {
            const { n, p, k } = crop.basal;
            if (n <= 0 && p <= 0 && k <= 0) {
                alert('基肥N・基肥P2O5・基肥K2Oのいずれかを入力してください。');
                return;
            }
        }

        const soil = readSoil();
        const field = { soilType: getSoilType(), depth: getDepth(), bd: getBd() };
        const compostInput = getCompostInput();
        const result = Calc.design(crop, soil, field, compostInput);
        const ranges = Calc.diagnosisRanges(crop, field.soilType, result.row);

        document.getElementById('resultCropEmoji').textContent = crop.emoji;
        document.getElementById('resultCropName').textContent = cropLabel(crop);

        const scale = getAreaM2() / AREA_DEFAULT_M2;
        renderDesignGrid('npkGrid', result, scale);

        document.getElementById('conversionAdviceText').textContent = buildConversionText(result, field);
        document.getElementById('nitrogenAdviceText').textContent = buildNitrogenAdviceText(result.nitrogen, result.factor, soil.ec);
        document.getElementById('compostAdviceText').textContent = buildCompostText(crop, compostInput, result.compost, scale);
        document.getElementById('limeAdviceText').textContent = buildLimeAdviceText(result, soil, scale);

        lastCalc = { crop, soil, field, compostInput, result, ranges };
        lastFertCalc = null;

        document.getElementById('fertResultArea').style.display = 'none';
        document.getElementById('staleNotice').style.display = 'none';
        unlockStepTab(2);
        lockStepTab(3);
        showStep(2);
    });

    // ---------- (2) 投入量を計算する ----------
    function computeFertilizer() {
        const areaM2 = getAreaM2();
        const scale = areaM2 / AREA_DEFAULT_M2;
        const { result } = lastCalc;
        renderDesignGrid('npkGrid', result, scale);
        document.getElementById('compostAdviceText').textContent =
            buildCompostText(lastCalc.crop, lastCalc.compostInput, result.compost, scale);
        document.getElementById('limeAdviceText').textContent = buildLimeAdviceText(result, lastCalc.soil, scale);

        const rows = readFertilizerRows();
        const totals = sumFertilizerRows(rows);
        const need = {};
        NUTRIENT_DEFS.forEach(def => { need[def.key] = (result[def.key].design || 0) * scale; });
        lastFertCalc = { areaM2, scale, rows, totals, need };
        return lastFertCalc;
    }

    function renderFertResult(fc, gridId, tableId) {
        document.getElementById(tableId).innerHTML = buildFertTableHTML(fc.rows, fc.totals);
        document.getElementById(gridId).innerHTML = NUTRIENT_DEFS.map(def =>
            buildFinalNpkCard(def, fc.need[def.key], fc.totals[def.key])
        ).join('');
    }

    document.getElementById('recalcBtn').addEventListener('click', () => {
        if (!lastCalc) {
            alert('先に①で「施肥計算をする」を実行してください。');
            return;
        }
        const fc = computeFertilizer();
        if (fc.rows.length === 0) {
            alert('少なくとも1つの肥料の「肥料名」または「今回投入量」を入力してください。');
            return;
        }
        renderFertResult(fc, 'finalNpkGrid', 'fertResultTable');
        document.getElementById('fertResultArea').style.display = 'block';
        document.getElementById('fertResultArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // ---------- (2)→(3) 施肥設計完了 ----------
    document.getElementById('completeBtn').addEventListener('click', () => {
        if (!lastCalc) {
            alert('先に①で「施肥計算をする」を実行してください。');
            return;
        }
        // 最新の入力で投入量を計算し直してから設計書を作る
        const fc = computeFertilizer();
        if (fc.rows.length === 0) {
            alert('少なくとも1つの肥料の「肥料名」または「今回投入量」を入力し、「投入量を計算する」で確認してください。');
            return;
        }
        renderFertResult(fc, 'finalNpkGrid', 'fertResultTable');
        document.getElementById('fertResultArea').style.display = 'block';

        const { crop, soil, field, compostInput, result, ranges } = lastCalc;
        const { areaM2, scale } = fc;
        const a = areaM2 / 100;
        const ha = areaM2 / 10000;
        const fieldName = document.getElementById('fieldName').value.trim();

        // バッジ・タイトル（作成日は栽培作物名の右側に表示し、PNG/PDF出力にも含まれる）
        document.getElementById('reportCropEmoji').textContent = crop.emoji;
        document.getElementById('reportCropName').textContent = fieldName ? `${cropLabel(crop)}（${fieldName}）` : cropLabel(crop);
        document.getElementById('captureCropEmoji').textContent = crop.emoji;
        document.getElementById('captureCropName').textContent = `${crop.emoji} ${cropLabel(crop)}`;
        document.getElementById('captureDateBadge').textContent = `作成日: ${todayStamp()}`;
        document.getElementById('captureAreaCaption').textContent =
            (fieldName ? `圃場名：${fieldName} ／ ` : '') +
            `面積：${areaM2.toLocaleString('ja-JP', { maximumFractionDigits: 1 })} ㎡（${a.toFixed(2)} a ／ ${ha.toFixed(3)} ha）`;

        // 土壌分析結果サマリー（各項目の右側に適正範囲との比較バッジを表示）
        const b = result.balance;
        const withAuto = (entered, computed) => isFinite(entered)
            ? { value: entered, text: String(entered) }
            : { value: computed, text: isFinite(computed) ? `${computed.toFixed(2)}（計算値）` : '-' };
        const cecItem = isFinite(soil.cec) ? { value: soil.cec, text: String(soil.cec) }
            : { value: result.cec, text: isFinite(result.cec) ? `${result.cec}（土壌タイプ代表値）` : '-' };
        const baseSatItem = withAuto(soil.base_sat, b.baseSat);
        if (!isFinite(soil.base_sat) && isFinite(b.baseSat)) baseSatItem.text = `${b.baseSat.toFixed(0)}（計算値）`;
        const plain = (v) => ({ value: v, text: isFinite(v) ? String(v) : '-' });
        const nr = result.nitrogen;
        const nBadge = nr.source === 'none' ? ''
            : `<span class="soil-badge soil-badge-info">N ${nr.kg.toFixed(1)}kg/10aを差し引き</span>`;
        const soilItems = [
            { label: 'pH (H2O)', item: plain(soil.ph), range: ranges.ph, unit: 'ph' },
            { label: 'EC (mS/cm)', item: plain(soil.ec), range: ranges.ec, unit: 'ec' },
            { label: '石灰 CaO (mg/100g)', item: plain(soil.cao), range: ranges.cao },
            { label: '苦土 MgO (mg/100g)', item: plain(soil.mgo), range: ranges.mgo },
            { label: '加里 K2O (mg/100g)', item: plain(soil.k2o), range: ranges.k2o },
            { label: '有効態リン酸 (mg/100g)', item: plain(soil.p2o5), range: ranges.p2o5 },
            { label: 'CEC (me/100g)', item: cecItem, range: ranges.cec },
            { label: '塩基飽和度 (%)', item: baseSatItem, range: ranges.base_sat },
            { label: '石灰/苦土比 (当量)', item: withAuto(soil.cao_mgo_ratio, b.caMg), range: ranges.cao_mgo_ratio, unit: 'ratio' },
            { label: '苦土/加里比 (当量)', item: withAuto(soil.mgo_k2o_ratio, b.mgK), range: ranges.mgo_k2o_ratio, unit: 'ratio' },
            { label: '硝酸態窒素 (mg/100g)', item: nr.source === 'ec' ? { value: nr.no3, text: `${nr.no3.toFixed(1)}（ECから推定）` } : plain(soil.no3n), badge: nBadge },
            { label: 'アンモニア態窒素 (mg/100g)', item: plain(soil.nh4n), badge: '' }
        ];
        document.getElementById('soilSummaryGrid').innerHTML = soilItems.map(s => `
            <div class="soil-summary-item">
                <span class="label">${s.label}<span class="soil-range-text">${rangeText(s.range, s.unit)}</span></span>
                <div class="soil-summary-value-row">
                    <span class="value">${escapeHtml(s.item.text)}</span>
                    ${s.badge !== undefined ? s.badge : buildRangeBadge(s.item.value, s.range, s.unit)}
                </div>
            </div>
        `).join('');
        document.getElementById('soilBadgeLegend').style.display = 'block';

        // 計算条件（設計の根拠）
        document.getElementById('reportConditionsText').textContent =
            buildConversionText(result, field) + ' ' + buildNitrogenAdviceText(nr, result.factor, soil.ec);

        // 設計量（基準・土壌・堆肥の内訳）と投入量
        renderDesignGrid('finalReportDesignGrid', result, scale);
        document.getElementById('finalReportNpkGrid').innerHTML = NUTRIENT_DEFS.map(def =>
            buildFinalNpkCard(def, fc.need[def.key], fc.totals[def.key])
        ).join('');

        document.getElementById('finalReportFertTable').innerHTML = buildFertTableHTML(fc.rows, fc.totals);
        document.getElementById('finalReportCompostText').textContent = buildCompostText(crop, compostInput, result.compost, scale);
        document.getElementById('finalReportLimeText').textContent = buildLimeAdviceText(result, soil, scale);

        // 特筆事項（任意入力。未入力の場合はブロックごと非表示にする）
        const specialNotesValue = specialNotesInput.value.trim();
        const reportNotesBlock = document.getElementById('reportNotesBlock');
        document.getElementById('finalReportNotesText').textContent = specialNotesValue;
        reportNotesBlock.style.display = specialNotesValue ? 'block' : 'none';

        unlockStepTab(3);
        showStep(3);
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
        // html2canvasが撮影時に設定した座標変換（画面外に置いた複製の位置補正）が残っているため、元に戻してから描く
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const padding = 5 * PX_PER_MM;
        const fontSize = 3.2 * PX_PER_MM;

        ctx.font = `bold ${fontSize}px "Noto Sans JP", "Hiragino Sans", Arial, sans-serif`;
        ctx.textAlign = 'right';

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

    // captureAreaをA4幅で撮影し、スタンプ済みcanvasを返す（フォント読み込み待ち。2秒でタイムアウトして進む）
    // 返されるcanvasは横幅がA4縦の幅(210mm)固定、縦は内容の長さになる。
    function generateA4ReportCanvas() {
        const fontsReadyPromise = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
        const fontsReady = Promise.race([fontsReadyPromise, timeoutPromise]);

        // 画面表示は70%だが、PNG/PDF出力時は従来の100%フォントサイズで描画する
        const rootFontSizeBeforeExport = document.documentElement.style.fontSize;
        document.documentElement.style.fontSize = '100%';
        const clone = buildA4Clone();

        return fontsReady
            .then(() => html2canvas(clone, {
                backgroundColor: '#FDFEFC',
                width: A4_WIDTH_PX,
                windowWidth: A4_WIDTH_PX,
                scale: 1
            }))
            .then(canvas => {
                document.body.removeChild(clone);
                document.documentElement.style.fontSize = rootFontSizeBeforeExport;
                return stampCaptureCanvas(canvas);
            })
            .catch(err => {
                if (clone.parentNode) document.body.removeChild(clone);
                document.documentElement.style.fontSize = rootFontSizeBeforeExport;
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
                link.download = `施肥設計書_${sanitizeFilename(cropName)}.png`;
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
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
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
                pdf.save(`施肥設計書_${sanitizeFilename(cropName)}.pdf`);
            })
            .catch(err => {
                console.error('PDF出力エラー:', err);
                alert('PDFの生成に失敗しました。もう一度お試しください。');
            });
    });

    // ---------- 初期表示 ----------
    soilTypeSelect.value = 'kuroboku_atsu_ta';
    applySoilTypeDefaults();
    updateCustomCropVisibility();
    updateCompostVisibility();
    updateAreaConvertedDisplay();
    updateSpecialNotesCounter();
});
