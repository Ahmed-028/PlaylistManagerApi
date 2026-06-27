using System.ComponentModel.DataAnnotations;

namespace PlaylistManagerApi.Dtos
{
    public class AddUserReq
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
    }
}
