# Validation performed — 17 October 2026

The initial report below and its assets describe the core published at commit
`4951f89` (same tree at merge `9e0b8f8`). Historical files and manifests are not
reattributed to later additions. The final dated section, "REA installation
applied and HTML case", records the new checks. The English translation does
not claim new renders: see [translation provenance](assets/TRANSLATION_PROVENANCE.md)
for preserved evidence and pinned source revisions.

Checks were performed on Windows, Node `24.18.1`, Playwright `1.64.1`, Chrome
`155.0.8059.84`, FFmpeg `N-92722-gf22fcd4483` (2018 build). These are the versions
actually tested, not recommended minima. Linux CI has its own check with the
installed Playwright Chromium and the distribution's FFmpeg.

## Computation and contract

`npm run doctor` passes. With `RENDER_INTEGRATION=1`, `npm test`: **14 passed,
0 failed, 0 skipped**. Cases include:

- Initial conditions, differential equation and spring convergence in all three
  regimes; continuity of a track at rest and rejection of an initial velocity
  reapplied at each change.
- Beats → seconds → frames → samples, shared picture/sound retiming, descriptor
  validation and input immutability.
- Shutter constrained to the shot, grid with offset, invalid arguments, server
  confinement and rejection of a symlink outside its root.
- Deterministic audio, exact PCM duration, attack at zero and peak headroom.
- Capture error preserving the previous MP4, temporary-file cleanup, blocked
  readiness promise interrupted by an actual deadline.
- Actual render with complete sound through the final cue; rejection of an MP4
  deliberately truncated to five seconds.

A clean copy of the files prepared for Git, in a path containing a space, passed
`npm ci`, the same 14 tests and `npm run verify`. It did not reuse the initial
project's `node_modules`.

`npm run verify` compares SHA-256 of **all RGBA bytes** at 22 times: markers,
±1 frame, opening/end and continuous subframes. After chronological reference
captures, five passes succeed: reverse, shuffled, repeated, after opening
another size, and fresh page. Captures at 1.234 and 1.235 s differ; time is not
rounded to a whole frame. External requests are blocked and no external asset
is requested.

[Probe results](assets/verify-evidence.json). These probes prove neither all
real-valued times nor identity across different rasterization systems.

## Inspected images and corrections

The four keys at 0.4 / 1.4 / 3.8 / 6.8 s, beat sheet, dense 1.8–2.2 s strip,
central crop and 360 px thumbnail were visually opened. After review, framing
was enlarged, the entrance trajectory cleared and the final outline reinforced.
Evidence was rerendered and opened again. See [REVIEW.md](../REVIEW.md) for
before/after observations.

![Verified key images](assets/keyframes.png)

[Contact strip](assets/contact.png) · [360 px thumbnail](assets/mobile.png) ·
[Decoded master sheet](assets/decoded-sheet.png)

Images extracted from the MP4 were also opened: a grid at two frames/second and
exact frames 0 and 239. The first and last return to paper; the closing residue
at frame 239 remains very faint. The decoded grid is neither a check of every
frame nor a sequence labelled with exact frame numbers.

## Files actually delivered

[signal.mp4](assets/signal.mp4): **8 s, 1920×1080, H.264 yuv420p, 30 fps,
240 frames**, 710,578 bytes. Four subframes per frame, 0.5-frame shutter.
BT.709 matrix and primaries, limited range, preserved and declared sRGB transfer.
Blur averages sRGB bytes; it does not integrate linear luminance.

The master was fully decoded before replacing the output. Stereo 48 kHz AAC
was decoded back to PCM: **384,000 stereo samples, 1,536,000 bytes, 8.000 s**.
Each sound window has nonzero energy, including `resolve` at 6 s (RMS ≈ 0.1062).
Parameters, source hashes and measurements are in the
[delivered manifest](assets/render-evidence.json).

