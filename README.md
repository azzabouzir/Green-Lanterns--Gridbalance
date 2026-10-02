# GRIDBALANCE (Team Green Lanterns, PESTGM 7.0, Track 2)

Decision-support platform for manual rotating load shedding on Tunisia's grid. **The operator decides**: the platform allocates, tracks, alarms and logs. It does not control the grid, and STEG integration is simulated here (target of a pilot).

```
RTU / SCADA simulator ─ telemetry + commands (API key) ─▶ API (Node 22) ─▶ SQLite
                                                          REST + WebSocket · role-based tokens · alarm engine
                                                          ▼
                       Web client: DN · CRC · BCC · Admin · Citizen · Industrial      public/prototype.html = offline v1 demo
```

## Rules implemented
- **Official STEG manual load-shedding keys** (from the "Délestage manuel" document): the national deficit is split North 65% / South 35% (the tables; the text says 2/3 – 1/3), then across BCCs. **Tunis is spared until 200 MW** are shed nationally; the part above 200 MW uses a second set of keys that includes Tunis. `npm test` checks all six reference rows (120 to 500 MW) against the document's tables, plus the traceability, protection, audit and learning checks.
- Industrial flexibility is deducted first. Fairness (history-based index) chooses the feeders inside each BCC. Critical feeders are never cut.
- Feeder timers start on the breaker-open telemetry: warning at 24 min, alarm at 30 min, rotation proposal. Σ BCC = CRC is enforced. Stale telemetry blocks commands. Everything is audited.

## Run on your PC
Requires **Node.js 22.13 or newer** (`node -v`). Without Node, use Docker.
```bash
npm install
npm start            # terminal 1: API + web client on http://localhost:3000
npm run sim          # terminal 2: SCADA/RTU simulator
```
Faster demo (1 real second = 20 simulated minutes): macOS/Linux `SPEED=20 npm start`; PowerShell `$env:SPEED=20; npm start`; cmd `set SPEED=20 && npm start`.
Docker: `docker compose up --build`.
Accounts (password `demo`): `dn`, `crc_north`, `crc_south`, `bcc_tunis`, `bcc_grombalia`, `bcc_sousse`, `bcc_beja`, `bcc_gafsa`, `bcc_sfax`, `bcc_gabes`, `admin`, `ind_a`, `ind_b`, `ind_c`, `cit_sami`, `cit_amel`.
Set `SECRET`, `SCADA_KEY`, `DEMO_PASSWORD` outside demos.

## Language
The web client has an **EN / FR** switch (bottom-right corner). It remembers your choice and defaults to your browser language. Screens, buttons, audit-trail events and error messages are translated; the API and the stored data stay in English. `public/prototype.html` (offline v1) is English only.

## Decision assistant (DN)
The DN screen starts with a guided card: (1) **situation**: demand, generation, interconnections and a unit outage preset give the deficit now, in 30 min and the J-1 peak (simulated data; every change is audited); (2) **flexibility**: request all available industrial sites in one click; (3) **three scenarios** (A official keys without flexibility, B official keys + accepted flexibility, C fairness-weighted + flexibility), each showing conventional MW, flexibility used, North/South and per-BCC MW, people affected (estimate), fairness of impact and feasibility against each BCC's sheddable capacity. One scenario is **recommended with a "Why?"** and can be approved in one click. The manual form remains available. The previewed scenario is exactly what gets created (tested).

## Accountability, protected sites, learning
- **Who set, acknowledged, accepted, executed:** every order follows a chain with named actors. `dn` creates it, the CRC **acknowledges** its region, each BCC **accepts** (or refuses with a reason) and only then **executes**; the API refuses a skipped step (409). Restoration and completion are recorded too. `GET /api/history` lists each order with all of this, and the web client shows the chain and the history.
- **Tamper-evident audit trail:** every event is hash-chained (SHA-256 of the previous record). `GET /api/audit/verify` detects any edit of a past record, shown as an integrity badge in the client.
- **Protected sites registry:** hospitals, police, civil protection, water stations and similar sites are registered on feeders by an admin. A feeder with a protected site is never planned, rotated or cut manually (403 with the site names). Removing a protection needs an admin and a written reason, and is logged.
- **Learning from history:** after each outage the platform updates (1) the fairness history, (2) the learned real load of each feeder (moving average), (3) a per-BCC correction factor from past planned-vs-delivered MW. These are explainable adaptive statistics, not a neural network; trained forecasting models are a pilot-phase step.

## Demo flow (about 2 minutes)
1. `dn`: request flexibility from `ind_a`, `ind_b`. Switch to `ind_a` and accept; `ind_b` sends a proposal; `dn` accepts it.
2. `dn`: pick a generation-outage preset (e.g. CO. CC, 280 MW) and create the order. The split follows the official keys.
3. `crc_north`: adjust shares (Σ BCC must equal the CRC amount, otherwise 409).
4. `bcc_sousse`: Execute. Citizens get an alert first, then the RTU opens breakers and feeder timers start.
5. Advance with `SPEED=20`: the 24 min warning and the 30 min alarm appear, then Rotate.
6. `cit_sami`: alert, status, "why", history. `admin`: cut the SCADA link, telemetry goes STALE.
7. `dn`: Order restoration. The fairness index and KPIs update. `GET /api/report` exports the audit log.

## API
`POST /api/login` · `GET /api/state` · `GET|POST /api/situation`, `POST /api/scenarios`, `POST /api/orders` (DN) · `POST /api/alloc` (CRC) · `POST /api/execute`, `/api/rotate`, `/api/command` (BCC) · `POST /api/accept` (CRC, BCC) · `POST /api/close` (DN) · `GET /api/history`, `GET /api/audit/verify` · `POST /api/sites`, `/api/sites/remove` (ADMIN) · `POST /api/flex/request|decide` (DN), `/api/flex/respond` (IND) · `GET /api/citizen`, `/api/industrial` · `POST /api/link` (ADMIN) · `GET /api/report` · `GET /api/scada/commands`, `POST /api/scada/telemetry` (API key).

## Layout
`server.js` API and rules · `scada-sim.js` RTU simulator · `public/index.html` web client · `public/prototype.html` offline v1 demo (simplified allocation, kept for reference) · `tests/allocation.mjs` · `.github/workflows/ci.yml`

## Known limits
Simulated RTU (no real OPC/ICCP), demo authentication (no TLS or rate limiting), single SQLite node without backup, SMS/push not actually sent, the 3-scenario AI generator exists only in `public/prototype.html`. All data is simulated. No STEG commitment to deploy or purchase is claimed.
