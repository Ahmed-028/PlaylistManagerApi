using PlaylistManagerApi.Models;
using System.Xml.Linq;

namespace PlaylistManagerApi.Services
{
    public class SongService : ISongService
    {

        //Using this to test functions before connecting database

        static List<Song> testList = new List<Song> {
           new Song {Id = 1,Name="Sharks",Artist ="Imagine dragons",PublishDate= DateTime.Now},
           new Song {Id = 2,Name="Beliver",Artist ="Imagine dragons",PublishDate= DateTime.Now},
           new Song {Id = 3,Name="Radioactive",Artist ="Imagine dragons",PublishDate= DateTime.Now}

        };

        public Task<Song> AddSongAsync(Song song)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteSongAsync(Song song)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Song>> GetAllSongsAsync() 
        {
            return await Task.FromResult(testList);
        }

        public async Task<List<Song>> GetSongByNameAsync(string name)
        {
            List<Song> result = testList.FindAll(s => s.Name.Equals(name));
            return result;
        }

        public async Task<List<Song>> GetSongsByArtistAsync(string artistName)
        {
            //List<Song> result = testList.FindAll(s => s.Artist.Equals(artistName));
            List<Song> result = testList.Where(s => s.Artist.Equals(artistName)).ToList();
            return await Task.FromResult(result);
        }

        public Task<bool> UpdateSongAsync(Song song)
        {
            throw new NotImplementedException();
        }
    }
}
