using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public class PlaylistService(AppDbContext context) : IPlaylistService
    {

        public Task<Playlist> AddPlaylistAsync(Playlist playlist)
        {
            throw new NotImplementedException();
        }

        public Task<Playlist> AddSongToPlaylistAsync(Song song)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeletePlaylistAsync(Playlist playlist)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Playlist>> GetAllPlaylistsAsync()
        {
            return await context.Playlists.ToListAsync();
        }

        public async Task<List<Playlist>> GetPlaylistByNameAsync(string name)
        {
            var result = context.Playlists.FromSqlRaw("SELECT * From Songs WHERE Name = {0}", name).ToListAsync();
            return await result;
        }
    }
}
