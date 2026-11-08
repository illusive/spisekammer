# Open questions

1. **Danish sources' licences.** Fødevarestyrelsen's and Forbrugerrådet Tænk's pages have no published reuse terms. Stead's private-phase exception (its D-028) does not cover a public app. Until this is settled, we use only general rules in our own words, with links.
2. **FoodKeeper is US data from 2018.** It assumes a 4 °C fridge; Danish advice is at most 5 °C. Use the low end of each range, and get a Danish check of the most common types (meat, fish, dairy, leftovers).
3. **Moderating the shared catalogue.** Wrong or abusive entries: reports, and edits limited to the creator at first. How are disputes settled?
4. **The name.** "Spisekammer" is a working name. Check the trademark, the domain and the App Store/web name before release.
5. **Costs.** Start on Supabase's free tier. Decide when to pay, and whether the app stays free.
6. **Notifications.** Web push works for installed PWAs on iOS (16.4+) but needs a server. Supabase could send them. Not in v1.
7. **Hosting.** Its own origin: GitHub Pages under a custom domain, or Cloudflare Pages. Decide with the name.
8. **Secret rotation.** The trial database password was shared in chat (2026-11-07). The owner will reset it before real use.
9. **Thawed things with a use-by date.** The app applies the package's use-by date again after thawing, even if it passed while the thing was frozen (S-010). Fødevarestyrelsen's advice may allow more (use soon after thawing, if frozen before the date). Decide whether to follow it, and how to say it in our own words.
10. **Drafted food-type names.** 308 Danish names and their keys are drafts (`docs/FOOD_TYPES_REVIEW.md`). A wrong key can give a wrong type, and so a wrong time; the user sees the type and can change it.
11. **Email for sign-in.** Supabase's built-in email sends only a few emails an hour and may only reach the project's team. Pick an EU SMTP provider before inviting others (`supabase/README.md`).
12. **Dependency advisories.** `npm audit` reports moderate advisories in dev tooling (Vitest's mocker, and deepmerge via workbox-build); none ships in the app. Update Vitest and vite-plugin-pwa in a separate change.
13. **Forbrugerrådet Tænk's freezer times (S-014).** We use their numbers (not their text) with credit. Ask them for permission, and whether they have more (fridge times for meat and fish).
14. **"Fars" (seasoned mince):** Tænk gives 2 months in the freezer, shorter than plain mince (4 months). "Fars" is matched to plain minced beef now; a type of its own would need a FoodKeeper record or a Danish source.
15. **The camera permission (S-015).** iPhone asks each time an installed web app restarts. Wrapping the app as a real app (for example with Capacitor) would ask once. Decide with the App Store question.