The first pass had audio truncated to 5.8667 s by the `-frames:v` cap. This defect
was corrected: the renderer sends N frames, then EOF, bounds the overall duration
and checks actual PCM duration. The master linked above is the corrected pass,
with the final accent present.

The `loudnorm` measurement of **the delivered file at the filter input** gives
approximately **−17.13 integrated LUFS**, **−1.00 dBTP**, LRA **2.50 LU**.
The filtered output was discarded: no mastering to −14 LUFS is claimed. The log's
`output_*` values do not describe our MP4. [Measurement](assets/audio-measurement.json).

The 960×540 draft was played at normal speed in a Chromium video element, muted,
and actually reached the end at 8 s without a media error.
[Playback report](assets/playback.json). This automated playback constitutes
neither continuous human observation nor subjective listening. The agent's
visual assessment relies on opened captures and strips; sound was checked
technically, with no human listening claimed.

## REA, provenance and limits

Detailed external-source study reports were removed from the current tree;
Git history is preserved. The checks below concern our engine and the delivered
REA case.

REA `6.5.0`: source reading, npm metadata, CLI help and Codex setup with
`--dry-run` actually succeeded. Result `planned`, zero actions applied, user
configuration hash unchanged. At that stage, no REA MCP server or skill had been
installed, and no complete REA investigation of a target was claimed as tested.
[Details and commands](REA_WORKFLOW.md).

The requested original X articles were inaccessible; searches and candidate
URLs are [recorded](SOCIAL_SOURCES.md), without invented technical attribution.
This documentary gap remains explicit.

## Reproduce

```sh
npm ci
npx playwright install chromium
npm run doctor
npm test
npm run verify
npm run sheet
npm run draft
npm run render -- --samples=4
```

Enable `RENDER_INTEGRATION=1` for the three integration tests; set `CHROME_PATH` /
`FFMPEG_PATH` if executables are not at their expected locations. For existing
outputs, add `--overwrite`. Local manifests record render inputs. Changing code,
project or versions requires new captures and new validation.

## 17 October 2026 — REA installation applied and HTML case

This section supplements the preceding report, whose dry-run was the actual
state when written. The REA workflow is now installed in the user profile:
setup `ready`, actions `configured_codex` and `installed_skill`, then Codex +
skill doctor with code `0` and `healthy: true`. Node, Codex registration and
skill identity are `ok`. Out-of-scope native providers are not configured;
their global state does not support claiming operational native analysis.

The installed MCP launcher actually answered `initialize` and `tools/list`
from an ephemeral stdio client: server `rea 6.5.0`, protocol `2024-11-05`,
207 tools, one catalogue page, exchange completed in 2.079 s. The test process
was then stopped. The existing authoring conversation did not refresh its MCP
catalogue; the case uses the versioned CLI.
[Redacted MCP report](assets/rea-case/mcp-smoke.json).

The investigation of `/examples/signal.html` ran under Node `24.18.1` and Chrome
`155.0.8059.84`, at 960×540, with the resolved pose at 6 s. All six REA operations
completed: target discovery, page inspection, bundle analysis, screenshot,
script export and JavaScript analysis of the export. The runner recorded no
page or resource failure. Three scripts totalling 10,894 bytes were exported
and analyzed without parsing errors; the application graph has 20 nodes and
29 relationships. Complete graph coverage concerns those captured files.
The capture itself remains limited by attachment timing and documented filters.
The candidate endpoint `scale` was rejected after reading the code: it is a
player URL parameter. [Public Evidence excerpt](assets/rea-case/evidence-summary.json).

Versioned commands, the observation/inference distinction, specification and
limits are explained in the [Signal case](cases/REA_SIGNAL.md). Complete Evidence
and configuration reports remain under `out/rea-case/` and `work/rea-install/`,
ignored by Git. The case was written through delegations identified as GPT-6
Astra by the environment; this attribution does not change the author of
historical files. Rendering remains local, without a model SDK or API key.

