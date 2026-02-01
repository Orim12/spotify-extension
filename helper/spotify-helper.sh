#!/bin/bash

# Spotify Helper for macOS
# This script provides the same interface as the Windows helper but uses AppleScript

if [[ "$1" == "--server" ]]; then
    # Server mode: read commands from stdin
    while IFS= read -r line; do
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*$ ]]; then
            continue
        fi
        
        # Parse command and options
        read -ra parts <<< "$line"
        command="${parts[0]}"
        noinfo=false
        for arg in "${parts[@]:1}"; do
            if [[ "$arg" == "--noinfo" ]]; then
                noinfo=true
            fi
        done
        
        # Execute command
        handle_command "$command" "$noinfo"
    done
else
    # Single command mode
    command="$1"
    noinfo=false
    for arg in "$@"; do
        if [[ "$arg" == "--noinfo" ]]; then
            noinfo=true
        fi
    done
    
    handle_command "$command" "$noinfo"
fi

handle_command() {
    local command="$1"
    local noinfo="$2"
    
    # Check if Spotify is running
    if ! pgrep -q "Spotify"; then
        echo "Spotify not running"
        return
    fi
    
    case "$command" in
        playpause)
            osascript -e 'tell application "Spotify" to playpause'
            ;;
        next)
            osascript -e 'tell application "Spotify" to next track'
            ;;
        previous)
            osascript -e 'tell application "Spotify" to previous track'
            ;;
        get|*)
            # Default: get current track info
            ;;
    esac
    
    # Handle info output
    if [[ "$noinfo" == "true" && "$command" != "get" ]]; then
        echo "OK"
    else
        # Get track information via AppleScript
        local track_info
        track_info=$(osascript <<'APPLESCRIPT'
try
    tell application "Spotify"
        set trackName to name of current track
        set artistName to artist of current track
        set albumName to album of current track
        return trackName & "|" & artistName & "|" & albumName
    end tell
on error
    return "Spotify not running"
end try
APPLESCRIPT
)
        echo "$track_info"
    fi
}

export -f handle_command
