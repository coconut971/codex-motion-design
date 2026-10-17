# Observed limitations and end of the experiment

**The project's visual goal has not been met; development is dormant.** Two trials
created with GPT-6 Astra, first at `high` and then at `ultra` effort, were rejected
by the user. Passing technical checks does not constitute artistic acceptance.
The [summary report](EXPERIMENT_REPORT.md) documents scope, results and the closeout decision.

## First trial: inadequate mechanics and rendering

[The Dawn Workshop](assets/morning-press/film.mp4) remains published as an
exploratory test with an inadequate artistic result. It was made quickly with
**GPT-6 Astra, `reasoning_effort = high`**, for authorship, critique and QA.
It lasts 14 seconds, with four shots, 81 drawn objects and five synthetic sound
accents in the local `motion/1` engine. The [case study](cases/morning-press.md)
retains its settings and checks.

The user judged the rendering highly inadequate, particularly the mechanical
logic beneath the lever. This final judgment takes precedence over the favorable
impression in the production review. The master and its sources remain frozen
to preserve the result actually obtained.

The [descriptor](../examples/morning-press/project.json) animates `lever.rotation`,
`shaft.y` and `platen.y` using separate tracks and different curves. Shared events
synchronize their timing, but the [frame calculation](../core/film.mjs) enforces
no kinematic relationship. The lever therefore does not determine platen movement,
contrary to the causality described in the storyboard.

The 27 passing tests, probes across 71 times × five traversal orders × two adapters
and six active subframe pairs verify technical properties. They establish neither
mechanical correctness, rhythm nor artistic quality. Critique through captures
and strips failed to identify the defect subsequently reported by the user.
The [original review](../examples/morning-press/REVIEW.md) is preserved; later human
feedback is documented in the case study.

## Second trial: simplification was insufficient

A subsequent local trial used **Astra `ultra`** for authorship, critique and QA:
six seconds, one shot and one simple action. A rigid construction and targeted
mechanical checks addressed the linkage problem. Verification covered 25 times ×
five traversal orders × two adapters at 1920 × 1080 and two subframe pairs.

The user nevertheless judged the graphical result extremely poor and rejected it.
Shortening the film and constraining its mechanics therefore did not deliver the
expected artistic result. “Four to six seconds, one action” is no longer an
untested suggestion: this trial explored it unsuccessfully. Its sources, images
and videos remain unpublished; only this anonymous finding is reported.

## Scope of the findings

The creative block was observed **in this project configuration with Astra**.
Agent critique was too lenient against the expected standard. The engine supplies
primitives and tracks without a visual catalog, expressive rigs or a general
mechanical solver. Paths allow arbitrary drawings, but their richness still had
to be built. No measurement isolates this framework's contribution from the model's.

The user reports seeing vastly better **Claude Opus 5.5** renders elsewhere and
considers Astra's capabilities the obstacle, regardless of effort level. This
personal testimony informs their decision to stop. No Claude comparison with an
identical brief, engine and budget was run here. Model versions used by the
repositories studied were not exhaustively inventoried.

The `high` and `ultra` efforts were tested on two different briefs; **`max` was
not tested**, nor were all other efforts. The independent effect of effort cannot
therefore be measured, nor can a universal inability be concluded. These comparison
limits do not change the project's failure to satisfy the user.

The repository is retained as an experiment in reverse engineering and adapting
Claude workflows to GPT, without a production promise. No new film or development
is scheduled. Restarting requires an explicit user request and human validation
of the result.
