# Use REA to understand a reference, then reimplement it

[REA — Reverse Engineer Anything](https://github.com/morluto/rea) is an optional integration for technical investigation. Codex can use it through MCP or its CLI to inspect a page, JavaScript scripts or an application. The film is still produced by this repository's `seek(t)` engine, Playwright and FFmpeg; REA does not replace that pipeline.

This integration is documented against commit [`408704827057280b240c91963ee5590fd4dcc988`](https://github.com/morluto/rea/tree/408704827057280b240c91963ee5590fd4dcc988), version `6.5.0`, under the [MIT licence, morluto](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/LICENSE#L1-L21). An npm registry lookup on 17 October 2026 confirmed `latest = 6.5.0`, the official repository and the Node requirements below. No REA code or skill is bundled here. After initial dry-run validation, the Codex integration and skill were actually installed on the working machine. The [Signal case study](cases/REA_SIGNAL.md) connects an HTML-page investigation to reconstruction, image comparisons and local rendering.

## Install the Codex integration

REA 6.5.0 requires Node `22.x >= 22.19`, `24.x >= 24.11` or `26+`, with npm. This is stricter than this repository renderer's minimum. Static JavaScript analysis does not require Hopper, Ghidra or IDA. Page analysis requires a Chrome-family browser. On Linux, JavaScript/Electron analysis also requires a procps-compatible `ps`. See the [official prerequisites](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/README.md#L164-L197) and [Linux clarification](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L338-L346).

The official entry command is:

```sh
npx rea-agents setup
```

To explicitly limit installation to Codex and inspect a reproducible plan:

```sh
npx rea-agents@6.5.0 setup --client codex --dry-run
npx rea-agents@6.5.0 setup --client codex
```

The first command shows the plan without applying changes. The second offers to apply it; read the reported paths, confirm in REA, then restart Codex after success. No native analysis engine is needed for the web and JavaScript uses described here. Adding `--skill=false` registers only the MCP, without the REA workflow. These options are documented in [installation](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L31-L114) and defined in [the CLI](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/cli/setupCommands.ts#L50-L88).

Setup touches the following user locations, according to the actual environment shown in its plan:

| Item | Location and effect |
| --- | --- |
| Codex MCP registration | `config.toml` in `CODEX_HOME`, or `~/.codex/config.toml` if that variable is empty or absent; entry `mcp_servers.rea`. |
| Default REA workflow | `~/.agents/skills/reverse-engineer-anything/`, with its references. For Codex, `CODEX_HOME` does not relocate this shared destination. |
| Configuration backups | `.rea.backup` files and, if needed, a recovery backup named by its hash; retain the paths reported by setup. |
| MCP timeouts | 30-second initialization for a new entry and a tool timeout derived from providers; existing positive values are preserved. |

Paths follow the [Codex configuration resolver](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L167-L168), [its declaration](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L503-L509) and the [skill resolver](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/SupportedClients.ts#L811-L855). [Backups](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L49-L70) and [Codex timeouts](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/client-configuration.md#L244-L260) are described separately.

Let REA generate its registration rather than copying generic TOML. The launcher is pinned to its version; on Windows it uses a `cmd.exe /d /c` wrapper to launch `npx`, as shown in [its implementation](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/src/application/ClientRegistrationIdentity.ts#L53-L69). This setup changes the user's Codex profile, not just the current repository.

Then check only the relevant components:

```sh
npx rea-agents@6.5.0 doctor --client codex --skill --json
npx rea-agents@6.5.0 --help
```

If the skill was deliberately omitted, remove `--skill` from the check. A scoped diagnostic does not prove that a particular target can be analyzed; the [readiness guide](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/installation.md#L301-L329) distinguishes these levels. Valid registration does not add MCP tools to an already open session: restart or reconnect Codex, then check discovery in the new session. Meanwhile, a working CLI allows the authorized investigation to continue while retaining the same Evidence. Missing MCP discovery does not require stopping this CLI path or repeating setup. Hosted ChatGPT without access to the local process does not receive this MCP through installation alone; use Codex on the machine, a CLI available in its environment, or provide exported Evidence.

## Choose the right investigation

| Available reference | What REA can provide | What remains to establish |
| --- | --- | --- |
| Accessible animated page | DOM, captured scripts, resources, network/console observations and viewport screenshots. | Visual timeline, items outside capture, server code, missing dependencies and artistic intent. |
| JavaScript folder / Electron application / ASAR | Observed module graph, imports, relationships and code locations; static analysis without executing the application. | Actual behaviour, unresolved paths and unobservable parameters. |
| Interface scenario | Declared actions and captures of their results in a launched or selected browser. | A successful scenario alone does not demonstrate motion quality or equivalence of all interactions. |
| MP4, GIF or images only | The visual reference can guide a specification and comparison. | Pixels do not provide source files or a unique spring function. REA is neither a video generator nor a guarantee of recovering the original project. |

The [web catalogue](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L15-L38) separates passive inspection and captures; [scenarios](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-scenario-contract.md#L1-L28) form another path capable of performing actions. [JavaScript workflows](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/javascript-application-workflows.md#L3-L24) preserve the distinction between static observation, runtime observation, inference and unknowns.

## Web page: capture useful facts

Use a dedicated Chrome profile with a local debugging port. REA neither launches nor terminates the browser in the passive path. The [official guide](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L92-L119) gives the flags `--remote-debugging-port=9222` and `--user-data-dir=<dedicated-profile>`. The exact executable path depends on the machine; the port stays on the local interface.

The following commands use an actually open endpoint; replace `TARGET_ID` with an identity returned by the first command:

```sh
npx rea-agents@6.5.0 list-browser-targets http://127.0.0.1:9222 --json
npx rea-agents@6.5.0 inspect-web-page http://127.0.0.1:9222 TARGET_ID --observation-ms 1000 --json
npx rea-agents@6.5.0 analyze-web-bundle http://127.0.0.1:9222 TARGET_ID --json
npx rea-agents@6.5.0 capture-web-screenshot http://127.0.0.1:9222 TARGET_ID --json
```

To observe a human interaction, arm `observe-web-session` with an explicit window, then perform the action within it. To also capture scripts exposed to the Debugger, add `--include-script-sources` to `inspect-web-page`. [Commands and options](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L192-L213) and [content capture](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/browser-observation.md#L245-L277) are verifiable in the sources. Screenshots are inline artifacts, not necessarily PNGs already saved to disk.

Retain the complete output as UTF-8 JSON without BOM in a local investigation folder, for example under `work/rea/`. Do not automatically add captures, third-party scripts, cookies or session data to the public repository. Broader option selections may include sensitive information; select only data useful to the question being investigated.

If sources were actually captured, REA can export them into a **new** folder and analyze them. In the commands below, replace both angle-bracketed paths with the actual absolute paths:

```sh
npx rea-agents@6.5.0 export-web-scripts "<capture.json>" "<new-folder>" --json
npx rea-agents@6.5.0 analyze-javascript-application "<new-folder>/files" --json
```

An export may legitimately provide no analyzable entry. It does not reconstruct a complete application, automatically recover missing source maps or guarantee execution of observed scripts. Check `analysis_input`, hashes, coverage and exclusions in [export results](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/website-script-export.md#L19-L34) and their [limits](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/website-script-export.md#L67-L86).

For an already available folder, simply run `npx rea-agents@6.5.0 analyze-javascript-application "<absolute-folder-or-ASAR>" --json`. Large Evidence outputs should be saved, then queried through focused views, as explained in [the CLI](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/cli.md#L7-L38). In MCP, retained references belong to the connection; multiple CLI calls must share complete Evidence files, not merely a session id ([contract](https://github.com/morluto/rea/blob/408704827057280b240c91963ee5590fd4dcc988/docs/cli.md#L216-L232)).

## Turn the investigation into deterministic animation

1. Define an observable question: for example, "how long separates the click and visual impact?" or "which curve brings this panel toward its target?" Retain the URL or file hash, version, dimensions, capture and reference time.
2. Record findings in a local note: observed fact, precise evidence, inference, uncertainty. A family of curves can explain the same positions; distinguish a value read from code from a visually adjusted setting.
3. Produce `STORYBOARD.md` before implementation: successive states, anticipation, action, contact, reading time, transition, camera role and sound. For video alone, identify poses and contacts by frames with FFmpeg; do not claim to have identified the original code.
4. Transfer named events into the film descriptor. Distinguish musical time and contact frame. Choose shapes, colours and sounds specific to the new film; REA's rights grant no rights over the analyzed target.
5. Reimplement useful behaviour with `seek(t)`, repository helpers and authorized assets. Keep investigation findings separate from delivered code. Reset all drawn state, use stable seeds and express springs in frequency and damping ratio.
6. Run `npm test`, then the browser checks in `npm run verify`. Compare key images, beats, contacts at ±1 frame and transition strips. Also check repeated seeks, reverse/shuffled order and a fresh page. REA pixel comparisons can supplement an investigation without replacing these tests of the new engine.
7. Render a draft, examine its rhythm, synchronize cues from the descriptor, then export the master. Record what was actually opened, measured and, if applicable, listened to in `docs/VALIDATION.md`; code analysis alone does not validate the film.

Use the [production prompt](../prompts/07-reverse-engineer.md) to conduct this sequence in Codex. Render commands and parameters remain those in [RENDER_CONTRACT.md](RENDER_CONTRACT.md).

## Checks actually performed

On 17 October 2026, on Windows with Node `24.18.1`:

- Read the clone, CLI options and path resolvers at the cited commit; checked 22 permalinks in this guide against the clone's files and line ranges.
- Queried `npm view rea-agents version dist-tags engines bin license repository --json`: published version `6.5.0`, matching package and repository.
- Ran `rea setup --help` with package `6.5.0`: successful exit, Codex and dry-run options present.
- Actually ran the plan with `npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea setup --client codex --dry-run --json`: exit code `0`, status `planned`, no actions applied. The plan proposed only `configure_client:codex` and `install_skill`. The user's `config.toml` hash was identical before and after.

This first pass was a dry-run: it had installed neither MCP registration nor skill, and had not yet tested an investigation on a target. It remains recorded as a historical step, not the current state.

### Installation applied on 17 October 2026

At the user's request, the following commands were subsequently run:

```sh
npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea setup --client codex --yes --json
npm exec --ignore-scripts --yes --package=rea-agents@6.5.0 -- rea doctor --client codex --skill --json
```

Setup returned `status: ready`, with two applied actions: `configured_codex` and `installed_skill`. The Codex entry was configured and the backup `~/.codex/config.toml.rea.backup` was created. The workflow was installed in `~/.agents/skills/reverse-engineer-anything/`.

The targeted diagnostic finished with code `0` and `healthy: true`: `node`, `registration:codex` and `skill:identity` are `ok`. Its scope is explicitly Codex and the skill, without a native provider. The global value `environment_healthy: false` concerns unconfigured native providers; they are not required for the case study's JavaScript and browser investigation. This result therefore does not claim to validate Hopper, Ghidra or other native engines.

The package was provisioned in the npm cache with lifecycle scripts disabled. The first `--yes` belongs to npm; the one after `setup --client codex` applies the already authorized REA setup. Complete configuration reports remain local in `work/rea-install/`: they are not material to publish with the user's configuration. At this stage, the authoring session had not refreshed its MCP tool list; the first Signal case therefore used the versioned CLI.

An ephemeral stdio client then launched the installed launcher, `cmd.exe /d /c npx -y rea-agents@6.5.0 mcp`, and successfully completed `initialize` followed by `tools/list` in 2.079 s. The server identified itself as `rea 6.5.0`, protocol `2024-11-05`, with 207 tools on one page, including `inspect_web_page`, `capture_web_screenshot` and `compare_web_screenshots`. The [redacted report](assets/rea-case/mcp-smoke.json) documents this actual exchange. It proves neither attachment to the already open Codex conversation nor execution of all 207 tools; the test stopped its process after discovery.

New scene generation follows the [Astra policy](ASTRA_WORKFLOW.md). Astra handles analysis, specification, writing and critique; `seek(t)`, Playwright and FFmpeg then perform local rendering without a model SDK or API key. The independent core and its limits are described in [CORE.md](CORE.md), with checks in [CORE_VALIDATION.md](CORE_VALIDATION.md).
