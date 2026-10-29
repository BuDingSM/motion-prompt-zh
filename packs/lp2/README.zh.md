<!-- 此文件由 tools/build.mjs 根据 meta.json 生成。如需修改，请编辑 meta.json，不要直接修改此文件。 -->

# 落地页与网站效果（第二辑）

24 个名称 · #145–168 · 类别包 `lp2` · 语言: [English](README.md) / [日本語](README.ja.md) / [繁體中文](README.zh-Hant.md)

找到名称后，直接告诉 AI。再补充“几秒”“强度”和“什么在动”，结果会更接近你的想法。

![落地页与网站效果（第二辑） — 示例](../../assets/preview-lp2.gif)

## Scroll effects

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#145](https://budingsm.github.io/motion-prompt-zh/#145) | **滚动时间线** | Timeline on scroll | A timeline line grows as you scroll | Turn the company history into a timeline on scroll: grow the vertical line with the scroll and reveal each year as the line reaches it. |
| [#146](https://budingsm.github.io/motion-prompt-zh/#146) | **滚动文字显现** | Scroll text reveal | Text darkens letter by letter as you scroll | Add a scroll text reveal to the concept statement: start in light gray and darken it one character at a time as the page scrolls. |
| [#147](https://budingsm.github.io/motion-prompt-zh/#147) | **堆叠卡片** | Stacking cards | Cards stack on top of each other on scroll | Show the three service steps as stacking cards: on scroll, each card slides up and stacks 12 px below the top of the one before. |
| [#148](https://budingsm.github.io/motion-prompt-zh/#148) | **滚动切换背景色** | Background color change on scroll | The page background changes color by section | Add a background color change on scroll: blend smoothly from cream for the morning section to navy for night and light blue for the holiday section. |
| [#149](https://budingsm.github.io/motion-prompt-zh/#149) | **滚动隐藏页头** | Hide-on-scroll header | Hides on scroll down, returns on scroll up | Make the header hide on scroll: slide it up out of view over 0.3 s when scrolling down, and bring it back as soon as the user scrolls up. |
| [#150](https://budingsm.github.io/motion-prompt-zh/#150) | **滚动监听** | Scrollspy | Highlights the current section in the menu | Add scrollspy to the article's table of contents: highlight the item for the section being read in orange, switching over 0.25 s. |
| [#151](https://budingsm.github.io/motion-prompt-zh/#151) | **返回顶部按钮** | Back-to-top button | Appears lower down and returns you to the top | Add a back-to-top button to the article page: show it at the bottom right once the reader has scrolled a little, and scroll to the top in 0.6 s when clicked. |
| [#152](https://budingsm.github.io/motion-prompt-zh/#152) | **滚动缩放** | Zoom on scroll | An image grows to fill the screen as you scroll | Use zoom on scroll for the hero image: grow the small centered photo to fill the viewport as the user scrolls, then fade a headline in over it. |

## Mouse & input interactions

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#153](https://budingsm.github.io/motion-prompt-zh/#153) | **悬停 3D 倾斜** | 3D tilt on hover | The card tilts in 3D following the cursor | Add a 3D tilt on hover to the member card: tilt it up to 18° following the cursor, with a moving glare. |
| [#154](https://budingsm.github.io/motion-prompt-zh/#154) | **聚光灯悬停** | Spotlight hover | Only the area around the cursor lights up | Add a spotlight hover to the feature cards: on the dark cards, light up only a circle of about 120 px around the cursor and make the borders glow too. |
| [#155](https://budingsm.github.io/motion-prompt-zh/#155) | **悬停切换图片** | Image swap on hover | Hovering swaps the photo for another shot | Add an image swap on hover to the product grid: cross-fade to the back view over 0.3 s when the cursor is on a card. |
| [#156](https://budingsm.github.io/motion-prompt-zh/#156) | **悬停文字滚动** | Text roll on hover | Letters roll up and swap on hover | Give the main menu a text roll on hover: the letters roll up one by one, 0.035 s apart, revealing the same word in orange from below. |
| [#157](https://budingsm.github.io/motion-prompt-zh/#157) | **悬停显示图片** | Hover image reveal | Hovering a list item shows its photo | Turn the property list into a hover image reveal: when the cursor is on a row, show its photo beside the cursor over 0.25 s and let it follow the cursor. |
| [#158](https://budingsm.github.io/motion-prompt-zh/#158) | **浮动标签** | Floating label | The label floats up when you start typing | Use floating labels in the form: on focus, shrink each label and move it onto the top border over 0.24 s. |
| [#159](https://budingsm.github.io/motion-prompt-zh/#159) | **即时校验** | Inline validation | Shows right or wrong while you type | Add inline validation to the contact form: while the email address is incomplete show a red "invalid format" message, and switch to a green check once it is valid. |
| [#160](https://budingsm.github.io/motion-prompt-zh/#160) | **加载按钮** | Loading button | Shows loading, then done, inside the button | Make the submit button a loading button: on click, shrink it to a circle with a spinner over 0.3 s, then turn it green with a check and "Done". |

## Showcase effects

| 编号 | 名称 | 英文名称 | 效果说明 | 给 AI 的示例说法 |
|---|---|---|---|---|
| [#161](https://budingsm.github.io/motion-prompt-zh/#161) | **视图转场（共享元素）** | View transition (shared element) | A list photo expands into the detail page | Use a view transition from the works list to the detail page: the clicked photo should grow into the top of the detail page over 0.6 s. |
| [#162](https://budingsm.github.io/motion-prompt-zh/#162) | **灯箱** | Lightbox | Opens an image large over a dimmed page | Let visitors view the case-study photos in a lightbox: on click, dim the page and enlarge the photo in the center, with arrows to go to the previous or next photo. |
| [#163](https://budingsm.github.io/motion-prompt-zh/#163) | **热点** | Hotspots | Dots on an image open notes when clicked | Add hotspots to the product photo: put pulsing dots on the key features and open a tooltip over 0.25 s when one is clicked. |
| [#164](https://budingsm.github.io/motion-prompt-zh/#164) | **倒数计时器** | Countdown timer | Counts down the time left to a deadline | Add a countdown timer for the campaign deadline: hours, minutes and seconds, with each changing digit rolling in from below over 0.3 s. |
| [#165](https://budingsm.github.io/motion-prompt-zh/#165) | **动态形状分隔线** | Animated shape divider | A wavy section divider that keeps moving | Add an animated shape divider between the hero and the next section: two white wave layers drifting slowly in opposite directions. |
| [#166](https://budingsm.github.io/motion-prompt-zh/#166) | **点赞按钮动效** | Like button animation | The heart pops with a burst when liked | Add a like button animation to posts: fill the heart red, bounce it up to 1.45×, scatter a few small particles and count up by one. |
| [#167](https://budingsm.github.io/motion-prompt-zh/#167) | **向下滚动提示** | Scroll-down cue | A looping cue that invites you to scroll down | Add a scroll-down cue below the hero: a dot inside a mouse outline slides down and fades about every 1.5 s, on repeat. |
| [#168](https://budingsm.github.io/motion-prompt-zh/#168) | **背景视频** | Background video | A video plays behind the hero section | Give the hero a background video: muted and looping, with a dark gradient on the left so the headline stays readable. |

点击编号即可在画廊打开动态示例。单个名称的时长、缓动数值和参考代码： `api/v1/zh/e/<id>.txt` ([#145](../../api/v1/zh/e/145.txt)).

[全部类别包](../README.md)
