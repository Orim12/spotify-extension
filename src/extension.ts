import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { exec, spawn, ChildProcessWithoutNullStreams } from "child_process";

const VIEW_TYPE = "spotifyView";
const POLL_INTERVAL_MS = 3000;
const HELPER_RELATIVE_PATH = path.join("helper", "SpotifySmtcHelper.exe");

type TrackMessage =
	| { type: "track"; title: string; artist: string; album: string }
	| { type: "status"; message: string };

function getHelperPath(context: vscode.ExtensionContext): string {
	return context.asAbsolutePath(HELPER_RELATIVE_PATH);
}

class HelperClient {
	private process?: ChildProcessWithoutNullStreams;
	private buffer = "";
	private pending: Array<(line: string) => void> = [];
	private starting = false;

	constructor(private readonly context: vscode.ExtensionContext) {}

	private start(): void {
		if (this.process || this.starting) {
			return;
		}

		this.starting = true;
		const helperPath = getHelperPath(this.context);
		if (!fs.existsSync(helperPath)) {
			this.starting = false;
			return;
		}

		this.process = spawn(helperPath, ["--server"], {
			windowsHide: true,
			stdio: "pipe",
		});

		this.process.stdout.on("data", (chunk: Buffer) => {
			this.buffer += chunk.toString("utf8");
			let lineBreakIndex = this.buffer.indexOf("\n");
			while (lineBreakIndex !== -1) {
				const line = this.buffer.slice(0, lineBreakIndex).replace(/\r$/, "");
				this.buffer = this.buffer.slice(lineBreakIndex + 1);
				const resolver = this.pending.shift();
				if (resolver) {
					resolver(line);
				}
				lineBreakIndex = this.buffer.indexOf("\n");
			}
		});

		this.process.on("exit", () => {
			this.process = undefined;
			this.buffer = "";
			while (this.pending.length > 0) {
				const resolver = this.pending.shift();
				if (resolver) {
					resolver("Helper exited");
				}
			}
		});

		this.process.on("error", () => {
			this.process = undefined;
		});

		this.starting = false;
	}

	public async send(command?: "playpause" | "next" | "previous", skipInfo?: boolean): Promise<string> {
		this.start();
		if (!this.process || !this.process.stdin.writable) {
			return execHelperOnce(this.context, command, skipInfo);
		}

		const line = command
			? `${command}${skipInfo ? " --noinfo" : ""}`
			: "get";

		return new Promise((resolve) => {
			this.pending.push(resolve);
			this.process?.stdin.write(`${line}\n`);
		});
	}
}

function execHelperOnce(
	context: vscode.ExtensionContext,
	command?: "playpause" | "next" | "previous",
	skipInfo?: boolean
): Promise<string> {
	return new Promise((resolve) => {
		const helperPath = getHelperPath(context);
		if (!fs.existsSync(helperPath)) {
			resolve("Helper not built. Build helper/SpotifySmtcHelper.csproj.");
			return;
		}

		const args = command ? ` ${command}${skipInfo ? " --noinfo" : ""}` : "";
		exec(`"${helperPath}"${args}`, { windowsHide: true }, (error, stdout, stderr) => {
			if (error) {
				resolve(`Helper error: ${error.message}`);
				return;
			}

			const output = `${stdout ?? ""}${stderr ?? ""}`.trim();
			resolve(output.length > 0 ? output : "No output from helper");
		});
	});
}

let helperClient: HelperClient | undefined;

function execHelper(
	context: vscode.ExtensionContext,
	command?: "playpause" | "next" | "previous",
	skipInfo?: boolean
): Promise<string> {
	if (!helperClient) {
		helperClient = new HelperClient(context);
	}
	return helperClient.send(command, skipInfo);
}

function parseHelperOutput(output: string): TrackMessage {
	if (output.includes("|")) {
		const parts = output.split("|");
		const title = parts[0]?.trim() ?? "";
		const artist = parts[1]?.trim() ?? "";
		const album = parts[2]?.trim() ?? "";
		return {
			type: "track",
			title: title || "-",
			artist: artist || "-",
			album: album || "-",
		};
	}

	if (output === "OK") {
		return {
			type: "status",
			message: "",
		};
	}

	return {
		type: "status",
		message: output || "Spotify not running",
	};
}

