---
name: motion-prompt
description: Motion Prompt (showheyohtaki.github.io/motion-prompt) gives numbers to named motion-graphics moves, camera moves and transitions, UI components, landing-page and web effects, and photo looks and lighting. Each element is a dependency-free Canvas 2D animation written as a pure function of time, with a written spec of its timings, easing and amounts. Given numbers or a description of a scene, it looks the moves up, pulls their code and spec, and rebuilds them in whatever the project uses to make video (a Canvas engine, Remotion, CSS/SVG/Lottie, After Effects expressions), or rewrites them as prompts for video-generation models. Use when the user names motion-prompt or Motion Prompt, gives element numbers, or asks for motion built from them, e.g. "use the motion-prompt skill with #012 and #045 to make this video look professional", "swap this title for #005", "motion-prompt スキルで #012 と #045 を使ってプロっぽい動画を作って", "今のタイトルを #005 に差し替えて", "モーションプロンプトから場面の切り替えを選んで".
---

# Motion Prompt

Motion Prompt is a library of names for the things people ask an AI to make (motion-graphics moves, camera moves and transitions, UI components, landing-page and web effects, photo looks and lighting, and whatever packs are added later), numbered so that people and agents can refer to them precisely. Every element has a three-digit ID (`#012`), a name in English and usually in other languages too, a one-line meaning, and a live demo at `https://showheyohtaki.github.io/motion-prompt/#<id>`.

- An element is one Canvas 2D drawing function, stored as `cells[i] = (ctx, w, h, u) => { … }`. `ctx` is a 2D context that the caller has cleared and wrapped in `save()`/`restore()`. `w, h` are the card size. `u` is the time in seconds, `0 <= u < cycle`.
- It is a **pure function of `u`**: no clock, no randomness at draw time, no state between calls. The same code plays live and renders frame by frame, and it loops seamlessly at `u = cycle`.
- It is not standalone. Constants (card size, cycle, the palette `C`, fonts) and helper functions live in the pack's **kit**. Fetch the kit once per pack you use.
- Each element file states its own size and cycle. Read them from the header instead of assuming them.
- New packs get added, so check the catalog with the CLI each time instead of relying on what you remember about it.

Read the catalog with the script that ships next to this file (below, `<skill-dir>` means the directory holding this SKILL.md):

```sh
node <skill-dir>/scripts/motion-prompt.mjs <command>
```

| Command | Use |
|---|---|
| `search <words...>` | Ranks elements against a few words describing one scene's motion. English and Japanese both work: `search typewriter text`, `search 文字 登場`. Narrow with `--pack <pack>`; ask for more rows with `--limit 20`. |
| `list` | An overview: each pack, its categories and how many elements they hold. With `--pack <pack>` it prints that pack's elements one per line. |
| `get <id> [<id>...]` | Prints each element's spec followed by its code. One call takes at most 8 IDs. Accepts `12`, `012`, `#012` or a demo URL. |
| `kit <pack>` | The shared constants and helpers that the pack's elements need. |
| `prompt <id>` | The ready-made copy-paste prompt for one element. |
| `info` | Where the data is being read from, how many elements it holds, its version and where the cache lives. Run it first when something looks wrong. |

`--lang ja` gives Japanese names and text; the default is `--lang en`, and `search` switches to Japanese by itself when the words are Japanese. `--out <dir>` writes files instead of printing them (`get`, `kit`, `prompt`). `--refresh` skips the disk cache.

## Workflow

