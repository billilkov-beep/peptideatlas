# Deploying Peptide Atlas

The application runs in an ordinary Node.js process. It serves the compiled browser interface and API from the same origin. For an initial production deployment, use one application instance with PostgreSQL and an HTTPS reverse proxy.

Docker and external PostgreSQL deployment files are supplied but were not executed in the build environment. The local SQL and application workflows were verified with PGlite.

## Configuration

The server and command-line utilities load `.env` from their working directory using Node's native loader. Run commands from the project root. Keep `.env`, database files, exports, and credentials out of version control and public downloads.

| Variable | Default / use |
| --- | --- |
| `PUBLIC_URL` | Public origin, such as `https://atlas.your-domain.example`. Required in production. Must match the browser's origin; it controls origin checks, canonical URLs, and secure cookies. |
| `PORT` | `3000`; must be 1–65535. |
| `HOST` | `0.0.0.0`; use `127.0.0.1` when a process is reachable only through a local reverse proxy. |
| `DATABASE_URL` | PostgreSQL connection string. If absent, the application uses PGlite. |
| `DATA_DIR` | `./data/atlas`; persistent PGlite directory, unused for a PostgreSQL connection. |
| `LOAD_CATALOG` | `true` by default; installs the complete 147-profile catalogue. Set `false` for an intentionally empty collection or an import destination. |
| `NODE_ENV` | Set to `production` on the deployed application. |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Optional environment values for the setup utility. They are not default login credentials and do not create an account during ordinary startup. |
| `POSTGRES_PASSWORD` | Used by the supplied Compose file to configure its database and application connection. |

The server also accepts `--port` and `--host` command-line overrides. Configure `PUBLIC_URL` to match the actual exposed address when changing ports.

## Local PGlite deployment

PGlite stores a local PostgreSQL-compatible database under `DATA_DIR`. It is useful for evaluation and a single-process local installation. Do not open the same PGlite directory from several application or CLI processes simultaneously.

```sh
npm ci
cp .env.example .env
npm run build
npm run setup
npm start
```

Use the dashboard export while the server is running. Stop the local server before opening the same PGlite data directory with a setup, import, or export CLI process. A normal first start publishes the complete source-checked catalogue. Check **Collection coverage** for 152/152 represented and published reference entries.

The catalogue installer is release-aware and runs transactionally. It retains existing UUIDs for untouched earlier imports, preserves editorial work and withdrawn entries, and does not reinsert the same release on each restart. Review preserved entries in the coverage screen when upgrading an existing installation.

## Docker Compose with PostgreSQL

The supplied `compose.yaml` defines:

- A Node 24 application image, running as the non-root `node` user.
- PostgreSQL 17 with a persistent named volume.
- A database health check and an application health check.
- Host binding `127.0.0.1:3000`, intended for a reverse proxy on the same host.
- Initial memory ceilings of 768 MB for the application and 512 MB for PostgreSQL. Monitor and size these for the real workload.

Create a private `.env` containing the actual HTTPS origin and a strong random hexadecimal database password. The values below are placeholders, not usable credentials:

```dotenv
PUBLIC_URL=https://atlas.your-domain.example
POSTGRES_PASSWORD=REPLACE_WITH_A_PRIVATE_RANDOM_HEX_PASSWORD
```

Hexadecimal characters avoid connection-string escaping issues in the supplied Compose interpolation. If using a separately managed database, provide a correctly URL-encoded `DATABASE_URL` through the hosting secret configuration instead.

Build, start the database, and create the administrator interactively:

```sh
docker compose config --quiet
docker compose build app
docker compose up -d database
docker compose run --rm app npm run setup
docker compose up -d app
```

The one-off setup container uses the same PostgreSQL database as the application. Do not place an actual password into a command argument or a checked-in Compose file. For unattended setup, supply the `ADMIN_*` environment variables through the deployment system's secret facility.

Check health:

```sh
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
```

The health response should include `status: "ok"` and `database: "postgresql"`. Open the HTTPS address and sign in at `/admin` using the administrator account just created.

### HTTPS reverse proxy

Point the intended domain to the host and terminate HTTPS at a suitable reverse proxy. A minimal Caddy example is:

```caddyfile
atlas.your-domain.example {
    reverse_proxy 127.0.0.1:3000
}
```

Replace the placeholder hostname and ensure `PUBLIC_URL` is that exact HTTPS origin. The browser's `Origin` must match it for login and staff mutations. Forward requests unchanged, including their paths, cookies, and headers. No cross-origin staff API configuration is required.

The application deliberately does not trust forwarded client-IP headers. Behind a reverse proxy, the in-process login rate limit conservatively sees the proxy IP, so the 60-attempt IP budget may be shared by staff. For greater traffic or multiple application instances, add correctly configured edge rate limiting and review trusted-proxy configuration explicitly; do not blindly trust arbitrary forwarded headers. The current limiter is process-local and resets on restart.

## Backups and restore

Use two distinct forms of backup:

1. **Portable library exports** for content transfer: profiles, published snapshots, revisions, and website settings. These exclude staff accounts, sessions, connection keys, and the global audit log.
2. **Database backups** for full operational recovery, including authentication and audit data.

For PostgreSQL, a full dump can be written to a private backup location:

```sh
docker compose exec -T database pg_dump -U atlas -d atlas -Fc > /private/backup/atlas.dump
```

Protect this file and copy it off the production host according to the chosen retention policy. A portable JSON export alone is not a full operational backup.

Test restore into a separate fresh database before relying on the backup. For a fresh, isolated Compose database with no application tables, a restore uses:

```sh
docker compose exec -T database pg_restore -U atlas -d atlas --exit-on-error < /private/backup/atlas.dump
```

Do not run that command against an active populated database as a routine operation. Start the application after restoring, verify health and entry counts, and test staff sign-in and node access. For PGlite, stop the application before making a physical copy of the entire data directory; keep the corresponding application/runtime version with that backup.

## Updates

Before an update, create and verify a database backup and retain the previous application image. Build the new image, run the checks, and test it against a restored staging database. Rebuild and restart the app service when ready. The current migration is the initial schema; future schema changes need a reviewed forward and rollback plan.

The shared viewer is versioned with the application and bundled into the WordPress plugin. A server deployment alone does not replace already installed plugin assets. Build and distribute the updated plugin ZIP when updating the viewer on WordPress sites.

## Final live-environment verification

Verify the actual HTTPS origin, cookie behaviour, staff sign-in, publishing, node synchronization, profile HTML, and database restore. Install the plugin on two differently styled pilot sites and confirm cron scheduling and full-page/CDN cache exclusions before expanding to the remaining sites. These checks establish the target deployment's behaviour; they were not implied by the local test results.
