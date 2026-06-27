using System.ComponentModel.DataAnnotations;

namespace PlaylistManagerApi.Dtos
{
    public class UpdatePlaylistReq
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive value.")]
        public int UserId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "UserId must be a positive value.")]
        public int PlaylistId { get; set; }


    }
}
