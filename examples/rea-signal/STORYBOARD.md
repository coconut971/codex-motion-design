# Signal: reconstruction after REA investigation

Written before the reconstruction module. Authorized reference: our film
`examples/signal.html`, observed with REA 6.5.0 and with readable sources.
This work is therefore not a clean-room experiment or reverse engineering from video.

Intent: an impulse joins three fragments, spreads them, then leaves a readable
ring. Fixed camera; the paper, ink, sage, clay and gold palette is reused to
make comparison useful. No text in the film. The only titles are labels on
inspection images.

The `project.json` descriptor owns the cues; the seconds below are a reading
of the reference descriptor, not a second executable timeline.

| Phase | Reference read | Reconstructed staging |
| --- | --- | --- |
| 0–0.3 s | Soft appearance | Fixed grain from the start, objects fading in. |
| arrival → contact (0.5→2 s) | Signal from upper left; guide arc | Continuous curved path; fixed central target; grouped silhouettes. |
| contact, then 0.65 s | Signal at the center; staggered fragment expansion | Analytical springs near 2 Hz, ζ=0.8; 70 ms delay; single wave. |
| split → align (3.5→5 s) | Fragments turn toward their final positions | Shared slow rotation and slight additional spread; no moving camera. |
| align → resolve (5→6 s) | The guide becomes a stronger stroke | Outer arc gains contrast; readable gold center. |
| resolve → exit (6→7.5 s) | Ring held | Angular micro-motion of 0.008 rad; no new event. |
| exit → end (7.5→8 s) | Disappearance | Objects fade into the same paper; no cut. |

Sound: the five authorized sound cues are reused as data in the descriptor.
WAV and MP4 derive from this JSON, without a parallel table of seconds.
Contact is loudest; resolution is higher and longer. Listening must be reported
separately from decoding measurements.

Original construction: separate an absolute pose model from a Canvas drawing
routine. Outlines use 48 vertices and new noise identifiers, arcs use 80 segments;
grain has its own distribution. Motion parameters understood from the sources
are retained, without importing or copying the reference film module.
These choices imply pixel differences.

Checks: four compositions, beats, cues ±1 frame, dense contact strip,
crop, thumbnail and first/last frame. Compare at the same times, size and seed;
publish MAE, RMSE and the fraction of pixels with an RGB channel differing by more
than 12/255, for the image and a region containing the action. Thresholds are
regression guardrails, not proof of perceptual equivalence. Check repeated,
reverse and shuffled seeks and a fresh page, then render draft and master.
