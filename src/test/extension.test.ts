import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
	const extensionId = "spotify-controller";

	test("Extension activates", async () => {
		const extension = vscode.extensions.getExtension(extensionId);
		assert.ok(extension, "Extension not found");

		await extension!.activate();
		assert.strictEqual(extension!.isActive, true);
	});

	test("Commands are registered", async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes("spotify.playpause"));
		assert.ok(commands.includes("spotify.next"));
		assert.ok(commands.includes("spotify.previous"));
	});
});
