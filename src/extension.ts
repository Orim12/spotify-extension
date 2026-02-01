// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spotifyService } from './spotifyService';

let statusBarItem: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Spotify Controller extension is now active!');

	// Load token from settings
	const token = spotifyService.loadTokenFromSettings();
	
	if (!token) {
		vscode.window.showInformationMessage('Spotify Controller: Please set your access token in settings or use the "Spotify: Set Access Token" command.');
	}

	// Create status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'spotify-controller.nowPlaying';
	statusBarItem.text = '♪ Spotify';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('spotify-controller.play', handlePlay),
		vscode.commands.registerCommand('spotify-controller.pause', handlePause),
		vscode.commands.registerCommand('spotify-controller.next', handleNext),
		vscode.commands.registerCommand('spotify-controller.previous', handlePrevious),
		vscode.commands.registerCommand('spotify-controller.nowPlaying', handleNowPlaying),
		vscode.commands.registerCommand('spotify-controller.setToken', handleSetToken)
	);

	// Update status bar every 3 seconds
	setInterval(updateStatusBar, 3000);
}

async function handlePlay(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			await vscode.window.showErrorMessage('Spotify access token not set. Set it with the "Spotify: Set Access Token" command.');
			return;
		}
		await spotifyService.play();
		vscode.window.showInformationMessage('▶ Playing');
	} catch (error) {
		vscode.window.showErrorMessage(`Play failed: ${(error as Error).message}`);
	}
}

async function handlePause(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			await vscode.window.showErrorMessage('Spotify access token not set. Set it with the "Spotify: Set Access Token" command.');
			return;
		}
		await spotifyService.pause();
		vscode.window.showInformationMessage('⏸ Paused');
	} catch (error) {
		vscode.window.showErrorMessage(`Pause failed: ${(error as Error).message}`);
	}
}

async function handleNext(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			await vscode.window.showErrorMessage('Spotify access token not set. Set it with the "Spotify: Set Access Token" command.');
			return;
		}
		await spotifyService.next();
		vscode.window.showInformationMessage('⏭ Next track');
	} catch (error) {
		vscode.window.showErrorMessage(`Next track failed: ${(error as Error).message}`);
	}
}

async function handlePrevious(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			await vscode.window.showErrorMessage('Spotify access token not set. Set it with the "Spotify: Set Access Token" command.');
			return;
		}
		await spotifyService.previous();
		vscode.window.showInformationMessage('⏮ Previous track');
	} catch (error) {
		vscode.window.showErrorMessage(`Previous track failed: ${(error as Error).message}`);
	}
}

async function handleNowPlaying(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			await vscode.window.showErrorMessage('Spotify access token not set. Set it with the "Spotify: Set Access Token" command.');
			return;
		}
		const track = await spotifyService.getCurrentlyPlaying();
		
		if (!track) {
			vscode.window.showInformationMessage('No track is currently playing');
			return;
		}

		const progress = `${spotifyService.formatTime(track.progressMs)} / ${spotifyService.formatTime(track.durationMs)}`;
		const status = track.isPlaying ? '▶ Playing' : '⏸ Paused';
		
		vscode.window.showInformationMessage(
			`${status}\n\n🎵 ${track.name}\n👤 ${track.artist}\n💿 ${track.album}\n⏱ ${progress}`
		);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to get now playing: ${(error as Error).message}`);
	}
}

async function handleSetToken(): Promise<void> {
	const token = await vscode.window.showInputBox({
		prompt: 'Enter your Spotify API Access Token',
		password: true,
		placeHolder: 'Your access token...',
	});

	if (token) {
		try {
			await spotifyService.saveTokenToSettings(token);
			vscode.window.showInformationMessage('✓ Spotify access token saved successfully');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to save token: ${(error as Error).message}`);
		}
	}
}

async function updateStatusBar(): Promise<void> {
	try {
		if (!spotifyService.getAccessToken()) {
			statusBarItem.text = '♪ Spotify (no token)';
			return;
		}

		const track = await spotifyService.getCurrentlyPlaying();
		
		if (!track) {
			statusBarItem.text = '♪ Spotify (nothing playing)';
			return;
		}

		const status = track.isPlaying ? '▶' : '⏸';
		const progress = `${spotifyService.formatTime(track.progressMs)}`;
		statusBarItem.text = `${status} ${track.name.substring(0, 30)} ${progress}`;
	} catch (error) {
		statusBarItem.text = '♪ Spotify (error)';
		console.log('Status bar update error:', (error as Error).message);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
