# Motion Prompt 中文版

**简体中文** | [繁體中文](README.zh-Hant.md) | [English](README.en.md) | [日本語](README.ja.md)

Motion Prompt 是一套给 AI 使用的动效与视觉术语库。每个名称都配有动态示例、一句话说明、适用场景、可复制的提示词和 Canvas 2D 参考实现，帮助你把“想要什么效果”说得更准确。

本仓库是 [showheyohtaki/motion-prompt](https://github.com/showheyohtaki/motion-prompt) 的中文化版本，支持简体中文和繁體中文，同时保留英文、日文原始字段与 MIT 许可声明。

## 内容

目前包含 7 个类别包，共 168 个名称：

| 编号 | 类别包 | 内容 | 中文列表 |
|---|---|---|---|
| 001–024 | `motion` | 动态图形动效 | [简体](packs/motion/README.zh.md) · [繁體](packs/motion/README.zh-Hant.md) |
| 025–048 | `camera` | 摄影机运动与转场 | [简体](packs/camera/README.zh.md) · [繁體](packs/camera/README.zh-Hant.md) |
| 049–072 | `ui` | UI 组件名称 | [简体](packs/ui/README.zh.md) · [繁體](packs/ui/README.zh-Hant.md) |
| 073–096 | `lp` | 落地页与网站效果 | [简体](packs/lp/README.zh.md) · [繁體](packs/lp/README.zh-Hant.md) |
| 097–120 | `photo` | 摄影风格、光线与镜头效果 | [简体](packs/photo/README.zh.md) · [繁體](packs/photo/README.zh-Hant.md) |
| 121–144 | `motion2` | 动态图形动效（第二辑） | [简体](packs/motion2/README.zh.md) · [繁體](packs/motion2/README.zh-Hant.md) |
| 145–168 | `lp2` | 落地页与网站效果（第二辑） | [简体](packs/lp2/README.zh.md) · [繁體](packs/lp2/README.zh-Hant.md) |

## 在线画廊

- [Motion Prompt 中文版画廊](https://budingsm.github.io/motion-prompt-zh/)
- [名称列表](packs/README.md)
- [API 目录](api/v1/catalog.json)

画廊支持简体中文、繁體中文、日文和英文。点击任意名称可以查看动态示例、规格、参考代码和可复制提示词。

## 使用方式

### 直接浏览和复制

打开画廊，搜索名称或编号，点击“选择”，最后复制选中的提示词。提示词中包含动效规格、示例链接和参考实现链接。

### 安装 Agent Skill

在 Claude Code、Codex 等支持 skills 的编程 AI 环境中运行：

```sh
npx skills add BuDingSM/motion-prompt-zh
```

然后可以直接询问：

```text
打开 motion-prompt 中文版画廊。
```

技能支持 `search`、`list`、`get`、`prompt`、`kit`、`pick` 和 `info` 命令。例如：

```sh
node skills/motion-prompt/scripts/motion-prompt.mjs search 打字机
node skills/motion-prompt/scripts/motion-prompt.mjs list --pack camera --lang zh
node skills/motion-prompt/scripts/motion-prompt.mjs get 001 --lang zh
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 001 --lang zh-Hant
```

可用语言代码：`zh`（简体中文）、`zh-Hant`（繁體中文）、`en`（English）和 `ja`（日本語）。

### 在项目中使用参考实现

每个元素都是一个只依赖时间 `u` 的 Canvas 2D 函数。参考实现中的形状、时间、延迟、缓动曲线、距离和角度应保持不变，只替换项目自己的文字、颜色、Logo 和素材。

单个元素的接口文件位于：

```text
api/v1/zh/e/<id>.txt
api/v1/zh-Hant/e/<id>.txt
```

类别包共用的常量和辅助函数位于：

```text
api/v1/kit/<pack>.js
```

## 本地运行

```sh
git clone https://github.com/BuDingSM/motion-prompt-zh.git
cd motion-prompt-zh
python3 -m http.server 8000
```

打开 <http://localhost:8000/> 即可查看本地画廊。构建和校验不需要额外依赖：

```sh
node tools/build.mjs
node tools/build.mjs --check
node tools/check.mjs
```

`packs/*/meta.json` 和 `packs/*/pack.js` 是源文件；`api/v1/`、`assets/catalog.js` 和各类别包的 README 是生成文件。修改数据后请重新运行构建。

## API 文件

| 文件 | 说明 |
|---|---|
| `api/v1/catalog.json` | 所有类别包和 168 个名称的完整目录 |
| `api/v1/zh/catalog.tsv` | 简体中文 TSV 索引 |
| `api/v1/zh-Hant/catalog.tsv` | 繁體中文 TSV 索引 |
| `api/v1/{lang}/e/{id}.txt` | 名称说明、规格和参考代码 |
| `api/v1/{lang}/p/{id}.txt` | 可直接复制给 AI 的提示词 |
| `api/v1/kit/{pack}.js` | 类别包共用代码 |

## 贡献与翻译

如果要修正术语、补充其他语言或新增类别包，请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [FORMAT.md](FORMAT.md)。中文字段使用 `zh` 与 `zh-Hant`，名称和动效规格应尽量采用对应语言中真实使用的专业术语，而不是逐字翻译。

## 许可

[MIT](LICENSE) © 2026 Shohei Ohtaki

商业使用允许用于代码、视频和图片。使用元素代码时，请保留其首行的 Motion Prompt 署名和 MIT 许可信息。

## 致谢

“动态示例 + 可复制提示词 + Agent Skill”的组织方式受到 [Lucian UX/UI Prompt](https://lucianlabs.dev/uxui-prompt/) 启发。原项目的作者、代码、示例素材和许可信息仍归原作者所有。
