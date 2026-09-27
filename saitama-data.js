// 施肥設計の基準データ（出典つき）
// 数値はすべて下記の資料から転記したもの。転記元のページを各データに記載している。
//   [埼玉R7]  埼玉県「主要農作物施肥基準」令和7年1月
//             https://www.pref.saitama.lg.jp/a0903/sehikijun.html
//             技術編 = 「適正施肥を進めるための技術と基準」(r7sehikijun_tech.pdf)
//             野菜編 = r7sehikijun_yasai1.pdf、水稲 = r7sehikijun_shukoku.pdf
//   [青森]    青森県「健康な土づくり技術マニュアル」（農林水産省 都道府県施肥基準等 掲載）
//   [藤原2008] 藤原(2008)。JAcom「今さら聞けない営農情報 第18回 土壌の改良(2) EC」(2019)からの二次引用
(function (root) {
    'use strict';

    // ---------------------------------------------------------------
    // 作物別の施肥基準（kg/10a）… [埼玉R7] 野菜編・水稲
    //   basal = 基肥、total = 合計（基肥＋追肥）。本アプリは基肥（元肥）の設計に使う。
    //   ecClass: 藤原(2008)の適正EC区分（fruit=果菜類、leafy=葉・根菜類、paddy=水田）
    //   compost: 各作物ページ「土づくり」に記載の堆肥施用量（t/10a）
    // ---------------------------------------------------------------
    const S = 'saitama';
    const crops = [
        // ①きゅうり p.46
        { id: 'cucumber_sokusei', name: 'きゅうり', cropType: '促成', emoji: '🥒', ecClass: 'fruit', basal: { n: 26, p: 43, k: 26 }, total: { n: 46, p: 43, k: 46 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.46' },
        { id: 'cucumber_hansokusei', name: 'きゅうり', cropType: '半促成', emoji: '🥒', ecClass: 'fruit', basal: { n: 23, p: 35, k: 23 }, total: { n: 38, p: 35, k: 38 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.46' },
        { id: 'cucumber_yokusei', name: 'きゅうり', cropType: '抑制', emoji: '🥒', ecClass: 'fruit', basal: { n: 10, p: 16, k: 10 }, total: { n: 18, p: 16, k: 18 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.46' },
        { id: 'cucumber_ettou', name: 'きゅうり', cropType: '越冬(短期)', emoji: '🥒', ecClass: 'fruit', basal: { n: 12, p: 20, k: 12 }, total: { n: 22, p: 20, k: 22 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.46' },
        // ②なす p.47
        { id: 'eggplant_hansokusei', name: 'なす', cropType: '半促成栽培', emoji: '🍆', ecClass: 'fruit', basal: { n: 30, p: 30, k: 30 }, total: { n: 40, p: 30, k: 40 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.47' },
        { id: 'eggplant_tunnel', name: 'なす', cropType: 'トンネル早熟栽培', emoji: '🍆', ecClass: 'fruit', basal: { n: 30, p: 30, k: 30 }, total: { n: 42, p: 30, k: 42 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.47' },
        { id: 'eggplant_roji', name: 'なす', cropType: '露地栽培', emoji: '🍆', ecClass: 'fruit', basal: { n: 30, p: 30, k: 30 }, total: { n: 38, p: 30, k: 38 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.47' },
        // ③トマト・ミニトマト p.48
        { id: 'tomato_sokusei', name: 'トマト', cropType: '促成栽培', emoji: '🍅', ecClass: 'fruit', basal: { n: 15, p: 25, k: 15 }, total: { n: 30, p: 30, k: 30 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.48' },
        { id: 'tomato_yoeki', name: 'トマト', cropType: '長期越冬栽培（養液土耕）', emoji: '🍅', ecClass: 'fruit', basal: { n: 0, p: 0, k: 0 }, total: { n: 60, p: 40, k: 120 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.48', note: '基肥を施用しない作型です（追肥は液肥混入機と点滴チューブで、かん水と併せて行う）。' },
        { id: 'minitomato_ettou', name: 'ミニトマト', cropType: '長期越冬栽培', emoji: '🍅', ecClass: 'fruit', basal: { n: 30, p: 30, k: 30 }, total: { n: 50, p: 40, k: 50 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.48' },
        // ④いちご p.49
        { id: 'strawberry_sokusei', name: 'いちご', cropType: '促成', emoji: '🍓', ecClass: 'fruit', basal: { n: 15, p: 20, k: 15 }, total: { n: 20, p: 25, k: 20 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.49', note: '連続畝栽培では基肥量を約3〜4割削減し、合計で15kg/10aとする（県基準）。' },
        // ⑤にがうり p.50
        { id: 'nigauri_roji', name: 'にがうり', cropType: '露地', emoji: '🥒', ecClass: 'fruit', basal: { n: 20, p: 20, k: 20 }, total: { n: 25, p: 25, k: 25 }, compost: { min: 3, max: 3 }, source: S, page: '野菜編 p.50' },
        // ⑥えだまめ p.51（追肥は施肥量が不足した場合のみ）
        { id: 'edamame_house', name: 'えだまめ', cropType: 'ハウス早熟', emoji: '🫛', ecClass: 'fruit', basal: { n: 8, p: 12, k: 12 }, total: { n: 8, p: 12, k: 12 }, compost: { min: 1, max: 1 }, source: S, page: '野菜編 p.51' },
        { id: 'edamame_tunnel', name: 'えだまめ', cropType: 'トンネル早熟', emoji: '🫛', ecClass: 'fruit', basal: { n: 8, p: 12, k: 12 }, total: { n: 8, p: 12, k: 12 }, compost: { min: 1, max: 1 }, source: S, page: '野菜編 p.51' },
        { id: 'edamame_roji', name: 'えだまめ', cropType: '露地', emoji: '🫛', ecClass: 'fruit', basal: { n: 10, p: 12, k: 12 }, total: { n: 10, p: 12, k: 12 }, compost: { min: 1, max: 1 }, source: S, page: '野菜編 p.51' },
        // ⑦さやいんげん p.52
        { id: 'ingen_roji_yokusei', name: 'さやいんげん', cropType: '露地抑制', emoji: '🫘', ecClass: 'fruit', basal: { n: 16, p: 22, k: 16 }, total: { n: 20, p: 22, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.52' },
        // ⑧スイートコーン p.53
        { id: 'corn_tunnel', name: 'スイートコーン', cropType: 'トンネル早熟', emoji: '🌽', ecClass: 'fruit', basal: { n: 22, p: 20, k: 25 }, total: { n: 22, p: 20, k: 25 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.53' },
        { id: 'corn_futsu', name: 'スイートコーン', cropType: '普通', emoji: '🌽', ecClass: 'fruit', basal: { n: 20, p: 18, k: 18 }, total: { n: 20, p: 18, k: 18 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.53' },
        // ⑨ねぎ p.54（基肥なし）
        { id: 'negi_akifuyu', name: 'ねぎ', cropType: '秋冬どり', emoji: '🌱', ecClass: 'leafy', basal: { n: 0, p: 0, k: 0 }, total: { n: 18, p: 18, k: 18 }, compost: { min: 1, max: 2 }, source: S, page: '野菜編 p.54', note: '基肥は施用しない（水田等地力窒素が少ないほ場は基肥の施用を検討する）作型です。' },
        { id: 'negi_harudori', name: 'ねぎ', cropType: '春どり', emoji: '🌱', ecClass: 'leafy', basal: { n: 0, p: 0, k: 0 }, total: { n: 18, p: 18, k: 18 }, compost: { min: 1, max: 2 }, source: S, page: '野菜編 p.54', note: '基肥を施用しない作型です。' },
        { id: 'negi_natsudori', name: 'ねぎ', cropType: '夏どり', emoji: '🌱', ecClass: 'leafy', basal: { n: 0, p: 0, k: 0 }, total: { n: 14, p: 14, k: 14 }, compost: { min: 1, max: 2 }, source: S, page: '野菜編 p.54', note: '基肥を施用しない作型です。' },
        // ⑩たまねぎ p.55
        { id: 'onion_mulch', name: 'たまねぎ', cropType: 'マルチ秋まき', emoji: '🧅', ecClass: 'leafy', basal: { n: 20, p: 28, k: 20 }, total: { n: 20, p: 28, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.55' },
        // ⑪ほうれんそう p.56
        { id: 'spinach_haru', name: 'ほうれんそう', cropType: '春まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 11, p: 12, k: 11 }, total: { n: 11, p: 12, k: 11 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.56' },
        { id: 'spinach_natsu', name: 'ほうれんそう', cropType: '夏まき雨よけ', emoji: '🥬', ecClass: 'leafy', basal: { n: 8, p: 8, k: 8 }, total: { n: 8, p: 8, k: 8 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.56' },
        { id: 'spinach_aki', name: 'ほうれんそう', cropType: '秋まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 20, p: 22, k: 18 }, total: { n: 20, p: 22, k: 18 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.56' },
        { id: 'spinach_tunnel', name: 'ほうれんそう', cropType: 'トンネル冬まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 18, p: 21, k: 18 }, total: { n: 18, p: 21, k: 18 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.56' },
        // ⑫こまつな p.57（1作の施肥量）
        { id: 'komatsuna_house_haru', name: 'こまつな', cropType: 'ハウス春まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 12, p: 12, k: 12 }, total: { n: 12, p: 12, k: 12 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.57', note: '1作の施肥量。連作や生育期間の短い夏播きでは3〜5割程度減肥する（県基準）。' },
        { id: 'komatsuna_house_natsu', name: 'こまつな', cropType: 'ハウス夏まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 8, p: 8, k: 8 }, total: { n: 8, p: 8, k: 8 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.57', note: '1作の施肥量。連作や生育期間の短い夏播きでは3〜5割程度減肥する（県基準）。' },
        { id: 'komatsuna_house_aki', name: 'こまつな', cropType: 'ハウス秋まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 12, p: 12, k: 12 }, total: { n: 12, p: 12, k: 12 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.57', note: '1作の施肥量。連作では3〜5割程度減肥する（県基準）。' },
        { id: 'komatsuna_house_fuyu', name: 'こまつな', cropType: 'ハウス冬まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 12, p: 12, k: 12 }, total: { n: 12, p: 12, k: 12 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.57', note: '1作の施肥量。連作では3〜5割程度減肥する（県基準）。' },
        // ⑬さんとうさい p.58
        { id: 'santousai_aki', name: 'さんとうさい', cropType: '秋まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 25, p: 25, k: 25 }, total: { n: 35, p: 25, k: 30 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.58' },
        // ⑭はくさい p.59
        { id: 'hakusai_aki', name: 'はくさい', cropType: '秋まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 20, p: 20, k: 20 }, total: { n: 28, p: 20, k: 25 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.59' },
        // ⑮キャベツ p.60
        { id: 'cabbage_akifuyu', name: 'キャベツ', cropType: '秋冬どり', emoji: '🥬', ecClass: 'leafy', basal: { n: 15, p: 18, k: 15 }, total: { n: 20, p: 18, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.60' },
        { id: 'cabbage_fuyu', name: 'キャベツ', cropType: '冬どり', emoji: '🥬', ecClass: 'leafy', basal: { n: 20, p: 20, k: 15 }, total: { n: 25, p: 20, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.60' },
        { id: 'cabbage_shoka', name: 'キャベツ', cropType: '初夏どり', emoji: '🥬', ecClass: 'leafy', basal: { n: 15, p: 20, k: 15 }, total: { n: 26, p: 20, k: 23 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.60' },
        // ⑯しゅんぎく p.61
        { id: 'shungiku_house_aki', name: 'しゅんぎく', cropType: 'ハウス秋まき', emoji: '🌿', ecClass: 'leafy', basal: { n: 14, p: 20, k: 14 }, total: { n: 14, p: 20, k: 14 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.61' },
        // ⑰レタス p.62
        { id: 'lettuce_house_aki', name: 'レタス', cropType: 'ハウス秋まき', emoji: '🥬', ecClass: 'leafy', basal: { n: 25, p: 25, k: 23 }, total: { n: 25, p: 25, k: 23 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.62', note: 'きゅうりの後等、前作の残肥がかなりある場合は減肥する（県基準）。' },
        { id: 'lettuce_natsu', name: 'レタス', cropType: '夏まき秋どり', emoji: '🥬', ecClass: 'leafy', basal: { n: 20, p: 18, k: 20 }, total: { n: 20, p: 18, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.62' },
        // ⑱カリフラワー p.63
        { id: 'cauliflower_natsu', name: 'カリフラワー', cropType: '夏まき秋冬どり', emoji: '🥦', ecClass: 'leafy', basal: { n: 15, p: 24, k: 15 }, total: { n: 23, p: 24, k: 23 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.63' },
        // ⑲ブロッコリー p.64
        { id: 'broccoli_tunnel', name: 'ブロッコリー', cropType: 'トンネル早春まき', emoji: '🥦', ecClass: 'leafy', basal: { n: 16, p: 20, k: 16 }, total: { n: 16, p: 20, k: 16 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.64' },
        { id: 'broccoli_natsu', name: 'ブロッコリー', cropType: '夏まき秋冬どり', emoji: '🥦', ecClass: 'leafy', basal: { n: 10, p: 14, k: 10 }, total: { n: 14, p: 14, k: 14 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.64' },
        // ⑳たいさい p.65
        { id: 'taisai_aki', name: 'たいさい', cropType: '秋まき露地', emoji: '🥬', ecClass: 'leafy', basal: { n: 20, p: 20, k: 20 }, total: { n: 20, p: 20, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.65' },
        // ㉑のらぼうな p.66
        { id: 'noraboun_roji', name: 'のらぼうな', cropType: '露地', emoji: '🥬', ecClass: 'leafy', basal: { n: 6, p: 6, k: 6 }, total: { n: 12, p: 10, k: 12 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.66' },
        // ㉒だいこん p.67
        { id: 'daikon_tunnel', name: 'だいこん', cropType: 'トンネル冬春まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 10, p: 10, k: 10 }, total: { n: 10, p: 10, k: 10 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.67' },
        { id: 'daikon_natsu', name: 'だいこん', cropType: '夏まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 10, p: 16, k: 10 }, total: { n: 10, p: 16, k: 10 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.67' },
        // ㉓かぶ p.68
        { id: 'kabu_haru', name: 'かぶ', cropType: '春まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 15, p: 15, k: 15 }, total: { n: 15, p: 15, k: 15 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.68' },
        { id: 'kabu_natsu', name: 'かぶ', cropType: '夏まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 10, p: 10, k: 10 }, total: { n: 10, p: 10, k: 10 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.68' },
        { id: 'kabu_tunnel', name: 'かぶ', cropType: 'トンネル冬まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 12, p: 15, k: 12 }, total: { n: 12, p: 15, k: 12 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.68' },
        // ㉔にんじん p.69
        { id: 'carrot_natsu', name: 'にんじん', cropType: '夏まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 14, p: 16, k: 11 }, total: { n: 19, p: 21, k: 16 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.69' },
        { id: 'carrot_tunnel', name: 'にんじん', cropType: 'トンネル冬まき', emoji: '🥕', ecClass: 'leafy', basal: { n: 20, p: 20, k: 20 }, total: { n: 20, p: 20, k: 20 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.69' },
        // ㉕さつまいも p.70（土づくりに堆肥量の記載なし）
        { id: 'satsumaimo_mulch', name: 'さつまいも', cropType: 'マルチ栽培', emoji: '🍠', ecClass: 'leafy', basal: { n: 2, p: 7, k: 20 }, total: { n: 2, p: 7, k: 20 }, compost: null, source: S, page: '野菜編 p.70', note: '全量基肥。窒素過多に注意。野菜後のような肥沃地では良質な生産物ができないので計画的な輪作を行う（県基準）。' },
        // ㉖さといも p.71
        { id: 'satoimo_roji', name: 'さといも', cropType: '露地栽培', emoji: '🥔', ecClass: 'leafy', basal: { n: 10, p: 24, k: 6 }, total: { n: 20, p: 36, k: 18 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.71' },
        // ㉗やまといも p.72（基肥なし）
        { id: 'yamatoimo_roji', name: 'やまといも', cropType: '露地栽培', emoji: '🥔', ecClass: 'leafy', basal: { n: 0, p: 0, k: 0 }, total: { n: 17, p: 17, k: 19 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.72', note: '基肥なし（追肥2回）の作型です。' },
        // ㉘葉しょうが p.73（基肥なし）
        { id: 'hashouga_roji', name: '葉しょうが', cropType: '露地早熟', emoji: '🫚', ecClass: 'leafy', basal: { n: 0, p: 0, k: 0 }, total: { n: 16, p: 16, k: 16 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.73', note: '基肥は施用しない作型です。' },
        // ㉙くわい p.74
        { id: 'kuwai_futsu', name: 'くわい', cropType: '普通栽培', emoji: '🌱', ecClass: 'leafy', basal: { n: 25, p: 30, k: 25 }, total: { n: 38, p: 30, k: 38 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.74' },
        // ㉚うど p.75
        { id: 'udo', name: 'うど', cropType: '根株養成・軟化栽培', emoji: '🌱', ecClass: 'leafy', basal: { n: 12, p: 24, k: 20 }, total: { n: 16, p: 32, k: 32 }, compost: { min: 2, max: 3 }, source: S, page: '野菜編 p.75' },

        // 水稲 p.38（速効性化学合成肥料を使用した場合の数値。原則として記載の施肥量を上限とする）
        { id: 'rice_koshihikari_souki', name: '水稲 コシヒカリ', cropType: '早期栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 3, p: 6, k: 3 }, total: { n: 7.5, p: 8, k: 7.5 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_koshihikari', name: '水稲 コシヒカリ', cropType: '早植栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 2, p: 6, k: 2 }, total: { n: 6.5, p: 8, k: 6.5 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_sainokizuna_wase', name: '水稲 彩のきずな', cropType: '早植栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 7, p: 7, k: 7 }, total: { n: 10, p: 7, k: 10 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_kinuhikari_wase', name: '水稲 キヌヒカリ', cropType: '早植栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 5, p: 5, k: 5 }, total: { n: 9, p: 7, k: 9 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_ayanokagayaki_wase', name: '水稲 彩のかがやき', cropType: '早植栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 5, p: 5, k: 5 }, total: { n: 8, p: 5, k: 8 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_sainokizuna', name: '水稲 彩のきずな', cropType: '普通期栽培（中苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 5, p: 5, k: 5 }, total: { n: 7, p: 5, k: 7 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_kinuhikari', name: '水稲 キヌヒカリ', cropType: '普通期栽培（中苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 5, p: 5, k: 5 }, total: { n: 8, p: 5, k: 8 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_ayanokagayaki', name: '水稲 彩のかがやき', cropType: '普通期栽培（中苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 5, p: 5, k: 5 }, total: { n: 7, p: 5, k: 7 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_minenoyukimochi_wase', name: '水稲 峰の雪もち', cropType: '早植栽培（稚苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 6, p: 6, k: 6 }, total: { n: 11, p: 8, k: 11 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_minenoyukimochi', name: '水稲 峰の雪もち', cropType: '普通期栽培（中苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 6, p: 6, k: 6 }, total: { n: 9, p: 6, k: 9 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_sakemusashi', name: '水稲 さけ武蔵', cropType: '普通期栽培（中苗）', emoji: '🌾', ecClass: 'paddy', basal: { n: 3, p: 3, k: 3 }, total: { n: 5, p: 3, k: 5 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_sainokizuna_kanden', name: '水稲 彩のきずな', cropType: '乾田直播栽培（5月中旬播）', emoji: '🌾', ecClass: 'paddy', basal: { n: 9, p: 9, k: 9 }, total: { n: 12, p: 9, k: 12 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_kinuhikari_tansui5', name: '水稲 キヌヒカリ', cropType: '湛水土壌中直播栽培（5月中下旬播）', emoji: '🌾', ecClass: 'paddy', basal: { n: 4, p: 6, k: 4 }, total: { n: 9, p: 8, k: 9 }, compost: null, source: S, page: '水稲 p.38' },
        { id: 'rice_kinuhikari_tansui6', name: '水稲 キヌヒカリ', cropType: '湛水土壌中直播栽培（6月上旬播）', emoji: '🌾', ecClass: 'paddy', basal: { n: 6, p: 6, k: 6 }, total: { n: 9, p: 6, k: 9 }, compost: null, source: S, page: '水稲 p.38' },

        // ---- 以下は県基準に掲載のない作物（旧ライブラリの 養分吸収量×標準元肥比率 による参考値。出典未確認） ----
        { id: 'bell_pepper', name: 'ピーマン', cropType: '', emoji: '🫑', ecClass: 'fruit', basal: { n: 8.4, p: 7.7, k: 9.6 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'watermelon', name: 'スイカ', cropType: '', emoji: '🍉', ecClass: 'fruit', basal: { n: 7.5, p: 6.4, k: 10 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'melon', name: 'メロン', cropType: '', emoji: '🍈', ecClass: 'fruit', basal: { n: 6.4, p: 6.3, k: 8.8 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'pumpkin', name: 'カボチャ', cropType: '', emoji: '🎃', ecClass: 'fruit', basal: { n: 9, p: 8, k: 12.5 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'wax_gourd', name: 'トウガン', cropType: '', emoji: '🍈', ecClass: 'fruit', basal: { n: 9, p: 7.2, k: 12.5 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'okra', name: 'オクラ', cropType: '', emoji: '🌱', ecClass: 'fruit', basal: { n: 7.2, p: 5.6, k: 8 }, total: null, compost: { min: 2, max: 3 }, source: 'reference' },
        { id: 'fava_bean', name: 'ソラマメ', cropType: '', emoji: '🫘', ecClass: 'fruit', basal: { n: 5, p: 5.6, k: 6 }, total: null, compost: { min: 1, max: 1.5 }, source: 'reference' },
        { id: 'celery', name: 'セロリ', cropType: '', emoji: '🌿', ecClass: 'leafy', basal: { n: 14, p: 11.2, k: 18 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'chinese_chive', name: 'ニラ', cropType: '', emoji: '🌿', ecClass: 'leafy', basal: { n: 6, p: 6.3, k: 6.6 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'water_spinach', name: 'エンサイ（空心菜）', cropType: '', emoji: '🌿', ecClass: 'leafy', basal: { n: 6, p: 5.6, k: 6 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'garlic', name: 'ニンニク', cropType: '', emoji: '🧄', ecClass: 'leafy', basal: { n: 8.8, p: 7, k: 8.8 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'potato', name: 'ジャガイモ', cropType: '', emoji: '🥔', ecClass: 'leafy', basal: { n: 12.6, p: 10, k: 19.6 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'ginger', name: 'ショウガ（根しょうが）', cropType: '', emoji: '🫚', ecClass: 'leafy', basal: { n: 10, p: 7, k: 12 }, total: null, compost: { min: 1.5, max: 2 }, source: 'reference' },
        { id: 'aspalagus', name: 'アスパラガス', cropType: '', emoji: '🌱', ecClass: 'leafy', basal: { n: 6.6, p: 7, k: 8.4 }, total: null, compost: { min: 3, max: 4 }, source: 'reference' }
    ];

    // 旧バージョンのパラメータファイル（cropId）を新しい作物IDへ読み替える
    const legacyCropIds = {
        cucumber_greenhouse: 'cucumber_sokusei', tomato_greenhouse: 'tomato_sokusei', eggplant: 'eggplant_hansokusei',
        strawberry: 'strawberry_sokusei', bitter_melon: 'nigauri_roji', cabbage: 'cabbage_akifuyu',
        chinese_cabbage: 'hakusai_aki', spinach_ordinary: 'spinach_aki', lettuce: 'lettuce_house_aki',
        broccoli: 'broccoli_natsu', cauliflower: 'cauliflower_natsu', radish: 'daikon_natsu', carrot: 'carrot_natsu',
        onion: 'onion_mulch', sweet_potato: 'satsumaimo_mulch', taro: 'satoimo_roji', corn: 'corn_futsu',
        edamame: 'edamame_roji', kidney_bean: 'ingen_roji_yokusei', green_onion: 'negi_akifuyu',
        komatsuna: 'komatsuna_house_aki', shungiku: 'shungiku_house_aki'
    };

    // ---------------------------------------------------------------
    // 土壌タイプ … [埼玉R7] 技術編 表5「埼玉県耕地土壌のタイプ別CEC、リン酸吸収係数、仮比重」(p.10)
    //   表5に幅で示された値は、その中央値を代表値とした（アプリでの取り扱い）。
    //   cecMin / pUpper … 技術編 表7「土壌診断基準（概略）」(p.11) の該当列
    //   ecGroup … 藤原(2008)の土壌区分（kuroboku=黒ボク土、alluvial=沖積土・洪積土、sandy=砂質土）
    // ---------------------------------------------------------------
    const soilTypes = [
        { id: 'kuroboku_atsu_ta', name: '黒ボク土（厚層多腐植質）', cec: 27.3, bd: 0.75, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'kuroboku_atsu_fu', name: '黒ボク土（厚層腐植質）', cec: 26.1, bd: 0.88, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'kuroboku_hyo_ta', name: '黒ボク土（表層多腐植質）', cec: 38.9, bd: 0.60, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'kuroboku_hyo_fu', name: '黒ボク土（表層腐植質）', cec: 26.0, bd: 0.91, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'tanshoku_kuroboku', name: '淡色黒ボク土', cec: 19.5, bd: 1.02, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'tashitsu_kuroboku', name: '多湿黒ボク土（表層腐植質）', cec: 26.0, bd: 0.72, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'kuroboku_gley', name: '黒ボクグライ土（腐植質）', cec: 27.0, bd: 0.80, ecGroup: 'kuroboku', cecMin: 15, pUpper: 100 },
        { id: 'kasshoku_shinrin', name: '褐色森林土（細粒）', cec: 19.8, bd: 1.22, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 },
        { id: 'haiiro_daichi', name: '灰色台地土（細粒）', cec: 18.7, bd: 1.21, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 },
        { id: 'kasshoku_teichi', name: '褐色低地土（細粒・斑紋なし）', cec: 15.3, bd: 1.11, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 },
        { id: 'haiiro_teichi', name: '灰色低地土（細粒灰色系）', cec: 18.7, bd: 1.11, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 },
        { id: 'gley', name: 'グライ土（細粒）', cec: 21.6, bd: 0.96, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 },
        { id: 'kokudei', name: '黒泥土', cec: 28.6, bd: 0.78, ecGroup: 'alluvial', cecMin: 15, pUpper: 75 },
        { id: 'deitan', name: '泥炭土', cec: 26.2, bd: 0.89, ecGroup: 'alluvial', cecMin: 15, pUpper: 75 },
        // 表5にない土壌。仮比重は[青森]p.38の目安（砂土・重粘土壌1.1）
        { id: 'sandy', name: '砂質土（CECは分析値を入力）', cec: null, bd: 1.1, ecGroup: 'sandy', cecMin: 12, pUpper: 75 },
        { id: 'other', name: 'その他・不明（CEC・仮比重を入力）', cec: null, bd: 1.0, ecGroup: 'alluvial', cecMin: 12, pUpper: 75 }
    ];

    // ---------------------------------------------------------------
    // 陽イオン交換容量別の土壌の適正塩基基準（水田、畑）… [埼玉R7] 技術編 表8 (p.12)
    //   caMg・mgK は当量比。
    // ---------------------------------------------------------------
    const baseStandard = [
        { cec: 10, cao: [210, 240], mgo: [25, 43], k2o: [15, 20], baseSat: [90, 110], caMg: [3.51, 6.90], mgK: [2.92, 6.70] },
        { cec: 15, cao: [230, 290], mgo: [40, 59], k2o: [15, 34], baseSat: [70, 93], caMg: [2.80, 5.21], mgK: [2.75, 9.20] },
        { cec: 20, cao: [280, 350], mgo: [56, 75], k2o: [20, 51], baseSat: [66, 86], caMg: [2.68, 4.49], mgK: [2.57, 8.77] },
        { cec: 25, cao: [340, 410], mgo: [71, 91], k2o: [25, 68], baseSat: [65, 82], caMg: [2.68, 4.15], mgK: [2.44, 8.51] },
        { cec: 30, cao: [400, 470], mgo: [87, 106], k2o: [30, 80], baseSat: [64, 79], caMg: [2.71, 3.88], mgK: [2.54, 8.26] },
        { cec: 35, cao: [460, 540], mgo: [103, 122], k2o: [30, 80], baseSat: [63, 77], caMg: [2.71, 3.77], mgK: [3.01, 9.51] },
        { cec: 40, cao: [520, 600], mgo: [119, 138], k2o: [30, 80], baseSat: [63, 75], caMg: [2.71, 3.62], mgK: [3.48, 10.8] }
    ];

    // 土壌診断基準（概略）… [埼玉R7] 技術編 表7 (p.11)。水田・普通畑とも pH(H2O) 6.0〜6.5、EC 0.2mS以下
    const diagnosisStandard = {
        ph: [6.0, 6.5],
        paddyEcMax: 0.2,
        pLower: 10
    };

    // リン酸の減肥 … [埼玉R7] 技術編 p.13「b リン酸」
    //   有効態リン酸(mg/100g)が min 以上 max 未満のとき、施肥基準のリン酸から rate を減じる
    const phosphateReduction = [
        { min: 0, max: 80, rate: 0 },
        { min: 80, max: 100, rate: 0.2 },
        { min: 100, max: 200, rate: 0.4 },
        { min: 200, max: 300, rate: 0.6 },
        { min: 300, max: Infinity, rate: 1.0 }
    ];

    // 窒素 … [埼玉R7] 技術編 p.12「a 窒素」：無機態窒素のうち 3mg/100g を超える分を肥料成分として計上する
    const inorganicNBaseline = 3;

    // 加里 … [埼玉R7] 技術編 p.13「c カリ」：表8の上限+10mg以上は肥料成分として換算、下限-5mg以下は増肥
    const potassiumMargin = { upper: 10, lower: 5 };

    // EC → 硝酸態窒素の推定式 Y(mg/100g) = a × EC(mS/cm) + b … [藤原2008]
    const ecToNitrate = {
        kuroboku: { a: 38, b: -10, label: '黒ボク土' },
        alluvial: { a: 44, b: -15, label: '沖積土・洪積土' },
        sandy: { a: 29, b: -5, label: '砂質土' }
    };

    // 土壌別・作物別の適正EC(mS/cm) … [藤原2008]
    const ecRange = {
        kuroboku: { fruit: [0.3, 0.8], leafy: [0.2, 0.6] },
        alluvial: { fruit: [0.2, 0.7], leafy: [0.2, 0.5] },
        sandy: { fruit: [0.1, 0.4], leafy: [0.1, 0.3] }
    };

    // 家畜ふん堆肥 … [埼玉R7] 技術編 表17（肥効率%）・表18（水分50%現物の成分含量%）(p.25-26)
    const composts = [
        { id: 'cattle', name: '牛ふん堆肥', n: 1.05, p: 1.03, k: 1.10, cao: 1.16, mgo: 0.50, eff: { n: 20, p: 60, k: 90 } },
        { id: 'swine', name: '豚ぷん堆肥', n: 1.43, p: 2.06, k: 1.12, cao: 1.98, mgo: 0.68, eff: { n: 40, p: 60, k: 90 } },
        { id: 'poultry', name: '鶏ふん堆肥', n: 1.45, p: 2.57, k: 1.34, cao: 5.66, mgo: 0.68, eff: { n: 50, p: 70, k: 90 } },
        { id: 'saw_cattle', name: 'おが屑混合 牛ふん堆肥', n: 0.83, p: 0.80, k: 0.85, cao: 0.96, mgo: 0.38, eff: { n: 10, p: 50, k: 90 } },
        { id: 'saw_swine', name: 'おが屑混合 豚ぷん堆肥', n: 1.06, p: 1.69, k: 0.92, cao: 1.68, mgo: 0.54, eff: { n: 20, p: 50, k: 90 } },
        { id: 'saw_poultry', name: 'おが屑混合 鶏ふん堆肥', n: 0.97, p: 2.05, k: 1.07, cao: 4.56, mgo: 0.48, eff: { n: 25, p: 60, k: 90 } }
    ];
    const compostBaseMoisture = 50; // 表18の成分含量は水分50%の現物

    // 当量（mg/me）… [埼玉R7] 技術編 p.9 の式で用いる値
    const equivalentWeight = { cao: 28.04, mgo: 20.15, k2o: 47.1 };

    root.FERT_DATA = {
        crops, legacyCropIds, soilTypes, baseStandard, diagnosisStandard, phosphateReduction,
        inorganicNBaseline, potassiumMargin, ecToNitrate, ecRange, composts, compostBaseMoisture, equivalentWeight
    };
})(typeof globalThis !== 'undefined' ? globalThis : this);
