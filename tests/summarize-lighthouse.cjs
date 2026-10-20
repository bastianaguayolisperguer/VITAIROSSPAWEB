'use strict';

const fs = require('fs');
const path = require('path');

const directory = path.resolve(process.argv[2] || '.');
const files = fs.readdirSync(directory)
  .filter((name) => /^(?:mobile|desktop)-\d+\.json$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
if (!files.length) throw new Error(`No Lighthouse JSON files found in ${directory}`);

const rows = files.map((name, index) => {
  const report = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  const audits = report.audits;
  const categories = report.categories;
  return {
    run: index + 1,
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    fcp: Math.round(audits['first-contentful-paint'].numericValue),
    lcp: Math.round(audits['largest-contentful-paint'].numericValue),
    speedIndex: Math.round(audits['speed-index'].numericValue),
    tbt: Math.round(audits['total-blocking-time'].numericValue),
    cls: audits['cumulative-layout-shift'].numericValue,
    mainThread: Math.round(audits['mainthread-work-breakdown'].numericValue),
    transfer: audits['total-byte-weight']?.numericValue ?? null,
    unusedCss: audits['unused-css-rules']?.details?.overallSavingsBytes ?? null,
    renderBlocking: audits['render-blocking-resources']?.details?.overallSavingsMs ?? null
  };
});

function median(key) {
  const values = rows.map((row) => row[key]).filter((value) => value !== null).sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}
const medianRow = Object.fromEntries(
  ['performance', 'accessibility', 'bestPractices', 'seo', 'fcp', 'lcp', 'speedIndex', 'tbt', 'cls', 'mainThread', 'transfer', 'unusedCss', 'renderBlocking']
    .map((key) => [key, median(key)])
);
console.log(JSON.stringify({ rows, median: medianRow }, null, 2));
