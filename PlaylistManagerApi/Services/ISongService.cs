using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public interface ISongService
    {
        Task<List<SongRes>> GetAllSongsAsync();

        Task<SongRes?> GetSongByIdAsync(int id);

        Task<List<SongRes>> GetSongByNameAsync(String name);

        Task<List<SongRes>> GetSongsByArtistAsync(String artistName);

        Task<SongRes> AddSongAsync(CreateSongReq song);


    }
}
