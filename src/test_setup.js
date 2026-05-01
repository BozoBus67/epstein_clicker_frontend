// Vitest setup file — runs once before any test in any file.
// Adds @testing-library/jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`,
// etc.) to vitest's `expect`. Without this, you'd have to fall back to plain
// DOM equality checks for component tests.
import '@testing-library/jest-dom/vitest';
