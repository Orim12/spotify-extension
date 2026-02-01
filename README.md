# Spotify Controller (Windows)

Control Spotify locally on Windows using Windows System Media Transport Controls (SMTC). No Spotify Web API, no OAuth, no internet.

## Features

- Sidebar (Activity Bar) view with track title, artist, and album
- Play / Pause, Next, Previous controls
- Uses a local C# helper (SMTC) for instant control
- Works only on Windows

## Requirements

- Windows 10/11
- Spotify desktop app running

## How it works

The extension starts a local .NET 6 helper that uses `GlobalSystemMediaTransportControlsSessionManager` to control Spotify and read track info. The sidebar view polls for track updates every few seconds and sends data to the webview.

## Usage

1. Build the helper (Release, single file):
	- `dotnet publish -c Release -r win-x64 /p:PublishSingleFile=true /p:SelfContained=true`
2. Reload the Extension Host.
3. Open the Spotify view from the Activity Bar.

## Commands

- Spotify: Play / Pause
- Spotify: Next
- Spotify: Previous

## Known issues

- If Spotify is closed, the view shows a status message and controls do nothing.

## Release notes

### 0.0.1

- Initial Windows-only release with SMTC control and sidebar view.
