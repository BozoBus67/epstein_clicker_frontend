// Drift tests for the scroll registry. Adding a slug to SCROLL_REGISTRY
// without also adding its display_name / description / image asset produces
// silent UI bugs (undefined names, missing images, broken tooltips). These
// tests catch every such gap at vitest time.
//
// Cross-repo drift (frontend registry vs. backend MASTERY_SCROLLS) is NOT
// tested here — that contract is enforced at runtime by the backend rejecting
// unknown slugs. The backend has its own mirror test in
// `backend/tests/test_scroll_registry.py`.

import { describe, expect, it } from 'vitest';
import { SCROLL_DESCRIPTIONS, SCROLL_DISPLAY_NAMES, SCROLL_TIERS } from './constants';
import { SCROLL_FACE_BY_SLUG } from './scroll_faces';
import { SCROLL_BY_ID, SCROLL_IDS, SCROLL_REGISTRY } from './scroll_registry';

const SLUG_PATTERN = /^[a-z0-9]+(_[a-z0-9]+)*$/;

describe('scroll_registry — internal consistency', () => {
  it('every scroll id is a non-empty lowercase snake_case slug', () => {
    const bad = SCROLL_IDS.filter(id => !SLUG_PATTERN.test(id));
    expect(bad).toEqual([]);
  });

  it('scroll ids are unique', () => {
    expect(SCROLL_IDS.length).toBe(new Set(SCROLL_IDS).size);
  });

  it('every scroll has a non-empty display_name', () => {
    const bad = SCROLL_REGISTRY.filter(s => !s.display_name || typeof s.display_name !== 'string');
    expect(bad.map(s => s.id)).toEqual([]);
  });

  it('every scroll has a description (string, may say "Not yet implemented")', () => {
    const bad = SCROLL_REGISTRY.filter(s => typeof s.description !== 'string' || s.description.length === 0);
    expect(bad.map(s => s.id)).toEqual([]);
  });

  it('every scroll has chess_elo as a number or null', () => {
    const bad = SCROLL_REGISTRY.filter(s => s.chess_elo !== null && typeof s.chess_elo !== 'number');
    expect(bad.map(s => s.id)).toEqual([]);
  });

  it('SCROLL_BY_ID covers exactly the registry ids', () => {
    expect(new Set(Object.keys(SCROLL_BY_ID))).toEqual(new Set(SCROLL_IDS));
  });
});

describe('scroll_registry — drift against constants.js', () => {
  it('SCROLL_DISPLAY_NAMES has an entry for every registry id and no extras', () => {
    expect(new Set(Object.keys(SCROLL_DISPLAY_NAMES))).toEqual(new Set(SCROLL_IDS));
  });

  it('SCROLL_DESCRIPTIONS has an entry for every registry id and no extras', () => {
    expect(new Set(Object.keys(SCROLL_DESCRIPTIONS))).toEqual(new Set(SCROLL_IDS));
  });
});

describe('scroll_registry — drift against image assets', () => {
  it('every registry id has a face image in master_scroll_faces/', () => {
    const missing = SCROLL_IDS.filter(id => !SCROLL_FACE_BY_SLUG[id]);
    expect(missing).toEqual([]);
  });

  it('no orphan image files exist (every face has a registry entry)', () => {
    const orphan = Object.keys(SCROLL_FACE_BY_SLUG).filter(slug => !SCROLL_BY_ID[slug]);
    expect(orphan).toEqual([]);
  });
});

describe('SCROLL_TIERS — descending order with return-first-match', () => {
  it('is in descending min order so the first satisfied threshold wins', () => {
    const mins = SCROLL_TIERS.map(t => t.min);
    const sorted = [...mins].sort((a, b) => b - a);
    expect(mins).toEqual(sorted);
  });
});
