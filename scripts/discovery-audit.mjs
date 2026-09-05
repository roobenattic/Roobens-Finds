import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');

const checks = [
  ['title', /<title>[^<]+<\/title>/i],
  ['meta description', /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i],
  ['canonical URL', /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/i],
  ['viewport', /<meta[^>]+name=["']viewport["'][^>]+content=/i],
  ['Open Graph title', /<meta[^>]+property=["']og:title["'][^>]+content=/i],
  ['Open Graph description', /<meta[^>]+property=["']og:description["'][^>]+content=/i],
  ['structured data', /<script[^>]+type=["']application\/ld\+json["']/i],
];

let score = 0;
const missing = [];

for (const [name, pattern] of checks) {
  if (pattern.test(index)) {
    score += 1;
    console.log(`PASS  ${name}`);
  } else {
    missing.push(name);
    console.log(`WARN  ${name}`);
  }
}

const percent = Math.round((score / checks.length) * 100);
console.log(`\nDiscovery readiness baseline: ${percent}% (${score}/${checks.length})`);

if (missing.length) {
  console.log(`Missing/advisory items: ${missing.join(', ')}`);
  console.log('This audit is advisory in Foundation v1; later phases can promote selected checks to blocking gates.');
}
