# Technical closeout report

October 17, 2026 — **project made dormant at the user's request**.

The visual goal failed. Adapting motion design workflows associated with Claude
to GPT-6 Astra produced a controllable rendering pipeline, but neither of the
two creative trials evaluated by the user met their standard. The first notably
suffers from unconvincing mechanical causality; the second, deliberately simplified,
remains extremely poor graphically in their judgment. The creative block with
Astra in our configuration led to the decision to stop development. Passing
technical tests does not diminish that finding.

## Scope and hypothesis

This report is limited to the `codex-motion-design` repository.

The repository is an **experiment in reverse engineering and workflow adaptation**,
not a validated production tool. The hypothesis was that investigating available
methods and translating them into direction rules, storyboards, absolute time,
frame-based critique and local rendering would enable GPT to produce convincing films.

The initial investigation was serious but bounded and quick. It was neither an
exhaustive study of Claude workflows nor an inventory of their models and versions.
Some primary social sources were inaccessible; the [source register](SOCIAL_SOURCES.md)
retains that limitation. The [REA Signal](cases/REA_SIGNAL.md) case actually tested
inspection, reconstruction and comparison on a repository page with accessible
sources. It does not demonstrate reproduction of external Claude films.

## Trials and results

The creations used Astra for authorship, critique and QA. Rendering runs locally
with Node, Chromium/Playwright and FFmpeg; the `motion/1` engine makes no model calls.

| Configuration | Observed scope | Result and limits |
| --- | --- | --- |
| Astra `high` | [The Dawn Workshop](cases/morning-press.md), 14 s, four shots, 81 objects | Rendering judged highly inadequate; flawed relationship between lever, shaft and platen. |
| Astra `ultra` | Second local trial outside the repository, 6 s, one shot, one simple action | Mechanically constrained construction; graphical result still rejected as extremely poor. Sources and media unpublished. |
| Astra `max` | No local trial | No result can be attributed to it. |
| Other Astra efforts | Not evaluated in this series | No effect established. |
| Claude Opus 5.5, according to the user | Renders seen elsewhere, judged vastly better | External personal testimony; no comparison run here. |

The first trial has 27 passing tests and probes covering 71 times × five traversal
orders × two adapters at 480 × 270, with six active subframe pairs. Canvas compares
RGBA bytes; SVG compares the DOM and shared state. The master has 420 decoded
frames. Compositions, contacts, strips and atlases were inspected; the production
review claims neither a complete real-time viewing nor human listening.

The second trial checked 25 times × five traversal orders × two adapters at
1920 × 1080 and two subframe pairs. One shared analytical angle enforced the rigid
linkage; the pivot and 550 px length remained constant, with decreasing energy.
These checks describe targeted invariants. Passing them did not make the film
acceptable to the user. Only this anonymous summary is retained here; the trial's
content remains unpublished.

## Identified failures

**Mechanics.** In the first descriptor, `lever.rotation`, `shaft.y` and `platen.y`
follow independent tracks. Shared cues synchronize moments without enforcing
kinematic transmission. The storyboard describes a cause that the calculation
does not guarantee. Repeatability can therefore preserve an incoherent action.

**Art direction.** Reducing duration, shot count and mechanical complexity was
not enough to produce a satisfactory image. Composition, richness of drawing and
staging interest remain failures against the requested result.

**Overly lenient critique.** Agent reviews accepted results that the user later
firmly rejected. Correcting a few local defects and inspecting captures did not
establish an appropriate artistic threshold. Final human judgment determines acceptance.

**Construction framework.** The core supplies primitives and numeric tracks,
without a visual catalog, expressive rigs or a general mechanical solver. Paths
allow arbitrary drawings, but their richness still had to be built. This limitation
forms part of the failure's context; its causal weight was not isolated from that
of the model, brief or method.

## What the evidence establishes

Tests verify mathematics, temporal contracts, repeatable images and decodable
exports. REA helps document observable behavior and distinguish facts from
hypotheses. Neither tests nor REA guarantee good art direction, credible mechanics
or demanding critique.

The two trials differ in brief, duration and complexity: they do not isolate the
effect of `high` versus `ultra`. No comparable protocol, captures or budget were
provided for the Claude renders mentioned. The user's feedback is nevertheless
clear: they see a major gap elsewhere and attribute the block to Astra's
capabilities, regardless of effort. This is their practical diagnosis; the local
series does not test every effort level or measure a universal model inability.

## Decision

Development is set aside. The repository retains code, evidence and previously
published results as an experimental archive, without a promise of production
quality. No new creation, revision or roadmap is underway. Restarting requires
an explicit user request and human validation of the visual result.
