namespace PlaylistManagerApi.Models
{
    public class Playlist
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }

        // Foreign key to User
        public int UserId { get; set; }
        public User? User { get; set; }

        //To save songs into Playlist
        public ICollection<PlaylistSongs> PlaylistSongs { get; set; } = new List<PlaylistSongs>();

    }
}
