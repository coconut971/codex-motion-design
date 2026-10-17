# REA Signal case review — October 17, 2026

Captures come from both local pages with `seek(t)`, at the same times,
seed and dimensions (960×540). The difference image amplifies RGB deviations ×4.
This is not a measurement produced by REA.

| Evidence opened | Observation | Decision |
| --- | --- | --- |
| `out/rea-case/key-comparison.png`, 0.5 / 2 / 3.5 / 6 s | Reference/reconstruction positions, sizes and silhouettes match visually. Differences concentrate on outlines and grain. | Keep the independent drawing routine; do not pursue zero pixel difference. |
| `out/rea-case/contact-comparison.png`, 1.8→2.2 s | Source and reconstruction converge at the center before staggered fragment expansion. The crop distinguishes the wave and gold core. | No major defect observed in these samples. |
| `out/rea-case/thumbnail-comparison.png`, 6 s, 360 px per version | Three fragments, center and arc remain distinct; the center does not become an unreadable blot. | Final hold retained. |

The dense contact sheet and thumbnail were also inspected by the coordinating
agent. No composition defect justified inventing three touch-ups.
The actual fixes in this pass concern workflow reliability:

- `__motionReady`/font waiting and captures bounded by an explicit timeout.
- CLI timeout: terminate the owned process tree on Windows.
- Page/resource errors block comparison success; tighter thresholds and a negative
  control substituting a paper screen at resolution.

Metrics, exact instants and probes are in `out/rea-case/metrics.json`.
Thresholds are deliberately wider than the observed outline differences,
but the negative control must reject an animation that vanishes into its background.

This image review constitutes neither real-time playback nor listening.
Final MP4 checks, listening limits and public files are recorded by the
coordinator in `docs/cases/REA_SIGNAL.md` and `docs/VALIDATION.md` after rendering.
