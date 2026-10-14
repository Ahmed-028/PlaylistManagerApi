using PlaylistManagerApi.Dtos;


namespace PlaylistManagerApi.Services
{
    public interface IPlaylistService
    {
        //Get all Playlists of a specific User
        Task<List<PlaylistRes>> GetUserPlaylistsAsync(int UserId);

        Task<List<PlaylistRes>> GetPlaylistByNameAsync(String name);

        Task<PlaylistRes?> GetPlaylistByIdAsync(int Id);

        //Get the songs of a Playlist in order (null if the Playlist doesn't exist)
        Task<List<PlaylistSongRes>?> GetPlaylistSongsAsync(int playlistId);

        Task<PlaylistRes> AddPlaylistAsync(CreatePlaylistReq playlist);

        Task<PlaylistSongRes> AddSongToPlaylistAsync(AddSongToPlaylistReq request);

        Task<bool> DeletePlaylistAsync(int playlistId, int userId);

        Task<bool> UpdatePlaylistAsync(UpdatePlaylistReq request);

    }
}
