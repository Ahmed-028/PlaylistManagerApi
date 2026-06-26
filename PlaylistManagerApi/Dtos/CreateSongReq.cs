using System.ComponentModel.DataAnnotations;

namespace PlaylistManagerApi.Dtos
{
    public class CreateSongReq
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Artist { get; set; } = string.Empty;
        //public DateTime PublishDate { get; set; } 
    }
}
