# Parfumerie — Le forum communautaire des passionnés de parfums

> Un espace ouvert où chacun contribue : ajouter des parfums, partager ses avis, noter, découvrir, et trouver sa communauté.

---

## Vision

**Parfumerie** est un forum participatif centré sur la passion du parfum. Contrairement aux catalogues figés, ici la base de données est vivante : n'importe qui peut enrichir une fiche, soumettre un parfum inconnu, laisser un avis circonstancié, ou démarrer une discussion.

Le modèle s'inspire de **Reddit** pour la dynamique communautaire, de **Fragrantica** pour la profondeur des données olfactives, et de **Letterboxd** pour la dimension personnelle et sociale des reviews.

---

## Ce qu'on peut faire

### Contribuer au catalogue

- **Ajouter un parfum** — n'importe quel membre peut soumettre une nouvelle fiche : nom, maison, année, pyramide olfactive, accords, image
- **Enrichir une fiche existante** — ajouter des informations manquantes, corriger, compléter
- **Créer une maison ou un parfumeur** — si la référence n'existe pas encore, elle peut être créée à la volée

### Partager son expérience

- **Noter sur 5** — une note globale simple et lisible
- **Rédiger un avis** — libre et circonstancié, avec dimensions optionnelles : longévité, sillage, rapport qualité/prix, saison, occasion
- **Journal de port** — noter quand, où et dans quel contexte on a porté un parfum

### Rejoindre la communauté

- **Suivre d'autres membres** — voir leur activité dans un feed
- **Créer des listes** — "Mes parfums d'hiver", "Top orientaux sous 100€", "Blind buys validés"
- **Gérer sa collection** — possédé / essayé / wishlist / décant voulu
- **Profil olfactif** — généré automatiquement depuis ses notes et collections

---

## Modèle de données

### Review multidimensionnelle

| Dimension | Échelle |
|---|---|
| Note globale | /5 |
| Longévité | /5 |
| Sillage | /5 |
| Rapport qualité/prix | /5 |
| Saison recommandée | Printemps / Été / Automne / Hiver |
| Occasion | Bureau / Soirée / Sport / Date / Quotidien |
| Blind buy ? | Oui / Non |

### Structure des données

```
User
 ├── Reviews → Perfume
 ├── Collections → Perfume (owned / tried / wishlist / decant)
 ├── Lists → [Perfume]
 └── Follows → User

Perfume
 ├── House (Maison)
 ├── Perfumer(s)
 ├── Notes (tête / cœur / fond)
 ├── Accords (woody, floral, oriental, cuiré…)
 └── Reviews → User

House
 └── Perfumes

Perfumer
 └── Perfumes
```

---

## Roadmap

### Phase 1 — Base communautaire (en cours)

- [x] Catalogue consultable (maisons, parfumeurs, parfums, accords)
- [x] Authentification (inscription / connexion)
- [x] Profils utilisateur publics
- [x] Collections personnelles
- [x] Listes thématiques
- [ ] Formulaire d'ajout de parfum par les membres
- [ ] Formulaire d'avis sur une fiche parfum
- [ ] Édition collaborative des fiches

### Phase 2 — Forum & Social

- [ ] Système de follow + feed d'activité
- [ ] Commentaires sur les reviews
- [ ] Discussions par parfum / maison / accord
- [ ] Profil olfactif automatique
- [ ] Communautés thématiques (niche, orientaux, vintages…)

### Phase 3 — Découverte & Intelligence

- [ ] Moteur de recommandations
- [ ] Nez Jumeaux (matching par profil olfactif)
- [ ] Journal de port enrichi (météo, contexte, humeur)
- [ ] Suggestions de layering

---

## Stack technique

```
Frontend      Next.js (App Router) + TypeScript
UI            Tailwind CSS 4 + shadcn/ui
Base de données  PostgreSQL + Prisma ORM 7
Auth          Better Auth
Déploiement   Vercel + Railway
```

---

## Lancer le projet en local

```bash
git clone https://github.com/[repo]/parfumerie
cd parfumerie
npm install
cp .env.example .env
# configurer DATABASE_URL dans .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Contribuer

Projet ouvert. Passionné de parfums, développeur ou designer — les contributions sont bienvenues.

---

## Licence

MIT
