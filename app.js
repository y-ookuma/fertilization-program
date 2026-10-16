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
    let lastReport = null;    // (3) 施肥設計完了、時点の設計書のデータ（PDF・Excel出力に使う）
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
        // 沖積土・洪積土の区分はプルダウンの表示にだけ添える（設計書・PDFは t.name のまま）
        option.textContent = t.deposit ? `${t.name}〔${t.deposit}〕` : t.name;
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
                <div class="fert-row-tail">
                    <div class="fert-move-btns">
                        <button type="button" id="fert_up_${i}" class="btn-fert-move" title="${i}行目を上の行と入れ替え"${i === 1 ? ' disabled' : ''}>▲ 上へ</button>
                        <button type="button" id="fert_down_${i}" class="btn-fert-move" title="${i}行目を下の行と入れ替え"${i === FERT_COUNT ? ' disabled' : ''}>▼ 下へ</button>
                    </div>
                    <button type="button" id="fert_clear_${i}" class="btn-fert-clear" title="${i}行目の肥料名〜今回投入量を消去">🗑 削除</button>
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
        // 削除ボタン：肥料名〜今回投入量とCSVの選択を初期化する
        document.getElementById(`fert_clear_${i}`).addEventListener('click', () => {
            ['name', 'n', 'p', 'k', 'cao', 'mgo', 'bagweight', 'amount'].forEach(f => {
                document.getElementById(`fert_${f}_${i}`).value = '';
            });
            document.getElementById(`fert_csv_select_${i}`).value = '';
            invalidateStep3();
        });
        // 上へ・下へボタン：隣の行と、肥料名〜今回投入量とCSVの選択を入れ替える
        document.getElementById(`fert_up_${i}`).addEventListener('click', () => swapFertRows(i, i - 1));
        document.getElementById(`fert_down_${i}`).addEventListener('click', () => swapFertRows(i, i + 1));
    }

    function swapFertRows(a, b) {
        if (b < 1 || b > FERT_COUNT) return;
        ['name', 'n', 'p', 'k', 'cao', 'mgo', 'bagweight', 'amount', 'csv_select'].forEach(f => {
            const elA = document.getElementById(`fert_${f}_${a}`);
            const elB = document.getElementById(`fert_${f}_${b}`);
            [elA.value, elB.value] = [elB.value, elA.value];
        });
        invalidateStep3();
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

    // ---------- ステップタブ（基本情報(0)→1→2→3）の状態表示・切り替え ----------
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
        [0, 1, 2, 3].forEach(n => {
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
    // 基本情報（名前・圃場名・面積）は③の施肥設計書と肥料の投入量に使うので、変わったら③をロックする
    document.getElementById('section0').addEventListener('input', invalidateStep3);
    document.getElementById('section0').addEventListener('change', invalidateStep3);
    document.getElementById('goStep1Btn').addEventListener('click', () => showStep(1));

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
                ownerName: document.getElementById('ownerName').value,
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
            document.getElementById('ownerName').value = data.area.ownerName || '';
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

    // 施肥後カード：目標・残存・追加・施肥後（残存＋追加）を並べて、目標との過不足を示す。
    //   N・P2O5・K2O … 目標＝施肥基準の基肥量、残存＝土壌・堆肥から見込める量（基準から差し引いた分）、
    //                  追加＝肥料の投入量、施肥後＝残存＋追加（kg、面積換算後）
    //   石灰・苦土   … 目標＝CEC別の適正範囲（mg/100g）、残存＝現状の分析値、
    //                  施肥後＝現状＋追加(kg/10a)÷換算係数 の推定値（mg/100g）
    // 施肥後の収支（画面のカードとPDFの表で共用）
    function calcFinalBalance(key, result, scale, applied) {
        const item = result[key];
        if (key === 'cao' || key === 'mgo') {
            const addedMg = scale > 0 ? (applied / scale) / result.factor : 0;
            const after = item.measured + addedMg;
            return { range: item.range, measured: item.measured, addedMg, after, state: Calc.compareRange(after, item.range) };
        }
        const target = item.standard * scale;
        const residual = (item.soilCredit + item.compostCredit) * scale;
        const after = residual + applied;
        return { target, residual, after, diff: after - target };
    }

    function buildFinalCard(def, result, scale, applied) {
        const bal = calcFinalBalance(def.key, result, scale, applied);
        const row = (label, value, unit) =>
            `<div class="final-row"><span class="final-label">${label}</span><span class="final-value"><strong>${value}</strong>${unit}</span></div>`;
        let rows, pct, status;
        if (def.key === 'cao' || def.key === 'mgo') {
            const { range, measured, addedMg, after, state } = bal;
            rows = [
                row('目標（適正範囲）', range ? `${range[0]}〜${range[1]}` : '-', 'mg/100g'),
                row('残存（現状）', isFinite(measured) ? measured.toFixed(0) : '-', 'mg/100g'),
                row('追加（肥料）', `${applied.toFixed(1)}kg ＝ +${addedMg.toFixed(1)}`, 'mg/100g'),
                row('施肥後（推定）', isFinite(after) ? after.toFixed(0) : '-', 'mg/100g')
            ];
            pct = range && isFinite(after) ? Math.min(100, (after / range[0]) * 100) : 0;
            if (!range) status = 'CECが不明のため判定できません';
            else if (!isFinite(measured)) status = '分析値が未入力のため判定できません';
            else if (state === 'ok') status = '✅ 施肥後は適正範囲内の見込みです';
            else if (state === 'low') status = `⚠️ 下限まで あと ${(range[0] - after).toFixed(0)}mg（約 ${((range[0] - after) * result.factor * scale).toFixed(1)}kg）`;
            else status = `⚠️ 上限を ${(after - range[1]).toFixed(0)}mg 超える見込みです`;
        } else {
            const { target, residual, after, diff } = bal;
            rows = [
                row('目標（基準）', target.toFixed(1), 'kg'),
                row('残存（土壌＋堆肥）', residual.toFixed(1), 'kg'),
                row('追加（肥料）', applied.toFixed(1), 'kg'),
                row('施肥後（残存＋追加）', after.toFixed(1), 'kg')
            ];
            pct = target > 0 ? Math.max(0, Math.min(100, (after / target) * 100)) : (after > 0 ? 100 : 0);
            if (target <= 0 && applied <= 0) status = '✅ 基肥の施用基準はありません';
            else if (target <= 0) status = `⚠️ 基肥の施用基準はありませんが ${applied.toFixed(1)}kg 追加しています`;
            else if (diff >= -0.05) status = `✅ 目標を満たしています（${diff >= 0.05 ? `+${diff.toFixed(1)}kg` : '過不足なし'}）`;
            else status = `⚠️ 目標まで あと ${(-diff).toFixed(1)} kg 不足しています`;
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
                <div class="final-rows">${rows.join('')}</div>
                <div class="npk-deficit-line">${status}</div>
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

    // 適正範囲を「a〜b」「a以上」「b以下」の形にする（範囲がなければ空文字）
    function rangePlainText(range, unit) {
        if (!range) return '';
        const f = (v) => (unit === 'ph' ? v.toFixed(1) : String(v));
        if (range[1] === Infinity) return `${f(range[0])}以上`;
        if (range[0] === 0) return `${f(range[1])}以下`;
        return `${f(range[0])}〜${f(range[1])}`;
    }

    function rangeText(range, unit) {
        return range ? `（適正 ${rangePlainText(range, unit)}）` : '';
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
                pct: { n: pct('n'), p: pct('p'), k: pct('k'), cao: pct('cao'), mgo: pct('mgo') },
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
        lastFertCalc = { areaM2, scale, rows, totals };
        return lastFertCalc;
    }

    function renderFertResult(fc, gridId, tableId) {
        document.getElementById(tableId).innerHTML = buildFertTableHTML(fc.rows, fc.totals);
        document.getElementById(gridId).innerHTML = NUTRIENT_DEFS.map(def =>
            buildFinalCard(def, lastCalc.result, fc.scale, fc.totals[def.key])
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
        const ownerName = document.getElementById('ownerName').value.trim();
        const fieldName = document.getElementById('fieldName').value.trim();

        // バッジ・タイトル（作成日は栽培作物名の右側に表示する）
        document.getElementById('reportCropEmoji').textContent = crop.emoji;
        document.getElementById('reportCropName').textContent = fieldName ? `${cropLabel(crop)}（${fieldName}）` : cropLabel(crop);
        document.getElementById('captureCropEmoji').textContent = crop.emoji;
        document.getElementById('captureCropName').textContent = `${crop.emoji} ${cropLabel(crop)}`;
        document.getElementById('captureDateBadge').textContent = `作成日: ${todayStamp()}`;
        document.getElementById('captureAreaCaption').textContent =
            (ownerName ? `名前：${ownerName} ／ ` : '') +
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
            { label: '硝酸態窒素 (mg/100g)', item: nr.source === 'ec' ? { value: nr.no3, text: `${nr.no3.toFixed(1)}（ECから推定）` } : plain(soil.no3n), badge: nBadge,
              pdfJudge: nr.source === 'none' ? '' : `N ${nr.kg.toFixed(1)}kg差引` },
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
            buildFinalCard(def, lastCalc.result, fc.scale, fc.totals[def.key])
        ).join('');

        document.getElementById('finalReportFertTable').innerHTML = buildFertTableHTML(fc.rows, fc.totals);
        document.getElementById('finalReportCompostText').textContent = buildCompostText(crop, compostInput, result.compost, scale);
        document.getElementById('finalReportLimeText').textContent = buildLimeAdviceText(result, soil, scale);

        // 特筆事項（任意入力。未入力の場合はブロックごと非表示にする）
        const specialNotesValue = specialNotesInput.value.trim();
        const reportNotesBlock = document.getElementById('reportNotesBlock');
        document.getElementById('finalReportNotesText').textContent = specialNotesValue;
        reportNotesBlock.style.display = specialNotesValue ? 'block' : 'none';

        // PDF・Excel出力用のデータ。画面の設計書と同じ値・同じ文章から作る
        lastReport = {
            crop, ownerName, fieldName, areaM2, field, result, fc, soilItems,
            date: todayStamp(),
            conditionsText: document.getElementById('reportConditionsText').textContent,
            compostText: document.getElementById('finalReportCompostText').textContent,
            limeText: document.getElementById('finalReportLimeText').textContent,
            notes: specialNotesValue
        };

        if (section3.classList.contains('simple-mode')) renderSimpleReportView();
        unlockStepTab(3);
        showStep(3);
    });

    // ---------- PDF・Excel共通：判定と過不足の文言 ----------
    // 土壌分析の判定：画面のバッジと同じ基準（県基準 表7・表8、ECは藤原(2008)）。state は ok / low / high / ''
    function reportSoilJudge(s) {
        if (s.badge !== undefined) return { state: '', text: s.pdfJudge || '' };
        const state = Calc.compareRange(s.item.value, s.range);
        if (state === 'ok') return { state, text: '✓適正' };
        if (state === 'low') return { state, text: '↓不足' };
        if (state === 'high') return { state, text: '↑過剰' };
        return { state: '', text: '' };
    }

    // 養分収支の過不足（b は calcFinalBalance の結果、applied は肥料からの追加量kg）
    function reportBalanceDiff(key, b, applied) {
        if (key === 'cao' || key === 'mgo') {
            if (!b.range) return { state: '', text: '判定不可（CEC不明）' };
            if (!isFinite(b.measured)) return { state: '', text: '判定不可（未測定）' };
            if (b.state === 'ok') return { state: 'ok', text: '適正範囲内' };
            if (b.state === 'low') return { state: 'low', text: `下限まで ${(b.range[0] - b.after).toFixed(0)}` };
            return { state: 'high', text: `上限を ${(b.after - b.range[1]).toFixed(0)} 超過` };
        }
        if (b.target <= 0) return applied > 0 ? { state: 'high', text: `基準なし（+${applied.toFixed(1)}）` } : { state: '', text: '基準なし' };
        if (b.diff >= 0.05) return { state: 'high', text: `+${b.diff.toFixed(1)}` };
        if (b.diff > -0.05) return { state: 'ok', text: '過不足なし' };
        return { state: 'low', text: `−${(-b.diff).toFixed(1)}` };
    }

    // ---------- PDF用の表（案A：縦・1段の帳票型） ----------
    // 上から 基本情報 → 土壌分析（左右2列）→ 養分収支 → 使用する肥料 → 計算条件・堆肥・石灰苦土・特筆事項 の順。
    // 794px（A4縦の96dpi相当）の幅で組み、出力時にA4用紙1枚へ収まるよう縮小する。
    function buildPdfSheetHTML(r) {
        const esc = escapeHtml;
        const a = r.areaM2 / 100;

        const stateClass = (state) => (state ? `pdf-${state}` : '');

        // 土壌分析
        const soilCells = (s) => {
            if (!s) return '<td class="pdf-lbl"></td><td></td><td></td><td></td>';
            const j = reportSoilJudge(s);
            return `<td class="pdf-lbl">${esc(s.label)}</td><td class="pdf-num">${esc(s.item.text)}</td>` +
                `<td class="pdf-c">${esc(rangePlainText(s.range, s.unit) || '—')}</td><td class="pdf-c ${stateClass(j.state)}">${esc(j.text)}</td>`;
        };
        const half = Math.ceil(r.soilItems.length / 2);
        let soilRows = '';
        for (let i = 0; i < half; i++) soilRows += `<tr>${soilCells(r.soilItems[i])}${soilCells(r.soilItems[i + half])}</tr>`;

        // 養分収支：画面の「目標・残存・追加・施肥後」カードと同じ計算
        const balRows = NUTRIENT_DEFS.map(def => {
            const applied = r.fc.totals[def.key];
            const b = calcFinalBalance(def.key, r.result, r.fc.scale, applied);
            const d = reportBalanceDiff(def.key, b, applied);
            const diff = `<span class="${stateClass(d.state)}">${d.text}</span>`;
            if (def.key === 'cao' || def.key === 'mgo') {
                return `<tr><td class="pdf-lbl">${def.label}</td><td class="pdf-c">mg/100g</td>` +
                    `<td class="pdf-num">${b.range ? `${b.range[0]}〜${b.range[1]}` : '—'}</td>` +
                    `<td class="pdf-num">${isFinite(b.measured) ? b.measured.toFixed(0) : '—'}</td>` +
                    `<td class="pdf-num">+${b.addedMg.toFixed(1)}<small>（${applied.toFixed(1)}kg）</small></td>` +
                    `<td class="pdf-num">${isFinite(b.after) ? b.after.toFixed(0) : '—'}</td><td class="pdf-c">${diff}</td></tr>`;
            }
            return `<tr><td class="pdf-lbl">${def.label}</td><td class="pdf-c">kg</td>` +
                `<td class="pdf-num">${b.target.toFixed(1)}</td><td class="pdf-num">${b.residual.toFixed(1)}</td>` +
                `<td class="pdf-num">${applied.toFixed(1)}</td><td class="pdf-num">${b.after.toFixed(1)}</td><td class="pdf-c">${diff}</td></tr>`;
        }).join('');

        // 使用する肥料
        const t = r.fc.totals;
        const totalBags = r.fc.rows.reduce((sum, f) => sum + (f.bags || 0), 0);
        const fertRows = r.fc.rows.map((f, i) => `<tr><td class="pdf-c">${i + 1}</td><td>${esc(f.name)}</td>` +
            `<td class="pdf-num">${f.amount.toFixed(1)}</td><td class="pdf-c">${f.bags === null ? '—' : `${f.bags}袋`}</td>` +
            [f.suppliedN, f.suppliedP, f.suppliedK, f.suppliedCaO, f.suppliedMgO].map(v => `<td class="pdf-num">${v.toFixed(1)}</td>`).join('') +
            '</tr>').join('');

        const box = (label, text) => text ? `<div class="pdf-box"><b>${label}：</b>${esc(text)}</div>` : '';
        const fieldLine = [r.ownerName, r.fieldName].filter(Boolean).map(esc).concat(`作成日 ${r.date}`).join(' ／ ');

        return `
            <div class="pdf-title"><b>施肥設計書</b><span>${esc(cropLabel(r.crop))}<br>${fieldLine}</span></div>
            <table class="pdf-t">
                <tr><td class="pdf-lbl">名前</td><td>${esc(r.ownerName || '—')}</td>
                    <td class="pdf-lbl">圃場名</td><td>${esc(r.fieldName || '—')}</td>
                    <td class="pdf-lbl">面積</td><td>${r.areaM2.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}㎡（${a.toFixed(2)}a）</td></tr>
                <tr><td class="pdf-lbl">作物</td><td>${esc(`${r.crop.emoji} ${cropLabel(r.crop)}`)}</td>
                    <td class="pdf-lbl">土壌</td><td>${esc(r.field.soilType.name)}</td>
                    <td class="pdf-lbl">作土深</td><td>${r.field.depth}cm（仮比重${r.field.bd}）</td></tr>
            </table>
            <div><div class="pdf-sec">土壌分析結果</div>
                <table class="pdf-t pdf-soil">
                    <colgroup>${'<col style="width:18%"><col style="width:12%"><col style="width:10%"><col style="width:10%">'.repeat(2)}</colgroup>
                    <tr><th>項目</th><th>分析値</th><th>適正範囲</th><th>判定</th><th>項目</th><th>分析値</th><th>適正範囲</th><th>判定</th></tr>
                    ${soilRows}
                </table>
            </div>
            <div><div class="pdf-sec">養分収支（目標・残存・追加・施肥後）</div>
                <table class="pdf-t">
                    <tr><th>養分</th><th>単位</th><th>目標</th><th>残存<br>（土壌＋堆肥）</th><th>追加<br>（肥料）</th><th>施肥後</th><th>過不足</th></tr>
                    ${balRows}
                </table>
            </div>
            <div><div class="pdf-sec">使用する肥料</div>
                <table class="pdf-t">
                    <tr><th>No</th><th>肥料名</th><th>投入量<br>(kg)</th><th>袋数</th><th>N<br>(kg)</th><th>P2O5<br>(kg)</th><th>K2O<br>(kg)</th><th>CaO<br>(kg)</th><th>MgO<br>(kg)</th></tr>
                    ${fertRows}
                    <tr class="pdf-sum"><td class="pdf-c" colspan="2">合計</td><td class="pdf-num">${t.amount.toFixed(1)}</td><td class="pdf-c">${totalBags > 0 ? `${totalBags}袋` : '—'}</td>
                        ${[t.n, t.p, t.k, t.cao, t.mgo].map(v => `<td class="pdf-num">${v.toFixed(1)}</td>`).join('')}</tr>
                </table>
            </div>
            <div class="pdf-stack">
                ${box('計算条件', r.conditionsText)}
                ${box('堆肥', r.compostText)}
                ${box('石灰・苦土', r.limeText)}
                ${box('特筆事項', r.notes)}
            </div>
            <div class="pdf-foot">
                <span>※ 埼玉県主要農作物施肥基準（令和7年）に基づく計算です。減肥した場合は生育状況を確認し、生育が劣る場合は追肥等で調整してください。</span>
                <span>This project is licensed under the BSD 3-Clause License.<br>Copyright (c) 2026 y-ookuma</span>
            </div>
        `;
    }

    // ---------- 簡易結果表示（PDFと同じ表を画面に表示。最初はこちらを表示し、ボタンで通常の表示と切り替える） ----------
    // 通常の設計書（#captureArea）は section3 の simple-mode クラスで隠す（index.html で最初から付けている）。
    const section3 = document.getElementById('section3');
    const simpleViewBtn = document.getElementById('simpleViewBtn');
    function renderSimpleReportView() {
        document.getElementById('simpleReportView').innerHTML =
            lastReport ? `<div class="pdf-sheet pdf-sheet-inline">${buildPdfSheetHTML(lastReport)}</div>` : '';
    }
    simpleViewBtn.addEventListener('click', () => {
        const on = !section3.classList.contains('simple-mode');
        if (on) renderSimpleReportView();
        section3.classList.toggle('simple-mode', on);
        simpleViewBtn.setAttribute('aria-pressed', String(on));
        simpleViewBtn.textContent = on ? '🔙 通常表示に戻す' : '📋 簡易結果表示';
    });

    // ---------- PDF出力の用紙（A4縦） ----------
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const EXPORT_DPI = 200; // 出力解像度の目安（約200dpi）

    // ---------- PDF出力（表形式のPDF用の表を、A4縦1枚に収めて出力） ----------
    const PDF_SHEET_WIDTH_PX = 794; // A4縦の幅（96dpi相当）。PDF用の表はこの幅で組む
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            alert('PDF出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        if (!lastReport) {
            alert('先に②で「施肥設計完了」を押してください。');
            return;
        }
        const sheet = document.createElement('div');
        sheet.className = 'pdf-sheet';
        sheet.innerHTML = buildPdfSheetHTML(lastReport);
        document.body.appendChild(sheet);

        const fontsReadyPromise = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        Promise.race([fontsReadyPromise, new Promise(resolve => setTimeout(resolve, 2000))])
            .then(() => html2canvas(sheet, {
                backgroundColor: '#FFFFFF',
                width: PDF_SHEET_WIDTH_PX,
                windowWidth: PDF_SHEET_WIDTH_PX,
                scale: EXPORT_DPI / 96
            }))
            .then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

                // 内容がA4の縦より長い場合（肥料8種類・特筆事項が長い等）は、縦横比を保ったまま1枚に収まるよう縮小する
                const heightMm = canvas.height * A4_WIDTH_MM / canvas.width;
                const fit = Math.min(1, A4_HEIGHT_MM / heightMm);
                const w = A4_WIDTH_MM * fit;
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (A4_WIDTH_MM - w) / 2, 0, w, heightMm * fit);

                const cropName = document.getElementById('reportCropName').textContent || 'result';
                pdf.save(`施肥設計書_${sanitizeFilename(cropName)}.pdf`);
            })
            .catch(err => {
                console.error('PDF出力エラー:', err);
                alert('PDFの生成に失敗しました。もう一度お試しください。');
            })
            .finally(() => {
                if (sheet.parentNode) document.body.removeChild(sheet);
            });
    });

    // ---------- Excel出力（PDFと同じ並び：基本情報 → 土壌分析 → 養分収支 → 使用する肥料 → 文章欄） ----------
    // 数値はセルに数値で入れ、肥料の供給量・袋数・合計は式にする（投入量や成分を書き換えると再計算される）。
    // 印刷はA4縦1枚に収まるよう設定する。
    function buildReportWorkbook(r) {
        const wb = new ExcelJS.Workbook();
        wb.creator = '施肥設計計算アプリ';
        wb.created = new Date();
        const ws = wb.addWorksheet('施肥設計書', {
            pageSetup: {
                paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1,
                margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
            }
        });
        ws.columns = [6, 22, 9, 11, 13, 9, 9, 9, 10, 8, 9, 9, 9, 9, 9].map(width => ({ width }));

        const FONT = '游ゴシック';
        const GREEN = 'FF2E6E45';
        const STATE_COLOR = { ok: 'FF2E7D4A', low: 'FFC0392B', high: 'FF2F6FB0' };
        const BORDER = { style: 'thin', color: { argb: 'FF9AA59A' } };
        const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
        ws.properties.defaultRowHeight = 18;

        // セルに値と書式を入れる。range（例 'B3:D3'）を渡すと結合する
        const put = (addr, value, opt = {}) => {
            if (opt.merge) ws.mergeCells(opt.merge);
            const cell = ws.getCell(addr);
            cell.value = value;
            cell.font = { name: FONT, size: opt.size || 10, bold: !!opt.bold, color: { argb: opt.color || 'FF222222' } };
            cell.alignment = { vertical: 'middle', horizontal: opt.align || 'left', wrapText: !!opt.wrap };
            if (opt.fmt) cell.numFmt = opt.fmt;
            if (opt.fill) cell.fill = fill(opt.fill);
            if (opt.border !== false) {
                const cells = opt.merge ? expandRange(opt.merge) : [addr];
                cells.forEach(a => { ws.getCell(a).border = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER }; });
            }
            return cell;
        };
        // 'B3:D4' → ['B3','C3','D3','B4',...]
        function expandRange(range) {
            const [from, to] = range.split(':').map(a => ({ col: ws.getCell(a).col, row: ws.getCell(a).row }));
            const list = [];
            for (let row = from.row; row <= to.row; row++) {
                for (let col = from.col; col <= to.col; col++) list.push(ws.getCell(row, col).address);
            }
            return list;
        }
        const label = (addr, text, merge) => put(addr, text, { merge, fill: 'FFF4F7F2' });
        const head = (addr, text, merge) => put(addr, text, { merge, bold: true, fill: 'FFE4EFE6', align: 'center', wrap: true });
        const section = (row, text) => {
            put(`A${row}`, text, { merge: `A${row}:O${row}`, bold: true, size: 11, color: GREEN, border: false });
            ws.getCell(`A${row}`).border = { bottom: { style: 'medium', color: { argb: GREEN } } };
        };
        const num = (v) => (isFinite(v) ? v : '—');

        // 見出し
        put('A1', '施肥設計書', { merge: 'A1:F1', bold: true, size: 18, border: false });
        put('J1', [r.ownerName, r.fieldName, `作成日 ${r.date}`].filter(Boolean).join(' ／ '), { merge: 'J1:O1', align: 'right', border: false });
        ws.getRow(1).height = 30;
        ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1', 'N1', 'O1']
            .forEach(a => { ws.getCell(a).border = { bottom: { style: 'medium', color: { argb: GREEN } } }; });

        // 基本情報
        label('A3', '名前'); put('B3', r.ownerName || '—', { merge: 'B3:D3' });
        label('E3', '圃場名'); put('F3', r.fieldName || '—', { merge: 'F3:H3' });
        label('I3', '面積(㎡)'); put('J3', r.areaM2, { fmt: '#,##0.0', align: 'right' });
        label('K3', '面積(a)'); put('L3', r.areaM2 / 100, { fmt: '0.00', align: 'right' });
        label('A4', '作物'); put('B4', `${r.crop.emoji} ${cropLabel(r.crop)}`, { merge: 'B4:D4' });
        label('E4', '土壌'); put('F4', r.field.soilType.name, { merge: 'F4:H4' });
        label('I4', '作土深(cm)'); put('J4', r.field.depth, { align: 'right' });
        label('K4', '仮比重'); put('L4', r.field.bd, { fmt: '0.00', align: 'right' });

        // 土壌分析結果
        let row = 6;
        section(row++, '土壌分析結果');
        head(`A${row}`, '項目', `A${row}:B${row}`); head(`C${row}`, '分析値'); head(`D${row}`, '適正範囲');
        head(`E${row}`, '判定'); head(`F${row}`, '備考', `F${row}:H${row}`);
        row++;
        r.soilItems.forEach(s => {
            const shown = parseFloat(s.item.text);
            const note = (s.item.text.match(/（(.+)）$/) || [])[1] || '';
            const j = reportSoilJudge(s);
            label(`A${row}`, s.label, `A${row}:B${row}`);
            put(`C${row}`, num(shown), { align: 'right' });
            put(`D${row}`, rangePlainText(s.range, s.unit) || '—', { align: 'center' });
            put(`E${row}`, j.text, { align: 'center', bold: !!j.state, color: STATE_COLOR[j.state] });
            put(`F${row}`, note, { merge: `F${row}:H${row}` });
            row++;
        });

        // 養分収支
        row++;
        section(row++, '養分収支（目標・残存・追加・施肥後）');
        head(`A${row}`, '養分', `A${row}:B${row}`); head(`C${row}`, '単位'); head(`D${row}`, '目標');
        head(`E${row}`, '残存\n（土壌＋堆肥）'); head(`F${row}`, '追加\n（肥料）'); head(`G${row}`, '施肥後');
        head(`H${row}`, '過不足', `H${row}:I${row}`); head(`J${row}`, '肥料の追加量(kg)', `J${row}:K${row}`);
        ws.getRow(row).height = 36; // 見出しは2行（游ゴシックは1行約17pt）
        row++;
        NUTRIENT_DEFS.forEach(def => {
            const applied = r.fc.totals[def.key];
            const b = calcFinalBalance(def.key, r.result, r.fc.scale, applied);
            const d = reportBalanceDiff(def.key, b, applied);
            const isBase = def.key === 'cao' || def.key === 'mgo';
            label(`A${row}`, def.label, `A${row}:B${row}`);
            put(`C${row}`, isBase ? 'mg/100g' : 'kg', { align: 'center' });
            if (isBase) {
                put(`D${row}`, b.range ? `${b.range[0]}〜${b.range[1]}` : '—', { align: 'center' });
                put(`E${row}`, num(b.measured), { fmt: '0', align: 'right' });
                put(`F${row}`, b.addedMg, { fmt: '+0.0', align: 'right' });
                put(`G${row}`, num(b.after), { fmt: '0', align: 'right' });
            } else {
                put(`D${row}`, b.target, { fmt: '0.0', align: 'right' });
                put(`E${row}`, b.residual, { fmt: '0.0', align: 'right' });
                put(`F${row}`, applied, { fmt: '0.0', align: 'right' });
                put(`G${row}`, b.after, { fmt: '0.0', align: 'right' });
            }
            put(`H${row}`, d.text, { merge: `H${row}:I${row}`, align: 'center', bold: !!d.state, color: STATE_COLOR[d.state] });
            put(`J${row}`, applied, { merge: `J${row}:K${row}`, fmt: '0.0', align: 'right' });
            row++;
        });

        // 使用する肥料（供給量・袋数・合計は式）
        row++;
        section(row++, '使用する肥料');
        ['No', '肥料名', 'N(%)', 'P2O5(%)', 'K2O(%)', 'CaO(%)', 'MgO(%)', '1袋の\n重量(kg)', '投入量(kg)', '袋数',
            'N(kg)', 'P2O5\n(kg)', 'K2O(kg)', 'CaO(kg)', 'MgO(kg)']
            .forEach((text, i) => head(ws.getCell(row, i + 1).address, text));
        ws.getRow(row).height = 36; // 見出しは2行（游ゴシックは1行約17pt）
        row++;
        const firstFertRow = row;
        r.fc.rows.forEach((f, i) => {
            put(`A${row}`, i + 1, { align: 'center' });
            put(`B${row}`, f.name);
            ['n', 'p', 'k', 'cao', 'mgo'].forEach((k, j) => put(ws.getCell(row, 3 + j).address, f.pct[k], { fmt: '0.0', align: 'right' }));
            put(`H${row}`, f.bagWeight || null, { fmt: '0.0', align: 'right' });
            put(`I${row}`, f.amount, { fmt: '0.0', align: 'right' });
            put(`J${row}`, { formula: `IF(H${row}>0,ROUNDUP(I${row}/H${row},0),"")`, result: f.bags === null ? '' : f.bags }, { align: 'right' });
            [f.suppliedN, f.suppliedP, f.suppliedK, f.suppliedCaO, f.suppliedMgO].forEach((v, j) => {
                const pctCol = String.fromCharCode(67 + j); // C〜G
                put(ws.getCell(row, 11 + j).address, { formula: `I${row}*${pctCol}${row}/100`, result: v }, { fmt: '0.0', align: 'right' });
            });
            row++;
        });
        const lastFertRow = row - 1;
        const t = r.fc.totals;
        const sum = (col, result) => ({ formula: `SUM(${col}${firstFertRow}:${col}${lastFertRow})`, result });
        put(`A${row}`, '合計', { merge: `A${row}:H${row}`, bold: true, fill: 'FFF4F7F2', align: 'center' });
        put(`I${row}`, sum('I', t.amount), { bold: true, fill: 'FFF4F7F2', fmt: '0.0', align: 'right' });
        put(`J${row}`, sum('J', r.fc.rows.reduce((s, f) => s + (f.bags || 0), 0)), { bold: true, fill: 'FFF4F7F2', align: 'right' });
        [['K', t.n], ['L', t.p], ['M', t.k], ['N', t.cao], ['O', t.mgo]]
            .forEach(([col, v]) => put(`${col}${row}`, sum(col, v), { bold: true, fill: 'FFF4F7F2', fmt: '0.0', align: 'right' }));
        row += 2;

        // 文章欄（計算条件・堆肥・石灰苦土・特筆事項）。行の高さは文字数から見積もる
        [['計算条件', r.conditionsText], ['堆肥', r.compostText], ['石灰・苦土', r.limeText], ['特筆事項', r.notes]]
            .filter(([, text]) => text)
            .forEach(([title, text]) => {
                label(`A${row}`, title, `A${row}:B${row}`);
                ws.getCell(`A${row}`).font = { name: FONT, size: 10, bold: true };
                put(`C${row}`, text, { merge: `C${row}:O${row}`, wrap: true });
                ws.getRow(row).height = Math.max(20, Math.ceil(text.length / 48) * 17 + 6); // C〜O列は全角約50字で折り返す
                row++;
            });

        row++;
        put(`A${row}`, '※ 埼玉県主要農作物施肥基準（令和7年）に基づく計算です。減肥した場合は生育状況を確認し、生育が劣る場合は追肥等で調整してください。',
            { merge: `A${row}:O${row}`, size: 8, color: 'FF555555', border: false, wrap: true });
        ws.getRow(row).height = 24;
        row++;
        put(`A${row}`, 'This project is licensed under the BSD 3-Clause License. Copyright (c) 2026 y-ookuma',
            { merge: `A${row}:O${row}`, size: 8, color: 'FF555555', border: false, align: 'right' });

        ws.pageSetup.printArea = `A1:O${row}`;
        return wb;
    }

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        if (typeof ExcelJS === 'undefined') {
            alert('Excel出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        if (!lastReport) {
            alert('先に②で「施肥設計完了」を押してください。');
            return;
        }
        buildReportWorkbook(lastReport).xlsx.writeBuffer()
            .then(buffer => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const cropName = document.getElementById('reportCropName').textContent || 'result';
                link.download = `施肥設計書_${sanitizeFilename(cropName)}.xlsx`;
                link.href = url;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            })
            .catch(err => {
                console.error('Excel出力エラー:', err);
                alert('Excelの生成に失敗しました。もう一度お試しください。');
            });
    });

    // ---------- 写真から読み込む（③ 土壌分析結果入力の12項目） ----------
    // 読み取り方法は3つ。どれも結果はいったん確認表に出し、利用者が確かめてから入力欄に反映する。
    //   gemini … Gemini API の無料枠（利用者自身のAPIキー）。Interactions API を fetch で直接呼ぶ
    //   claude … Claude API（利用者自身のAPIキー・有料）。公式SDKを使うときだけCDNから読み込む
    //   ocr    … Tesseract.js（ブラウザ内で文字認識）。項目名と同じ行の数値を SoilReader.parseOcrText で拾う
    const ANTHROPIC_SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm';
    const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
    const CLAUDE_MODEL = 'claude-opus-5-5';
    const GEMINI_MODEL = 'gemini-3.8-flash'; // 無料枠で使えるモデル（Gemini API の料金ページ、2026年10月時点）
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
    const PHOTO_MAX_SIDE = 1600; // AIに送る画像の長辺(px)。結果票の文字が読める大きさで、送る量を抑える

    // AIごとのAPIキー入力欄と、ブラウザに保存するときの名前
    const API_PROVIDERS = {
        gemini: { area: 'geminiKeyArea', input: 'geminiApiKey', remember: 'rememberGeminiKey', storage: 'fertilizationProgram.geminiApiKey' },
        claude: { area: 'claudeKeyArea', input: 'anthropicApiKey', remember: 'rememberApiKey', storage: 'fertilizationProgram.anthropicApiKey' }
    };

    const photoModal = document.getElementById('photoReadModal');
    const photoPreview = document.getElementById('photoPreview');
    const photoReadBtn = document.getElementById('photoReadBtn');
    const photoStatus = document.getElementById('photoReadStatus');
    let photoFile = null;
    let photoPreviewUrl = '';

    const photoMethod = () => document.querySelector('input[name="photoMethod"]:checked').value;
    function setPhotoStatus(text, isError) {
        photoStatus.textContent = text;
        photoStatus.classList.toggle('is-error', !!isError);
    }
    function updatePhotoMethodView() {
        Object.keys(API_PROVIDERS).forEach(m => { document.getElementById(API_PROVIDERS[m].area).hidden = photoMethod() !== m; });
    }

    // APIキーは「保存する」にチェックしたときだけ、このブラウザ（localStorage）に置く
    function loadSavedApiKeys() {
        Object.values(API_PROVIDERS).forEach(p => {
            try {
                const saved = localStorage.getItem(p.storage);
                if (saved) { document.getElementById(p.input).value = saved; document.getElementById(p.remember).checked = true; }
            } catch (e) { /* 保存が使えない環境では毎回入力してもらう */ }
        });
    }
    function storeApiKey(method) {
        const p = API_PROVIDERS[method];
        const key = document.getElementById(p.input).value.trim();
        try {
            if (document.getElementById(p.remember).checked && key) localStorage.setItem(p.storage, key);
            else localStorage.removeItem(p.storage);
        } catch (e) { /* 保存できなくても読み取りは続ける */ }
    }

    document.getElementById('photoReadOpenBtn').addEventListener('click', () => {
        loadSavedApiKeys();
        updatePhotoMethodView();
        photoModal.style.display = 'block';
    });
    document.getElementById('closePhotoReadModal').addEventListener('click', () => { photoModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === photoModal) photoModal.style.display = 'none'; });
    document.querySelectorAll('input[name="photoMethod"]').forEach(r => r.addEventListener('change', updatePhotoMethodView));
    Object.keys(API_PROVIDERS).forEach(m => {
        document.getElementById(API_PROVIDERS[m].remember).addEventListener('change', () => storeApiKey(m));
    });

    // 写真を選ぶ（カメラ／画像ファイル）
    const photoCameraInput = document.getElementById('photoCameraInput');
    const photoFileInput = document.getElementById('photoFileInput');
    document.getElementById('photoCameraBtn').addEventListener('click', () => photoCameraInput.click());
    document.getElementById('photoFileBtn').addEventListener('click', () => photoFileInput.click());
    [photoCameraInput, photoFileInput].forEach(input => input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        photoFile = file;
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = URL.createObjectURL(file);
        photoPreview.src = photoPreviewUrl;
        photoPreview.hidden = false;
        photoReadBtn.disabled = false;
        document.getElementById('photoReadResult').hidden = true;
        setPhotoStatus('');
    }));

    // 写真を長辺 PHOTO_MAX_SIDE px のJPEGに縮め、base64（data: を除いた部分）で返す
    function photoToJpegBase64(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.naturalWidth * scale);
                canvas.height = Math.round(img.naturalHeight * scale);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/jpeg', 0.9).split(',')[1]);
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('画像を開けませんでした。JPEGかPNGの画像を選んでください。')); };
            img.src = url;
        });
    }

    let anthropicSdkPromise = null;
    function loadAnthropicSdk() {
        if (!anthropicSdkPromise) {
            anthropicSdkPromise = import(ANTHROPIC_SDK_URL).then(m => m.default)
                .catch(err => { anthropicSdkPromise = null; throw err; });
        }
        return anthropicSdkPromise;
    }

    // Gemini API（無料枠）で読み取る。返事の形は SoilReader.AI_SCHEMA（構造化出力）で決めてある。
    // store: false で、やりとりを Google 側に保存しない（会話の続きは使わないため）。
    async function readPhotoWithGemini(apiKey, file) {
        const base64 = await photoToJpegBase64(file);
        let res;
        try {
            res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({
                    model: GEMINI_MODEL,
                    input: [
                        { type: 'text', text: SoilReader.AI_PROMPT },
                        { type: 'image', data: base64, mime_type: 'image/jpeg' }
                    ],
                    response_format: { type: 'text', mime_type: 'application/json', schema: SoilReader.AI_SCHEMA },
                    store: false
                })
            });
        } catch (err) {
            throw new Error('Google に接続できませんでした。通信環境をご確認ください。');
        }
        const body = await res.json().catch(() => null);
        if (!res.ok) {
            const error = ((Array.isArray(body) ? body[0] : body) || {}).error || {};
            const reason = ((error.details || []).find(d => d.reason) || {}).reason;
            if (reason === 'API_KEY_INVALID' || res.status === 401) throw new Error('APIキーが正しくありません。キーを確かめてください。');
            if (res.status === 403) throw new Error('このAPIキーでは利用できません（Google AI Studio でキーの設定をご確認ください）。');
            if (res.status === 429) throw new Error('無料枠の上限に達しました。しばらく待つか、翌日にもう一度お試しください。');
            throw new Error(`APIエラー（${res.status}）：${error.message || '不明なエラー'}`);
        }
        if (!body || body.status !== 'completed') throw new Error(`読み取りが完了しませんでした（${body ? body.status : '応答なし'}）。もう一度お試しください。`);
        const text = (body.steps || []).filter(s => s.type === 'model_output')
            .flatMap(s => s.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
        if (!text) throw new Error('AIから読み取り結果が返ってきませんでした。別の写真でお試しください。');
        return Object.assign(SoilReader.normalizeAiResult(JSON.parse(text)), { raw: '' });
    }

    // Claude API で読み取る。返事の形は SoilReader.AI_SCHEMA（構造化出力）で決めてある。
    // 安全上の理由で断られた場合に備え、サーバー側の代替モデル（fallbacks: 'default'）を有効にしている。
    async function readPhotoWithClaude(apiKey, file) {
        const [Anthropic, base64] = await Promise.all([loadAnthropicSdk(), photoToJpegBase64(file)]);
        const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
        let response;
        try {
            response = await client.beta.messages.create({
                model: CLAUDE_MODEL,
                max_tokens: 16000,
                betas: ['server-side-fallback-2026-07-01'],
                fallbacks: 'default',
                output_config: {
                    effort: 'medium',
                    format: { type: 'json_schema', schema: SoilReader.AI_SCHEMA }
                },
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
                        { type: 'text', text: SoilReader.AI_PROMPT }
                    ]
                }]
            });
        } catch (err) {
            if (err instanceof Anthropic.AuthenticationError) throw new Error('APIキーが正しくありません。キーを確かめてください。');
            if (err instanceof Anthropic.PermissionDeniedError) throw new Error('このAPIキーでは利用できません（権限または残高をご確認ください）。');
            if (err instanceof Anthropic.RateLimitError) throw new Error('利用の上限に達しました。しばらく待ってからもう一度お試しください。');
            if (err instanceof Anthropic.BadRequestError) throw new Error(`リクエストが受け付けられませんでした：${err.message}`);
            if (err instanceof Anthropic.APIConnectionError) throw new Error('Anthropic に接続できませんでした。通信環境をご確認ください。');
            if (err instanceof Anthropic.APIError) throw new Error(`APIエラー（${err.status}）：${err.message}`);
            throw err;
        }
        if (response.stop_reason === 'refusal') throw new Error('この画像は読み取りを断られました。別の写真でお試しください。');
        if (response.stop_reason === 'max_tokens') throw new Error('読み取りの途中で打ち切られました。もう一度お試しください。');
        const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
        return Object.assign(SoilReader.normalizeAiResult(JSON.parse(text)), { raw: '' });
    }

    let tesseractPromise = null;
    function loadTesseract() {
        if (!tesseractPromise) {
            tesseractPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = TESSERACT_URL;
                script.onload = () => resolve(window.Tesseract);
                script.onerror = () => { tesseractPromise = null; reject(new Error('文字認識の機能を読み込めませんでした。通信環境をご確認ください。')); };
                document.head.appendChild(script);
            });
        }
        return tesseractPromise;
    }

    // ブラウザ内OCRで読み取る（日本語＋英数字）。値の対応付けは SoilReader.parseOcrText
    async function readPhotoWithOcr(file) {
        const Tesseract = await loadTesseract();
        const worker = await Tesseract.createWorker('jpn+eng', 1, {
            logger: (m) => {
                if (m.status === 'recognizing text') setPhotoStatus(`文字を認識しています… ${Math.round(m.progress * 100)}%`);
                else if (m.status) setPhotoStatus('文字認識の準備をしています…（初回は時間がかかります）');
            }
        });
        try {
            const { data } = await worker.recognize(file);
            const found = SoilReader.parseOcrText(data.text);
            const values = {};
            Object.keys(found).forEach(k => {
                values[k] = { value: found[k].value, note: found[k].note || `認識した行：${found[k].line}` };
            });
            return { values, sample: '', warnings: '', raw: data.text };
        } finally {
            await worker.terminate();
        }
    }

    photoReadBtn.addEventListener('click', async () => {
        if (!photoFile) return;
        const method = photoMethod();
        const provider = API_PROVIDERS[method];
        const apiKey = provider ? document.getElementById(provider.input).value.trim() : '';
        if (provider && !apiKey) {
            setPhotoStatus('APIキーを入力してください。', true);
            document.getElementById(provider.input).focus();
            return;
        }
        if (provider) storeApiKey(method);
        photoReadBtn.disabled = true;
        document.getElementById('photoReadResult').hidden = true;
        setPhotoStatus(provider ? 'AIが結果票を読んでいます…（数十秒かかることがあります）' : '文字認識の準備をしています…');
        try {
            const result = method === 'gemini' ? await readPhotoWithGemini(apiKey, photoFile)
                : method === 'claude' ? await readPhotoWithClaude(apiKey, photoFile)
                : await readPhotoWithOcr(photoFile);
            renderPhotoResult(result);
            const count = Object.values(result.values).filter(v => v.value !== null).length;
            // OCRは斜めの写真・照明のむら・横のグラフに弱い。拾えた項目が少ないときはAI画像認識をすすめる
            const hint = method === 'ocr' && count < 6 ? ' 読み取れた項目が少ないため、AI画像認識（Gemini API・無料枠）をおすすめします。' : '';
            setPhotoStatus(`${count}項目を読み取りました。下の表で確かめてください。${hint}`);
        } catch (err) {
            console.error('写真の読み取りエラー:', err);
            setPhotoStatus(err && err.message ? err.message : '読み取りに失敗しました。', true);
        } finally {
            photoReadBtn.disabled = false;
        }
    });

    // 確認表：読み取った値は直せる。値がある項目だけ最初からチェックを入れる
    function renderPhotoResult(result) {
        document.getElementById('photoReadRows').innerHTML = SoilReader.FIELDS.map(f => {
            const item = result.values[f.key] || { value: null, note: '' };
            const current = document.getElementById(`soil_${f.key}`).value;
            const has = item.value !== null;
            return `<tr>
                <td class="photo-use"><input type="checkbox" id="photo_use_${f.key}" ${has ? 'checked' : ''} aria-label="${escapeHtml(f.label)}を反映"></td>
                <td>(${f.no}) ${escapeHtml(f.label)}${f.unit ? ` <small>${escapeHtml(f.unit)}</small>` : ''}</td>
                <td><input type="number" step="any" id="photo_val_${f.key}" value="${has ? item.value : ''}"></td>
                <td class="photo-note">${escapeHtml(item.note || '')}</td>
                <td class="photo-current">${current === '' ? '（空欄）' : escapeHtml(current)}</td>
            </tr>`;
        }).join('');
        // 値を書き込んだ行は反映の対象にする
        SoilReader.FIELDS.forEach(f => {
            document.getElementById(`photo_val_${f.key}`).addEventListener('input', (e) => {
                document.getElementById(`photo_use_${f.key}`).checked = e.target.value !== '';
            });
        });
        const info = [result.sample ? `試料：${result.sample}` : '', result.warnings].filter(Boolean).join(' ／ ');
        document.getElementById('photoReadSample').textContent = info ? `⚠️ ${info}` : '';
        document.getElementById('photoOcrRawWrap').hidden = !result.raw;
        document.getElementById('photoOcrRaw').textContent = result.raw || '';
        document.getElementById('photoReadResult').hidden = false;
    }

    document.getElementById('photoApplyBtn').addEventListener('click', () => {
        let applied = 0;
        SoilReader.FIELDS.forEach(f => {
            const value = document.getElementById(`photo_val_${f.key}`).value;
            if (!document.getElementById(`photo_use_${f.key}`).checked || value === '') return;
            const input = document.getElementById(`soil_${f.key}`);
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true })); // ②・③を古い結果としてロックする処理を動かす
            applied++;
        });
        photoModal.style.display = 'none';
        document.getElementById('photoReadNotice').textContent =
            applied > 0 ? `✅ 写真から${applied}項目を入力しました。値を確かめてから計算してください。` : '反映した項目はありません。';
    });

    // ---------- 初期表示 ----------
    soilTypeSelect.value = 'kuroboku_atsu_ta';
    applySoilTypeDefaults();
    updateCustomCropVisibility();
    updateCompostVisibility();
    updateAreaConvertedDisplay();
    updateSpecialNotesCounter();
});
