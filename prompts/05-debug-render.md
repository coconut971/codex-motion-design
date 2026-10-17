# Repair a render with evidence

```text
Required author: GPT-6 Astra exclusively, including code, assets, prompts and
corrections. Verify the model using reliable session information; if it is not
Astra or you cannot verify it, state the limitation before generating and ask
for Astra to be selected, without a fallback model. Rendering and measurement
of existing files remain local, without a model API.

Diagnose [command + error + file]. Read docs/RENDER_CONTRACT.md. For motion/1,
read docs/CORE.md, compare film.sample(t) before rendering, then both adapters;
npm run core:verify tests reset, masks and shared state. Reduce the case to one
frame or a short range. First check doctor, readiness, local resources, browser
errors, dimensions and FFmpeg output. Compare seek(t) after another time and on
a fresh page, using all pixels. Check that t remains continuous and blur does
not cross any cut.

Fix the cause with the smallest coherent change. Add a regression test if the
defect concerns a reusable contract. Do not hide an error by disabling its
check. Preserve the previous master if the new export fails. Rerender the case,
then the affected deliverable, and report the evidence.
```

Author policy: [Astra workflow](../docs/ASTRA_WORKFLOW.md).
