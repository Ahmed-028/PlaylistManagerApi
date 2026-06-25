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

        public async Task<Song?> GetSongByIdAsync(int id)
        {
            return await context.Songs.Where(s => s.Id == id).FirstOrDefaultAsync();
        }


        public Task<SongRes> AddSongAsync(CreateSongReq song)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteSongAsync(Song song)
        {
            throw new NotImplementedException();
        }

        public async Task<List<SongRes>> GetAllSongsAsync() 
        {
            return await context.Songs.Select(s => new SongRes { Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate}).ToListAsync();
        }

        public async Task<List<SongRes>> GetSongByNameAsync(string name)
        {
            //List<Song> result = testList.FindAll(s => s.Name.ToLower().Equals(name.ToLower()));
            var result = context.Songs.FromSqlRaw("SELECT * From Songs WHERE Name = {0}",name).Select(s => new SongRes { Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }

        public async Task<List<SongRes>> GetSongsByArtistAsync(string artistName)
        {
            //List<Song> result = testList.FindAll(s => s.Artist.Equals(artistName));
            //List<Song> result = testList.Where(s => s.Artist.ToLower().Equals(artistName.ToLower())).ToList();
            //return await Task.FromResult(result);
            var result = context.Songs.FromSqlRaw("SELECT * From Songs WHERE Artist = {0}", artistName).Select(s => new SongRes { Name = s.Name, Artist = s.Artist, PublishDate = s.PublishDate }).ToListAsync();
            return await result;
        }

        public Task<bool> UpdateSongAsync(Song song)
        {
            throw new NotImplementedException();
        }
    }
}
