import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface CurrentlyPlayingTrack {
	name: string;
	artist: string;
	album: string;
	isPlaying: boolean;
	progressMs: number;
	durationMs: number;
}

export class SpotifyService {
	private api: AxiosInstance;
	private accessToken: string = '';

	constructor() {
		this.api = axios.create({
			baseURL: 'https://api.spotify.com/v1',
		});
	}

	/**
	 * Set the access token for Spotify API requests
	 */
	setAccessToken(token: string): void {
		this.accessToken = token;
		this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	/**
	 * Get the current access token
	 */
	getAccessToken(): string {
		return this.accessToken;
	}

	/**
	 * Load access token from VS Code settings
	 */
	loadTokenFromSettings(): string | undefined {
		const config = vscode.workspace.getConfiguration('spotify-controller');
		const token = config.get<string>('accessToken');
		if (token) {
			this.setAccessToken(token);
		}
		return token;
	}

	/**
	 * Save access token to VS Code settings
	 */
	async saveTokenToSettings(token: string): Promise<void> {
		const config = vscode.workspace.getConfiguration('spotify-controller');
		await config.update('accessToken', token, vscode.ConfigurationTarget.Global);
		this.setAccessToken(token);
	}

	/**
	 * Play the current track
	 */
	async play(): Promise<void> {
		try {
			await this.api.put('/me/player/play');
		} catch (error) {
			throw this.handleError(error, 'Failed to play track');
		}
	}

	/**
	 * Pause the current track
	 */
	async pause(): Promise<void> {
		try {
			await this.api.put('/me/player/pause');
		} catch (error) {
			throw this.handleError(error, 'Failed to pause track');
		}
	}

	/**
	 * Skip to the next track
	 */
	async next(): Promise<void> {
		try {
			await this.api.post('/me/player/next');
		} catch (error) {
			throw this.handleError(error, 'Failed to skip to next track');
		}
	}

	/**
	 * Go to the previous track
	 */
	async previous(): Promise<void> {
		try {
			await this.api.post('/me/player/previous');
		} catch (error) {
			throw this.handleError(error, 'Failed to go to previous track');
		}
	}

	/**
	 * Get currently playing track information
	 */
	async getCurrentlyPlaying(): Promise<CurrentlyPlayingTrack | null> {
		try {
			const response = await this.api.get('/me/player/currently-playing');
			
			if (!response.data || !response.data.item) {
				return null;
			}

			const item = response.data.item;
			const artistName = item.artists && item.artists.length > 0 
				? item.artists[0].name 
				: 'Unknown Artist';

			return {
				name: item.name,
				artist: artistName,
				album: item.album?.name || 'Unknown Album',
				isPlaying: response.data.is_playing,
				progressMs: response.data.progress_ms || 0,
				durationMs: item.duration_ms || 0,
			};
		} catch (error) {
			throw this.handleError(error, 'Failed to get currently playing track');
		}
	}

	/**
	 * Format time in milliseconds to MM:SS
	 */
	formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	/**
	 * Handle errors from API calls
	 */
	private handleError(error: any, message: string): Error {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				return new Error('Spotify access token is invalid or expired. Please set a new token.');
			}
			if (error.response?.status === 404) {
				return new Error('No active Spotify device found. Open Spotify on any device and try again.');
			}
			if (error.response?.status === 429) {
				return new Error('Rate limited by Spotify API. Please wait a moment and try again.');
			}
			return new Error(`${message}: ${error.response?.statusText || error.message}`);
		}
		return new Error(`${message}: ${(error as Error).message}`);
	}
}

export const spotifyService = new SpotifyService();
