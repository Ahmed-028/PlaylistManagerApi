using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public interface IPlaylistService
    {
        //Get all Playlists of a specific User
        Task<List<PlaylistRes>> GetUserPlaylistsAsync(int UserId);

        Task<List<PlaylistRes>> GetPlaylistByNameAsync(String name);

        Task<PlaylistRes?> GetPlaylistByIdAsync(int Id);

        Task<PlaylistRes> AddPlaylistAsync(CreatePlaylistReq playlist);

        Task<PlaylistSongRes> AddSongToPlaylistAsync(AddSongToPlaylistReq request);

        Task<bool> DeletePlaylistAsync(int playlistId, int userId);

    }
}