The reconstruction was then compared to the reference at **41 times**, in
**960×540**, with the same logical dimensions, seed, palette and cues. MAE and
RMSE cover RGB channels 0–255; a pixel counts as different if one channel differs
by more than 12. Across the whole frame, maxima are **MAE 0.302508**,
**RMSE 3.925067** and **0.723765%** differing pixels. In the action region
`[90, 0, 630, 500]`, they are **0.485677**, **5.032379** and **1.191111%**.
MAE/RMSE peak at 6.033333333 s; the fraction peaks at 7 s. Thresholds declared
in the specification are met. These are difference measurements on captures
without registration or blur, not an artistic score.
[Full report](assets/rea-case/metrics.json).

Thresholds were tightened after the first measurement: frame MAE/RMSE 1.5/10,
region 2.5/13 and 5% differing pixels. This post-measurement calibration is
explicit. The negative control replacing the composition at 6 s with blank
paper is rejected: frame 3.863616/19.743721; region 6.352139/25.328008 and
7.933016% differing pixels.

The eight passes — reverse, shuffled, repeated, fresh page, for both reference
and reconstruction — each compared 41 hashes of all RGBA bytes with equality.
Subframes 1.234 and 1.235 s are distinct in both films. No page or resource
failure was recorded. These probes establish reproducibility at the tested
times and environment, not for all times or platforms.

The four reconstructed compositions at 0.4 / 1.4 / 3.8 / 6.8 s, the
[compared keys](assets/rea-case/key-comparison.png),
[beat sheet](assets/rea-case/beat-comparison.png),
[1.8–2.2 s contact crop](assets/rea-case/contact-comparison.png) and
[6 s thumbnail](assets/rea-case/thumbnail-comparison.png) were opened.
Trajectories, main positions and stages of visual reading are close; visible
differences lie mainly in outlines and grain. No major defect was observed in
these samples; no staging correction was deemed necessary at this stage.

After stabilizing the case code, `npm test` with `RENDER_INTEGRATION=1` passed
**18 tests, 0 failures, 0 skipped**. `npm run verify` again passed the reference
film's 22 times and five orders. `npm run rea:render -- --overwrite` produced
the 960×540 draft, then the 1920×1080 master, each 8 s, 30 fps, 240 frames and
four subframes per frame, with a 0.5-frame shutter.

The [delivered reconstructed master](assets/rea-case/final.mp4) is **681,116 bytes**
and its SHA-256 is recorded in the [public manifest](assets/rea-case/render-evidence.json).
The H.264 yuv420p export declares limited range, BT.709 matrix and primaries,
and preserved sRGB transfer. Blur averages sRGB bytes; no linear-luminance
integration is claimed. All 240 frames were fully decoded successfully before
replacing the output, without page or resource errors.

AAC audio decoded back to 16-bit stereo PCM at 48 kHz contains **384,000 audio
frames**, or **1,536,000 bytes and 8.000 s**. All five cue windows are non-silent;
`resolve` at 6 s has an RMS of approximately **0.106217**. The source WAV has
zero clipped samples and a peak of **−1.000152 dBFS**. These measurements are
neither a LUFS measurement of the new master nor listening.

The 18 source hashes in the case's final manifest matched the files delivered
at that time; [translation provenance](assets/TRANSLATION_PROVENANCE.md) records
the corresponding historical source revision. The
[sheet extracted from the MP4](assets/rea-case/decoded-sheet.png) and exact frames
[0](assets/rea-case/first.png) and [239](assets/rea-case/last.png) were opened.
The opening is paper; the last frame still contains a very faint silhouette
during the fade's end. The decoded sheet shows the entrance, contact, opening
and final hold; it does not constitute inspection of every frame.

The final 960×540 draft was played automatically in Chromium, muted at speed 1,
and actually reached `ended`, from 0 to 8 s, without a media error. The
[playback report](assets/rea-case/playback.json) contains the tested draft's hash.
This check constitutes neither continuous human observation nor subjective
listening. Visual assessment relies on the images and strips actually opened.
