using System.ComponentModel.DataAnnotations;

namespace PlaylistManagerApi.Dtos
{
    public class CreatePlaylistReq
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        //To add Playlist to users list
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive value.")]
        public int UserId { get; set; }
    }
}
