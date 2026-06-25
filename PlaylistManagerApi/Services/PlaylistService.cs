using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Services
{
    public class PlaylistService : IPlaylistService
    {
        //Using this to test functions before connecting database

        static List<Playlist> testList = new List<Playlist> {
           new Playlist {Id = 1,Name="Vibe",CreationDate= DateTime.Now},
           new Playlist {Id = 2,Name="Loop",CreationDate= DateTime.Now},
           new Playlist {Id = 3,Name="Arabic",CreationDate= DateTime.Now}

        };

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
            return await Task.FromResult(testList);
        }

        public async Task<List<Playlist>> GetPlaylistByNameAsync(string name)
        {
            List<Playlist> result = testList.FindAll(p => p.Name.ToLower().Equals(name.ToLower()));
            return await Task.FromResult(result);
        }
    }
}
