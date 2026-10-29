# Motion Prompt 中文版

**簡體中文** | [繁體中文](README.zh-Hant.md) | [English](README.en.md) | [日本語](README.ja.md)

Motion Prompt 是一套給 AI 使用的動效與視覺術語庫。每個名稱都配有動態示例、一句話說明、適用場景、可複製的提示詞和 Canvas 2D 參考實現，幫助你把“想要什麼效果”說得更準確。

本倉庫是 [showheyohtaki/motion-prompt](https://github.com/showheyohtaki/motion-prompt) 的中文化版本，支持簡體中文和繁體中文，同時保留英文、日文原始字段與 MIT 許可聲明。

## 內容

目前包含 7 個類別包，共 168 個名稱：

| 編號 | 類別包 | 內容 | 中文列表 |
|---|---|---|---|
| 001–024 | `motion` | 動態圖形動效 | [簡體](packs/motion/README.zh.md) · [繁體](packs/motion/README.zh-Hant.md) |
| 025–048 | `camera` | 攝影機運動與轉場 | [簡體](packs/camera/README.zh.md) · [繁體](packs/camera/README.zh-Hant.md) |
| 049–072 | `ui` | UI 組件名稱 | [簡體](packs/ui/README.zh.md) · [繁體](packs/ui/README.zh-Hant.md) |
| 073–096 | `lp` | 落地頁與網站效果 | [簡體](packs/lp/README.zh.md) · [繁體](packs/lp/README.zh-Hant.md) |
| 097–120 | `photo` | 攝影風格、光線與鏡頭效果 | [簡體](packs/photo/README.zh.md) · [繁體](packs/photo/README.zh-Hant.md) |
| 121–144 | `motion2` | 動態圖形動效（第二輯） | [簡體](packs/motion2/README.zh.md) · [繁體](packs/motion2/README.zh-Hant.md) |
| 145–168 | `lp2` | 落地頁與網站效果（第二輯） | [簡體](packs/lp2/README.zh.md) · [繁體](packs/lp2/README.zh-Hant.md) |

## 在線畫廊

- [Motion Prompt 中文版畫廊](https://budingsm.github.io/motion-prompt-zh/)
- [名稱列表](packs/README.md)
- [API 目錄](api/v1/catalog.json)

畫廊支持簡體中文、繁體中文、日文和英文。點擊任意名稱可以查看動態示例、規格、參考代碼和可複製提示詞。

## 使用方式

### 直接瀏覽和複製

打開畫廊，搜索名稱或編號，點擊“選擇”，最後複製選中的提示詞。提示詞中包含動效規格、示例鏈接和參考實現鏈接。

### 安裝 Agent Skill

在 Claude Code、Codex 等支持 skills 的編程 AI 環境中運行：

```sh
npx skills add BuDingSM/motion-prompt-zh
```

然後可以直接詢問：

```text
打開 motion-prompt 中文版畫廊。
```

技能支持 `search`、`list`、`get`、`prompt`、`kit`、`pick` 和 `info` 命令。例如：

```sh
node skills/motion-prompt/scripts/motion-prompt.mjs search 打字機
node skills/motion-prompt/scripts/motion-prompt.mjs list --pack camera --lang zh
node skills/motion-prompt/scripts/motion-prompt.mjs get 001 --lang zh
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 001 --lang zh-Hant
```

可用語言代碼：`zh`（簡體中文）、`zh-Hant`（繁體中文）、`en`（English）和 `ja`（日本語）。

### 在項目中使用參考實現

每個元素都是一個只依賴時間 `u` 的 Canvas 2D 函數。參考實現中的形狀、時間、延遲、緩動曲線、距離和角度應保持不變，只替換項目自己的文字、顏色、Logo 和素材。

單個元素的接口文件位於：

```text
api/v1/zh/e/<id>.txt
api/v1/zh-Hant/e/<id>.txt
```

類別包共用的常量和輔助函數位於：

```text
api/v1/kit/<pack>.js
```

## 本地運行

```sh
git clone https://github.com/BuDingSM/motion-prompt-zh.git
cd motion-prompt-zh
python3 -m http.server 8000
```

打開 <http://localhost:8000/> 即可查看本地畫廊。構建和校驗不需要額外依賴：

```sh
node tools/build.mjs
node tools/build.mjs --check
node tools/check.mjs
```

`packs/*/meta.json` 和 `packs/*/pack.js` 是源文件；`api/v1/`、`assets/catalog.js` 和各類別包的 README 是生成文件。修改數據後請重新運行構建。

## API 文件

| 文件 | 說明 |
|---|---|
| `api/v1/catalog.json` | 所有類別包和 168 個名稱的完整目錄 |
| `api/v1/zh/catalog.tsv` | 簡體中文 TSV 索引 |
| `api/v1/zh-Hant/catalog.tsv` | 繁體中文 TSV 索引 |
| `api/v1/{lang}/e/{id}.txt` | 名稱說明、規格和參考代碼 |
| `api/v1/{lang}/p/{id}.txt` | 可直接複製給 AI 的提示詞 |
| `api/v1/kit/{pack}.js` | 類別包共用代碼 |

## 貢獻與翻譯

如果要修正術語、補充其他語言或新增類別包，請先閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [FORMAT.md](FORMAT.md)。中文字段使用 `zh` 與 `zh-Hant`，名稱和動效規格應儘量採用對應語言中真實使用的專業術語，而不是逐字翻譯。

## 許可

[MIT](LICENSE) © 2026 Shohei Ohtaki

商業使用允許用於代碼、視頻和圖片。使用元素代碼時，請保留其首行的 Motion Prompt 署名和 MIT 許可信息。

## 致謝

“動態示例 + 可複製提示詞 + Agent Skill”的組織方式受到 [Lucian UX/UI Prompt](https://lucianlabs.dev/uxui-prompt/) 啓發。原項目的作者、代碼、示例素材和許可信息仍歸原作者所有。
