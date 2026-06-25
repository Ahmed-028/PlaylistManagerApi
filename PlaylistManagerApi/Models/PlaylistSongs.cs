using Microsoft.EntityFrameworkCore;

namespace PlaylistManagerApi.Models
{
    //The Primary Key will be a composite key using PlaylistID and OrderInPlaylist
    [PrimaryKey(nameof(PlaylistId), nameof(OrderInPlaylist))]
    public class PlaylistSongs
    {
        public int PlaylistId { get; set; }
        public int SongId { get; set; }
        public int OrderInPlaylist { get; set; }

    }
}
