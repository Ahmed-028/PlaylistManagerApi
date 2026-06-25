using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public interface IPlaylistService
    {
        Task<List<Playlist>> GetAllPlaylistsAsync();

        Task<List<Playlist>> GetPlaylistByNameAsync(String name);

        Task<Playlist> AddPlaylistAsync(Playlist playlist);

        Task<Playlist> AddSongToPlaylistAsync(Song song);

        Task<bool> DeletePlaylistAsync(Playlist playlist);

    }
}
