# Formation Préparateur Méthodes Assemblage — Airbus Helicopters

Single Page Application (Vite 6 + React 18 + Tailwind CSS 3) : écran de connexion, espace stagiaire, tableau de bord formateur et les 5 modules M1 à M4B.

**Règle unique : score < 85 % = À REVOIR · score ≥ 85 % = VALIDE** (ratio brut, jamais arrondi vers le haut : 10/12 = 83,3 % → À REVOIR).

## Parcours

| Écran | Qui | Contenu |
|---|---|---|
| Connexion | tous | Onglet **Stagiaire** (Nom, Prénom, Type : Entretien / CQPM / Formation basique) · onglet **Administrateur** |
| Espace stagiaire | stagiaire | Ses 5 modules, son statut, l'historique de ses tentatives, l'export de ses résultats. Aucune saisie de score, aucun accès aux autres stagiaires ni à la grille formateur. |
| Tableau de bord | formateur | Promotion filtrable (type de formation, VALIDE / À REVOIR), détail de chaque réponse, grille 20 compétences, bilan imprimable PDF/HTML, **Autoriser une nouvelle tentative**, **Réinitialiser un module**, suppression, import / export, Sync Cloud Multi-PC, paramètres |
| `#module/mod1` … `mod4b` | les deux | Modules. En mode formateur ils s'ouvrent en **aperçu** (rien n'est enregistré). |

Le profil stagiaire est identifié par **Nom + Prénom + Type de formation** (casse et accents ignorés) : se reconnecter avec les mêmes informations retrouve le même parcours. La base démarre vierge.

## Règles pédagogiques appliquées partout

- **Premier choix verrouillé** dans tous les ateliers (tri, décodeur d'OF, mini-checks de fin d'onglet, sprints QCM, missions M4B) : une erreur reste rouge, la correction s'affiche et elle compte dans le score.
- **Sous 85 %**, l'atelier entier est relancé avec un **nouveau tirage**.
- **Mélange Fisher-Yates** (aléa cryptographique) des items et des options à chaque chargement, sans regrouper les réponses identiques à la suite.
- Chaque atelier terminé, chaque démarrage de sprint et chaque sprint noté est **journalisé** dans la fiche du stagiaire (réponse donnée, bonne réponse, juste / faux).
- Module **VALIDE** : sprint verrouillé (révision du cours possible). Module **À REVOIR** : nouvelle tentative libre, ou seulement sur autorisation du formateur (réglage dans Paramètres).

## Sécurité : ce qui protège vraiment, et ce qui ne protège pas

- Le site est **statique et public** (GitHub Pages) : tout son code est lisible. Le mot de passe admin n'y figure donc **jamais en clair** : seule son empreinte **PBKDF2-SHA-256 (100 000 itérations + sel)** est dans `src/config/admin.config.js`. On ne peut pas le retrouver en lisant le code.
- Mais un écran de connexion dans le navigateur **n'est pas une vraie sécurité** : une personne qui maîtrise les outils développeur peut le contourner ou modifier les données locales de son propre PC. Ce verrou empêche les manipulations ordinaires d'un stagiaire, pas une attaque.
- La **vraie protection multi-PC** est la Sync Cloud Supabase : c'est le **serveur** qui applique les règles **RLS** (Row Level Security) de `supabase/schema.sql` :
  - la clé `anon` publique du site permet **seulement** d'ajouter un profil ou une tentative, et de relire **son propre** parcours ;
  - lire toute la promotion, autoriser, réinitialiser ou supprimer exige une **session Supabase Auth** d'un compte formateur déclaré dans `ah_admins`. Modifier le code du site n'y change rien.
  - Limite connue : connaître le nom, le prénom et le type de formation d'un stagiaire suffit pour relire ses scores (pas ses commentaires formateur). Ne mettez pas de données sensibles dans la formation.
