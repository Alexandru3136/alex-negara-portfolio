# Portofoliu personal cu admin

Aplicatie web minimalista cu pagina publica read-only si panou admin protejat prin parola. Pagina publica porneste in engleza si include selector pentru romana si rusa. Backend Node.js fara dependinte de runtime (ESLint este doar devDependency).

## Rulare

1. Instaleaza Node.js 18 sau mai nou.
2. (Optional) instaleaza dev dependencies pentru lint: `npm install`.
3. Porneste aplicatia:

```bash
npm start
```

- Pagina publica: `http://localhost:3000`
- Panou admin: `http://localhost:3000/admin`

### Parola admin

Nu exista o parola implicita hardcodata. Comportament:

- **`ADMIN_PASSWORD` setat** — se foloseste acea parola (orice mediu).
- **nesetat, in development** — se genereaza o parola aleatorie afisata o data in consola la pornire (`[auth] parola de dezvoltare generata: ...`).
- **nesetat, in productie** — loginul admin este dezactivat (503) pana cand configurezi `ADMIN_PASSWORD`.

```bash
ADMIN_PASSWORD="parola-ta" npm start
```

Pe Windows PowerShell:

```powershell
$env:ADMIN_PASSWORD="parola-ta"; npm start
```

## Variabile de mediu

| Variabila | Rol |
| --- | --- |
| `PORT` | Portul serverului (implicit 3000). |
| `ADMIN_PASSWORD` | Parola panoului admin (vezi mai sus). |
| `SESSION_SECRET` | Cheia de semnare a sesiunilor. Optionala: daca lipseste, se deriva din `ADMIN_PASSWORD`. Recomandata in productie. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Activeaza backend-ul KV pentru persistenta (vezi mai jos). |
| `KV_KEY` | Cheia sub care se salveaza documentul in KV (implicit `portfolio`). |

## Persistenta datelor

Documentul de portofoliu este citit/scris printr-un strat de storage cu doua backend-uri (`lib/storage.js`):

- **Local / dev (`fs`)** — scriere atomica in `data/portfolio.json` (fisier temporar + `rename`), cu scrieri serializate ca sa nu existe coruptie la scrieri concurente.
- **Productie serverless (`kv`)** — pe Vercel filesystem-ul este efemer/read-only, deci editarile din admin s-ar pierde. Cand setezi `KV_REST_API_URL` + `KV_REST_API_TOKEN` (conventia Vercel KV / Upstash), documentul se salveaza in KV. La prima citire, KV-ul este populat din `data/portfolio.json`.

## Sesiuni si securitate

- **Sesiuni stateless**: token semnat HMAC cu expirare proprie, deci functioneaza pe mai multe instante / cold start (fara store in memorie). Logout sterge cookie-ul; rotirea `ADMIN_PASSWORD`/`SESSION_SECRET` invalideaza toate sesiunile.
- **CSRF**: double-submit token legat de sesiune, trimis in cookie `portfolio_csrf` si verificat din header-ul `X-CSRF-Token` la POST/PUT/DELETE.
- **Rate-limit login**: 5 incercari / 15 min / IP.
- **Headere**: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. Cookie `Secure` in productie.
- **Limita body**: 100 KB. Protectie path-traversal la fisierele statice.

## Scripturi

```bash
npm start     # porneste serverul
npm test      # ruleaza suita de teste (node:test, fara dependinte)
npm run lint  # ESLint (necesita npm install)
```

## Structura

```text
server.js              Server HTTP local (foloseste lib/handler)
api/index.js           Entry serverless pentru Vercel (foloseste lib/handler)
vercel.json            Rewrite: toate rutele -> functia serverless
lib/handler.js         Handler-ul de request partajat (local + Vercel)
lib/config.js          Configurare (env + constante)
lib/kv.js              Client KV REST (partajat de storage si rate-limit)
lib/storage.js         Storage abstraction (fs | kv)
lib/auth.js            Sesiuni semnate + CSRF
lib/security.js        Headere + rate-limit (in-memory | kv)
lib/http.js            Helpers HTTP (send/parseBody/clientIp)
lib/projects.js        Validare/normalizare proiecte + traduceri
lib/credentials.js     Rezolvarea parolei admin la pornire
lib/logger.js          Logging structurat de request
routes/api.js          Rutele /api/* (inclusiv /api/health)
routes/static.js       Servire fisiere statice
public/                Frontend (index, admin, app.js, admin.js, styles, locales/)
data/portfolio.json    Date profil si proiecte (seed)
test/                  Teste unitare (node:test)
.github/workflows/     CI: lint + teste la push/PR
```

Endpoint de sanatate: `GET /api/health` returneaza `{ status, storage, adminConfigured, time }`.

## Ce poti administra

Din `/admin`, dupa autentificare, poti adauga, edita si sterge proiecte. Fiecare proiect are o categorie (`Automatizari si AI Workflows` sau `Aplicatii web si site-uri`), iar pagina publica le grupeaza automat.

Textele interfetei publice sunt in `public/locales/{en,ro,ru}.json`. Pentru fiecare proiect poti completa optional traduceri RO si RU (nume, descriere, detalii, problema, rezultat) direct din formularul admin; campurile necompletate cad automat pe engleza. Fiecare proiect are si detalii extinse afisate intr-un modal de tip case study.

## Deploy

Local si pe hosting Node clasic, aplicatia asculta `process.env.PORT` prin `server.js`.

Pe **Vercel** exista `vercel.json` care rescrie toate rutele catre functia serverless `api/index.js` (acelasi handler ca local, deci acelasi comportament). Pasi:

1. Importa repo-ul in Vercel.
2. In Settings -> Environment Variables seteaza cel putin `ADMIN_PASSWORD`, ideal si `SESSION_SECRET`.
3. Pentru ca editarile din admin sa fie persistente (filesystem-ul e efemer pe serverless), adauga un KV store (Vercel KV / Upstash) si seteaza `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
4. Deploy. Autodeploy-ul se face la fiecare `git push` doar dupa ce repo-ul e conectat la proiectul Vercel.

Nota: fara KV pe Vercel, aplicatia porneste si serveste continutul din `data/portfolio.json`, dar editarile facute din admin nu persista intre deploys.
