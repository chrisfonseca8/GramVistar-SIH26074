/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export (tasks.md 10.3) — this app has no server components that
  // fetch dynamic data, no route handlers, no dynamic route segments, no
  // Server Actions, cookies, rewrites, or next/image usage (confirmed by
  // inspection — see README.md's Deployment section), so it's fully
  // compatible with `next build` producing a plain HTML/CSS/JS bundle in
  // `out/` that any static host (Vercel, Netlify, GitHub Pages) can serve.
  // `npm start` (`next start`) is not used with this mode — see README.
  output: "export",
};

export default nextConfig;
