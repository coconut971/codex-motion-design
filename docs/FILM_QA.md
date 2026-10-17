# Verify a `motion/1` film

The generic check uses the repository's real player and adapters in
Chrome/Chromium. It changes neither the descriptor nor the engine. Example:

```sh
node scripts/verify-film.mjs --project=examples/morning-press/project.json --out=out/morning-press/verify.json --scale=.25
```

Use `CHROME_PATH` or `--chrome=path/to/chrome` if necessary. The only other
options are `--timeout=30000` (milliseconds, at most 120,000) and size `--scale`
(strictly positive, at most 2). `--project` and `--out` are required. The descriptor
must remain inside the repository. The designated JSON report is replaced with
a new report only after a successful pass.

Times come from `film.qa`, cuts at ±1 frame, the beginning, the last encoded
frame and the state at the exact duration. The script adds up to two pairs of
moving subframes per scene: they belong to the same output frame and the same
boil tick. Selection uses visible transforms; variation is then measured in pixels.

Each time is visited in five traversals: ascending, descending, shuffled,
repeated, then in a fresh page. For Canvas, SHA-256 covers all RGBA bytes, copied
into a CPU capture buffer with `willReadFrequently`, as in the video renderer.
Reading therefore does not affect the source Canvas backend choice. The SHA-256
of the complete frame and of the complete SVG DOM are also compared. The shared
frame must match across Canvas and SVG; the two adapters' pixels are not expected
to be identical.

The JSON body actually received by each page and the file still present at the
end of the pass must have the initial SHA-256. Any edit during the pass invalidates
the check. JavaScript errors, failed requests, HTTP ≥ 400 and external requests
are blocking failures. Navigation, readiness, fonts and evaluations have timeouts;
the browser and server are closed in `finally`.

These are regression checks at the listed times, browser and resolution. They
prove neither universal film purity, artistic quality nor the absence of collisions
outside those times. SVG is checked through state and DOM, not rasterization.
Results do not constitute listening to the sound or observing the rhythm at
normal speed. Sheets, contacts, draft and master remain necessary.
