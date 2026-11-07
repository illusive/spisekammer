# Spisekammer

Spisekammer (working name) is an everyday app for Danish homes. It shows what is in the freezer and the pantry (and the fridge, if a household wants it), and when to use it. It grew out of the Forråd part of stead (`../offline-knowledge`), which people asked for on its own.

## Goal

Know what you have and when to use it, with as little typing as possible.

## Who it is for

Danish households. Danish first, with an English interface too.

## Core flows

- **Add:** scan a barcode, or type with suggestions.
- **Use and keep:** tap a thing to take some out, add more, move it (into the freezer, say), mark it opened, or delete it.
- **Find:**
  - Search across everything: names, brands, food types and places.
  - Scan to check whether you already have something.
- **Overview:**
  - **"Brug snart"**: what to use soon, across all places, on top.
  - The places (Fryser, Forråd, and your own), each grouped by category. Køleskab is optional and off by default (S-007): what is in it changes every day, so a list of it soon goes wrong.
- **Household:** everyone in the home sees and changes the same inventory.

## How long things keep

Estimates come from ground rules, written up in `docs/ARCHITECTURE.md` §3:
- the food type (from USDA FoodKeeper, CC0, given Danish names)
- the place
- the day the thing was added, opened, frozen or thawed
- the package's own date, which comes first; a "sidste anvendelsesdato" is never extended

They are always shown as guidance, never as "safe".

## Principles

- **Local first:** everything works on the phone without a connection, because reception in shops is poor. It syncs when there is a connection.
- **Quick:** few fields, sensible defaults, and the package date only if you want it.
- **Friendly:** warm, calm and clear, with large touch targets and text that follows the phone's text size, plus dark mode.
- **Private:** data stays in the EU (Supabase), with no tracking or ads. You can export your data and delete your account.

## Not in v1

Recipes, shopping lists, meal plans, nutrition, prices and push notifications. The first two may come later.

## Status

See `docs/ROADMAP.md`. Decisions are in `docs/DECISIONS.md` (S-001 …).
