namespace PlaylistManagerApi.Dtos
{
    public class PlaylistSongRes
    {
        public string PlaylistName { get; set; } = string.Empty;
        public int PlaylistId { get; set; } 
        public string SongName { get; set; } = string.Empty;
        public int SongId { get; set; }
        public int OrderInPlaylist { get; set; }


    }
}
