# Saad Fast Food — original landing page

The earlier Saad Fast Food restaurant showcase, built with HTML, CSS and plain JavaScript.

[Live website](https://scriptingwithsaad.github.io/Saad-Fast-Food-Landing-Page/)

This version keeps the chef logo, Josefin Sans headings, original photography and full 46-item catalogue. Its wine-red photographic hero, compact menu rows and delivery section distinguish it from the later [re-imagined website](https://scriptingwithsaad.github.io/Saad-Fast-Food-re-imagine/). It has no cart or checkout.

## Improvements

- Normal document flow replaces fixed absolute section positions, preventing large gaps and overlapping content.
- Sticky responsive navigation has a mobile menu with keyboard/Escape support and working section links.
- Twelve representative menu items appear first; visitors can expand all 46, search or select a category. All items remain readable without JavaScript.
- The invalid search form, placeholder phone/address and unrelated theme-feature advertising are replaced with functioning menu search and contact links.
- Responsive WebP images, lazy loading and explicit image dimensions reduce loading work. The largest intended image set is 801,885 bytes compared with 80,359,130 bytes of image files referenced by the original HTML (about 99% less). This is a file-size comparison, not a measured load-time or Lighthouse score.
- Content-versioned CSS and JavaScript avoid mixing cached old assets with new HTML. Original source images remain available for editing.

## Local preview

```sh
python -m http.server 8766
```

Open `http://localhost:8766`.

After editing `stylesheet/style.css` or `script/script.js`, run:

```sh
python scripts/build_assets.py
```

Commit the updated `index.html` and generated `assets/site/` files together. Previously generated versions should remain available for visitors with cached HTML.

To regenerate images:

```sh
python -m pip install Pillow
python scripts/optimize_images.py
```

`scripts/menu.json` maps all original catalogue photos to their optimized image IDs; the static menu is in `index.html`.

## Validation

JavaScript syntax and Git whitespace checks pass. Browser checks cover full-menu expansion, category/search combinations, empty/reset states, mobile-menu open/close, Escape, navigation and layouts at 320px, 390px, 768px and desktop width. The 100 local image/style/script resources return HTTP 200 and match their files. Internal anchors and unique element IDs are checked.
