# #CAFFIENATION — The Second Uprising

An intercepted pirate broadcast from the office movement for a proper
bean-to-cup coffee machine. Absurdly serious presentation, genuinely useful
decision-making underneath.

Plain static site: HTML, CSS and vanilla JavaScript. No build step, no dependencies,
fonts self-hosted.

## Run it locally

```sh
npx http-server -p 8080 .
# or
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Any static host works. For GitHub Pages: **Settings → Pages → Deploy from a branch**,
choose the branch and `/ (root)`.

## Updating the content

Everything the committee is likely to change lives in **`js/data.js`**:

| What | Key |
| --- | --- |
| Active phase of the operation (1–6) | `config.currentPhase` |
| Email address for **TRANSMIT POSITION →** | `config.contactEmail` |
| Field Calculator defaults (headcount, prices, …) | `config.calculator` |
| Situation Room branches, options and agreed positions | `situationRoom` |
| Candidate machines & suppliers | `dossiers` |
| Timeline phases | `phases` |
| Committee announcements (newest first) | `transmissions` |
| Next meeting & standing orders | `briefing` |

- **Record a decision:** set an item's `position` in `situationRoom` (e.g.
  `position: "Fresh milk, dual line"`). The card and the status board switch to
  RESOLVED automatically.
- **Add a real machine:** copy a `dossiers` entry and replace the values. Add
  `image: "img/your-photo.jpg"` for a surveillance photo. The dossiers that ship
  with the site are placeholder archetypes, marked SPECIMEN DATA on the page.
- **Post an announcement:** add an object to the top of `transmissions` and set
  `live: false` on the previous one.
- Any value written exactly as `"[REDACTED]"` is shown as a black bar.

## The signal-loss effect

Large headings with the `data-sig` attribute occasionally lose horizontal sync:

- Only one heading at a time, and only while it's on screen, every 4–12 seconds.
- A glitch lasts 80–250 ms and then snaps back instantly, with no easing.
- The readable text is never altered. During a glitch it's hidden and replaced by
  identical layers clipped into horizontal bands. Some bands are stretched, smeared
  (`CAFFIIIIIENATION`) or pushed sideways with cyan ghosting. The rest stay perfectly
  aligned.
- No glitches, intro or flicker when the visitor has **prefers-reduced-motion** set.

To trigger one yourself, run `CFNBroadcast.glitch()` or
`CFNBroadcast.glitch('.hero__sub')` in the browser console.

## The opening transmission

It plays on the first visit, then not again for 12 hours. Click, tap or press any key
to skip it. **REPLAY TRANSMISSION ↺** in the footer, or adding `?intro` to the URL,
plays it again.

## Easter eggs

Type `instant`, `decaf`, `beans` or `kettle` anywhere on the page.

## Files

```
index.html        page structure and static copy
css/styles.css    all styling, CRT effects, responsive rules
css/fonts.css     self-hosted font faces
fonts/            Anton, IBM Plex Mono, IBM Plex Sans Condensed, Courier Prime (SIL OFL)
js/data.js        editable content
js/main.js        rendering, signal-loss engine, intro, navigation, calculator
```
