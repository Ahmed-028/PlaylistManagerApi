namespace PlaylistManagerApi.Dtos
{
    public class CreatePlaylistReq
    {
        public string Name { get; set; } = string.Empty;

        //To add Playlist to users list
        public int UserId { get; set; }
    }
}
