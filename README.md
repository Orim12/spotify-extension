# Spotify Controller

Control Spotify locally across Windows and macOS. No Spotify Web API, no OAuth, no internet required.

## Features

- Sidebar (Activity Bar) view with track title, artist, and album
- Play / Pause, Next, Previous controls
- **Windows**: Uses a local C# helper (SMTC) for instant control
- **macOS**: Uses AppleScript for native integration
- Works on Windows 10/11 and macOS
- Real-time track information polling

## Requirements

### Windows
- Windows 10/11
- Spotify desktop app running

### macOS
- macOS 10.12 or later
- Spotify desktop app running

## How it works

**Windows**: The extension starts a local .NET 6 helper that uses `GlobalSystemMediaTransportControlsSessionManager` to control Spotify and read track info.

**macOS**: The extension uses embedded AppleScript commands to communicate with Spotify.

The sidebar view polls for track updates every few seconds and sends data to the webview.

## Usage

### For Users
1. Install the extension from the VS Code Marketplace
2. Open the Spotify view from the Activity Bar
3. Use the Play / Pause, Next, and Previous buttons to control playback

### For Developers

#### Windows
1. Build the helper (Release, single file):
   - `dotnet publish -c Release -r win-x64 /p:PublishSingleFile=true /p:SelfContained=true`
2. Reload the Extension Host.
3. Open the Spotify view from the Activity Bar.

#### macOS
1. The AppleScript helper is embedded in the extension
2. No additional setup required
3. Reload the Extension Host and open the Spotify view

## Commands

- Spotify: Play / Pause
- Spotify: Next
- Spotify: Previous

## Known issues

- If Spotify is closed, the view shows a status message and controls do nothing.

## Release notes

### 1.0.0

- **Major release**: Added full macOS support with embedded AppleScript integration
- Updated extension to work seamlessly across Windows and macOS
- Refactored macOS helper to be embedded in the extension (no external file needed)
- Improved error handling and messaging

### 0.0.1

- Initial Windows-only release with SMTC control and sidebar view.
