using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public interface IPlaylistService
    {
        Task<List<PlaylistRes>> GetAllPlaylistsAsync();

        Task<List<PlaylistRes>> GetPlaylistByNameAsync(String name);

        Task<PlaylistRes?> GetPlaylistByIdAsync(int Id);

        Task<PlaylistRes> AddPlaylistAsync(CreatePlaylistReq playlist);

        Task<PlaylistSongRes> AddSongToPlaylistAsync(AddSongToPlaylistReq songandplaylist);

        Task<bool> DeletePlaylistAsync(Playlist playlist);

    }
}
