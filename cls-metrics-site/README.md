# CLS and Performance Metrics Demo

Static GitHub Pages demo with two routes:

- `/high/` intentionally creates high CLS and high synthetic timing metrics.
- `/low/` keeps layout stable and shows low synthetic timing metrics.

## Deploy

Upload all files and folders to your GitHub repo root, then enable GitHub Pages from Settings -> Pages -> Deploy from branch -> main -> root.

## Notes

Browser-measured metrics include CLS, First Paint, First Contentful Paint, Largest Contentful Paint, long-task approximation, DOM counts, and FPS sampling. Backend or synthetic-monitoring metrics such as speed index, visually complete, webpage response time, throughput time, third-party bottleneck, and self downloaded bytes are simulated for demo purposes.
