using Microsoft.EntityFrameworkCore;

namespace PlaylistManagerApi.Models
{
    //The Primary Key will be a composite key using PlaylistID and SongId
    [PrimaryKey(nameof(PlaylistId), nameof(SongId))]
    public class PlaylistSongs
    {
        public int PlaylistId { get; set; }
        public int SongId { get; set; }
        public int OrderInPlaylist { get; set; }
        public Playlist? Playlist { get; set; }
        public Song? Song { get; set; }

    }
}
