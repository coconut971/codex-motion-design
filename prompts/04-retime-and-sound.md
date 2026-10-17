# Retiming and sound without divergence

```text
Required author: GPT-6 Astra exclusively, including code, assets, prompts and
corrections. Verify the model using reliable session information; if it is not
Astra or you cannot verify it, state the limitation before generating and ask
for Astra to be selected, without a fallback model. Rendering and measurement
of existing files remain local, without a model API.

Retime [cue / passage] for [new narrative effect or new BPM]. Start by identifying
the single cue in project.json and its picture/sound/QA consumers. For motion/1,
retain tracks' and scenes' {cue,offset} references; cuts are derived, and the
compiled seconds in film.project.events are canonical. Do not reconvert derived
beats to seconds to create the WAV. Do not copy times into another list.
Preserve object continuity and reading times. If a beat falls between frames,
document the choice between exact musical time and a quantized contact frame.

Render a strip around the old and new contact. Calculate the expected audio
sample at 48 kHz and check attack/peak, duration, peak headroom and absence of
clipping. Render the new draft with audio, then the master. If using an external
track, measure its beat/drop offset and drift; check its rights. Do not claim
−14 LUFS or listening without actual measurement/listening.
```

Author policy: [Astra workflow](../docs/ASTRA_WORKFLOW.md).
