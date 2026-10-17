# Rendering contract

## motion/1 core

`core/film.mjs` compiles the single descriptor into pure, continuous `sample(t)`.
`core/adapters.mjs` renders this complete frame in Canvas 2D or SVG DOM. Masks
use world coordinates; the camera depends only on the current time. Cuts derive
from scenes, never from a second array. The `core/project.mjs` loader selects
`motion/1` or the unchanged legacy contract.

The `/examples/core-demo/index.html?capture=1` page follows the same
`__motionReady`, `film.project`, `seek(t)` and `#film` Canvas interface as Signal.
The `?adapter=svg` variant rewrites the entire DOM and styles every frame;
clip ids are prefixed with a stable identity specific to the instance. It is
checked through screenshots, but the current video exporter captures Canvas
only. Do not pass the SVG variant to the Canvas renderer.

`npm run core:verify` compares states and bounds across the two adapters,
pixels before/after shuffled seeks and a fresh page within each, reset of
contaminated state, two isolated sizes and clips across multiple instances.
Readiness/fonts have bounded timeouts. Manifests also include `core/` sources.
See [CORE.md](CORE.md) for the schema and [CORE_VALIDATION.md](CORE_VALIDATION.md)
for results of checks actually run.

## Example interface

Local HTTP server: `examples/signal.html?capture=1&scale=0.5`.
The module exposes:

```js
await window.__motionReady;       // project and initialization complete
await document.fonts.ready;
window.film.project;              // compileProject(project.json)
window.seek(2.0);                 // draws the entire frame, synchronously
document.querySelector('#film');  // Canvas 2D, project dimensions × scale
```

`seek` rejects nonfinite times and clamps times outside the film to `[0,duration]`.
Output frame n is at `n/fps`, with n in `[0, frameCount−1]`. The final time
`duration` can be inspected but does not produce an extra frame. Logical
coordinates remain 1920 × 1080; only the backing buffer changes. The project
is validated in Node and in the browser. Cue ids are unique.

For another film, adapt the HTML entry in the renderer or retain this interface.
The supplied renderer targets Canvas 2D. It cannot blend arbitrary DOM or WebGL:
an extension would need to define compatible capture and tests. No automatic
support for multiple runtimes is promised.

## Captures

The renderer waits for readiness, fonts and two rAFs during initialization.
Each Canvas 2D seek is then read synchronously with `getImageData`, without
waiting for screen presentation. A future DOM renderer would need to define a
presentation barrier per capture. rAFs are never a scene clock. Page errors,
failed requests and HTTP error responses are fatal. Example media is entirely
local. Capture targets only the canvas; player UI and QA labels are not in the film.

A master has `duration × fps` frames and a constant frame rate. The draft changes
resolution while preserving frame rate and logical coordinates. A crop is given
in logical coordinates, then converted to the output scale. Sheet labels show
time and frame number; this lettering is for review only and adds no titles to
the animation.

## Subframes

For S samples and shutter h (a fraction of a frame), sampling occurs at the
centres of S subintervals around n/fps:

```
t(n,j) = n/fps + ((j+0.5)/S − 0.5) × h/fps
```

Film bounds and cuts declared in seconds constrain these times to the same shot
as the central frame. There is no temporal blending between two output frames
or across a cut. Each subframe is a new absolute seek. Canvas blending averages
sRGB RGBA bytes; this approximates in encoded space, rather than integrating
linear light. 4 samples improve fast motion without guaranteeing a physically
accurate shutter simulation.

## Encoding and evidence

Playwright captures the canvas; Node feeds PNGs to FFmpeg with backpressure.
The H.264 yuv420p MP4 has explicit BT.709 matrix and primaries, limited range,
preserved sRGB transfer (`iec61966-2-1`), constant frame rate and AAC audio derived
from the WAV. It does not convert the sRGB curve to the BT.709 transfer curve.
Colour compatibility still depends on the player and display. A temporary file
is decoded before replacing the master. Encoded audio is also decoded to binary
PCM: its duration must cover the film (with at most one AAC packet of padding).
Energy in each sound window is measured and recorded; the integration test checks
the example's final cue in particular. The renderer sends exactly N frames, then
EOF; a `-frames:v` limit can truncate audio with some encoders and is therefore
not used. A nonzero FFmpeg exit code can never produce success.

The manifest beside each output records dimensions, frame rate, frames, samples,
shutter, project, versions and available measurements. Determinism probes hash
all RGBA pixels in different orders and on a fresh page. They compare the current
environment: different GPUs/Chromium versions may rasterize differently. They
prove neither all real-valued times nor artistic quality.

Do not infer sound presence from an `.mp4` filename, or sound quality from a
normalized peak. Decode both streams, inspect frames extracted from the encoded
file, and listen if the environment allows. Record all limitations.
