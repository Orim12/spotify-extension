using System;
using System.Linq;
using System.Threading.Tasks;
using Windows.Media.Control;

namespace SpotifySmtcHelper
{
    internal class Program
    {
        private static async Task<int> Main(string[] args)
        {
            if (args.Any(arg => arg.Equals("--server", StringComparison.OrdinalIgnoreCase)))
            {
                await RunServerAsync();
                return 0;
            }

            var manager =
                await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();

            string commandLine = args.Length > 0 ? string.Join(" ", args) : "get";
            await HandleCommandAsync(manager, commandLine, false);
            return 0;
        }

        private static async Task RunServerAsync()
        {
            var manager =
                await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();

            while (true)
            {
                string? line = Console.ReadLine();
                if (line is null)
                {
                    break;
                }

                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                await HandleCommandAsync(manager, line, true);
            }
        }

        private static async Task HandleCommandAsync(
            GlobalSystemMediaTransportControlsSessionManager manager,
            string commandLine,
            bool serverMode)
        {
            string[] parts = commandLine
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            string command = parts.Length > 0 ? parts[0].ToLowerInvariant() : "get";
            bool noInfo = parts.Any(part => part.Equals("--noinfo", StringComparison.OrdinalIgnoreCase));

            var spotifySession = manager
                .GetSessions()
                .FirstOrDefault(session =>
                    !string.IsNullOrWhiteSpace(session.SourceAppUserModelId) &&
                    session.SourceAppUserModelId.Contains("Spotify", StringComparison.OrdinalIgnoreCase));

            if (spotifySession is null)
            {
                Console.WriteLine("Spotify not running");
                return;
            }

            switch (command)
            {
                case "playpause":
                    await spotifySession.TryTogglePlayPauseAsync();
                    break;

                case "next":
                    await spotifySession.TrySkipNextAsync();
                    break;

                case "previous":
                    await spotifySession.TrySkipPreviousAsync();
                    break;
            }

            if (noInfo)
            {
                if (serverMode)
                {
                    Console.WriteLine("OK");
                }
                return;
            }

            var media = await spotifySession.TryGetMediaPropertiesAsync();

            string title = media.Title ?? string.Empty;
            string artist = media.Artist ?? string.Empty;
            string album = media.AlbumTitle ?? string.Empty;

            if (string.IsNullOrWhiteSpace(title) &&
                string.IsNullOrWhiteSpace(artist) &&
                string.IsNullOrWhiteSpace(album))
            {
                Console.WriteLine("No track playing");
                return;
            }

            Console.WriteLine($"{title}|{artist}|{album}");
        }
    }
}
