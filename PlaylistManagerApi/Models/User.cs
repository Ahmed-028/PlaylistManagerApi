namespace PlaylistManagerApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        //The Playlists belonging to user
        public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();

    }
}
