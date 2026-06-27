# Playlist Manager API

A RESTful Web API for managing music playlists, built with **ASP.NET Core (.NET 10)** and **Entity Framework Core 10**. Users can be created, songs can be catalogued, and each user can create playlists, add songs to their own playlists, and retrieve the playlists that belong to them. Ownership, relationships, and duplicate-prevention are enforced at the database level.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Database Design Summary](#database-design-summary)
- [API Overview](#api-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Running Migrations](#running-migrations)
- [Seeding Sample Data](#seeding-sample-data)
- [Running the Tests](#running-the-tests)
- [Using a Different Database Provider](#using-a-different-database-provider)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Playlist Manager API is a backend service for maintaining personal music playlists. It is organized in clean layers — **Controllers → Services → EF Core `DbContext` → Models** — with separate request and response DTOs so the public contract is decoupled from the database entities.

A **relational SQL database** was chosen deliberately. The domain is inherently relational (users own playlists, playlists contain songs), and a SQL engine provides:

- **Structured relationships** between users, playlists, and songs.
- **Foreign keys** guaranteeing a playlist always belongs to a real user and every join row references a real playlist and a real song.
- **Duplicate prevention** via a composite primary key on the join table, so the same song cannot be added to the same playlist twice — enforced by the database, not only by application code.

The default target is **SQL Server (Express)**, but the project can be pointed at another provider such as PostgreSQL (see [Using a Different Database Provider](#using-a-different-database-provider)).

## Features

- **Create a user.**
- **Create a playlist** owned by a specific user.
- **Add a song to a playlist**, with ownership checks, existence checks, sequential ordering, and duplicate prevention.
- **Fetch all playlists for a user**, returning only that user's playlists.
- **Update / delete a playlist** (owner-checked; delete cascades to its song links).
- Supporting song operations (create, list, search by id / name / artist).
- Centralised error handling that returns **RFC 7807 ProblemDetails** responses.
- Interactive API documentation served through **Scalar** in development.

## Architecture

| Layer | Responsibility |
| --- | --- |
| **Controllers** | HTTP concerns only: routing, model validation, status codes. |
| **Services** (`IUserService`, `IPlaylistService`, `ISongService`) | Business rules: ownership, duplicate handling, ordering, mapping to DTOs. |
| **`AppDbContext`** | EF Core mapping, relationships, cascade behaviour. Acts as the Repository + Unit-of-Work. |
| **Models** | Database entities (`User`, `Playlist`, `Song`, `PlaylistSongs`). |
| **DTOs** | Request/response shapes with validation attributes. |
| **Middleware** | `GlobalExceptionHandler` translates domain exceptions to ProblemDetails. |

Dependencies flow toward abstractions: controllers depend on service **interfaces**, registered for dependency injection in `Program.cs`. EF Core's `DbContext`/`DbSet` already provide the Repository and Unit-of-Work patterns, so no separate repository layer is introduced.

## Technology Stack

- ASP.NET Core Web API on **.NET 10**
- Entity Framework Core 10 (SQL Server provider)
- Scalar for the API reference UI
- xUnit v3 + FluentAssertions + FakeItEasy + EF Core InMemory for tests

NuGet packages are restored automatically by `dotnet restore`; you do not install them by hand.

## Folder Structure

```
PlaylistManagerApi/
├── Controllers/      # UserController, PlaylistController, SongController
├── Services/         # I*Service interfaces + UserService, PlaylistService, SongService
├── Middleware/       # GlobalExceptionHandler (ProblemDetails)
├── Data/             # AppDbContext (relationships + cascade config)
├── Models/           # User, Playlist, Song, PlaylistSongs
├── Dtos/             # Request/response DTOs with validation
├── Migrations/       # EF Core migration + model snapshot
├── appsettings.json  # Connection string
├── Program.cs        # DI registration and HTTP pipeline
└── PlaylistManagerApi.http   # Sample requests for every endpoint

PlaylistManagerApi.Tests/
├── ServiceTests/     # PlaylistServiceTests, UserServiceTests, SongServiceTests
└── ControllerTests/  # PlaylistControllerTests, UserControllerTests, SongControllerTests
```

## Database Design Summary

Four tables:

- **Users** — `Id` (PK), `Name`
- **Songs** — `Id` (PK), `Name`, `Artist`, `PublishDate`
- **Playlists** — `Id` (PK), `Name`, `CreationDate`, `UserId` (FK → Users)
- **PlaylistSongs** (join) — `PlaylistId` (PK/FK → Playlists), `SongId` (PK/FK → Songs), `OrderInPlaylist`

Relationships and integrity:

- A **User** has many **Playlists**; deleting a user cascades to their playlists.
- A **Playlist** contains many **Songs** through **PlaylistSongs**; deleting a playlist cascades to its join rows.
- A **Song** can appear in many playlists; deleting a song cascades to its join rows.
- The composite primary key **(`PlaylistId`, `SongId`)** guarantees a song appears in a given playlist at most once. `OrderInPlaylist` records position and is **not** part of the key.

```
Users (1) ───< Playlists (1) ───< PlaylistSongs >─── (1) Songs
```

Indexes: `IX_Playlists_UserId` (FK lookups by owner) and `IX_PlaylistSongs_SongId` (the second FK; the first is covered by the composite PK). See the separate database documentation for full details.

## API Overview

Base path: `/api`

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/user` | Create a user. |
| `GET` | `/api/user` | List all users. |
| `GET` | `/api/user/search/id/{id}` | Get a user by id. |
| `GET` | `/api/user/search/name/{name}` | Search users by name. |
| `POST` | `/api/playlist` | Create a playlist. |
| `POST` | `/api/playlist/addsong` | Add a song to a playlist. |
| `GET` | `/api/playlist/search/userId/{userId}` | Get all playlists for a user. |
| `GET` | `/api/playlist/search/playlistId/{id}` | Get a single playlist by id. |
| `GET` | `/api/playlist/search/name/{name}` | Search playlists by name. |
| `PUT` | `/api/playlist/update` | Rename a playlist (owner-checked). |
| `DELETE` | `/api/playlist?playlistId={id}&userId={id}` | Delete a playlist (cascades to its songs). |
| `GET` | `/api/song` | List all songs. |
| `POST` | `/api/song` | Create a song. |
| `GET` | `/api/song/search/id/{id}` | Get a song by id. |
| `GET` | `/api/song/search/name/{name}` | Search songs by name. |
| `GET` | `/api/song/search/artist/{artist}` | Search songs by artist. |

**Example — create a playlist**

```http
POST /api/playlist
Content-Type: application/json

{ "name": "Road Trip", "userId": 1 }
```

**Example — add a song to a playlist**

```http
POST /api/playlist/addsong
Content-Type: application/json

{ "playlistId": 1, "songId": 1, "userId": 1 }
```

Error responses follow ProblemDetails: a missing user on create returns `400`, adding a song to a playlist you do not own returns `400`, and adding a song that is already present returns `409`.

## Prerequisites

- **.NET 10 SDK** — required to build/run the project and to run EF Core migration commands. (The runtime alone is not enough.)
- **A SQL database.** SQL Server 2022/2025 **Express** is the primary target on Windows. On macOS/Linux, use SQL Server in Docker or switch to PostgreSQL.
- One of: **Visual Studio 2022/2026** (includes the Package Manager Console), or **VS Code / any editor + the `dotnet ef` CLI**.

## Installation

```bash
git clone <your-repo-url>
cd PlaylistManagerApi
dotnet restore
```

## Configuration

The connection string lives in `appsettings.json` under `ConnectionStrings:DefaultConnection`. The default (SQL Server Express) is:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLExpress;Database=StorageDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

> Keep `Trusted_Connection=True;TrustServerCertificate=True` for a standard local Express install — they enable Windows authentication and accept the local self-signed certificate.

## Running the Application

```bash
dotnet run --project PlaylistManagerApi
```

In development, open the interactive docs at `https://localhost:7230/scalar`. You can also exercise every endpoint with the included `PlaylistManagerApi.http` file. Default ports are `7230` (HTTPS) and `5239` (HTTP); confirm against the console output.

On first HTTPS run, trust the dev certificate once: `dotnet dev-certs https --trust` (CLI) or accept the Visual Studio prompt.

## Running Migrations

The project ships with an `Initial` migration; you only need to apply it.

```bash
# CLI (cross-platform):
dotnet tool install --global dotnet-ef   # once
dotnet ef database update                # from the folder containing the .csproj
```

```powershell
# Visual Studio Package Manager Console:
Update-Database
```

Re-create from scratch: `dotnet ef database drop` then `dotnet ef database update`.

> Do **not** run `Add-Migration Initial` again — a migration named `Initial` already exists. Add a *new*, differently named migration only after you change the model.

## Seeding Sample Data

Creating a playlist requires an existing **User**. You can either call `POST /api/user`, or run the bundled `data_insertions.txt` script in SSMS / the SQL Server Object Explorer to seed users, songs, playlists, and links in dependency order.

> Let the database assign identity `Id` values unless you deliberately use `SET IDENTITY_INSERT` (as the script does). Insert in order: Users and Songs first, then Playlists, then PlaylistSongs.

## Running the Tests

```bash
dotnet test
```

The xUnit test project covers the business logic with the EF Core **InMemory** provider and **FakeItEasy** mocks:

- **Service tests** — playlist creation (valid/invalid user), add-song (ordering, ownership rejection, unknown song, duplicate rejection), owner-scoped retrieval, owner-checked update/delete, and song/user CRUD + search.
- **Controller tests** — status-code mapping for each action (`200`, `201`, `204`, `404`) using configured fakes.

> Note: relational **cascade delete** and **foreign-key** enforcement are SQL Server behaviours and are not reproduced by the InMemory provider, so they are validated at the database layer rather than asserted in unit tests.

## Using a Different Database Provider

The connection string and the provider call in `Program.cs` must match.

**PostgreSQL example:**

```jsonc
// appsettings.json
"DefaultConnection": "Host=localhost;Port=5432;Database=StorageDb;Username=postgres;Password=yourpassword"
```

```csharp
// Program.cs
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

> Two extra steps: (1) `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`; (2) the existing migration targets SQL Server — delete `Migrations/`, then `dotnet ef migrations add Initial` and `dotnet ef database update`.

## Assumptions

- **No authentication layer.** Ownership is validated against a `UserId` supplied in the request. In production this `UserId` must come from an authenticated identity (e.g. a JWT claim), never from the client body/query — see Future Improvements.
- `PublishDate` for a song is currently set to the time of creation because the create-song DTO does not capture a real release date.
- `CreationDate` and `PublishDate` are stored in **UTC** (`DateTime.UtcNow`).
- Duplicate playlist **names** (per user, or globally) are allowed; only duplicate **songs within a playlist** are prevented.
- Songs are a shared catalogue: the same title/artist may legitimately appear more than once.

## Future Improvements

- **Authentication & authorization** (JWT/Identity); derive the owner from the token rather than the request.
- Capture a real `PublishDate` (or rename to `CreatedDate`) in the song create flow.
- Pagination for the list/search endpoints.
- RESTful route normalization (query parameters instead of verbs like `search`/`delete` in paths).
- Structured logging + correlation IDs; rate limiting; output caching for read endpoints.
- Integration tests on a relational provider (SQLite/SQL Server) to assert cascade and FK behaviour.

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Build error: a NuGet package is "missing" | Run `dotnet restore`. |
| `dotnet ef` not recognized | `dotnet tool install --global dotnet-ef`, then reopen the terminal. |
| `Add-Migration Initial` fails | An `Initial` migration already exists. Use `Update-Database`, or `Drop-Database` then `Update-Database`. |
| Cannot connect to SQL Server | Confirm SQL Express is running and the instance name matches (`localhost\SQLExpress`); keep `Trusted_Connection=True;TrustServerCertificate=True`. |
| Creating a playlist returns "User not found" | Seed/create a user first; `UserId` must reference an existing user. |
| Certificate warning in browser | `dotnet dev-certs https --trust`. |
| `/scalar` returns 404 | Scalar is mapped only in Development. Ensure `ASPNETCORE_ENVIRONMENT=Development`. |
