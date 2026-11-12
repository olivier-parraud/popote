# Biscuit — sources

Appli de repas de la semaine (PWA), publiée sur https://olivier-parraud.github.io/popote/ (branche `main`).

- `data/` : ingrédients, recettes, détails, photos. Les fichiers `d9-…` à `d14-…` regroupent chacun fiche, étapes détaillées, astuces, conservation et photo (fonction `NR`).
- `src/b/` : l'appli Biscuit (`core.js` calculs et données, `gestures.js` gestes illustrés, `ui-*.js` interface, `biscuit.css` design).
- `fonts/` : Inter, Bricolage Grotesque, Fredoka (intégrées en base64 au build).
- `build.js` : construit `dist/Biscuit.html`, `dist/biscuit-artifact.html` et `dist/installable/` (PWA).
- `tools/icons.py` génère les icônes ; `tools/check-recipes.js` vérifie les recettes ; `tools/gtest.js` les gestes.

```
node build.js && python3 tools/icons.py
node tools/check-recipes.js --new
```
