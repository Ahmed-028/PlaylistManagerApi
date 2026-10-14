# Crate (Playlist Manager web app)

A React front end for the Playlist Manager API. Pick a listener, build playlists from a shared song catalog, add songs in order, rename and delete playlists, and search across songs, artists, playlists and listeners.

## Running it

You need the API and the web app running at the same time.

```bash
# 1. API (from the repository root), listens on http://localhost:5239
dotnet run --project PlaylistManagerApi --launch-profile http

# 2. Web app (from this folder), opens on http://localhost:5173
npm install
npm run dev
```

The API has no CORS policy, so the Vite dev server proxies `/api` to it. If the API runs on a different address, set `API_URL` when starting the dev server:

```bash
API_URL=https://localhost:7230 npm run dev
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Type-checks, then builds to `dist/` |
| `npm run preview` | Serves `dist/` on http://localhost:4173, with the same `/api` proxy |
| `npm run typecheck` | Type-checks only |

If the database is empty, the app starts with a "create your first listener" screen. To load the sample data instead, run `PlaylistManagerApi/data_insertions.txt` against the database (see the main README).

## How it maps to the API

| Screen | Endpoints |
| --- | --- |
| Listener picker / switcher | `GET /api/user`, `POST /api/user` |
| Home | `GET /api/playlist/search/userId/{id}`, `GET /api/song` |
| Playlist | `GET /api/playlist/search/playlistId/{id}`, `GET /api/playlist/search/playlistId/{id}/songs`, `POST /api/playlist/addsong`, `PUT /api/playlist/update`, `DELETE /api/playlist/delete/user={u}/playlist={p}` |
| Catalog | `GET /api/song`, `POST /api/song` |
| Search | `GET /api/song/search/name/{q}`, `GET /api/song/search/artist/{q}`, `GET /api/playlist/search/name/{q}`, `GET /api/user/search/name/{q}` |

Notes on API behaviour the client handles:

- **No authentication.** The API checks ownership against a `userId` in each request, so the "current listener" is a choice stored in the browser. Other listeners' playlists open read-only, with an option to switch to their owner.
- **Empty results** come back as `204` (lists) or `404` (searches); both are shown as empty states, not errors.
- **Errors** come back either as plain text (`BadRequest("...")`) or as ProblemDetails JSON (validation); both are turned into one readable message.
- **Duplicate songs** (`409`) are prevented in the UI by marking songs already in a playlist, and reported if they happen anyway.
- **Dates** from SQL Server have no time zone designator and are read as UTC, as the API stores them.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Motion, Sonner (toasts), Phosphor icons, Geist type. Light and dark themes follow the system setting, with a manual override in the sidebar. Motion respects `prefers-reduced-motion`.

## Layout

```
src/
├── lib/          API client, query hooks, router, formatting, generated cover art
├── state/        Theme, current listener, dialog host
├── components/   UI primitives, navigation, song rows, dialog contents
└── views/        Home, Playlist, Catalog, Search, entry screens
```
