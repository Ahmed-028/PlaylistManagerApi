using Azure.Core;
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
            var user = await context.Users.FindAsync(playlist.UserId);
            if (user == null)
            {
                throw new ArgumentException("User not found.");
            }
                
            var newPlaylist = new Playlist
            {
                Name = playlist.Name,
                CreationDate = DateTime.Now,
                UserId = playlist.UserId

            };

            context.Playlists.Add(newPlaylist);
            await context.SaveChangesAsync();

            return new PlaylistRes
            {
                Id = newPlaylist.Id,
                Name = newPlaylist.Name,
                CreationDate = newPlaylist.CreationDate,
                UserId = newPlaylist.UserId
            };
        }

        public async Task<PlaylistSongRes> AddSongToPlaylistAsync(AddSongToPlaylistReq request)
        {
            //var tempPlaylist = GetPlaylistByIdAsync(request.PlaylistId);

            var tempPlaylist = await context.Playlists.Include(p => p.PlaylistSongs).FirstOrDefaultAsync(p => p.Id == request.PlaylistId && p.UserId == request.UserId);
            if (tempPlaylist == null) 
            {
                throw new ArgumentException("Playlist Not Found or it is not yours");
            }

            var song = await context.Songs.FindAsync(request.SongId);

            if (song == null)
            {
                throw new ArgumentException("Song Not Found");
            }

            if (tempPlaylist.PlaylistSongs.Any(ps => ps.SongId == request.SongId))
            {
                throw new InvalidOperationException("Song Already in Playlist");
            }

            int nextOrder;
            var last = tempPlaylist.PlaylistSongs.LastOrDefault();

            if (last == null)
            {
                nextOrder = 1;
            }
            else
            {
                nextOrder = last.OrderInPlaylist + 1;
            }
            


            var newPlaylistSongs = new PlaylistSongs
            {
                PlaylistId = request.PlaylistId,
                OrderInPlaylist = nextOrder,
                SongId = request.SongId

            };

            context.PlaylistSongs.Add(newPlaylistSongs);
            await context.SaveChangesAsync();

            return new PlaylistSongRes
            {
                PlaylistId = newPlaylistSongs.PlaylistId,
                PlaylistName = tempPlaylist.Name,
                OrderInPlaylist = newPlaylistSongs.OrderInPlaylist,
                SongName = song.Name,
                SongId = song.Id,
                Artist = song.Artist

            };
        }


        public async Task<List<PlaylistRes>> GetUserPlaylistsAsync(int userId)
        {
            var result = context.Playlists.Where(p => p.UserId == userId).Select(p => new PlaylistRes { Id = p.Id, Name = p.Name, CreationDate = p.CreationDate, UserId = p.UserId }).ToListAsync();
            return await result;
        }

        public async Task<PlaylistRes?> GetPlaylistByIdAsync(int Id)
        {
            return await context.Playlists.Where(p => p.Id == Id).Select(p => new PlaylistRes { Id = p.Id, Name = p.Name,CreationDate = p.CreationDate, UserId = p.UserId }).FirstOrDefaultAsync();
        }

        public async Task<List<PlaylistRes>> GetPlaylistByNameAsync(string name)
        {
            var result = context.Playlists.Where(p => p.Name.Contains(name)).Select(p => new PlaylistRes { Id = p.Id, Name = p.Name, CreationDate = p.CreationDate, UserId = p.UserId }).ToListAsync();
            return await result;
        }

        public async Task<bool> DeletePlaylistAsync(int playlistId, int userId)
        {
            var tempPlaylist = await context.Playlists.Include(p => p.PlaylistSongs).FirstOrDefaultAsync(p => p.Id == playlistId && p.UserId == userId);
            if (tempPlaylist == null)
            {
                return false;
            }
            context.Playlists.Remove(tempPlaylist);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
