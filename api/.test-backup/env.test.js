import { describe, it, expect } from 'vitest';

describe('env', () => {
  it('loads JWT_SECRET from .env.test', () => {
    expect(process.env.JWT_SECRET).toBeTruthy();
  });
});
