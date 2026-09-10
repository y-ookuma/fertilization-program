// 30品目を含む元肥ライブラリデータ
// category: fruit(果菜) / leafy(葉菜) / root(根菜) / bulb(りん茎) / tuber(いも類) / legume(豆類) / perennial(多年生)
// targetPh: その作物が好む目安pH（未指定は6.3を既定値として使用）
const fertilizerLibrary = {
    "version": "1.2",
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

// 作物カテゴリー別の堆肥アドバイス（簡易的なめやす）
const compostAdviceByCategory = {
    fruit: "完熟堆肥を2〜3t/10a、植付けの3週間以上前に施用してください。実つきを良くする土づくりの土台になります。",
    leafy: "堆肥1.5〜2t/10aを目安に施用してください。窒素が効きすぎると軟弱徒長しやすいので入れすぎに注意しましょう。",
    root: "未熟な堆肥は又根（またね）の原因になります。完熟堆肥を1.5〜2t/10a、前作からの持ち越しも意識して施用してください。",
    bulb: "完熟堆肥を1.5〜2t/10a施用し、根の伸長を妨げないよう植付け前によく耕うんしてください。",
    tuber: "完熟堆肥を1.5〜2t/10aを目安に、窒素過多を避けて施用してください。",
    legume: "根粒菌が窒素を供給するため、堆肥は1〜1.5t/10aと控えめで十分です。",
    perennial: "定植・株分け時に堆肥を多め（3〜4t/10a）に施し、以降は毎年株元に補うと生育が安定します。"
};

const categoryLabel = {
    fruit: "果菜類", leafy: "葉菜類", root: "根菜類", bulb: "りん茎類",
    tuber: "いも類", legume: "豆類", perennial: "多年生"
};

// アイコン（SVG）
const ICONS = {
    n: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40C8 24 20 8 40 8C40 28 24 40 8 40Z"/><path d="M10 38C18 30 26 22 34 14"/></svg>',
    p: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6V22"/><path d="M24 22C24 22 14 26 12 40"/><path d="M24 22C24 22 34 26 36 40"/><path d="M24 22V42"/><circle cx="24" cy="6" r="3" fill="currentColor" stroke="none"/></svg>',
    k: '<svg viewBox="0 0 48 48" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="4.5" fill="currentColor" stroke="none"/><circle cx="24" cy="11" r="6"/><circle cx="24" cy="37" r="6"/><circle cx="11" cy="24" r="6"/><circle cx="37" cy="24" r="6"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
    const cropSelect = document.getElementById('cropSelect');

    // 作物セレクトボックスの構築
    fertilizerLibrary.crops.forEach(crop => {
        const option = document.createElement('option');
        option.value = crop.id;
        option.textContent = `${crop.emoji} ${crop.name}`;
        cropSelect.appendChild(option);
    });

    // モーダル制御
    const modal = document.getElementById('helpModal');
    document.getElementById('helpBtn').addEventListener('click', () => modal.style.display = 'block');
    document.getElementById('closeModal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // ファイル名として使えない文字を除去する簡易サニタイズ
    function sanitizeFilename(name) {
        return name.replace(/[\\/:*?"<>|]/g, '').trim();
    }

    function todayStamp() {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // パラメータの保存（ファイル名を指定してJSONダウンロード）
    document.getElementById('saveBtn').addEventListener('click', () => {
        const selectedCrop = fertilizerLibrary.crops.find(c => c.id === cropSelect.value);
        const data = {
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
                mgo_k2o_ratio: document.getElementById('soil_mgo_k2o_ratio').value
            }
        };

        const defaultName = `施肥パラメータ_${selectedCrop ? selectedCrop.name : '未選択'}_${todayStamp()}`;
        let filename = prompt('保存するファイル名を入力してください（拡張子 .json は自動で付きます）', defaultName);
        if (filename === null) return; // キャンセル
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
    });

    // パラメータの復元（ファイルを選択して読み込み）
    const restoreFileInput = document.getElementById('restoreFileInput');
    document.getElementById('restoreBtn').addEventListener('click', () => {
        restoreFileInput.click();
    });

    restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
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
                alert(`「${file.name}」からパラメータを復元しました。`);
            } catch (err) {
                alert('ファイルの読み込みに失敗しました。正しい形式の.jsonファイルか確認してください。');
            } finally {
                restoreFileInput.value = ''; // 同じファイルを連続で選択できるようにリセット
            }
        };
        reader.onerror = () => {
            alert('ファイルの読み込み中にエラーが発生しました。');
            restoreFileInput.value = '';
        };
        reader.readAsText(file);
    });

    // NPKカードのHTMLを作成
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
                <div class="npk-deficit-line">${sufficient ? '✅ 目標量に到達しています' : `🌾 不足量：${deficit.toFixed(1)} kg/10a`}</div>
            </div>
        `;
    }

    // 石灰アドバイスを組み立てる
    function buildLimeAdvice(crop, ph, caoMgoRatio) {
        const lines = [];
        const targetPh = crop.targetPh || 6.3;

        if (isNaN(ph)) {
            lines.push(`この作物の目安pHは約${targetPh}です。pHの値を入力すると石灰の施用量を計算します。`);
        } else if (ph < targetPh) {
            const need = Math.round((targetPh - ph) * 120);
            lines.push(`現在のpH ${ph.toFixed(1)} → 目安pH ${targetPh} まで上げるには、苦土石灰を目安で約${need}kg/10a施用してください。`);
        } else {
            lines.push(`現在のpH ${ph.toFixed(1)} は目安pH ${targetPh} に対して十分です。石灰質資材の追加は控えめで大丈夫です。`);
        }

        if (!isNaN(caoMgoRatio)) {
            if (caoMgoRatio > 8) {
                lines.push('石灰に対して苦土（マグネシウム）が相対的に不足気味です。苦土石灰（ドロマイト）での補給がおすすめです。');
            } else if (caoMgoRatio < 3) {
                lines.push('苦土に対して石灰が少なめです。炭酸カルシウムなど苦土を含まない石灰質資材が適しています。');
            } else {
                lines.push('石灰と苦土のバランスは良好です。');
            }
        }
        return lines.join(' ');
    }

    // 計算実行
    document.getElementById('calcBtn').addEventListener('click', () => {
        const cropId = cropSelect.value;
        if (!cropId) {
            alert('作物を選択してください。');
            return;
        }

        const crop = fertilizerLibrary.crops.find(c => c.id === cropId);

        // 土壌分析値の取得（未入力は0または未入力として扱う）
        const soilK2O = parseFloat(document.getElementById('soil_k2o').value) || 0;
        const soilP2O5 = parseFloat(document.getElementById('soil_p2o5').value) || 0;
        const soilPh = parseFloat(document.getElementById('soil_ph').value);
        const caoMgoRatio = parseFloat(document.getElementById('soil_cao_mgo_ratio').value);
        const soilN = 25; // 簡易目安（本来は硝酸態窒素等から換算）

        // 目標成分量 (kg/10a) ＝ 吸収量 × 標準元肥比率
        const targetN = crop.nutrient_absorption_kg_10a.n * crop.standard_basal_ratio.n;
        const targetP = crop.nutrient_absorption_kg_10a.p2o5 * crop.standard_basal_ratio.p2o5;
        const targetK = crop.nutrient_absorption_kg_10a.k2o * crop.standard_basal_ratio.k2o;

        // 土壌残存量の簡易換算（mg/100gを大まかな係数でkg/10a分に換算する例）
        // ※実運用では各地域の土壌診断基準に基づく係数に置き換えてください
        const residualN = soilN * 0.2;
        const residualP = soilP2O5 * 0.15;
        const residualK = soilK2O * 0.15;

        // 不足分（目標 - 残存、マイナスになる場合は0）
        const deficitN = Math.max(0, targetN - residualN);
        const deficitP = Math.max(0, targetP - residualP);
        const deficitK = Math.max(0, targetK - residualK);

        // 作物名エリアの更新
        document.getElementById('resultCropEmoji').textContent = crop.emoji;
        document.getElementById('resultCropName').textContent = crop.name;
        document.getElementById('captureCropEmoji').textContent = crop.emoji;
        document.getElementById('captureCropName').textContent = `${crop.emoji} ${crop.name}`;

        // NPKカードの描画
        const npkGrid = document.getElementById('npkGrid');
        npkGrid.innerHTML =
            buildNpkCard('n', '窒素 (N)', '葉と茎を育てる', targetN, residualN, deficitN) +
            buildNpkCard('p', 'リン酸 (P2O5)', '根と花・実をつくる', targetP, residualP, deficitP) +
            buildNpkCard('k', '加里 (K2O)', '株を丈夫にする', targetK, residualK, deficitK);

        // 石灰アドバイス
        document.getElementById('limeAdviceText').textContent = buildLimeAdvice(crop, soilPh, caoMgoRatio);

        // 堆肥アドバイス
        const compostText = compostAdviceByCategory[crop.category] || compostAdviceByCategory.leafy;
        document.getElementById('compostAdviceText').textContent =
            `【${categoryLabel[crop.category] || ''}】${compostText}`;

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // PNG出力
    document.getElementById('exportPngBtn').addEventListener('click', () => {
        const target = document.getElementById('captureArea');
        if (typeof html2canvas === 'undefined') {
            alert('PNG出力機能の読み込みに失敗しました。通信環境をご確認のうえ再度お試しください。');
            return;
        }
        html2canvas(target, { backgroundColor: '#FDFEFC', scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            const cropName = document.getElementById('resultCropName').textContent || 'result';
            link.download = `施肥設計_${cropName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(() => {
            alert('PNGの生成に失敗しました。もう一度お試しください。');
        });
    });
});
