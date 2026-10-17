# English translation and historical evidence provenance

The English translation changes human-readable documentation, player labels and package description. Film IDs, cue IDs, geometry, timing, dependencies and media are unchanged. Existing masters, captured images, measurements and recorded source hashes remain historical evidence; they have not been rewritten to imply that the masters were rendered from the translated sources. No new master render or subjective visual review is claimed by this translation.

The original source bytes are retrievable from Git at the pinned commits below. Each recorded source hash was checked against its corresponding Git snapshot before the translation was finalized.

| Historical evidence | Original source snapshot | Source hashes verified |
| --- | --- | --- |
| `core/film.mp4.manifest.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 30/30 |
| `morning-press/film.mp4.manifest.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 35/35 |
| `rea-case/evidence-summary.json` | `463d22d6120d2fd6e1d8e789200afbf6febc1d6f` | 5/5 |
| `render-evidence.json` | `9e0b8f8c67111b29a9d1b1632dd95304a080452e` | 12/12 |
| `rea-case/render-evidence.json` | `62c3fdc1ba8c6677ea1fc9b6d865ab42ecf97e5f` | 18/18 |

Paths in this table are relative to `docs/assets/`. For example, retrieve a source with `git show <commit>:<source-path>` and compare its raw bytes with the hash in the historical record. Current English source files can legitimately have different hashes even when only human-readable text changed.

Statements in translated reviews about sources being frozen describe the historical master capture, before this later translation. Historical verification reports and project hashes apply to their recorded source state. Captured comparison images may retain their original French labels as unmodified evidence; future comparison labels are English. The translated film display names are **The Dawn Workshop** and **The Seed and the Fold**; stable file paths and identifiers are preserved.

The active reference specification `examples/rea-signal/spec.json` was separately reviewed and re-pinned to the English, LF-normalized reference module. Its additive `translationReview` metadata retains the original module hash and snapshot and clarifies that the REA evidence IDs describe the prior capture. This maintains the existing reference-change guard without relaxing any comparison threshold. Archived evidence hashes and measurements remain unchanged.

After re-pinning the active specification, `RENDER_INTEGRATION=1` with installed Chrome and `node --test tests/rea-case.test.mjs` passed all four tests: the browser comparison checked 41 times and eight determinism orders. This fresh automated regression check used temporary outputs; it does not replace the archived evidence or claim a new REA investigation or subjective visual review.
