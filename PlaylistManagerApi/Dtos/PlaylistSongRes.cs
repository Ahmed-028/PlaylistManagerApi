namespace PlaylistManagerApi.Dtos
{
    public class PlaylistSongRes
    {
        public int PlaylistId { get; set; }
        public string PlaylistName { get; set; } = string.Empty;
        public int SongId { get; set; }
        public string SongName { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public int OrderInPlaylist { get; set; }


    }
}
