# Spisekammer

Spisekammer (working name) is an everyday app for Danish homes. It shows what is in the freezer and the pantry (and the fridge, if a household wants it), and when to use it. It grew out of the Forråd part of stead (`../offline-knowledge`), which people asked for on its own.

## Goal

Know what you have and when to use it, with as little typing as possible.

## Who it is for

Danish households. Danish first, with an English interface too.

## Core flows

- **Add:** scan a barcode, or type with suggestions.
- **Use and keep:** tap a thing to take some out, add more, move it (into the freezer, say), change its size, kind or date, or delete it.
- **Find:**
  - Search across everything: names, kinds of food and places.
  - Scan to check whether you already have something.
- **Overview:**
  - **"Brug snart"**: what to use soon, across all places, on top.
  - The places, each grouped by category. The household makes its own (more freezers, cupboards, a cellar), each of the kind Frost, Køl or Tørvarer (S-013). New households start with Fryser, Skabe and Viktualiekammer. A fridge is optional: what is in it changes every day, so a list of it soon goes wrong.
- **Household:** everyone in the home sees and changes the same inventory.

## Dates

The app does not estimate how long things keep (S-021). A thing has a date only if the user gives one: a day in the fridge, a month and a year elsewhere. "Brug snart" gathers what is near or past its date. Once a date has passed, the thing's sheet says so, and to look, smell and taste, and to throw out meat, fish and leftovers. Never "safe".

## Principles

- **Local first:** everything works on the phone without a connection, because reception in shops is poor. It syncs when there is a connection.
- **Quick:** few fields, sensible defaults, and the package date only if you want it.
- **Friendly:** calm and clear, in the look of the owner's Shelfwise (light only, S-023), with large touch targets and text that follows the phone's text size.
- **Private:** data stays in the EU (Supabase), with no tracking or ads. You can export your data and delete your account.

## Not in v1

Recipes, shopping lists, meal plans, nutrition, prices and push notifications. The first two may come later.

## Status

See `docs/ROADMAP.md`. Decisions are in `docs/DECISIONS.md` (S-001 …).
