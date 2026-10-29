<!-- 此文件由 tools/build.mjs 根据 meta.json 生成。如需修改，请编辑 meta.json，不要直接修改此文件。 -->

# UI 组件名称

24 个名称 · #049–072 · 类别包 `ui` · 语言: [English](README.md) / [日本語](README.ja.md) / [繁體中文](README.zh-Hant.md)

找到名称后，直接告诉 AI。再补充“几秒”“强度”和“什么在动”，结果会更接近你的想法。

## 展开与弹出式元件

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#049](https://budingsm.github.io/motion-prompt-zh/#049) | **Modal** | Modal dialog | 画面变暗，中央跳出一个视窗 | 按下删除按钮时，用 Modal 跳出确认。背景变暗约 40%，并在 0.3 秒内一边微放大一边淡入。 |
| [#050](https://budingsm.github.io/motion-prompt-zh/#050) | **Drawer** | Drawer (Off-canvas) | 从侧边滑出选单面板 | 按下选单按钮时，从左侧滑出 Drawer。宽度为萤幕的 40%，0.4 秒滑出，背景稍微变暗。 |
| [#051](https://budingsm.github.io/motion-prompt-zh/#051) | **Bottom Sheet** | Bottom sheet | 面板从画面底部往上滑出 | 点「查看详情」时，用 Bottom Sheet 显示详细内容。高度为萤幕的 40%，0.4 秒升起，往下拖曳就关闭。 |
| [#052](https://budingsm.github.io/motion-prompt-zh/#052) | **手风琴** | Accordion | 点击标题展开或收合内容 | 把常见问题做成手风琴。只有点到的项目在 0.35 秒内展开，箭头旋转 180 度。 |
| [#053](https://budingsm.github.io/motion-prompt-zh/#053) | **下拉选单** | Dropdown (select) | 点击栏位，选项往下展开 | 把县市栏位做成下拉选单。点击后 0.25 秒内往下展开选项，选好后收起并填入所选的值。 |
| [#054](https://budingsm.github.io/motion-prompt-zh/#054) | **Tooltip** | Tooltip | 游标移上去显示简短说明 | 帮「?」图示加上 Tooltip。游标移上去 0.2 秒后在上方显示说明，移开就消失。 |
| [#055](https://budingsm.github.io/motion-prompt-zh/#055) | **Popover** | Popover | 点击后跳出带箭头的小面板 | 帮「详情」按钮加上 Popover。点击后 0.3 秒内在右侧跳出带箭头的小面板，按「确定」就关闭。 |
| [#056](https://budingsm.github.io/motion-prompt-zh/#056) | **Toast** | Toast notification | 角落跳出通知并自动消失 | 储存后在右下角用 Toast 显示「已储存」。0.35 秒内从右侧滑入，2 秒后自动消失。 |

## 选择与切换元件

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#057](https://budingsm.github.io/motion-prompt-zh/#057) | **页签** | Tabs | 点击页签标题切换内容 | 在价格页面上方放三个页签。点击时底线在 0.25 秒内滑动过去，内容以 0.2 秒的交叉淡入淡出切换。 |
| [#058](https://budingsm.github.io/motion-prompt-zh/#058) | **轮播** | Carousel | 横向切换，依序展示内容 | 把首页顶部的图片做成轮播。按右箭头每次用 0.4 秒换一张，下方显示目前位置的圆点。 |
| [#059](https://budingsm.github.io/motion-prompt-zh/#059) | **Toggle** | Toggle switch | 切换开启或关闭 | 在通知设定的每一列放上 Toggle。点击时圆钮在 0.2 秒内滑动，开启时轨道变成蓝色。 |
| [#060](https://budingsm.github.io/motion-prompt-zh/#060) | **Segmented Control** | Segmented control | 用并排按钮切换检视 | 在图表上方放「日／周／月」的 Segmented Control。点击时选取背景在 0.25 秒内滑动，图表同步改变。 |
| [#061](https://budingsm.github.io/motion-prompt-zh/#061) | **Filter Chip** | Filter chips | 点击以加上或移除筛选条件 | 在列表上方放 Filter Chip。点击后出现勾号并变成蓝色，0.15 秒内筛选列表。 |
| [#062](https://budingsm.github.io/motion-prompt-zh/#062) | **范围滑杆** | Range slider | 用两个滑钮选出范围 | 把价格筛选做成范围滑杆。要有两个滑钮，拖曳时用气泡显示数值。 |
| [#063](https://budingsm.github.io/motion-prompt-zh/#063) | **数量加减器** | Stepper (+/−) | 用 ＋/－ 按钮增减数字 | 把数量栏位做成＋／－数量加减器。每按一次增减 1，数字轻轻弹一下，持续 0.25 秒。 |
| [#064](https://budingsm.github.io/motion-prompt-zh/#064) | **分页（Pagination）** | Pagination | 用页码切换页面 | 在搜寻结果下方加上分页页码。目前页码用蓝色圆形标示，点击后圆形在 0.2 秒内移动，并换成对应的列表。 |

## 导览与状态元件

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#065](https://budingsm.github.io/motion-prompt-zh/#065) | **汉堡选单** | Hamburger menu | 点击三条线图示打开选单 | 在手机版页首右侧放汉堡选单。点击时三条线在 0.3 秒内变成 ×，选单从上方往下展开。 |
| [#066](https://budingsm.github.io/motion-prompt-zh/#066) | **面包屑** | Breadcrumbs | 以阶层显示目前所在位置 | 在文章页上方加上面包屑。格式为「首页 › 课程 › 网页设计」，目前页面用粗体且不加连结。 |
| [#067](https://budingsm.github.io/motion-prompt-zh/#067) | **Mega Menu** | Mega menu | 展开大型的分组连结面板 | 帮页首的「产品」加上 Mega Menu。游标移上去时 0.25 秒内往下展开满版面板，排列三栏连结和一张图片。 |
| [#068](https://budingsm.github.io/motion-prompt-zh/#068) | **步骤指示器** | Step indicator | 显示目前进行到第几步 | 在申请表单上方加上步骤指示器。分为填写、确认、付款、完成四个步骤，已完成的步骤显示勾号。 |
| [#069](https://budingsm.github.io/motion-prompt-zh/#069) | **Skeleton** | Skeleton screen | 载入时以灰色方块占位 | 列表载入时显示 Skeleton。做成和内容形状相同的灰色方块，并让光泽每 0.9 秒由左向右扫过。 |
| [#070](https://budingsm.github.io/motion-prompt-zh/#070) | **Spinner** | Spinner | 旋转的圆圈表示请稍候 | 送出中在按钮上显示 Spinner。大约每秒转一圈多一点，完成后换成蓝色圆形的勾号。 |
| [#071](https://budingsm.github.io/motion-prompt-zh/#071) | **Badge** | Badge | 以小圆点显示数量 | 在页首的铃铛加上 Badge 显示未读数。每次数字增加就在 0.3 秒内微微弹跳，点开后消失。 |
| [#072](https://budingsm.github.io/motion-prompt-zh/#072) | **Empty State** | Empty state | 没有内容时显示的引导画面 | 列表清空时显示 Empty State。用 0.35 秒淡入线条图示、「目前还没有任何内容」和新增按钮。 |

点击编号即可在画廊打开动态示例。单个名称的时长、缓动数值和参考代码： `api/v1/zh/e/<id>.txt` ([#049](../../api/v1/zh/e/049.txt)).

[全部类别包](../README.md)
