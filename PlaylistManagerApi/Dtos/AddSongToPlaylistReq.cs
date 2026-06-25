namespace PlaylistManagerApi.Dtos
{
    public class AddSongToPlaylistReq
    {
        public string PlaylistName { get; set; } = string.Empty;
        public string SongName { get; set; } = string.Empty;

    }
}
