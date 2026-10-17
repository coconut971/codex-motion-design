# Motion design rules adapted for GPT

The [motion/1 core](CORE.md) executes these rules with a single descriptor.
Its retargets preserve position/velocity even when frequency or ζ changes;
cubic solving uses bounded bisection. Compiled seconds remain canonical: the
derived beat field is not reconverted for audio, avoiding a one-sample audio
shift at rounding boundaries. Cuts come from shots; masks and cameras are
evaluated at the current time. Canvas/SVG adapters rewrite each state and
share the same geometry.

This document formalizes our implementation's rules. Replacing a model name
in a prompt is not enough: contracts must be executable, corrections visible
and evidence explicit.

## A frame is a function of time

`frame = F(t, project, seed, dimensions, localAssets)`. The result of `seek(4)`
never depends on an earlier `seek(3)`. An object writes its transform, colour,
alpha and visibility on every call. An immutable geometry or grain cache is
allowed if its key contains all inputs. A necessary simulation can be
precomputed with a seed and fixed step, then sampled independently of the
renderer's call order.

Film time is in continuous seconds. `n/fps` belongs to the renderer; a discrete
property, such as a digit, may read the output frame separately if required
by the project. Do not blend two characters by calculating their content from
shutter subframes. Our text-free example avoids this case.

## Springs: defined physics

For a constant unit target:

```
x'' + 2 ζω x' + ω² x = ω²
ω = 2π frequencyHz
ζ = damping / (2 √(stiffness × mass))
```

`lib/motion.mjs` calculates the three regimes at absolute time, with zero initial
position and configurable initial velocity. For ζ<1 and zero velocity:

```
x(t) = 1 − exp(−ζωt) [cos(ωd t) + ζω/ωd sin(ωd t)]
ωd = ω √(1−ζ²)
```

Omitting the sine term changes initial velocity. Replacing every ζ>1 with the
critical solution changes response time. Our tests check initial conditions,
the differential equation, all three regimes and continuity when targets
change through superposition (`springTrack`).

| Starting use | Frequency | ζ | Intent |
| --- | --- | --- | --- |
| Small accent | 4 Hz | 0.85 | Lively, very little overshoot |
| Paper fragment | 2.3 Hz | 0.8 | Flexible, readable damping |
| Heavy mass | 1.7 Hz | 1 | No bounce |
| Restrained closing | 2 Hz | 1.4 | Overdamped, slow |

These values are starting points. Do not confuse Hz and rad/s. If an object
must respect a geometric limit, plan constrained movement; abruptly cutting
a spring with `clamp` breaks its velocity and physical intent.

## Banned list: remove automatic choices

| Habit to avoid | Decision to make instead |
| --- | --- |
| Central text appearing on a purple/blue gradient | Composition and palette motivated by the subject |
| Neon, chrome, glass and glow on every object | One dominant material and consistent lighting |
| Decorative particles, confetti and counters | Motion explaining a cause or transformation |
| Identical card grid for every brief | A metaphor and silhouette specific to the product |
| The same ease and bounce for everything | Different weights, functions and delays |
| A constantly zooming camera | A camera serving framing and readability |
| Everything moving simultaneously | One focus of attention, with delayed secondary motion |
| A logo alone on black, then effects without a payoff | Setup, transformation, consequence, final hold |
| Fake figures, fake testimonials, implied OpenAI branding | Sourced facts and illustrative data identified in the brief |
| A new object appearing without an entrance or exit | Continuity, occlusion, trajectory or visible match cut |

A requested artistic exception is possible: record its purpose in the storyboard.
The list challenges interchangeable results, rather than forbidding a technique
in every style. Grain or pastel does not automatically make a film original.

## Beat grid and synchronization

Beats are indexed from zero. `seconds = beatOffset + beat × 60/bpm`.
A bar contains `beatsPerBar` beats. The JSON is the sole owner of cues. A cue
defines the visual contact and requested sound onset. In this example, 120 BPM
and 30 fps give 15 frames/beat; contact at beat 4 is at 2 s, frame 60 and WAV
sample 96000.

At 110 BPM, a beat often falls between frames. Choose explicitly: retain exact
musical time, or round the visible cue to `round(t*fps)/fps` and derive audio
from that compiled cue too. Never round the entire scene. For a recorded track,
identify actual beats and the start offset; average BPM proves neither the
drop's position nor the absence of drift.

Our sound is synthesized locally at 48 kHz stereo. The envelope starts at zero
with a 4 ms attack: requested onset and perceptual peak are not interchangeable.
For an external SFX, measure its peak and place its onset at `cue − peakOffset`,
checking the film start and trims. The mix should not hide contacts behind a
generic whoosh. Keep silence. Do not default to −14 LUFS for a composition
with a few accents: measure first.

## Critique through images and time

1. Four images: opening, action, transformation, payoff. Check hierarchy,
   silhouette, margins and palette before investing in a full render.
2. Sheet: every beat and useful offsets between beats. A sparse sheet can miss
   a single-frame flash; supplement it at shot boundaries.
3. Contacts: preceding frame, contact, following frame; dense strip, local crop,
   trajectory and timing. Sound must reference the same event.
4. 360 px thumbnail: the shape and, if requested, main text must remain readable.
5. `REVIEW.md`: frame, observed defect, significance, correction, evidence file,
   result after correction. Address the three most important defects.
6. Draft at normal speed, then decoded master: rhythm, comprehension time,
   closing, temporal texture and synchronization. A frame grid does not replace
   playback; a waveform does not replace listening.

An optional score helps compare two passes without certifying quality. The
critic describes what is visible and measurable. If nothing needs correction,
document useful observations instead of inventing ten defects.
