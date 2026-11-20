# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all 55 Grand Theft Auto VI
PlayStation 5 trophies: the official list with saved progress, filters and a
spoiler setting, a roadmap to the platinum, and a guide to each trophy that
cites its sources.

## What it does

- **Checklist** — every trophy with its official name, description and grade;
  tick trophies off and progress is saved in the browser (localStorage).
  Export progress to JSON and import it back on any device.
- **Filters** — by kind (story, strangers, collectibles, activities, combat &
  crime, exploration, money & property, moments & choices), by grade, by
  status (earned / still to earn / missable only), plus full-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you earn them (on by default).
- **Roadmap** — four phases to the platinum, built from the official
  descriptions: story first, strangers and moments before the finale,
  activities and counted grinds, then collectibles, money and clean-up.
- **Missables** — 16 trophies flagged as potentially missable, with why and
  when to do them. Nothing here is claimed as confirmed by play: the game
  released 2026-11-19, and the guides say plainly where a place or step is
  not pinned down by the sources.
- **Guide to each trophy** — in our own words, with steps and sources
  (Exophase for the official list; PSNProfiles for PSN's progress targets).

## Sources

- Exophase — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
  (official names, descriptions, grades, hidden flags)
- PSNProfiles — https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
  (grades and PSN progress targets / counts)

Guides are our own words from those sources; no other guide's text is
copied, and no Rockstar logo or official artwork is used.

## Run it

```sh
node serve.ts          # serves app/ on http://localhost:8080
```

Open `app/index.html` directly in a desktop browser and it works fully
offline — it loads nothing over the network.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json`.

## License

MIT — see LICENSE.
