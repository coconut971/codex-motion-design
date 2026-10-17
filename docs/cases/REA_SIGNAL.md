# Signal: from an HTML page to a reconstructed film

This case starts with a demonstration page owned by the repository,
[`examples/signal.html`](../../examples/signal.html), and uses REA `6.5.0`
to retain evidence of its operation in Chromium. The objective is concrete:
understand visible states, write a new `seek(t)` scene, compare its images with
the reference and produce an MP4 with sound.

The target was chosen because its code and assets can be redistributed. This
is not recovery of closed third-party code. Sources are accessible during the
investigation: the reimplementation is independent of the reference module,
but this case is not a clean-room experiment. Separation is verifiable in
imports, files and evidence, not through a claim of ignorance of the original code.

## Who does what

Astra conducts the investigation, establishes the specification, writes the
scene and critiques captures under [ASTRA_WORKFLOW.md](../ASTRA_WORKFLOW.md).
REA inspects the page and scripts; it does not generate the film. Playwright
drives `seek(t)` calls and captures pixels. The local renderer and FFmpeg
produce picture and sound without a model SDK, model call or API key at render time.

REA was actually installed for Codex on 17 October 2026. Setup returned `ready`
and the actions `configured_codex` and `installed_skill`; the targeted Codex +
skill doctor returned `healthy: true`. The current session had not refreshed
MCP discovery: the investigation uses the versioned CLI. A separate stdio client
nevertheless successfully communicated with the installed launcher and discovered
its 207 tools; this actual check does not constitute MCP attachment to the
already open conversation. This distinction and native-provider limits are
recorded in [REA_WORKFLOW.md](../REA_WORKFLOW.md#installation-applied-on-17-october-2026).

## Reproduce the steps

Prerequisites are those of the renderer, plus Node compatible with REA `6.5.0`
(Node `22.19+` in the 22 branch, `24.11+` in the 24 branch, or `26+`). The case
uses a locally served page and dedicated browser. Ports are chosen at runtime;
no production URL is targeted.

```sh
npm ci
npx playwright install chromium
node scripts/rea-case.mjs --phase=investigate --out=out/rea-case --overwrite
node scripts/rea-case.mjs --phase=compare --out=out/rea-case --overwrite
node scripts/rea-case.mjs --phase=render --out=out/rea-case --overwrite
```

`--phase=all` runs all three steps in sequence. `CHROME_PATH` and `FFMPEG_PATH`,
or `--chrome=…` and `--ffmpeg=…`, select local executables. `--npm-cli=…` allows
an absolute `npm-cli.js` path if the runner cannot find it. `--overwrite`
expresses replacement of existing outputs. The case does not rerun REA installation.

The runner successively calls these commands through
`npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea`:

```text
list-browser-targets ENDPOINT --json
inspect-web-page ENDPOINT TARGET_ID --observation-ms 1000 --include-script-sources --json
analyze-web-bundle ENDPOINT TARGET_ID --json
capture-web-screenshot ENDPOINT TARGET_ID --json
export-web-scripts CAPTURE_JSON NEW_FOLDER --json
analyze-javascript-application NEW_FOLDER/files --json
```

`ENDPOINT` and `TARGET_ID` identify the browser and target actually opened.
Resolved arguments, versions, source SHA-256 hashes and report references are
recorded in `out/rea-case/evidence/index.json`. Complete Evidence remains in
that same Git-ignored folder. Retaining it allows the investigation to be reread
across multiple CLI calls without confusing an MCP session identifier with a
durable file.

## Observation, measurement and interpretation

The reference draws a text-free film in a Canvas; player controls are hidden
in capture mode. The project has a logical space of 1920 × 1080, an 8 s duration,
30 fps frame rate, 120 BPM grid and seed 17. These parameters are read from the
descriptor and reference module, not inferred from the capture alone.

| Element | Verifiable fact in the reference | Adopted interpretation |
| --- | --- | --- |
| Time | The module exposes `window.seek(seconds)`; the playback driver is separate. | A frame can be reconstructed from absolute time. This property must then be tested on the new scene. |
| Composition | An impulse, three ovals and an open ring; paper, indigo, sage, terracotta and gold palette. | A signal organizes fragments and leaves a readable final shape. |
| Movement | Continuous curves, analytical springs, slight delays between fragments and outlines varying at 12 Hz. | Delay and damping create a readable succession without requiring accumulated simulation. |
| Camera | The reference applies a fixed scale of 1.2 around the centre. | Retaining fixed framing and comparable occupancy makes reading and comparison easier. |
| Sound | Descriptor events carry frequencies, gains, durations and pans. | Reusing shared events for local synthesis avoids a second manually maintained timeline. |

REA observes an already loaded page here. A window without a new network request
therefore does not mean no resource was loaded. The REA capture is a viewport
artifact. The PNG `source-resolve.png`, obtained after a Playwright `seek` call,
is identified separately; it is not attributed to passive temporal evaluation
by REA. Script export reports content actually captured without promising a
complete application or absent source maps.

In this run, inspection retained 30 DOM nodes. Three scripts were observed,
analyzed and exported: `examples/signal.mjs`, `lib/motion.mjs` and `lib/project.mjs`,
totalling 10,894 bytes. Static analysis of that export traversed 2,626 AST nodes
without a parsing error and produced an application graph of 20 nodes and
29 relationships. Coverage labelled `complete` concerns these three files.
The original capture remains `policy_filtered` and `attach_limited`, including
nine scripts excluded for lack of attributable origin; it is not an exhaustive
copy of browser state.

A useful example of critical reading appears in the bundle: REA finds both
local imports and the `fetch('../project.json')` call, but also proposes `scale`
as a low-confidence endpoint. Reading the relevant line shows `params.get('scale')`:
it is a player URL parameter name, not a network request. The case retains this
rejected inference instead of turning it into a fact. Hashes and these findings
are in the [public Evidence excerpt](../assets/rea-case/evidence-summary.json).

## Specification before reconstruction

The [case storyboard](../../examples/rea-signal/STORYBOARD.md) was written
before the [reconstructed module](../../examples/rea-signal/reconstruction.mjs).
The [frozen specification](../../examples/rea-signal/spec.json) separates REA
observations, values read from code, scene interpretation and drawing choices.
It binds the reference to its hashes; the runner refuses comparison if the
module, source descriptor or shared motion/project helpers have changed.

The stages of visual reading remain: appearance, approach, contact, fragments
opening, alignment, held resolution, disappearance. Named descriptor events
are authoritative for their times; the storyboard explains staging without
creating a second source of seconds.

The camera is fixed. The impulse leads the eye to contact, then the three
fragments take over with staggered timing. The final ring must remain readable
at small size and hold long enough before closing. Grain and living outlines
belong to the visual vocabulary; their randomness is calculated from a seed,
a stable identifier and an explicit tick.

The reconstruction must rewrite the entire Canvas at each `seek(t)`, retain
continuous time between frames and separate playback control from computation.
It may share engine helpers and the descriptor, but does not import
`examples/signal.mjs`. This distinction enables a new drawing implementation
while retaining one timeline for picture, sound and checks.

The new module separates `poseAt(seconds, project, spec)` from the drawing
routine. It uses 48 vertices per oval, 80 segments per arc and 2,400 grains with
new variation identifiers. Retained motion values are explicitly read from the
reference code: they are not presented as a unique mathematical fit inferred
from pixels. The [reconstruction descriptor](../../examples/rea-signal/project.json)
carries this film's cues and sounds; the comparator checks its agreement with
the reference, apart from the project identifier.

## Evaluate the result

Compare reference and reconstruction images at the same times, dimensions and
browser settings. Side-by-side sheets show composition; difference images locate
discrepancies. MAE, RMSE and differing-pixel fraction describe that rasterized
scope without constituting an artistic-quality score. They do not demonstrate
equivalence for all times, platforms or sizes.

Calculation covers RGB channels at levels 0–255, excluding alpha. A pixel counts
as different when at least one channel differs by **more than 12**. Besides the
whole frame, a logical region `[180, 0, 1260, 1000]` contains the action, or
`[90, 0, 630, 500]` at comparison scale 0.5. No spatial registration or temporal
blur is applied. After the first measurement, regression limits were tightened
in the specification: MAE/RMSE ≤ 1.5/10 for the frame, ≤ 2.5/13 for the region,
and ≤ 5% differing pixels in that region. This is explicit post-measurement
calibration, not thresholds declared in advance for a blind evaluation. Visual
differences are amplified ×4 in the sheets; this amplification does not alter
metrics.

Reverse, repeated and fresh-page seeks compare the reconstruction with itself.
They answer a different question from similarity to the reference: does the
same time reproduce the same pixels after a different history? Video rendering
and audio decoding are then checked as separate outputs. A present, measured
track is not listening.

## Results of the comparison performed

The 41 tested times cover beats, cues at ±1 frame, contact from 1.8 to 2.2 s in
1/30 s steps, useful endpoints and two subframes at 1.234 and 1.235 s.
Measurements cover 960×540 pixels; the action region contains 315,000 pixels.

| Maximum across 41 captures | Whole frame | Action region |
| --- | ---: | ---: |
| RGB MAE, levels 0–255 | 0.302508 | 0.485677 |
| RGB RMSE, levels 0–255 | 3.925067 | 5.032379 |
| Pixels with a channel differing by more than 12 | 0.723765% | 1.191111% |

MAE/RMSE maxima occur at 6.033333333 s, differing-fraction maxima at 7 s. All
regression thresholds are met. The eight determinism passes — reverse, shuffled,
repeated and fresh page for each film — reproduce the same SHA-256 hashes of
all RGBA bytes, 41 probes per pass. Subframes at 1.234 and 1.235 s are distinct
in both films. No page or resource failure was recorded.
[Full measurements](../assets/rea-case/metrics.json).

A negative control replaces the resolved composition at 6 s with blank paper.
It is rejected: frame MAE/RMSE 3.863616/19.743721; action region
6.352139/25.328008, with 7.933016% differing pixels. This check verifies that the
large shared paper area alone cannot make a reconstruction missing its objects pass.

![Reference, reconstruction and amplified difference](../assets/rea-case/key-comparison.png)

The review opened the four compositions at 0.4 / 1.4 / 3.8 / 6.8 s, then the
comparison at cues 0.5 / 2 / 3.5 / 6 s, the
[beat sheet](../assets/rea-case/beat-comparison.png),
[dense contact crop](../assets/rea-case/contact-comparison.png) and
[final thumbnail](../assets/rea-case/thumbnail-comparison.png). Entrance from
the upper left, grouping at contact, fragment separation and the reinforced
final outline preserve the reference's visual reading. Visible differences
concentrate on outlines and grain, consistent with the new drawing routine's choices.

In this before/after reconstruction comparison, no major position or timing
defect was observed in the inspected images. No staging correction was deemed
necessary in these samples. Keeping the new outlines leaves an intentional
nonzero pixel difference. Image-based review proves neither quality at every
instant nor continuous observation of the film. The
[case review](../../examples/rea-signal/REVIEW.md) distinguishes this visual
finding from corrections actually made to the checking workflow.

Exports and their checks are recorded in [VALIDATION.md](../VALIDATION.md).
The [reconstructed film with sound](../assets/rea-case/final.mp4) is 8 s at
1920×1080 and 30 fps, or 240 frames, with four subframes per frame. Its
[manifest](../assets/rea-case/render-evidence.json) retains parameters, source
hashes and decoding results. These historical hashes refer to the sources at
the time of rendering; [translation provenance](../assets/TRANSLATION_PROVENANCE.md)
identifies the pinned revisions. Translating the documentation and source text
does not claim a new render. Sound is checked technically; no subjective
listening is claimed. The [decoded sheet](../assets/rea-case/decoded-sheet.png)
and exact frames 0 and 239 were opened; the last retains a very faint fade
residue. [Automated muted playback](../assets/rea-case/playback.json) of the
draft reached the end at 8 s without a media error. This does not constitute
continuous observation by a viewer.

Absolute-time, frame-review and verification methods are described in the
[rendering contract](../RENDER_CONTRACT.md).
