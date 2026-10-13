# Prompt 3: make the one-page cheat-sheet image

Use this with an image-generation AI that can draw text accurately. Attach `make-your-own/examples/camera-moves/en/cheatsheet.png` as a layout reference if your tool accepts a reference image.

Replace the parts in `<...>` and the 24 rows. The camera-move text is left in as a filled-in example.

The layout, colors and icon style written below are the look of the camera example, not a rule. Change those lines to match your own videos. A second filled-in example with a different look (colored thumbnails on dark navy, Japanese) is in [`examples/motion-graphics/ja/cheatsheet-prompt.md`](../../examples/motion-graphics/ja/cheatsheet-prompt.md).

Image models still misspell text sometimes. Make a few variants, then read every row of the one you choose against your list before you post it.

```
Create an English cheat-sheet image. <If a reference image is attached: keep its layout,
mood, colors and icon style, but do not copy any text from it. Use only the text below.>

## Output
- Aspect ratio 8:9 (for example 1024x1152). Compose for 8:9 from the start, so that nothing
  needs cropping or padding afterwards.
- Make 3 variants. Vary spacing, text size and icon drawing slightly between them.

## Layout
- Top: big bold black title "<24 Camera Moves & Transitions — Cheat Sheet>"; below it a gray
  subtitle "<Numbers match the videos — use the name in your prompt>"
- White to very light gray background. One rounded box (thin light-gray border) per section.
  Section headings in blue.
- Each row: blue line icon on the left (a small rounded square with a simple drawing of the
  item) -> blue number -> bold black name -> gray one-line description. Align the columns as a table.
- Bottom: one line in a light-gray band.
- Colors: one blue accent + black + gray only. No emoji, photos or gradients.
- 24 rows must fit in 8:9. Spacing can be a bit tight, but the text must stay crisp and easy to read.

## Text (use EXACTLY as written, character for character. Do not rephrase, shorten or add.
## "|" is a column separator and must not be drawn)
Section heading 1: Video 1/3   Camera Movement   01–08
01 | Pan | Pivot the camera left or right
02 | Tilt | Pivot the camera up or down
03 | Dolly in | Move the camera toward the subject
04 | Zoom in | Magnify with the lens (camera stays put)
05 | Tracking shot | Move along with the subject
06 | Orbit (Arc shot) | Circle around the subject
07 | Crane up | Lift the camera up
08 | Dolly zoom (Vertigo) | Subject stays, background warps
Section heading 2: Video 2/3   Shooting Style & Time   09–16
09 | Rack focus | Shift focus from near to far
10 | Handheld | Add a slight, deliberate shake
11 | FPV drone shot | Fast, immersive fly-through
12 | Dutch angle | Tilt the frame diagonally
13 | Slow motion | Play the action slower
14 | Speed ramp | Change speed mid-shot
15 | Time-lapse | Compress hours into seconds
16 | Freeze frame | Pause the action for a beat
Section heading 3: Video 3/3   Transitions   17–24
17 | Jump cut | Same framing, skip ahead in time
18 | Match cut | Cut on a matching shape or motion
19 | Whip pan | Fast pan blur into the next shot
20 | Cross dissolve | Blend one shot into the next
21 | Wipe | A moving edge replaces the shot
22 | Smash cut | Abrupt cut to a contrasting scene
23 | J-cut | Next scene's audio starts first
24 | L-cut | Previous scene's audio carries over
Bottom line: Add timing, speed, and direction for better results: "over 3 seconds" / "slowly" / "toward the subject"

## Icons (blue line art, small and simple)
Pan = horizontal double arrow + camera, Tilt = vertical double arrow, Dolly in = camera on
rails with forward arrow, Zoom in = lens with magnify arrow, Tracking = person and camera
side by side with arrow, Orbit = arc arrows around a person, Crane up = crane arm with up
arrow, Dolly zoom = same person with expanding frame corners, Rack focus = blurred near /
sharp far, Handheld = wavy lines, FPV = drone, Dutch angle = tilted rectangle, Slow motion =
snail, Speed ramp = fast-to-slow curve, Time-lapse = clock, Freeze frame = pause symbol,
Jump cut = two identical frames, Match cut = circle -> circle, Whip pan = motion streaks,
Cross dissolve = two overlapping frames, Wipe = dividing line moving across, Smash cut =
lightning bolt, J-cut = audio bars BEFORE the video bar (audio leads), L-cut = video bar
then audio bars AFTER (audio trails).
```

## Tips

- Give one icon hint per row. Without hints, the model draws similar icons for different rows.
- If you post the image next to the videos, scale it to the same size (1200x1350) afterwards.
- For a bilingual sheet, add a column: `number | local name | English name | description`, and describe it in the Layout section.
