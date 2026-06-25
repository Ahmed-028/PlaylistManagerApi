using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Data;
using PlaylistManagerApi.Dtos;
using PlaylistManagerApi.Models;
using System.Xml.Linq;
using static Azure.Core.HttpHeader;

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
                PublishDate = DateTime.Now

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
            var result = context.Songs.FromSqlRaw("SELECT * From Songs WHERE Name = {0}",name).Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }

        public async Task<List<SongRes>> GetSongsByArtistAsync(string artistName)
        {
            var result = context.Songs.FromSqlRaw("SELECT * From Songs WHERE Artist = {0}", artistName).Select(s => new SongRes { Id = s.Id, Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }


    }
}
