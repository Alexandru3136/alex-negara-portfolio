# Portofoliu personal cu admin

Aplicatie web minimalista cu pagina publica read-only si panou admin protejat prin parola. Pagina publica porneste in engleza si include selector pentru romana si rusa. Datele sunt salvate local in `data/portfolio.json`.

## Rulare

1. Instaleaza Node.js 18 sau mai nou.
2. Porneste aplicatia:

```bash
npm start
```

3. Deschide pagina publica:

```text
http://localhost:3000
```

4. Deschide panoul admin:

```text
http://localhost:3000/admin
```

Parola implicita este:

```text
schimba-parola
```

Parola implicita functioneaza doar local. Pentru productie sau testare locala cu alta parola:

```bash
ADMIN_PASSWORD="parola-ta" npm start
```

Pe Windows PowerShell:

```powershell
$env:ADMIN_PASSWORD="parola-ta"; npm start
```

Pe Vercel seteaza variabila de mediu `ADMIN_PASSWORD` inainte de deploy sau imediat dupa deploy. Fara aceasta variabila, loginul admin este dezactivat in productie.

## Deploy

Aplicatia poate rula ca Node server si asculta automat portul oferit de hosting prin `process.env.PORT`.

Pentru GitHub:

```bash
git add -A
git commit -m "Initial portfolio app"
git branch -M main
git remote add origin URL_REPO_GITHUB
git push -u origin main
```

Pentru Vercel, importa repo-ul din dashboard sau ruleaza CLI-ul Vercel si seteaza `ADMIN_PASSWORD` in Environment Variables.

Nota: datele sunt salvate in `data/portfolio.json`, ceea ce este foarte comod local. Pe hosting serverless, editarile facute din admin pot sa nu fie persistente pe termen lung. Pentru update-uri sigure in productie, editeaza local, fa commit si redeploy, sau muta ulterior datele intr-o baza de date.

## Structura

```text
server.js              Backend Node.js fara dependinte externe
data/portfolio.json    Date profil si proiecte
public/index.html      Pagina publica
public/admin.html      Panou admin
public/styles.css      Stiluri responsive
public/app.js          Logica pagina publica
public/admin.js        Logica panou admin
```

## Ce poti administra

Din `/admin`, dupa autentificare, poti adauga proiectele tale, edita proiectele existente si sterge proiecte. Fiecare proiect are o categorie: `Automatizari si AI Workflows` sau `Aplicatii web si site-uri`, iar pagina publica le grupeaza automat. Vizitatorii neautentificati pot vedea doar pagina publica si API-ul public de citire.

Textele interfetei publice sunt traduse in `public/app.js`. Proiectele adaugate din admin apar exact in limba in care le introduci.

Pentru fiecare proiect poti completa si detalii extinse: problema, rezultat, URL de screenshot/video si linkuri externe. Pe pagina publica, cardurile se deschid intr-un modal de tip case study.
