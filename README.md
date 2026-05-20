# CLS GitHub Pages Demo

Static website with two routes:

- `/high/` intentionally creates high Cumulative Layout Shift by injecting content above existing content after load.
- `/low/` keeps CLS low by reserving space and specifying image dimensions/aspect ratio.

## Local test

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit:

- `http://localhost:8080/high/`
- `http://localhost:8080/low/`

## GitHub Pages deploy

1. Create a GitHub repository, for example `cls-github-pages-demo`.
2. Upload these files to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch `main` and folder `/root`, then save.

Your site will be available at:

```text
https://YOUR_USERNAME.github.io/cls-github-pages-demo/
https://YOUR_USERNAME.github.io/cls-github-pages-demo/high/
https://YOUR_USERNAME.github.io/cls-github-pages-demo/low/
```
