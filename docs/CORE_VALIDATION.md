# Core validation — 17 October 2026

Project: `examples/core-demo/project.json`, **The Seed and the Fold**. Local
runtime: Node 24.18.1, Chrome 155.0.8059.84, locked Playwright 1.64.1, locally
supplied FFmpeg. A 10 s film, 1920×1080, 30 fps, 300 frames. Draft 960×540.
No model dependency, CDN, external font or media. Author: GPT-6 Astra.

## Checks actually run

| Check | Observed result |
| --- | --- |
| `npm test` with `RENDER_INTEGRATION=1` | **27/27 tests passed, none skipped**; 18 historical tests and 9 core tests |
| `node --test tests/core*.test.mjs` with `RENDER_INTEGRATION=1` | 9 tests passed: difficult cubic, three-regime ODE, x/v retarget with new Hz/ζ, timeline/audio/cuts, pure state, validation, silence, canonical seconds, browsers |
| `npm run core:verify` | 27 poses × 2 adapters × 5 orders/pages: identical pixels within each adapter; identical states and bounds across Canvas and SVG |
| Adapter reset | Contaminated filter/display/transform/origin styles and Canvas clip are cleared; pixel-identical result after seek |
| Isolation | Another page at another size without contamination; two SVGs have distinct clip ids |
| Subframes | 2.001 and 2.002 s produce distinct images in both adapters |
| Canonical times | Two half-sample regressions at 123 BPM pass; independent investigation: 80 cases at 4 BPM values with no disagreement after correction |
| Synthesized audio | 48 kHz stereo, 480000 PCM frames, 4 accents, peak −1.000 dBFS, RMS −29.254 dBFS, no clipped sample |
| Draft with audio | 300 encoded frames, decoding validated, picture/sound duration checked by the manifest |
| `npm run core:render -- --samples=4 --overwrite` | Master 1920×1080, 30 fps, 300 decoded frames; 4 subframes, 0.5-frame shutter; no page/network errors |
| Decoded master audio | 480256 PCM frames at 48 kHz, or 10.005333 s: 256 samples of AAC padding, four non-silent cue windows |

The verification script rejects page/network errors, external resources and
readiness/font timeouts; it closes the browser and server in `finally`. The code
version and descriptor are included in render-manifest hashes, including
`core/`. Full results are produced in `out/core-verify.json` and manifests
beside exports.

Published evidence: [MP4 film](assets/core/film.mp4),
[render manifest](assets/core/film.mp4.manifest.json) (only absolute output paths
are replaced with relative paths), and [compact verification](assets/core/verification.json)
with PNG hashes and state per pose. State comparison covers scene, camera,
objects, styles, geometry and bounds; grain is also covered by PNG captures.

The master is 684550 bytes. SHA-256:
`d609a016a4eee9531fb3641aa99804dd117480006c054896e7d594cc41189ccb`.
The descriptor at the time used LF, matching its Git version; SHA-256:
`8c0e9a4123a2c1306ca63515fa3142b2a4eeb79f95c02c2dd8017d573f3cee80`.
These are historical render records. The English translation does not claim a
new render; see [translation provenance](assets/TRANSLATION_PROVENANCE.md) for
the preserved manifests and their pinned source revisions.

## Actual image inspection

The first four compositions (0.6 / 2.9 / 4.1 / 8.5 s) were opened. They revealed
a floating leaf at 4.1 s. Correction: stem rising contact→unfold, leaf appearing
unfold→unfold+0.15 s. The [crop after correction](assets/core/leaf-fix.png), at
4.1 / 4.5 / 4.6 / 4.7 s, was opened: the stem meets the leaf before its retarget.

The 13-pose [contact strip](assets/core/contact-strip.png) was opened. The seed
descends into the bowl, the front rim masks its base, then it settles. Outlines
remain readable at the inspected size.

The [sheet extracted from the encoded draft](assets/core/draft-decoded.png),
20 poses at 2 Hz, was opened. It shows the wait, continuous arc, contact,
asymmetric leaves, return to a wide view and final hold. No new major defect
was identified in these poses. The [film review](../examples/core-demo/REVIEW.md)
documents the correction without inventing additional defects.

The [sheet extracted from the master](assets/core/master-decoded.png), 20 poses
at 2 Hz, and its [frames 0 and 299](assets/core/master-ends.png) were then opened.
The entrance is full paper; the last frame holds the visible plant. Composition,
mask and leaves remain readable. No new major defect was identified in these
images from the encoded file.

## Limits

The decoded sheet is not continuous video playback. Sound was generated and
measured, with no documented listening. Measurements are peak/RMS, not LUFS.
Pixels are compared only within the same adapter/browser; Canvas/SVG rasterization
may differ. Bounds are conservative control-point envelopes, without stroke or
clipping. Probes do not prove all times or platforms. Extreme spring parameters
near floating-point limits (for example ζ of 10^155) are outside the validated
numerical domain; the film's ζ values range from 0.72 to 1.15. Generic SVG/DOM/WebGL
export is not supplied.
