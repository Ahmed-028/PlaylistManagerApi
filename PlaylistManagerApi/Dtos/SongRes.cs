namespace PlaylistManagerApi.Dtos
{
    public class SongRes
    {
        public string Name { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; }
    }
}
