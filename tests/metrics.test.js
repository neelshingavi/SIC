import { describe, it, expect } from 'vitest';

function parseMetricText(raw) {
  const match = raw.match(/([\D]*)([\d,]+(?:\.\d+)?)([\D]*)/);
  if (!match) return null;
  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const target = parseFloat(numStr);
  const hasCommas = match[2].includes(',');
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  return { prefix, target, suffix, hasCommas, decimals };
}

describe('Metrics Parser', () => {
  it('parses simple integers', () => {
    const res = parseMetricText('100');
    expect(res).toEqual({ prefix: '', target: 100, suffix: '', hasCommas: false, decimals: 0 });
  });

  it('parses formatted numbers with commas and suffixes', () => {
    const res = parseMetricText('$1,200+');
    expect(res).toEqual({ prefix: '$', target: 1200, suffix: '+', hasCommas: true, decimals: 0 });
  });

  it('parses decimals and percentages', () => {
    const res = parseMetricText('99.9%');
    expect(res).toEqual({ prefix: '', target: 99.9, suffix: '%', hasCommas: false, decimals: 1 });
  });
});
