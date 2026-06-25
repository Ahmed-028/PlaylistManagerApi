namespace PlaylistManagerApi.Dtos
{
    public class PlaylistRes
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        //To return which user this playlist belongs to
        public int UserId { get; set; }
    }
}