- Changer le mot de passe : **Paramètres** du tableau de bord. Il devient actif sur ce PC ; pour tous les PC, collez le bloc généré dans `src/config/admin.config.js` puis republiez.

## Sync Cloud Multi-PC (Supabase, gratuit)

1. Créer un projet sur supabase.com.
2. **SQL Editor** → coller `supabase/schema.sql` → **Run**.
3. **Authentication → Users → Add user** : votre compte formateur (cocher Auto Confirm).
4. Exécuter la requête `insert into public.ah_admins …` en bas du script avec votre e-mail.
5. **Project Settings → API** : copier *Project URL* et la clé *anon public* dans le panneau **Sync Cloud Multi-PC** du tableau de bord → **Enregistrer et activer**, puis **Connexion** avec l'e-mail / mot de passe Supabase.
6. Copier le **lien de configuration** et l'ouvrir une fois sur chaque PC stagiaire (ou renseigner `src/config/cloud.config.js` avant le build).

Ensuite tout est automatique : chaque tentative part dans le cloud 2 s après, le tableau de bord se met à jour toutes les minutes. Les données sont un journal d'événements (jamais d'écrasement) : deux PC ne peuvent pas effacer le travail l'un de l'autre.

Sans cloud : le stagiaire clique **Exporter mes résultats** (fichier .json ou code `AHSYNC1:…`) et le formateur l'importe dans **Import / Export** (fusion sans doublon).

## Arborescence

```
index.html · package.json · vite.config.js (base "./") · vite.singlefile.config.js · tailwind.config.js
.github/workflows/deploy.yml     build + publication GitHub Pages à chaque push
supabase/schema.sql              table ah_events + règles RLS + fonction ah_events_stagiaire
src/
  main.jsx · index.css
  App.jsx                        routage connexion → espace → module, contexte de session, synchro auto
  auth/AuthPortal.jsx            écran de connexion 2 onglets
  auth/session.js                identifiants admin hashés, verrouillage après 5 essais, sessions
  auth/crypto.js                 SHA-256 / PBKDF2 (WebCrypto + repli JS)
  config/admin.config.js         login + empreinte du mot de passe par défaut
  config/cloud.config.js         URL + clé anon Supabase (optionnel)
  student/StudentSpace.jsx       espace stagiaire strict
  admin/AdminDashboard.jsx       promotion, fiche détaillée, décisions
  admin/Grille.jsx · Bilan.jsx · ImportExport.jsx · CloudSync.jsx · Settings.jsx
  lms/db.js                      modèle de données, calcul des statuts, fusion, codes d'import
  lms/sync.js                    API REST Supabase
  lms/ui.jsx                     briques d'interface
  lib/pedago.jsx                 moteur commun : verrouillage, mélange, ateliers, sprints
  modules/Module1.jsx … Module4B.jsx
  modules/m1/            écorché pleine largeur (Cutaway), silhouettes partagées (HeliViews), simulateur rotor (RotorLab), freinages, mastic PR, tables de normes
  modules/m2/            catalogue visuel de la quincaillerie (Quincaillerie)
  modules/m3/            écran de gamme SAP / MES (GammeMES) + workflow QN Part-21G / 21J (QnWorkflow)
  modules/plans/         laboratoire de plans : PlanKit (feuille, cartouche, cotes, ISO GPS),
                         Plan1Ferrure, Plan2Jonction, Plan3Composite, LaboPlans (onglet M4A)
```

## Lancer, construire

```powershell
npm install
npm run dev            # http://localhost:5173
npm run build          # dist/ (utilisé par GitHub Pages)
npm run build:single   # dist-single/index.html : tout en un fichier, s'ouvre sans serveur
```

## Mettre à jour le site GitHub Pages

Le workflow `.github/workflows/deploy.yml` reconstruit et publie le site à chaque modification de la branche `main`. Remplacez simplement les fichiers modifiés sur github.com (Add file → Upload files), le site se met à jour en 1 à 2 minutes (onglet Actions).
