import { lstat, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";
//#region lib/types/protocol.js
const FILE_BROWSER_ROUTE = "/side-panel/api";
//#endregion
//#region lib/types/index.js
const inject = ["webServer", "sessions"];
const IMAGE_MIME = {
	".avif": "image/avif",
	".bmp": "image/bmp",
	".gif": "image/gif",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp"
};
const HIDDEN = /* @__PURE__ */ new Set([".git", "node_modules"]);
const execFileAsync = promisify(execFile);
function inside(root, input = "") {
	const absolute = resolve(root, input || ".");
	const path = relative(root, absolute);
	if (path === ".." || path.startsWith(`..${sep}`) || resolve(path) === path) throw new Error("path is outside the configured workspace");
	return {
		absolute,
		path: path.split(sep).join("/")
	};
}
async function insideExisting(root, input = "") {
	const target = inside(root, input);
	const [canonicalRoot, canonicalTarget] = await Promise.all([realpath(resolve(root)), realpath(target.absolute)]);
	inside(canonicalRoot, canonicalTarget);
	return {
		absolute: canonicalTarget,
		path: target.path
	};
}
async function insideWritable(root, input = "") {
	const target = inside(root, input);
	const canonicalRoot = await realpath(resolve(root));
	let exists = true;
	try {
		await lstat(target.absolute);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		exists = false;
	}
	if (exists) {
		const canonicalTarget = await realpath(target.absolute);
		inside(canonicalRoot, canonicalTarget);
		return {
			absolute: canonicalTarget,
			path: target.path
		};
	}
	const canonicalParent = await realpath(dirname(target.absolute));
	inside(canonicalRoot, canonicalParent);
	return {
		absolute: resolve(canonicalParent, basename(target.absolute)),
		path: target.path
	};
}
async function writeWorkspaceFile(root, input, content) {
	const target = await insideWritable(root, input);
	await writeFile(target.absolute, content, "utf8");
	return target;
}
async function list(root, input) {
	const target = await insideExisting(root, input);
	const children = await readdir(target.absolute, { withFileTypes: true });
	return (await Promise.all(children.filter((child) => !child.isSymbolicLink() && !HIDDEN.has(child.name)).map(async (child) => {
		const childPath = target.path === "" ? child.name : `${target.path}/${child.name}`;
		if (child.isDirectory()) return {
			name: child.name,
			path: childPath,
			kind: "directory"
		};
		const info = await stat(resolve(target.absolute, child.name));
		return {
			name: child.name,
			path: childPath,
			kind: "file",
			size: info.size
		};
	}))).sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "directory" ? -1 : 1);
}
async function search(root, input, limit) {
	const query = input.trim().toLocaleLowerCase();
	if (query === "") return {
		matches: [],
		truncated: false
	};
	const matches = [];
	const pending = [""];
	let truncated = false;
	while (pending.length > 0) {
		const directory = pending.pop() ?? "";
		let children;
		try {
			const target = await insideExisting(root, directory);
			children = await readdir(target.absolute, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const child of children) {
			if (child.isSymbolicLink() || HIDDEN.has(child.name)) continue;
			const childPath = directory === "" ? child.name : `${directory}/${child.name}`;
			if (child.isDirectory()) {
				pending.push(childPath);
				continue;
			}
			if (!child.isFile() || !childPath.toLocaleLowerCase().includes(query)) continue;
			matches.push({
				name: child.name,
				path: childPath,
				kind: "file"
			});
			if (matches.length >= limit) {
				truncated = pending.length > 0 || children.at(-1) !== child;
				pending.length = 0;
				break;
			}
		}
	}
	matches.sort((a, b) => a.path.localeCompare(b.path));
	return {
		matches,
		truncated
	};
}
async function preview(root, input, maxText, maxImage) {
	const target = await insideExisting(root, input);
	const info = await stat(target.absolute);
	if (!info.isFile()) throw new Error("path is not a file");
	const name = target.path.split("/").at(-1) ?? target.path;
	const extension = extname(name).toLowerCase();
	if (info.size === 0) return {
		kind: "empty",
		path: target.path,
		name,
		size: 0
	};
	const mime = IMAGE_MIME[extension];
	if (mime) {
		if (info.size > maxImage) return {
			kind: "too-large",
			path: target.path,
			name,
			size: info.size
		};
		const body = await readFile(target.absolute);
		return {
			kind: "image",
			path: target.path,
			name,
			mime,
			dataUrl: `data:${mime};base64,${body.toString("base64")}`,
			size: info.size
		};
	}
	if (info.size > maxText) return {
		kind: "too-large",
		path: target.path,
		name,
		size: info.size
	};
	const body = await readFile(target.absolute);
	if (body.includes(0)) return {
		kind: "binary",
		path: target.path,
		name,
		size: info.size
	};
	return {
		kind: "text",
		path: target.path,
		name,
		extension,
		content: body.toString("utf8"),
		size: info.size
	};
}
function json(res, status, body) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	res.end(JSON.stringify(body));
}
async function requestBody(req) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += value.length;
		if (size > 3145728) throw new Error("request body is too large");
		chunks.push(value);
	}
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
function diffFiles(value) {
	const files = /* @__PURE__ */ new Map();
	for (const block of value.split(/(?=^diff --git )/m)) {
		const path = /^diff --git a\/(.*?) b\/(.*?)$/m.exec(block)?.[2];
		if (path !== void 0) files.set(path, block);
	}
	return files;
}
function changedDiff(before, after) {
	const previous = diffFiles(before);
	return [...diffFiles(after)].filter(([path, block]) => previous.get(path) !== block).map(([, block]) => block).join("");
}
async function workspaceDiff(root) {
	let diff = await execFileAsync("git", [
		"diff",
		"HEAD",
		"--no-ext-diff",
		"--"
	], {
		cwd: root,
		maxBuffer: 4194304
	}).then((value) => value.stdout).catch(() => "");
	const untracked = (await execFileAsync("git", ["status", "--short"], {
		cwd: root,
		maxBuffer: 1048576
	}).then((value) => value.stdout).catch(() => "")).split("\n").filter((line) => line.startsWith("?? ")).map((line) => line.slice(3));
	for (const file of untracked) try {
		await execFileAsync("git", [
			"diff",
			"--no-index",
			"--",
			"/dev/null",
			file
		], {
			cwd: root,
			maxBuffer: 2097152
		});
	} catch (error) {
		const output = error.stdout;
		if (typeof output === "string") diff += `${diff.endsWith("\n") || diff === "" ? "" : "\n"}${output}`;
	}
	return diff;
}
function apply(ctx, config = {}) {
	const maxText = config.maxTextBytes ?? 2097152;
	const maxImage = config.maxImageBytes ?? 10485760;
	const searchMaxResults = config.searchMaxResults ?? 200;
	const terminals = /* @__PURE__ */ new Map();
	const turnGit = /* @__PURE__ */ new Map();
	let nextTerminal = 0;
	ctx.on("session/event", ((session, event) => {
		if (event.type !== "turn/start" && event.type !== "turn/end") return;
		const cwd = session.header.cwd;
		if (cwd === void 0) return;
		const state = turnGit.get(session.id) ?? { ready: Promise.resolve() };
		state.ready = state.ready.then(async () => {
			const snapshot = await workspaceDiff(resolve(cwd));
			if (event.type === "turn/start") state.before = snapshot;
			else if (state.before !== void 0) {
				state.last = changedDiff(state.before, snapshot);
				state.before = void 0;
			}
		}).catch(() => {});
		turnGit.set(session.id, state);
	}));
	ctx.effect(() => {
		const disposeRoute = ctx.webServer.register({
			kind: "exact",
			path: FILE_BROWSER_ROUTE,
			handler: async (req, res) => {
				try {
					const url = new URL(req.url ?? "/side-panel/api", "http://localhost");
					const body = req.method === "POST" ? await requestBody(req) : {};
					const sessionId = typeof body.sessionId === "string" ? body.sessionId : url.searchParams.get("sessionId");
					if (sessionId === null || sessionId === "") throw new Error("sessionId is required");
					const cwd = ctx.sessions.get(sessionId)?.header.cwd;
					if (cwd === void 0) throw new Error("current session has no workspace");
					const root = resolve(cwd);
					const path = typeof body.path === "string" ? body.path : url.searchParams.get("path") ?? "";
					const action = typeof body.action === "string" ? body.action : url.searchParams.get("action") ?? "list";
					if (action === "list") return json(res, 200, {
						ok: true,
						root,
						entries: await list(root, path)
					});
					if (action === "search") return json(res, 200, {
						ok: true,
						...await search(root, path, searchMaxResults)
					});
					if (action === "preview") return json(res, 200, {
						ok: true,
						preview: await preview(root, path, maxText, maxImage)
					});
					if (action === "write") {
						if (typeof body.content !== "string") throw new Error("content is required");
						return json(res, 200, {
							ok: true,
							saved: (await writeWorkspaceFile(root, path, body.content)).path
						});
					}
					if (action === "review") {
						const allowedModes = /* @__PURE__ */ new Set([
							"unstaged",
							"staged",
							"commits",
							"branches",
							"last-session"
						]);
						const mode = typeof body.mode === "string" && allowedModes.has(body.mode) ? body.mode : "unstaged";
						const status = await execFileAsync("git", ["status", "--short"], {
							cwd: root,
							maxBuffer: 1048576
						}).then((value) => value.stdout).catch(() => "当前工作区不是 Git 仓库");
						const branch = await execFileAsync("git", [
							"symbolic-ref",
							"--quiet",
							"--short",
							"HEAD"
						], {
							cwd: root,
							maxBuffer: 65536
						}).then((value) => value.stdout.trim()).catch(async () => execFileAsync("git", [
							"rev-parse",
							"--short",
							"HEAD"
						], {
							cwd: root,
							maxBuffer: 65536
						}).then((value) => `detached@${value.stdout.trim()}`).catch(() => ""));
						const statusLines = status.split("\n").filter(Boolean);
						const stagedStatus = statusLines.filter((line) => line[0] !== " " && line[0] !== "?");
						const unstagedStatus = statusLines.filter((line) => line.startsWith("?? ") || line[1] !== " ");
						if (mode === "last-session") await turnGit.get(sessionId)?.ready;
						const lastSessionDiff = mode === "last-session" ? turnGit.get(sessionId)?.last : void 0;
						const relevantStatus = statusLines.filter((line) => line !== "" && (mode === "staged" ? line[0] !== " " && line[0] !== "?" : mode === "unstaged" ? line.startsWith("?? ") || line[1] !== " " : mode === "last-session" && lastSessionDiff !== void 0 ? lastSessionDiff.includes(` b/${line.slice(3).split(" -> ").at(-1) ?? line.slice(3)}`) : false)).join("\n");
						let diff = mode === "staged" || mode === "unstaged" ? await execFileAsync("git", mode === "staged" ? [
							"diff",
							"--cached",
							"--no-ext-diff",
							"--"
						] : [
							"diff",
							"--no-ext-diff",
							"--"
						], {
							cwd: root,
							maxBuffer: 2097152
						}).then((value) => value.stdout).catch(() => "") : mode === "last-session" ? lastSessionDiff ?? "" : "";
						const untracked = mode === "unstaged" ? status.split("\n").filter((line) => line.startsWith("?? ")).map((line) => line.slice(3)) : [];
						const untrackedDiffs = await Promise.all(untracked.map(async (file) => {
							try {
								return (await execFileAsync("git", [
									"diff",
									"--no-index",
									"--",
									"/dev/null",
									file
								], {
									cwd: root,
									maxBuffer: 2097152
								})).stdout;
							} catch (error) {
								const output = error.stdout;
								return typeof output === "string" ? output : "";
							}
						}));
						if (untrackedDiffs.length > 0) diff += `${diff.endsWith("\n") || diff === "" ? "" : "\n"}${untrackedDiffs.join("\n")}`;
						const commits = mode === "commits" ? await execFileAsync("git", [
							"log",
							"-50",
							"--date=relative",
							"--pretty=format:%H%x1f%h%x1f%s%x1f%an%x1f%ar%x1f%D%x1e"
						], {
							cwd: root,
							maxBuffer: 1048576
						}).then((value) => value.stdout.split("").filter(Boolean).map((record) => {
							const [hash = "", shortHash = "", subject = "", author = "", relativeDate = "", refs = ""] = record.replace(/^\n/, "").split("");
							return {
								hash,
								shortHash,
								subject,
								author,
								relativeDate,
								refs
							};
						})).catch(() => []) : [];
						const branches = mode === "branches" ? await execFileAsync("git", [
							"for-each-ref",
							"--format=%(refname:short)%00%(HEAD)%00%(upstream:short)%00%(upstream:track,nobracket)%00%(subject)",
							"refs/heads"
						], {
							cwd: root,
							maxBuffer: 1048576
						}).then((value) => value.stdout.split("\n").filter(Boolean).map((line) => {
							const [name = "", head = "", upstream = "", track = "", subject = ""] = line.split("\0");
							const ahead = Number(/ahead (\d+)/.exec(track)?.[1] ?? 0);
							const behind = Number(/behind (\d+)/.exec(track)?.[1] ?? 0);
							return {
								name,
								current: head.trim() === "*",
								upstream,
								ahead,
								behind,
								subject
							};
						})).catch(() => []) : [];
						const message = mode === "last-session" && lastSessionDiff === void 0 ? "暂无上轮会话快照。插件会从下一轮对话开始记录 Git 变更边界。" : void 0;
						return json(res, 200, {
							ok: true,
							review: {
								status: relevantStatus,
								diff,
								branch,
								mode,
								counts: {
									unstaged: unstagedStatus.length,
									staged: stagedStatus.length
								},
								commits,
								branches,
								...message === void 0 ? {} : { message }
							}
						});
					}
					if (action === "git-stage" || action === "git-unstage") {
						if (typeof body.path !== "string" || body.path === "") throw new Error("path is required");
						const target = await insideWritable(root, body.path);
						const args = action === "git-stage" ? [
							"add",
							"--",
							target.path
						] : [
							"restore",
							"--staged",
							"--",
							target.path
						];
						await execFileAsync("git", args, {
							cwd: root,
							maxBuffer: 1048576
						});
						return json(res, 200, {
							ok: true,
							accepted: true
						});
					}
					if (action === "terminal") {
						if (typeof body.command !== "string" || body.command.trim() === "") throw new Error("command is required");
						try {
							const result = await execFileAsync("/bin/bash", ["-lc", body.command], {
								cwd: root,
								timeout: 3e4,
								maxBuffer: 2097152
							});
							return json(res, 200, {
								ok: true,
								terminal: {
									output: result.stdout + result.stderr,
									exitCode: 0
								}
							});
						} catch (error) {
							const failure = error;
							return json(res, 200, {
								ok: true,
								terminal: {
									output: `${failure.stdout ?? ""}${failure.stderr ?? ""}`,
									exitCode: typeof failure.code === "number" ? failure.code : 1
								}
							});
						}
					}
					if (action === "terminal-open") {
						const id = `side-pty-${++nextTerminal}`;
						const requestedCols = typeof body.cols === "number" ? Math.floor(body.cols) : 80;
						const requestedRows = typeof body.rows === "number" ? Math.floor(body.rows) : 24;
						const cols = Math.min(500, Math.max(2, requestedCols));
						const rows = Math.min(200, Math.max(1, requestedRows));
						const configuredShell = process.env.SHELL || "/bin/bash";
						const shell = /^\/[A-Za-z0-9_./-]+$/.test(configuredShell) ? configuredShell : "/bin/bash";
						const terminal = spawn("script", [
							"-qfec",
							`stty cols ${cols} rows ${rows}; exec ${shell}`,
							"/dev/null"
						], {
							cwd: root,
							env: {
								...process.env,
								TERM: "xterm-256color"
							},
							stdio: "pipe"
						});
						const record = {
							owner: sessionId,
							process: terminal,
							chunks: [],
							exited: false
						};
						terminal.stdout.on("data", (chunk) => record.chunks.push(String(chunk)));
						terminal.stderr.on("data", (chunk) => record.chunks.push(String(chunk)));
						terminal.on("exit", () => {
							record.exited = true;
						});
						terminals.set(id, record);
						return json(res, 200, {
							ok: true,
							pty: {
								id,
								output: "",
								exited: false
							}
						});
					}
					if (action.startsWith("terminal-")) {
						if (typeof body.terminalId !== "string") throw new Error("terminalId is required");
						const record = terminals.get(body.terminalId);
						if (record === void 0 || record.owner !== sessionId) throw new Error("terminal is unavailable");
						if (action === "terminal-read") {
							const output = record.chunks.join("");
							record.chunks.length = 0;
							return json(res, 200, {
								ok: true,
								pty: {
									id: body.terminalId,
									output,
									exited: record.exited
								}
							});
						}
						if (action === "terminal-input") {
							if (typeof body.data !== "string") throw new Error("terminal data is required");
							record.process.stdin.write(body.data);
							return json(res, 200, {
								ok: true,
								accepted: true
							});
						}
						if (action === "terminal-resize") {
							if (typeof body.cols !== "number" || typeof body.rows !== "number") throw new Error("terminal dimensions are required");
							return json(res, 200, {
								ok: true,
								accepted: true
							});
						}
						if (action === "terminal-close") {
							record.process.kill("SIGTERM");
							terminals.delete(body.terminalId);
							return json(res, 200, {
								ok: true,
								accepted: true
							});
						}
					}
					if (action === "resolve-path") {
						const target = await insideExisting(root, path);
						return json(res, 200, {
							ok: true,
							path: target.absolute,
							parentPath: dirname(target.absolute),
							platform: process.platform,
							...process.env.WSL_DISTRO_NAME === void 0 ? {} : { distro: process.env.WSL_DISTRO_NAME }
						});
					}
					json(res, 400, {
						ok: false,
						error: "unknown action"
					});
				} catch (error) {
					json(res, 400, {
						ok: false,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
		});
		return () => {
			disposeRoute();
			for (const terminal of terminals.values()) terminal.process.kill("SIGTERM");
			terminals.clear();
		};
	}, "side-panel: workspace and terminal API");
}
//#endregion
export { apply, inject, inside, insideExisting, insideWritable, list, preview, search, writeWorkspaceFile };
