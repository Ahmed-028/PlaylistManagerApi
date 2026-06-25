using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options):DbContext(options)
    {
        public DbSet<Song> Songs => Set<Song>();

        public DbSet<Playlist> Playlists => Set<Playlist>();

    }
}
