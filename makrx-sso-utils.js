/**
 * MakrX Ecosystem SSO Utilities
 * Centralized authentication functions for consistent SSO across all MakrX sites
 */

// SSO Configuration
const SSO_CONFIG = {
  authDomain: 'https://auth.makrx.org',
  realm: 'makrx',
  clients: {
    'makrx.org': 'makrx-gateway',
    'makrcave.com': 'makrx-cave', 
    'makrx.store': 'makrx-store'
  }
};

/**
 * Get the appropriate client ID based on the current domain
 */
function getClientId() {
  if (typeof window === 'undefined') return 'makrx-store'; // Default for SSR
  
  const hostname = window.location.hostname;
  
  // Map subdomains and domains to client IDs
  if (hostname.includes('makrcave') || hostname.includes('cave')) {
    return SSO_CONFIG.clients['makrcave.com'];
  } else if (hostname.includes('store')) {
    return SSO_CONFIG.clients['makrx.store'];
  } else {
    return SSO_CONFIG.clients['makrx.org'];
  }
}

/**
 * Generate a secure random state for OAuth flow
 */
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store the current URL for post-login redirect
 */
function storeRedirectUrl() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('makrx_redirect_url', window.location.href);
  }
}

/**
 * Get stored redirect URL and clear it
 */
function getAndClearRedirectUrl() {
  if (typeof window === 'undefined') return null;
  
  const url = sessionStorage.getItem('makrx_redirect_url');
  sessionStorage.removeItem('makrx_redirect_url');
  return url;
}

/**
 * Redirect to SSO login with proper return URL
 */
function redirectToSSO() {
  if (typeof window === 'undefined') return;
  
  storeRedirectUrl();
  
  const clientId = getClientId();
  const state = generateState();
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state
  });
  
  // Store state for validation
  sessionStorage.setItem('makrx_oauth_state', state);
  
  // Redirect to auth.makrx.org
  window.location.href = `${SSO_CONFIG.authDomain}/realms/${SSO_CONFIG.realm}/protocol/openid-connect/auth?${params}`;
}

/**
 * Logout from SSO and redirect
 */
function logoutFromSSO() {
  if (typeof window === 'undefined') return;
  
  const clientId = getClientId();
  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: window.location.origin
  });
  
  // Clear local storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('makrx_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('makrx_')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Redirect to SSO logout
  window.location.href = `${SSO_CONFIG.authDomain}/realms/${SSO_CONFIG.realm}/protocol/openid-connect/logout?${params}`;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = {
    redirectToSSO,
    logoutFromSSO,
    getClientId,
    getAndClearRedirectUrl,
    SSO_CONFIG
  };
} else if (typeof window !== 'undefined') {
  // Browser global
  window.MakrXSSO = {
    redirectToSSO,
    logoutFromSSO,
    getClientId,
    getAndClearRedirectUrl,
    SSO_CONFIG
  };
}

// ES6 modules
export {
  redirectToSSO,
  logoutFromSSO,
  getClientId,
  getAndClearRedirectUrl,
  SSO_CONFIG
};
