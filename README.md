# Space Oddity

Static migration of the Home, Agency, and Films pages of spaceoddity.xyz.

## Preview

Run `python3 -m http.server 4173 --directory site` and open http://localhost:4173.

## Structure

- `site/index.html`, `site/agency/index.html`, `site/films/index.html`: editable pages.
- `site/assets/`: local original images, exported template and custom CSS, and a small replacement runtime.
- `asset-manifest.json`: provenance of downloaded public assets.
- `scripts/import_site.py`: original import utility; requires Python with lxml and the three source HTML captures described in the script.

There is no application server or build dependency. GitHub Pages can serve the `site` directory using the included workflow. Relative links support both a GitHub project URL and the original custom domain.

## Fidelity and remaining dependencies

The original responsive grid, content, custom CSS, imagery, section spacing and 0.5-factor parallax are preserved. The Squarespace platform runtime and tracking scripts are replaced with local code. Video backgrounds use the original YouTube reels; portfolio players retain YouTube, Facebook, and TikTok sources. The video modal supports keyboard activation, Escape and a close control. Playback remains subject to those providers' availability and embedding permissions.

Futura PT loads from the same Adobe font resources used by the live website. An independent Adobe Fonts project or licensed webfont files should replace those URLs before Squarespace retirement; the old Squarespace kit itself is not used.

106 image references were checked against recorded upload dimensions. 105 match. The LucidPix thumbnail is served by Squarespace at 2500×1406 although its file details record a 3840×2160 upload; its 4K original remains outstanding. No image was recompressed by this migration.

The custom domain has not been changed. Keep Squarespace active until the GitHub preview is reviewed and DNS cutover is complete.
