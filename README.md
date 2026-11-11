# Formation Préparateur Méthodes Assemblage — Airbus Helicopters

Single Page Application (Vite + React 18 + Tailwind CSS 3) qui réunit le **Portail LMS** et les 5 modules :

| Route | Module | Score envoyé au portail |
|---|---|---|
| `#portail` | Portail LMS (BDD stagiaires, grille 20 compétences, export CSV/JSON, fiche bilan) | — |
| `#module/mod1` | M1 · Fondamentaux hélico, zonage, ATA 62-67, BNAE / ECS | % du sprint final (17 Q) |
| `#module/mod2` | M2 · Procédés d'assemblage, Hi-Lok, PR, freinage, métallisation | % du sprint final (12 Q) |
| `#module/mod3` | M3 · E-BOM/M-BOM, gammes SAP/MES, QN / dérogations Part-21G | % du sprint final (12 Q) |
| `#module/mod4a` | M4A · Lecture de plans, ISO 286 / LN2, ISO GPS, calage pelable | % du sprint final (12 Q) |
| `#module/mod4b` | M4B · Grand simulateur final H160 (5 missions) | jauge de crédibilité finale |

**Règle unique : score < 85 % = À REVOIR · score ≥ 85 % = VALIDE** (ratio brut, jamais arrondi vers le haut : 10/12 = 83,3 % → À REVOIR).

## Comment marche le pont des scores

- `src/App.jsx` détient le state global `db`, chargé depuis et sauvegardé dans `localStorage["ah_lms_db_85_v1"]` (la même clé que le portail).
- Le stagiaire actif est celui choisi dans le sélecteur « Stagiaire actif » du portail.
- Le bouton **Lancer M1…M4B** d'une carte module ouvre le module avec :
  - `onSaveScore={(score) => updateStudentScore(activeStudentId, moduleId, score)}`
  - `onBack` → bouton **« ← Retour au Portail LMS »** dans l'en-tête du module.
- Fin du QCM (M1 à M4A) ou fin de la mission 4 (M4B) → `updateStudentScore` écrit dans la fiche : `score`, `statut` (`VALIDE` / `À REVOIR`), `tentatives + 1`, `datePassage` du jour. Un bandeau confirme l'enregistrement.
- La progression interne des modules (onglets validés, missions 4B) est rangée par stagiaire (`<clé du module>::<id stagiaire>`), donc plusieurs stagiaires peuvent partager le même poste.

> Les données restent dans le navigateur du poste (localStorage). Pour passer d'un poste à l'autre, utiliser l'export / import JSON du portail (onglet Base stagiaires).

## Arborescence

```
index.html
package.json
vite.config.js          base "./" : marche sur GitHub Pages et Vercel
tailwind.config.js      thème « cockpit de nuit » (bg, panel, ink, sky, ok, ko…)
postcss.config.js
.github/workflows/deploy.yml   build + publication GitHub Pages à chaque push
src/
  main.jsx
  App.jsx               state global + pont onSaveScore + routage #module/…
  index.css
  lms/BackToPortal.jsx  bouton « ← Retour au Portail LMS »
  lms/session.js        clé de progression par stagiaire
  modules/PortailLMS.jsx  Module1.jsx  Module2.jsx  Module3.jsx  Module4A.jsx  Module4B.jsx
```

## Lancer en local (Windows, PowerShell)

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # produit dist/
```

## Publier sur GitHub Pages (Windows, PowerShell)

Une seule fois, installer les outils puis **fermer et rouvrir** PowerShell :

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id OpenJS.NodeJS.LTS -e
```

Puis, dans le dossier du projet :

```powershell
cd "$HOME\Downloads\formation-preparateur-ah"
npm install
git init -b main
git add .
git commit -m "Formation Préparateur Méthodes AH : portail LMS + modules M1 à M4B"
gh auth login                                   # GitHub.com > HTTPS > Login with a web browser
gh repo create formation-preparateur-ah --public --source . --remote origin
gh api -X POST "repos/{owner}/{repo}/pages" -f build_type=workflow
git push -u origin main
gh run watch                                    # suit le déploiement (≈ 1 min)
```

Site : `https://<votre-compte>.github.io/formation-preparateur-ah/`

Mises à jour suivantes : `git add . ; git commit -m "maj" ; git push`.

> GitHub Pages gratuit exige un dépôt **public** : le code et les profils de démonstration sont visibles. Les fiches réelles des stagiaires, elles, ne quittent jamais le navigateur.

## Variante Vercel

```powershell
npm install -g vercel
vercel login
vercel --prod       # accepter les réglages proposés (Vite détecté, dossier dist)
```

Ou, une fois le dépôt sur GitHub : vercel.com → Add New… → Project → importer `formation-preparateur-ah` → Deploy.
