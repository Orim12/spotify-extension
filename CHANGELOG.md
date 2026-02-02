# Change Log

All notable changes to the "spotify-controller" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2026-02-02

### 🎉 First Major Release

The first stable release of Spotify Controller brings native Spotify control to VS Code on both Windows and macOS, without requiring any API keys, OAuth flows, or internet connection.

### ✨ Features

#### Core Functionality
- **Sidebar View**: Activity Bar integration displaying current track information
  - Track title
  - Artist name
  - Album name
  - Real-time updates every 3 seconds
- **Playback Controls**: Three essential commands accessible from both the sidebar and command palette
  - Play / Pause (`spotify.playpause`)
  - Next Track (`spotify.next`)
  - Previous Track (`spotify.previous`)
- **Local Control**: All operations happen locally on your machine
  - No Spotify Web API required
  - No OAuth authentication
  - No internet connection needed
  - Instant response times

#### Platform Support
- **Windows (win32)**: Uses Windows System Media Transport Controls (SMTC) via a native C# helper
  - Leverages `GlobalSystemMediaTransportControlsSessionManager` API
  - Direct integration with Windows media controls
  - Works with Windows 10 and Windows 11
- **macOS (darwin)**: Uses AppleScript via a Bash helper script
  - Native AppleScript integration with Spotify
  - Automatic script permissions management
  - Process detection using system tools

### 🔧 Technical Details

#### Architecture
- **Helper Client System**: Persistent connection to platform-specific helper processes
  - Server mode for continuous operation
  - Single-command fallback mode
  - Automatic process management and recovery
- **Cross-Platform Design**: Intelligent platform detection and helper selection
  - Automatic executable permissions on macOS
  - Platform-specific error messages
  - Consistent output format across platforms

#### Helper Executables
- **Windows**: `SpotifySmtcHelper.exe` - Compiled C# executable
- **macOS**: `spotify-helper.sh` - Bash script with AppleScript integration

### 📋 Requirements

#### Windows
- Windows 10 or Windows 11
- Spotify desktop application installed and running
- Visual Studio Code 1.108.1 or later

#### macOS
- macOS (tested on recent versions)
- Spotify desktop application installed and running
- AppleScript enabled (default on macOS)
- Visual Studio Code 1.108.1 or later

### 🎯 Usage

1. Install the extension from the VS Code marketplace
2. Ensure Spotify desktop app is running
3. Open the Spotify view from the Activity Bar (Spotify icon)
4. Use the sidebar buttons or command palette to control playback

### ⚠️ Known Limitations

- Extension only works when the Spotify desktop application is running
- If Spotify is closed, the view displays a status message and controls are inactive
- Requires Spotify desktop app (does not work with web player)
- Windows and macOS only (Linux support planned for future releases)

### 📝 Files Included

- Extension source code (`out/**`)
- Windows helper: `helper/SpotifySmtcHelper.exe`
- macOS helper: `helper/spotify-helper.sh`
- Media assets and icon
- Documentation

### 🙏 Acknowledgments

This release represents a complete rewrite focusing on:
- Cross-platform compatibility
- Simple, dependency-free operation
- Fast, local control
- Clean, modern UI integration

---

## [Unreleased]

- Future features and improvements will be listed here