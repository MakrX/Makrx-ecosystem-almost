import { describe, it, expect } from 'vitest';
import { getRoleRedirect } from '../../../lib/roleRedirect';

describe('getRoleRedirect', () => {
  it('redirects super_admin to /admin', () => {
    expect(getRoleRedirect(['super_admin'])).toBe('/admin');
  });

  it('redirects admin to /org/home', () => {
    expect(getRoleRedirect(['admin'])).toBe('/org/home');
  });

  it('redirects makerspace_admin to /portal', () => {
    expect(getRoleRedirect(['makerspace_admin'])).toBe('/portal');
  });

  it('redirects service_provider to /jobs', () => {
    expect(getRoleRedirect(['service_provider'])).toBe('/jobs');
  });

  it('defaults unknown roles to /dashboard', () => {
    expect(getRoleRedirect(['something_else'])).toBe('/dashboard');
  });
});
