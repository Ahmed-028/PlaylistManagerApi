namespace PlaylistManagerApi.Dtos
{
    public class CreateSongReq
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; }
    }
}
