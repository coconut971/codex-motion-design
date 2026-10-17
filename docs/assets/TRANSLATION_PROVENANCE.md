# English translation and historical evidence provenance

The English translation changes human-readable documentation, player labels, package description and the headers of four historical comparison PNGs. Film IDs, cue IDs, geometry, timing, dependencies and existing film masters are unchanged. The published English comparison images are caption-localized derivatives, not byte-identical original evidence. Measurements and recorded historical source hashes remain unchanged; the localized headers do not imply that the captured films or masters were rendered from translated sources. No new film render, REA investigation or subjective film review is claimed by this caption cleanup.

The original source bytes are retrievable from Git at the pinned commits below. Each recorded source hash was checked against its corresponding Git snapshot before the translation was finalized.

| Historical evidence | Original source snapshot | Source hashes verified |
| --- | --- | --- |
| `core/film.mp4.manifest.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 30/30 |
| `morning-press/film.mp4.manifest.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 35/35 |
| `rea-case/evidence-summary.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 5/5 |
| `render-evidence.json` | `9e0b8f8c67111b29a9d1b1632dd95304a080452e` | 12/12 |
| `rea-case/render-evidence.json` | `62c3fdc1ba8c6677ea1fc9b6d865ab42ecf97e5f` | 18/18 |

Paths in this table are relative to `docs/assets/`. For example, retrieve a source with `git show <commit>:<source-path>` and compare its raw bytes with the hash in the historical record. Current English source files can legitimately have different hashes even when only human-readable text changed.

Statements in translated reviews about sources being frozen describe the historical master capture, before this later translation. Historical verification reports and project hashes apply to their recorded source state. The four comparison PNGs in `rea-case/` (`beat-comparison.png`, `contact-comparison.png`, `key-comparison.png` and `thumbnail-comparison.png`) now have English headers. Only their top 32 pixel rows were edited locally; all decoded pixels below that header band preserve the original captured content. The original PNG bytes remain recoverable from Git commit `95b6d0529f7e585f74335333cc6541b466267f5f`. The [caption localization manifest](rea-case/caption-localization.json) records the original and localized PNG SHA-256 values and hashes of the protected pixel region. These edits use existing captures and do not generate new animation frames. The translated film display names are **The Dawn Workshop** and **The Seed and the Fold**; stable file paths and identifiers are preserved.

The active reference specification `examples/rea-signal/spec.json` was separately reviewed and re-pinned to the English, LF-normalized reference module. Its additive `translationReview` metadata retains the original module hash and snapshot and clarifies that the REA evidence IDs describe the prior capture. This maintains the existing reference-change guard without relaxing any comparison threshold. Archived evidence hashes and measurements remain unchanged.

During the earlier translation, after re-pinning the active specification, `RENDER_INTEGRATION=1` with installed Chrome and `node --test tests/rea-case.test.mjs` passed all four tests: the browser comparison checked 41 times and eight determinism orders. That earlier automated regression check used temporary outputs; it does not replace the archived evidence or claim a new REA investigation or subjective visual review.

No tests, new trials, animation renders or image-generation services were run for this later caption cleanup. The experiment remains set aside.
