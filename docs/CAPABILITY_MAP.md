# Consolidated core capabilities

**Development is dormant.** This map describes functions already present in an
experiment in reverse engineering and adapting Claude workflows to GPT. It is
neither artistic validation nor a roadmap. The [closeout report](EXPERIMENT_REPORT.md)
records the failure of the visual goal after two Astra trials rejected by the user.

The executable core is now `core/`: a `motion/1` descriptor owns time, scenes,
visual/audio/QA cues and persistent objects. It produces a pure frame shared by
Canvas 2D and SVG DOM adapters. The original **The Seed and the Fold** demo lasts
10 s and uses three shots without scene code. The [API](CORE.md),
[storyboard](../examples/core-demo/STORYBOARD.md) and [checks](CORE_VALIDATION.md)
describe what is delivered.

These technical capabilities do not guarantee a satisfactory artistic result.
[The Dawn Workshop](cases/morning-press.md), made with GPT-6 Astra at `high` effort,
passed its technical checks and was then judged highly inadequate by the user,
particularly in mechanical causality. A second local trial at `ultra` effort,
shorter and mechanically constrained, was also rejected for its poor graphics;
its content remains unpublished. The [observed limitations](LIMITATIONS.md)
clarify the scope of these results.

This repository combines an original implementation, production rules and an REA
investigation workflow. The tables below describe local functions and their limits.

Creation and revisions follow [Astra exclusivity](ASTRA_WORKFLOW.md). Code execution
and media production remain local.

## What already runs

| Core function | Entry point | Evidence and scope |
| --- | --- | --- |
| Reusable JSON film | `compileFilm(json)`; player `?project=/film.json` | Three shots and eleven persistent objects in the demo; no custom scene code |
| Single timing and cuts | Referenced seconds/beats/frames cues, scenes and QA | Retiming and audio half-sample boundary regressions; cuts derived from scenes |
| Analytical tracks | `core/tracks.mjs` | Bounded cubic, logarithmic zoom, three-regime springs, continuous position/velocity at retargets |
| Geometry and composition | `core/geometry.mjs`, `core/film.mjs` | M/L/C/Q/Z paths, ellipses/rectangles, cubic trajectory, world masks, fade/wipe, grain and boil12Hz |
| Two adapters | `canvasAdapter`, `svgAdapter` | Same frame and bounds; pixels compared within each, contamination and multi-instance clips tested |
| Demo and QA outputs | `npm run core:sheet`, `core:verify`, `core:draft`, `core:render` | See [CORE_VALIDATION.md](CORE_VALIDATION.md) for commands, results and limitations actually observed |

| Function | Entry point | Evidence and scope |
| --- | --- | --- |
| Playback/scrubbing of a computed film | `npm run studio` | Local Signal example, absolute-time scenes |
| Analytical physics and cue compilation | `npm test` | Spring, conversion and contract tests; see [VALIDATION.md](VALIDATION.md) for dated results |
| Image repeatability | `npm run verify` | Signal: full RGBA comparisons at repeated/shuffled times and on a fresh page; distinct subframes |
| Sheets, key images, strips and crops | `npm run sheet`, `scripts/render.mjs` options | Inspectable outputs; visual quality requires actually opening them |
| Audio from the same events | `npm run audio` | 48 kHz stereo WAV; measurements do not constitute listening |
| Draft and master with subframes | `npm run draft`, `npm run render -- --samples=4` | Encoding followed by decoding and counting; adjacent manifests |
| HTML reference to reconstructed film | [REA Signal case](cases/REA_SIGNAL.md) | Case-specific commands, observations, comparisons and limits; installation status in the REA guide |

These commands describe existing entry points. Success on one machine or revision
does not establish the state of another machine. Executed results belong in
[VALIDATION.md](VALIDATION.md), the REA guide and the documented case.
`npm run verify` targets Signal; `npm run core:verify` targets The Seed and the Fold.
A new project needs probes appropriate to its page and descriptor.

## Missing or incomplete functions

This inventory describes repository limits; no development is underway.

| Need | Remaining work |
| --- | --- |
| Generic SVG/DOM/WebGL video export | The SVG DOM adapter exists and is verified; the video renderer still captures Canvas. Add dedicated capture and tests before promising this export |
| Automatic remake of any video | Develop extraction, object matching and parameter fitting; pixels alone do not reveal original code |
| Automatic external project import | No importer delivered; analyze and reimplement useful behavior within license terms |
| Ready-to-use asset library | The core composes JSON shapes; the demo and Signal are not a catalog. Create assets with Astra and document provenance |
| Certified perceptual critique | No score or test replaces actual inspection; define film criteria and check captures |
| Remote generative rendering | Outside the local runtime and current Astra-only policy |

The core implements a verifiable technical process: reference question → evidence
→ storyboard → single-source cues → `seek(t)` → inspection and correction → export.
The trials showed that this process is insufficient to achieve the expected visual
result. Any restart requires an explicit user request and human validation.
