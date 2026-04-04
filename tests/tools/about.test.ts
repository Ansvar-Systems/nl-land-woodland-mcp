import { describe, test, expect } from 'vitest';
import { handleAbout } from '../../src/tools/about.js';

describe('about tool', () => {
  test('returns server metadata', () => {
    const result = handleAbout();
    expect(result.name).toBe('Netherlands Land & Woodland Management MCP');
    expect(result.description).toContain('houtopstanden');
    expect(result.jurisdiction).toEqual(['NL']);
    expect(result.tools_count).toBe(11);
    expect(result.links).toHaveProperty('homepage');
    expect(result._meta).toHaveProperty('disclaimer');
  });
});
