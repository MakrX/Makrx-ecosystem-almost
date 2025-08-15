import Keycloak, { KeycloakInitOptions, KeycloakLoginOptions } from 'keycloak-js';

export interface User {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roles: string[];
  isActive: boolean;
  createdAt?: string;
}

class AuthService {
  private keycloak = new Keycloak({
    url: 'https://auth.makrx.org',
    realm: 'makrx',
    clientId: 'makrx-cave',
  });

  async init() {
    const options: KeycloakInitOptions = {
      pkceMethod: 'S256',
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    };

    const authenticated = await this.keycloak.init(options);

    this.keycloak.onTokenExpired = () => {
      this.keycloak.updateToken(60).catch(() => {
        this.login();
      });
    };

    return authenticated;
  }

  login(options?: KeycloakLoginOptions) {
    this.keycloak.login({
      redirectUri: window.location.origin + '/portal',
      ...options,
    });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin + '/' });
  }

  register() {
    this.keycloak.register({ redirectUri: window.location.origin + '/portal' });
  }

  isAuthenticated() {
    return !!this.keycloak.authenticated;
  }

  getToken() {
    return this.keycloak.token;
  }

  getRefreshToken() {
    return this.keycloak.refreshToken;
  }

  getUser(): User | null {
    const parsed = this.keycloak.tokenParsed;
    if (!parsed) return null;
    const roles = (parsed.realm_access?.roles as string[]) || [];
    return {
      id: parsed.sub as string,
      email: parsed.email as string | undefined,
      username: parsed.preferred_username as string | undefined,
      firstName: parsed.given_name as string | undefined,
      lastName: parsed.family_name as string | undefined,
      role: roles[0] || 'user',
      roles,
      isActive: true,
      createdAt: parsed.iat ? new Date((parsed.iat as number) * 1000).toISOString() : undefined,
    };
  }

  getRoles(): string[] {
    return (this.keycloak.tokenParsed?.realm_access?.roles as string[]) || [];
  }

  hasRole(role: string) {
    return this.getRoles().includes(role);
  }
}

export const authService = new AuthService();
export default authService;
