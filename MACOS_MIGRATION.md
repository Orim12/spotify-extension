# macOS Compatibility Migration

**Date:** February 1, 2026  
**Status:** ✅ Complete

## Overview

This document outlines all changes made to add macOS support to the Spotify Extension. The extension previously only supported Windows but now supports both **Windows (win32)** and **macOS (darwin)**.

---

## Changes Made

### 1. **Platform-Specific Helper Path Resolution**
**File:** [src/extension.ts](../src/extension.ts)

#### Before:
```typescript
const HELPER_RELATIVE_PATH = path.join("helper", "SpotifySmtcHelper.exe");

function getHelperPath(context: vscode.ExtensionContext): string {
	return context.asAbsolutePath(HELPER_RELATIVE_PATH);
}
```

#### After:
```typescript
function getHelperPath(context: vscode.ExtensionContext): string {
	const platform = process.platform;
	
	if (platform === "darwin") {
		// macOS
		return context.asAbsolutePath(path.join("helper", "spotify-helper.sh"));
	} else {
		// Windows
		return context.asAbsolutePath(path.join("helper", "SpotifySmtcHelper.exe"));
	}
}
```

**Reason:** The extension now detects the runtime platform and uses the appropriate helper executable:
- Windows: `SpotifySmtcHelper.exe` (C# Windows SMTC helper)
- macOS: `spotify-helper.sh` (Bash script using AppleScript)

---

### 2. **File Permissions for macOS**
**File:** [src/extension.ts](../src/extension.ts) - `HelperClient.start()` method

#### Added:
```typescript
// Make helper executable on macOS
if (process.platform === "darwin") {
	fs.chmodSync(helperPath, 0o755);
}
```

**Reason:** Shell scripts on macOS need execute permissions. The extension automatically sets `chmod 755` on the helper script when running on macOS.

---

### 3. **Updated Error Messages**
**File:** [src/extension.ts](../src/extension.ts) - `execHelperOnce()` function

#### Before:
```typescript
if (!fs.existsSync(helperPath)) {
	resolve("Helper not built. Build helper/SpotifySmtcHelper.csproj.");
	return;
}
```

#### After:
```typescript
if (!fs.existsSync(helperPath)) {
	if (process.platform === "darwin") {
		resolve("Helper not found. Ensure helper/spotify-helper.sh is included.");
	} else {
		resolve("Helper not built. Build helper/SpotifySmtcHelper.csproj.");
	}
	return;
}
```

**Reason:** Different platforms have different error messages since the helpers are different types of executables.

---

### 4. **New macOS Helper Script**
**File:** [helper/spotify-helper.sh](../helper/spotify-helper.sh) (NEW)

#### Implementation:
A Bash script that provides the same CLI interface as the Windows C# helper but uses AppleScript to control Spotify on macOS.

**Features:**
- **Server mode:** `spotify-helper.sh --server` - Reads commands from stdin
- **Single command mode:** `spotify-helper.sh get|playpause|next|previous [--noinfo]`
- **Output format:** Same as Windows helper: `TITLE|ARTIST|ALBUM`
- **Status messages:** Returns "Spotify not running" if Spotify is not active

**Commands:**
- `get` - Returns current track info (title|artist|album)
- `playpause` - Toggles play/pause
- `next` - Skips to next track
- `previous` - Skips to previous track
- `--noinfo` flag - Suppresses track info output (returns "OK" instead)

**AppleScript Integration:**
```applescript
tell application "Spotify"
    set trackName to name of current track
    set artistName to artist of current track
    set albumName to album of current track
    return trackName & "|" & artistName & "|" & albumName
end tell
```

---

### 5. **Package Configuration Updates**
**File:** [package.json](../package.json)

#### OS Support:
```json
"os": [
  "win32",
  "darwin"
]
```

**Change:** Added "darwin" (macOS) to the supported operating systems list.

#### Bundled Files:
```json
"files": [
  "out/**",
  "media/**",
  "helper/SpotifySmtcHelper.exe",
  "helper/spotify-helper.sh",
  "package.json",
  "README.md"
]
```

**Change:** Added `helper/spotify-helper.sh` to the files list so it's included in the extension package for macOS users.

---

## Platform-Specific Behavior

| Feature | Windows | macOS |
|---------|---------|-------|
| Helper Type | C# Executable (.exe) | Bash Script (.sh) |
| Control Method | Windows SMTC API | AppleScript |
| Spotify Detection | App User Model ID | Process search (pgrep) |
| Execution | Direct spawn | Shell execution |
| File Permissions | Not required | Auto-set to 0o755 |

---

## Installation Requirements

### Windows
- Spotify desktop app installed
- Visual Studio build of `SpotifySmtcHelper.csproj` included in extension

### macOS
- Spotify desktop app installed
- AppleScript enabled (usually default)
- Script permissions automatically configured by extension

---

## Testing Checklist

- [ ] Windows: Extension loads and detects Spotify playback
- [ ] Windows: Play/Pause button works
- [ ] Windows: Next/Previous buttons work
- [ ] macOS: Extension loads and detects Spotify playback
- [ ] macOS: Play/Pause button works
- [ ] macOS: Next/Previous buttons work
- [ ] Both: Status updates when track changes
- [ ] Both: Displays "Spotify not running" when app is closed

---

## Future Enhancements

1. **Linux Support:** Add support for Linux using DBus (MPRIS interface)
2. **Error Handling:** Improve error messages for specific failure scenarios
3. **Configuration:** Allow users to customize polling intervals or enable/disable features per platform
4. **Code Signing:** Sign macOS helper script for better security
5. **Apple Silicon:** Test and verify compatibility with Apple Silicon Macs

---

## Technical Notes

- The `HelperClient` class in `extension.ts` now works cross-platform without modifications
- The `parseHelperOutput()` function uses the same `TITLE|ARTIST|ALBUM` format for both platforms
- TypeScript compilation remains the same; no platform-specific build steps needed for the extension itself
- Only the helper executables differ per platform

---

## Summary of Files Modified

1. ✅ [src/extension.ts](../src/extension.ts) - Platform detection and error handling
2. ✅ [package.json](../package.json) - OS support and bundled files
3. ✅ [helper/spotify-helper.sh](../helper/spotify-helper.sh) - NEW: macOS helper script

**Total changes:** 2 files modified + 1 new file created