1. **Read how this project makes video.** Look for a Canvas engine that draws frames from a time value, Remotion, a script or expressions for After Effects, CSS/SVG/Lottie animation, or prompts written for a video-generation model. Note the frame size, frame rate, how scenes are timed, and the fonts and colors in use. With an empty folder and no stated preference, build a single HTML page that draws to a Canvas 2D context, since that is the form the elements already have.
2. **Plan scene by scene.** Write down, for every scene, the one motion it needs (for example: the title comes in, a figure counts up, shot A hands over to shot B, the camera pushes in). The catalog only covers those individual moves. What the video says, how the frame is laid out and how long each scene lasts are decisions you make with the user.
3. **Choose elements.** Numbers or demo links from the user are final: go straight to `get` for them. Otherwise run one `search` for each scene and choose from the results by what the summary says the motion does, not by the name alone. Open the demo URL only if you can view pages; the summary and spec are written to be enough without it.
4. **Pull the code.** Run `get` with the IDs you settled on (keep each call small). Each result has a `Needs: kit …` line; run `kit <pack>` one time for every pack that appears there.
5. **Rebuild each move in the project's method.** [references/porting.md](references/porting.md) explains how for each kind of project, so open it before you start. Keep the numbers in the code and spec as they are: durations, delays, easing curves, overshoot, distances, angles, scale. Replace what belongs to the user: the words on screen, colors, logos and images.
6. **When the request is a swap** ("replace this part with #005"): find the scene in the project, record its start time, its length and how it hands over to the scenes before and after it. Replace only the motion. Keep the scene's length, its content and those hand-overs. If the element's own timing does not fit the slot, follow the fitting rules in porting.md rather than stretching every value.
7. **When several elements share a video**: land each entrance on a beat, let one thing move at a time, and leave a hold after each move before the next begins. Use one easing family per video unless the user asks for contrast. Two elements that both animate the whole frame should not overlap.
8. **Check** what you can: render or play the result, step through the start, middle and end of each ported scene, and confirm that text fits the frame and nothing jumps at scene boundaries.
9. **Report.** Close your reply with the elements that ended up in the video. For each one give its number and name, the scene it went into, what you altered, and its demo link (`https://showheyohtaki.github.io/motion-prompt/#ID`). Add a short note on whatever you were unable to verify.

## Video-generation models

For Veo, Seedance, Sora and similar models, do not pass code. Write the prompt in sentences from the element's English name and its spec lines: what moves, in what order, how long each part takes, how the motion eases, and where it ends. Add the user's subject, look and aspect ratio. `prompt <id>` gives a starting text, and `get <id>` gives the full spec. These models treat timings as guidance, so say in your report that the result will be close to the element rather than exact.

## Web pages and still images

Not every pack is about video.

- **`ui` and `lp`** name parts and effects of web pages. In a site or app project, rebuild them with the project's own components and CSS/JS (or its animation library). Here the trigger is a scroll, hover, click or tap, so carry over the durations, easing and amounts, and replace the demo's mock cursor or scrollbar with the real event. Respect `prefers-reduced-motion`.
- **`photo`** names lighting, lens effects and finishing looks. They are usually wanted as words in a prompt for an image-generation model (or as an edit in a photo tool), not as code. Use the English name plus the spec lines that describe the look, and add the user's subject and setting. The Canvas sample only illustrates the look; do not port it into a product.

## Rules

- The code you port must be what `get` and `kit` printed in this session. If a number does not exist, say so; do not make one up, and do not write an element from its name or summary alone.
- Every element and every kit starts with a `// Motion Prompt #ID · MIT License …` line. Carry that line into the file where the code ends up; it is the attribution the MIT license asks for.
- Fetch narrowly. `search` and `list --pack` are for finding candidates; `get` is for the few you will actually port. Printing the whole catalog wastes context and helps nobody.
- Port the motion as designed. A ported move should still look like its demo: same path, same rhythm. Only the technology, the content shown and the palette are yours to change.

## Troubleshooting

- **Exit code 3: no data source answered.** The script downloads from `showheyohtaki.github.io` and, failing that, from `raw.githubusercontent.com`. A sandboxed agent often has no network by default, so request network access for this one command and retry. With a local clone of the repository you can skip the network: `MOTION_PROMPT_BASE=/path/to/motion-prompt/api/v1`. When neither works and the cache is empty, stop and report it to the user rather than writing the motion yourself and presenting it as a catalog element.
- **Unknown ID** (exit code 1): the number is not in the catalog. Tell the user and offer the closest `search` results.
- **Node.js is missing.** Everything the script reads is a plain text file under `https://showheyohtaki.github.io/motion-prompt/api/v1/`, so any HTTP client can stand in for it:
  - `en/catalog.tsv` (or `ja/catalog.tsv`) is the index, tab-separated: id, pack, category, title, tags, summary. Filter it with `grep`.
  - `en/e/012.txt` is element #012 with its spec and code.
  - `kit/motion.js` is the kit of the `motion` pack.
