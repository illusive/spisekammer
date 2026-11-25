# Open questions

1. **Danish sources' licences.** Fødevarestyrelsen's and Forbrugerrådet Tænk's pages have no published reuse terms. Stead's private-phase exception (its D-028) does not cover a public app. Since S-021 the app uses none of their content.
2. **Moderating the shared catalogue.** Wrong or abusive entries: reports, and edits limited to the creator at first. How are disputes settled?
3. **The name.** "Spisekammer" is a working name. Check the trademark, the domain and the App Store/web name before release.
4. **Costs.** Start on Supabase's free tier. Decide when to pay, and whether the app stays free.
5. **Notifications.** Web push works for installed PWAs on iOS (16.4+) but needs a server. Supabase could send them. Not in v1.
6. **Hosting.** Its own origin: GitHub Pages under a custom domain, or Cloudflare Pages. Decide with the name.
7. **Secret rotation.** The trial database password was shared in chat (2026-11-07). The owner will reset it before real use.
8. **Email for sign-in.** Supabase's built-in email sends only a few emails an hour and may only reach the project's team. Pick an EU SMTP provider before inviting others (`supabase/README.md`).
9. **Dependency advisories.** `npm audit` reports moderate advisories in dev tooling (Vitest's mocker, and deepmerge via workbox-build); none ships in the app. Update Vitest and vite-plugin-pwa in a separate change.
10. **The camera permission (S-015).** iPhone asks each time an installed web app restarts. Wrapping the app as a real app (for example with Capacitor) would ask once. Decide with the App Store question.
11. **The overdue warning's wording (S-021).** "Datoen er overskredet. Se, lugt og smag, før du bruger det. Kød, fisk og rester: smid det ud." Check it with the owner, and against Fødevarestyrelsen's advice, before sharing the app.
