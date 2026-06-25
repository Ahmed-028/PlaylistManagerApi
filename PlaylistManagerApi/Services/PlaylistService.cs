using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public class PlaylistService(AppDbContext context) : IPlaylistService
    {

        public async Task<PlaylistRes> AddPlaylistAsync(CreatePlaylistReq playlist)
        {
            var newPlaylist = new Playlist
            {
                Name = playlist.Name,
                CreationDate = DateTime.Now

            };

            context.Playlists.Add(newPlaylist);
            await context.SaveChangesAsync();

            return new PlaylistRes
            {
                Id = newPlaylist.Id,
                Name = newPlaylist.Name,
                CreationDate = newPlaylist.CreationDate
            };
        }

        public async Task<PlaylistSongRes> AddSongToPlaylistAsync(AddSongToPlaylistReq songandplay)
        {
            var pid = GetPlaylistByNameAsync(songandplay.PlaylistName).Result.First().Id;

            var sid = context.Songs.FromSqlRaw("SELECT * From Songs WHERE Name = {0}", songandplay.SongName).First().Id;

            var newPlaylistSongs = new PlaylistSongs
            {
                PlaylistId = pid,
                SongId = sid

            };

            context.PlaylistSongs.Add(newPlaylistSongs);
            await context.SaveChangesAsync();

            return new PlaylistSongRes
            {
                PlaylistId = newPlaylistSongs.PlaylistId,
                PlaylistName = songandplay.PlaylistName,
                SongId = sid,
                SongName = songandplay.SongName,
                OrderInPlaylist = newPlaylistSongs.OrderInPlaylist

            };
        }

        public Task<bool> DeletePlaylistAsync(Playlist playlist)
        {
            throw new NotImplementedException();
        }

        public async Task<List<PlaylistRes>> GetAllPlaylistsAsync()
        {
            return await context.Playlists.Select(p => new PlaylistRes { Id = p.Id, Name = p.Name, CreationDate = p.CreationDate }).ToListAsync();
        }

        public async Task<PlaylistRes?> GetPlaylistByIdAsync(int Id)
        {
            return await context.Playlists.Where(p => p.Id == Id).Select(p => new PlaylistRes { Id = p.Id, Name = p.Name,CreationDate = p.CreationDate }).FirstOrDefaultAsync();
        }

        public async Task<List<PlaylistRes>> GetPlaylistByNameAsync(string name)
        {
            var result = context.Playlists.FromSqlRaw("SELECT * From Songs WHERE Name = {0}", name).Select(p => new PlaylistRes { Id = p.Id, Name = p.Name, CreationDate = p.CreationDate }).ToListAsync();
            return await result;
        }
    }
}
