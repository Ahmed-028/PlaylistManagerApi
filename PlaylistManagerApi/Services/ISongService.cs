using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public interface ISongService
    {
        Task<List<Song>> GetAllSongsAsync();

        Task<List<Song>> GetSongByNameAsync(String name);

        Task<List<Song>> GetSongsByArtistAsync(String artistName);

        Task<Song> AddSongAsync(Song song);

        Task<bool> UpdateSongAsync(Song song);

        Task<bool> DeleteSongAsync(Song song);
    }
}
