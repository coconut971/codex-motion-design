# Produce a complete film with Codex

Paste into Codex, opened at the repository root. Replace the fields.

```text
Required author: GPT-6 Astra exclusively, including code, assets, prompts and
corrections. Verify the model using reliable session information; if it is not
Astra or you cannot verify it, state the limitation before generating and ask
for Astra to be selected, without a fallback model. Rendering and measurement
of existing files remain local, without a model API.

Create an original [8–15]-second film for [subject / audience / destination].
What the viewer should understand: [one idea].
Format: [1920×1080, 30 fps]. Tone: [calm / precise / energetic].
Brand constraints: [palette, materials, authorized local assets].
On-screen text: [none / exact content]. Sound: [accents / music / silent].
Expected payoff: [final shape or transformation].

Follow AGENTS.md. Write STORYBOARD.md first: idea, readable states, anticipation,
action, consequence, final hold, transitions and sound direction. Give concrete
values instead of "premium". Choose a metaphor specific to the subject.
If the brief provides enough to proceed, state your assumptions and continue.

Read docs/CORE.md. Write a motion/1 descriptor with scenes, objects with stable
ids, tracks and shared picture/sound/QA cues. Reuse compileFilm and the Canvas/SVG
adapters; add core code only for a demonstrated and tested need. The
examples/core-demo player accepts another JSON through ?project=; no copied
scene code is needed. Keep seek(t) pure and continuous. Render video with Canvas
and also verify SVG if used. No model/API at runtime.
Start with four key images, then inspect the beat sheet, contact strips and a
thumbnail. Record observed defects in REVIEW.md, correct the three most
important and rerender their evidence. Run tests and seek verification. Render
the draft, then the decodable master with sound. Deliver the files, checks
actually run and playback/listening limitations.
```

Author policy: [Astra workflow](../docs/ASTRA_WORKFLOW.md).
