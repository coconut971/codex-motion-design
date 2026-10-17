# The Dawn Workshop

Original direction and writing: **GPT-6 Astra** (explicit model selection). A `motion/1` core film, 1920 × 1080, 30 fps, 14 seconds. No on-screen text, external assets, image generation model or dedicated JavaScript scene.

## Intent

A heavy machine produces something light: a small sun print. The viewer first recognizes a press, follows a single cream sheet, feels the pressure, then discovers the result while following its exit. The printed sun stays still: the pleasure comes from its reveal, the ink and the composition. The last shot allows real time to look at the image.

The view is drawn and flat, like a graphic cross-section of a small workshop. The press has an arched frame, a vermilion handwheel, a screw, a platen and a dark mouth masking the printing area. A rectangular sheet with slightly irregular corners is the only moving object crossing every shot. The design is created behind the occluding frame; it never materializes on a visible sheet.

## Visual direction

Warm paper `#EEE5D4`, sheet `#FAF3E4`, slate ink `#3D4E53`, dark paper tint `#D5C9B4`. Two accents: ochre `#D9A33D` and vermilion `#BB604B`. Broad silhouettes, asymmetric cast-iron curves, lines boiling at 12 Hz between 0.35 and 0.9 logical px. Some hatching in the cast iron and sun disc; no photographic texture or gradient. The table is a single working line. The sun is a real print: an imperfect disc, rays of varied lengths, a small horizon line and two curved strokes composing a quiet morning.

## Four shots

1. **The workshop / the sheet** — fixed wide shot. The press occupies the left third, and the space on the right anticipates the future exit. A blank sheet arrives from the left, slides with mechanical deceleration, then disappears into the mouth. The handwheel briefly retreats before the effort. Read: waiting → entry → placement.
2. **The weight** — closer cut motivated by the handwheel. The lever descends along an arc, driving the screw and platen. The mass stops exactly at the press bed, holds pressure, then rises more slowly. No platen bounce. The handwheel has only a small damped release. The design becomes opaque at the pressure cue, entirely hidden.
3. **The first light** — lateral cut, followed by a small bounded horizontal follow. The sheet exits to the right. The sun appears gradually under the press's right lip; the contrast between dark cast iron and ochre guides the eye. Once the design is revealed, the sheet gently descends 26 px to rest its edge on the table. A very slight horizontal paper overshoot settles before the stop. No ray grows or explodes: this is ink on a sheet.
4. **The print** — hard cut into a detail of the resting sheet. The press leaves the frame. Ochre sun, engraved rays and slate lines remain broad and readable in a thumbnail. The sheet slides a few final pixels, then holds. Only grain and line boil change during the last two seconds.

Boundaries and all numeric events reside exclusively in the `cues` of `project.json`. Tracks, four inspection compositions, contacts, cuts, sound and QA reference them. The overall duration above does not constitute a second timeline.

## Motion and sound

Entry: brief acceleration, long braking; sheet contact without bounce. Handwheel: restrained anticipation, then deliberate rotation, secondary release after the platen. Platen: heavy acceleration, constrained stop, held pressure, then a gentle rise. Exit: translation with a slow emergence from the mask, cruising and braking, overshoot below 12 px. No perpetual camera movement; cuts and following motion are motivated only by readability.

Five accents maximum, computed by the local synthesizer: paper placement, heavy contact, screw release, entry into the exit rollers, paper stop. Existing 4 ms attack; no recorded sound effects or promise of music. Accents are spaced, holds silent. Moderate gains and distinct frequencies; audio measurements and any listening limitation will be reported separately.

## Expected checks

Four named compositions, final thumbnail, beat sheet, contacts ±1 frame, tight platen and reveal strips, poses at cuts, unordered seeks and a fresh page. Draft render before master. The review distinguishes observed defects, measurements and limits. Sources frozen before the master; delivery report outside this directory.
