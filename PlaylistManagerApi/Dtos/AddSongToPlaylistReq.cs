namespace PlaylistManagerApi.Dtos
{
    public class AddSongToPlaylistReq
    {
        // Use ID instead of name for accuracy
        public int PlaylistId { get; set; }   
        public int SongId { get; set; }

        // For ownership validation
        public int UserId { get; set; }      

    }
}
