using Microsoft.EntityFrameworkCore;
using PlaylistManagerApi.Models;

namespace PlaylistManagerApi.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options):DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Song> Songs => Set<Song>();

        public DbSet<Playlist> Playlists => Set<Playlist>();

        public DbSet<PlaylistSongs> PlaylistSongs => Set<PlaylistSongs>();

        //Add Creation Overriding to form Relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Playlist -> User relationship
            modelBuilder.Entity<Playlist>()
                .HasOne(p => p.User)
                .WithMany(u => u.Playlists)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // PlaylistSongs -> Playlist relationship
            modelBuilder.Entity<PlaylistSongs>()
                .HasOne<Playlist>(ps => ps.Playlist)
                .WithMany(p => p.PlaylistSongs)
                .HasForeignKey(ps => ps.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);

            // PlaylistSongs -> Song relationship
            modelBuilder.Entity<PlaylistSongs>()
                .HasOne<Song>(ps => ps.Song)
                .WithMany()
                .HasForeignKey(ps => ps.SongId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}
