# Third-party notices

## Lucian UX/UI Prompt

The idea of pairing a gallery of live elements with an agent skill, and the general outline of the skill
documentation (a command table, a workflow, rules and troubleshooting), the CLI's command set
(search / list / get / info, its exit codes and its three environment variables) and the layout of the static
data files (`api/v1/<lang>/catalog.tsv`, `e/<id>.txt`) follow
[Lucian UX/UI Prompt](https://lucianlabs.dev/uxui-prompt/) and its skill
[Seokwoooo/lucian-uxui](https://github.com/Seokwoooo/lucian-uxui). No Lucian element, style or script is
included in this repository. Its license notice is reproduced here in acknowledgment:

> MIT License
>
> Copyright (c) 2026 Seokwoooo
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
> associated documentation files (the "Software"), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
> following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial
> portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
> LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
> EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
> THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Tools used at run time (not included)

`make-your-own/render.mjs` uses [Playwright](https://playwright.dev/) (Apache-2.0, installed by `npm install`)
and [ffmpeg](https://ffmpeg.org/) (installed separately). `tools/check.mjs` also uses Playwright. Neither is
redistributed in this repository. No font files or third-party images are included; the examples use fonts
that are already installed on the machine that renders them.
