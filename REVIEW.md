# Signal review — October 17, 2026

The storyboard preceded the code. The first pass was rendered and examined
through four keys, the sheet and the contact strip. Files from before the fixes
are preserved locally as `out/*-before.png`, ignored by Git.

| Evidence / instant | First-pass observation | Fix | New inspection |
| --- | --- | --- | --- |
| Keys, frame 204 / 6.8 s | The final composition occupied too little of the image at small sizes. | Fixed framing enlarged ×1.2 around the center, without adding camera motion. | Rerendered keys and a 360 px image opened; petals and center remain distinct. |
| Keys, frame 42 / 1.4 s | The signal followed the petal junction before the central cue, making its target harder to read. | Approach through the upper-left space with a shallower arc. | New key and frames 54–66 strip opened: trajectory and central arrival are more separate. |
| Keys, frame 204 / 6.8 s | The resolution outline remained close to the preparatory guide, so the ending barely changed the hierarchy. | Final stroke 4.5 px, alpha 0.78; guide progressively removed. | The opened thumbnail retains a readable final outline and a dominant center. |

The dense contact strip shows the reaction after frame 60, followed by the delays
of the three fragments. The crop deliberately cuts off the large guide; the
full-frame sheet checks framing. The ending returns to paper without a new
element. The film is a short geometric demonstration, not a brand campaign or
a claimed reproduction of a reference.

The independent technical review also prompted regression coverage: bounded
readiness, server confinement, an offset grid, finite timeout, three spring
regimes and rejection of initial velocity applied repeatedly within a track.
Decoding the first master exposed an AAC track truncated by a video frame limit.
The export was fixed, and a regression now requires the complete PCM duration
and last-cue energy before replacing the master.

Continuous playback and subjective listening are not established by these images.
[VALIDATION.md](docs/VALIDATION.md) specifies the checks actually performed on
the final outputs and their limits.