class SpotifyViewProvider implements vscode.WebviewViewProvider {
	private view?: vscode.WebviewView;
	private pollTimer?: NodeJS.Timeout;

	constructor(private readonly context: vscode.ExtensionContext) {}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		};

		webviewView.webview.html = this.getHtml(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (message) => {
			if (message?.type === "command") {
				const command = message.command as "playpause" | "next" | "previous";
				await execHelper(this.context, command, true);
				await this.refresh();
			}
		});

		this.startPolling();
	}

	public async refresh(): Promise<void> {
		if (!this.view) {
			return;
		}

		const output = await execHelper(this.context);
		const parsed = parseHelperOutput(output);
		this.view.webview.postMessage(parsed);
	}

	private startPolling(): void {
		this.stopPolling();
		void this.refresh();
		this.pollTimer = setInterval(() => {
			void this.refresh();
		}, POLL_INTERVAL_MS);
	}

	private stopPolling(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer);
			this.pollTimer = undefined;
		}
	}

	private getHtml(webview: vscode.Webview): string {
		const nonce = getNonce();
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Spotify</title>
	<style nonce="${nonce}">
		:root {
			color-scheme: light dark;
		}
		body {
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background: var(--vscode-sideBar-background);
			margin: 0;
			padding: 12px;
		}
		.container {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		.title {
			font-weight: 600;
			font-size: 1.1em;
		}
		.label {
			color: var(--vscode-descriptionForeground);
			font-size: 0.85em;
			margin-bottom: 2px;
		}
		.value {
			word-break: break-word;
		}
		.status {
			color: var(--vscode-descriptionForeground);
			font-style: italic;
		}
		.buttons {
			display: flex;
			gap: 8px;
		}
		button {
			flex: 1;
			padding: 6px 8px;
			border: 1px solid var(--vscode-button-border, transparent);
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border-radius: 4px;
			cursor: pointer;
		}
		button:hover {
			background: var(--vscode-button-hoverBackground);
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="title">Spotify</div>
		<div class="status" id="status">Loading…</div>
		<div>
			<div class="label">Track</div>
			<div class="value" id="track">-</div>
		</div>
		<div>
			<div class="label">Artist</div>
			<div class="value" id="artist">-</div>
		</div>
		<div>
			<div class="label">Album</div>
			<div class="value" id="album">-</div>
		</div>
		<div class="buttons">
			<button data-command="previous">Previous</button>
			<button data-command="playpause">Play / Pause</button>
			<button data-command="next">Next</button>
		</div>
	</div>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		const statusEl = document.getElementById("status");
		const trackEl = document.getElementById("track");
		const artistEl = document.getElementById("artist");
		const albumEl = document.getElementById("album");

		function setStatus(message) {
			statusEl.textContent = message;
		}

		function setTrack(title, artist, album) {
			trackEl.textContent = title;
			artistEl.textContent = artist;
			albumEl.textContent = album;
		}

		window.addEventListener("message", (event) => {
			const message = event.data;
			if (!message) {
				return;
			}
			if (message.type === "track") {
				setStatus("");
				setTrack(message.title, message.artist, message.album);
			} else if (message.type === "status") {
				setStatus(message.message);
				setTrack("-", "-", "-");
			}
		});

		document.querySelectorAll("button[data-command]").forEach((button) => {
			button.addEventListener("click", () => {
				const command = button.getAttribute("data-command");
				vscode.postMessage({ type: "command", command });
			});
		});
	</script>
</body>
</html>`;
	}
}

function getNonce(): string {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i += 1) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function activate(context: vscode.ExtensionContext): void {
	const provider = new SpotifyViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(VIEW_TYPE, provider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("spotify.playpause", async () => {
			    await execHelper(context, "playpause", true);
			await provider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("spotify.next", async () => {
			    await execHelper(context, "next", true);
			await provider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("spotify.previous", async () => {
			    await execHelper(context, "previous", true);
			await provider.refresh();
		})
	);
}

export function deactivate(): void {}
