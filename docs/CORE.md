# motion/1 core

The original core compiles JSON into independent frames. No model SDK,
accumulated simulation, rendering service or remote media is involved. Astra
writes the direction and descriptor; computation then runs locally.

```js
import {compileFilm} from './core/film.mjs';
import {canvasAdapter, svgAdapter} from './core/adapters.mjs';
const film = compileFilm(descriptor);
const adapter = canvasAdapter(canvas, {scale: .5});
// Or svgAdapter(svg, {scale: .5, idPrefix: 'my-film'}).
const frame = film.sample(4.123);
adapter.render(frame);
```

`sample(t)` returns a frozen frame: time, scene, camera, persistent objects,
geometry, styles, masks, transition and grain. The same time produces the same
state after any seek. The Canvas adapter resets its buffer and context; the SVG
adapter replaces its root attributes and DOM graph. No display, filter, clip
or transform survives from a previous frame. `idPrefix` is required for multiple
SVGs: provide a unique stable identifier per instance (the root id is used by default).

`film.project` follows the existing capture and audio contract.
`film.cuts` comes from scene boundaries; `film.cues` contains their compiled times;
`film.qa` references those same cues. `core/project.mjs` is the compatible loader
for audio/render commands. `lib/project.mjs` remains unchanged for Signal and
its REA case. Historical Signal scenes continue to work.

## Descriptor

The [complete demo](../examples/core-demo/project.json) provides an example.

```json
{
  "schema":"motion/1", "id":"my-film",
  "width":1920, "height":1080, "fps":30, "duration":10,
  "seed":61, "bpm":120, "beatOffset":0, "beatsPerBar":4,
  "palette":{"paper":"#F1E8D7","ink":"#394953","clay":"#C8795E"},
  "cues":[{"id":"contact","at":{"beat":8}}],
  "scenes":[{"id":"wide","start":0,"end":10}],
  "objects":[{
    "id":"seed", "geometry":{"type":"ellipse","rx":50,"ry":60},
    "x":{"keys":[{"at":0,"value":300},{"at":{"cue":"contact"},"value":1100,"ease":[0.2,0.7,0.3,1]}]},
    "y":600, "fill":"clay"
  }],
  "qa":[{"id":"contact","at":{"cue":"contact"},"object":"seed"}]
}
```

A time is a number in seconds, or an object with **one** unit:
`{seconds: 1.2}`, `{beat: 4}`, `{frame: 60}` or `{cue: 'contact', offset: -.1}`.
The offset is in seconds. `snap:'frame'` rounds that cue alone to the frame grid;
it never quantizes `sample(t)`. Cues are base times, without circular references;
tracks, scenes and QA may reference them. Scenes must cover exactly `[0,duration]`
with no gaps or overlaps. A boundary belongs to the incoming scene; `duration`
allows inspection of the final state without adding a frame to the master.
Do not provide a `cuts` list.

A cue may carry `sound:{hz,gain,duration,pan}` under the existing synthesis
contract. The same compiled time drives picture, WAV and QA. A change invalidates
the corresponding outputs; no separate audio file owns manually entered times.
A silent film remains valid.

The seconds in `film.project.events[].at` remain exactly those compiled from the
cues. The derived `beat` is metadata; do not pass this already compiled project
to the legacy compiler to reconvert its beats. Consume `film.project` directly,
as the renderer and audio synthesis do. This preserves half-sample rounding
boundaries even at an off-grid BPM.

## Tracks and geometry

Properties `x`, `y`, `rotation` (degrees), `scaleX`, `scaleY`, `opacity` are either
constants or tracks. Keyframes are strictly ordered; values are held before and
after the track. The arriving keyframe's `ease` controls its interval: `linear`,
`smooth`, `hold`, or cubic `[x1,y1,x2,y2]`. Cubic solving uses bounded bisection;
y may exceed [0,1].

```json
{"spring":{
  "initial":0, "velocity":0, "frequencyHz":2, "dampingRatio":0.8,
  "targets":[
    {"at":{"cue":"contact"},"value":100},
    {"at":{"cue":"retarget"},"value":30,"frequencyHz":3,"dampingRatio":1.4}
  ]
}}
```

Compilation calculates position **and velocity** at each retarget, then solves
the following segment analytically, including when frequency or damping changes.
The three regimes are distinct. Initial velocity may be nonzero; units are
property/second, Hz and ratio ζ. No fps stepping is involved. The historical
functions in `lib/motion.mjs` remain available and tested.

Geometry: `ellipse` (`rx`, `ry`, `cx`, `cy`), `rect` (`x`, `y`, `width`, `height`)
or `path` with commands `M`, `L`, `C`, `Q`, `Z`. All paths compile to shared
commands. `fill`/`stroke` accept a palette key, hex colour or `none`.
`strokeWidth` and `boil` are logical numbers. Outlines vary at 12 Hz with stable
seed/id values; trajectories remain continuous.

`trajectory:{points:[[x0,y0],[x1,y1],[x2,y2],[x3,y3]],progress:track,orient:true}`
adds a cubic trajectory to x/y; orientation follows its tangent when requested.
This parameterization does not provide constant arc-length speed. Returned bounds
are conservative envelopes of transformed control points, excluding stroke width
and mask intersections. They are identical across adapters, but do not necessarily
match the rectangle of painted pixels.

## Shots, camera and masks

Each scene may select `objects:[ids]`; other objects remain in the frame with
`visible:false`, preserving identity and global tracks. The order of `objects`
in the descriptor is the painting order.

`camera:{x,y,zoom}` accepts the same tracks; positive zoom interpolates
logarithmically and does not accept springs that could cross zero. The camera
is calculated from the current time, never from the previous render.
A scene or object `mask` accepts geometry **in world coordinates**, before the
object's local transform. `transition:{type:'fade'|'wipe',duration,colour:'paper'}`
covers the screen on entry, then reveals the shot; duration is in seconds.
Shot boundaries constrain the shutter even with a wipe.

## Playback and export

```sh
npm run core:sheet
npm run core:verify
npm run core:draft
npm run core:render -- --samples=4
npm run core:audio
```

After `npm run studio`, open `/examples/core-demo/index.html` or the
`?adapter=svg` variant. The player accepts `?project=/path/to/descriptor.json`
on the same server: another film requires another JSON file, with no scene code.
For export, supply the same path to `--project` and the `project` query; the
renderer rejects any disagreement between its descriptor and the page's.

The supplied video export captures **Canvas 2D**. SVG is a viewable, tested DOM
adapter, not a promise of arbitrary HTML/WebGL capture. QA compares states and
bounds across adapters, and repeated pixels within each. Canvas/SVG rasterization
may differ. Demo measurements and limits are in [CORE_VALIDATION.md](CORE_VALIDATION.md).
