using System.ComponentModel.DataAnnotations;

namespace PlaylistManagerApi.Dtos
{
    public class AddSongToPlaylistReq
    {
        // Use ID instead of name for accuracy
        [Range(1, int.MaxValue, ErrorMessage = "PlaylistId must be a positive value.")]
        public int PlaylistId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "SongId must be a positive value.")]
        public int SongId { get; set; }

        // For ownership validation
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive value.")]
        public int UserId { get; set; }      

    }
}
