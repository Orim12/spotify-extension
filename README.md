# Spotify Controller

Control Spotify locally on **Windows** and **macOS** using native platform APIs. No Spotify Web API, no OAuth, no internet.

## Features

- Sidebar (Activity Bar) view with track title, artist, and album
- Play / Pause, Next, Previous controls
- Cross-platform support: Windows and macOS
- Platform-specific helpers for optimal performance:
  - **Windows**: Uses System Media Transport Controls (SMTC) via C# helper
  - **macOS**: Uses AppleScript via Bash helper
- Works locally without internet connection

## Requirements

- **Windows**: Windows 10 or Windows 11
- **macOS**: Recent macOS version with AppleScript support
- Spotify desktop app running

## How it works

The extension uses platform-specific helpers to control Spotify:

- **Windows**: A .NET 6 helper uses `GlobalSystemMediaTransportControlsSessionManager` to control Spotify and read track info
- **macOS**: A Bash script uses AppleScript to control Spotify and read track info

The sidebar view polls for track updates every few seconds and displays the information in a clean webview interface.

## Usage

### Windows
1. Build the C# helper (Release, single file):
   ```bash
   dotnet publish -c Release -r win-x64 /p:PublishSingleFile=true /p:SelfContained=true
   ```
2. Reload the Extension Host
3. Open the Spotify view from the Activity Bar

### macOS
1. The helper script is included and automatically configured
2. Reload the Extension Host
3. Open the Spotify view from the Activity Bar

## Commands

- Spotify: Play / Pause
- Spotify: Next
- Spotify: Previous

## Known issues

- If Spotify is closed, the view shows a status message and controls do nothing.

## Release notes

### 1.0.0

🎉 **First Major Release** - Full cross-platform support for Windows and macOS!

**Features:**
- ✅ Cross-platform support (Windows 10/11 and macOS)
- ✅ Sidebar view with real-time track information (title, artist, album)
- ✅ Playback controls: Play/Pause, Next, Previous
- ✅ Local control without API keys or OAuth
- ✅ Platform-specific helpers:
  - Windows: SMTC (System Media Transport Controls)
  - macOS: AppleScript integration
- ✅ Command palette integration
- ✅ Auto-updating track information every 3 seconds

**Requirements:**
- Windows 10/11 or macOS
- Spotify desktop app running
- VS Code 1.108.1+

**Known Limitations:**
- Only works with Spotify desktop app (not web player)
- Extension is inactive when Spotify is closed
- Linux support coming in future releases
