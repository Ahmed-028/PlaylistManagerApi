// Mirrors the API's response DTOs (PlaylistManagerApi/Dtos).

export interface User {
  id: number
  name: string
}

export interface Song {
  id: number
  name: string
  artist: string
  /** The API sets this to the creation time for songs added through it; seeded songs carry real release dates. */
  publishDate: string
}

export interface Playlist {
  id: number
  name: string
  creationDate: string
  userId: number
}

export interface PlaylistSong {
  playlistId: number
  playlistName: string
  songId: number
  songName: string
  artist: string
  orderInPlaylist: number
}
