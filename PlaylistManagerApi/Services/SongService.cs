using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;


namespace PlaylistManagerApi.Services
{
    public class SongService(AppDbContext context) : ISongService
    {

        public async Task<SongRes?> GetSongByIdAsync(int id)
        {
            return await context.Songs.Where(s => s.Id == id).Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).FirstOrDefaultAsync();
        }


        public async Task<SongRes> AddSongAsync(CreateSongReq song)
        {
            var newSong = new Song
            {
                Name = song.Name,
                Artist = song.Artist,
                PublishDate = DateTime.UtcNow

            };

            context.Songs.Add(newSong);
            await context.SaveChangesAsync();

            return new SongRes
            {
                Id = newSong.Id,
                Name = newSong.Name,
                Artist= newSong.Artist,
                PublishDate= newSong.PublishDate

            };
        }


        public async Task<List<SongRes>> GetAllSongsAsync() 
        {
            return await context.Songs.Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate}).ToListAsync();
        }

        public async Task<List<SongRes>> GetSongByNameAsync(string name)
        {
            var result = context.Songs.Where(s => s.Name.Contains(name)).Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }

        public async Task<List<SongRes>> GetSongsByArtistAsync(string artistName)
        {
            var result = context.Songs.Where(s => s.Artist.Contains(artistName)).Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }


    }
}
