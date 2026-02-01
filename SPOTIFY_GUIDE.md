# Spotify Controller Extension - Setup Guide

This VS Code extension allows you to control Spotify directly from your editor!

## Features

- ▶ **Play** - Resume playback
- ⏸ **Pause** - Pause the current track
- ⏭ **Next Track** - Skip to the next track
- ⏮ **Previous Track** - Go back to the previous track
- 🎵 **Now Playing** - Display current track information
- 📊 **Status Bar** - Shows current track and progress (updates every 3 seconds)

## Setup Instructions

### 1. Get Spotify API Access Token

To use this extension, you need a Spotify API access token:

**Option A: Using Spotify Web API (Recommended)**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if needed)
3. Create a new application
4. Accept the terms and create the app
5. You'll get a **Client ID** and **Client Secret**

**Option B: Generate Access Token via Authorization Code Flow**

If you need an access token:
1. Visit: `https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-modify-playback-state%20user-read-playback-state%20user-read-currently-playing`
2. Replace `YOUR_CLIENT_ID` with your actual Client ID
3. After authorization, you'll get a code in the redirect URL
4. Exchange it for an access token using your Client ID and Client Secret

### 2. Set Up the Extension

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Search for and run the command: **"Spotify: Set Access Token"**
4. Paste your Spotify API access token when prompted
5. The token is saved securely in your VS Code settings

### 3. Make Sure Spotify is Running

- Open Spotify on any device (desktop, phone, web player, etc.)
- Make sure playback is on an active device
- The extension communicates with your active Spotify device

## Commands

Use `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to access these commands:

| Command | Description |
|---------|-------------|
| Spotify: Play | Resume playback on your active device |
| Spotify: Pause | Pause the current track |
| Spotify: Next Track | Skip to the next track |
| Spotify: Previous Track | Go to the previous track |
| Spotify: Show Now Playing | Display detailed info about the current track |
| Spotify: Set Access Token | Update your Spotify API access token |

## Status Bar

The extension adds a status bar item on the right side showing:
- Current playback status (▶ or ⏸)
- Track name (truncated to 30 characters)
- Current playback time

Click the status bar item to see the full "Now Playing" information.

## Troubleshooting

### "No active Spotify device found"
- Ensure Spotify is running on at least one device
- Open Spotify on your computer, phone, or web player

### "Access token is invalid or expired"
- Re-run the "Spotify: Set Access Token" command with a fresh token
- Tokens may expire after ~1 hour; get a new one if needed

### "Rate limited by Spotify API"
- Wait a moment and try again
- The API has rate limiting; multiple commands in quick succession may trigger this

### Commands don't work
- Verify your access token is set correctly
- Check that Spotify is running on an active device
- Open the VS Code developer console (Help → Toggle Developer Tools) for error messages

## Spotify API Scopes Required

This extension requires these Spotify API scopes:
- `user-modify-playback-state` - Control playback
- `user-read-playback-state` - Check current playback status
- `user-read-currently-playing` - Get currently playing track info

## API Rate Limits

Spotify API has rate limits. To avoid hitting them:
- Don't spam commands in quick succession
- Status bar updates every 3 seconds (respects limits)
- Use the commands reasonably throughout your coding session

## Privacy & Security

- Your access token is stored locally in VS Code settings
- The extension only communicates with Spotify's official API
- Your token is never shared or transmitted elsewhere

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your token in VS Code settings: Open Settings → Search "spotify-controller"
3. Check the VS Code output console for error details
4. Make sure Spotify is running and has an active playback device

Enjoy coding with your music! 🎵
