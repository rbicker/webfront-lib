// generate a random string
const generateRandomString = () => {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => (`0${dec.toString(16)}`).substr(-2)).join('');
};

// calculate the SHA256 hash of the input text.
// returns a promise that resolves to an ArrayBuffer
const sha256 = (plain : string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

// base64-urlencodes the input string
// convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
// btoa accepts chars only within ascii 0-255 and base64 encodes them.
// then convert the base64 encoded to base64url encoded
// (replace + with -, replace / with _, trim trailing =)
const base64urlencode = (str : ArrayBuffer) => btoa(String.fromCharCode
  .apply(null, new Uint8Array(str) as unknown as number[]))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// return the base64-urlencoded sha256 hash for the PKCE challenge
const pkceChallengeFromVerifier = async (v : string) => {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
};

// configuration for a hydra auth code flow
interface HydraAuthCodeConfig{
  hydraBaseUrl: string,
  authUrl: string,
  clientId: string,
  redirectUri: string,
  state: string,
  verifier: string,
  challenge: string,
  originalHash: string,
}

// start a new hydra auth code flow
const newHydraAuthCodeFlow = async (hydraBaseUrl : string, clientId : string, redirectUri : string, scope = 'openid')
: Promise<HydraAuthCodeConfig> => {
  const state = generateRandomString();
  const verifier = generateRandomString();
  const challenge = await pkceChallengeFromVerifier(verifier);
  const authUrl = `${hydraBaseUrl}/oauth2/auth?
      response_type=code
      &code_challenge_method=S256
      &client_id=${clientId}
      &scope=${scope}
      &redirect_uri=${redirectUri}
      &state=${state}
      &code_challenge=${challenge}
      `.replace(/\s/g, '');
  return {
    hydraBaseUrl,
    clientId,
    redirectUri,
    state,
    verifier,
    challenge,
    authUrl,
    originalHash: window.location.hash,
  };
};

// query access token for given hydra flow + code
const getAccessToken = async (config : HydraAuthCodeConfig, code : string) => {
  const tokenUrl = `${config.hydraBaseUrl}/oauth2/token`;
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');

  const params = new Map<string, string>();
  params.set('grant_type', 'authorization_code');
  params.set('client_id', config.clientId);
  params.set('code_verifier', config.verifier);
  params.set('code', code);
  params.set('redirect_uri', config.redirectUri);

  const body = Array.from(params.keys()).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params.get(key) || '')}`).join('&');
  const requestInit : RequestInit = {
    method: 'POST',
    headers,
    body,
  };
  const response = await fetch(tokenUrl, requestInit);
  const resBody = await response.json();
  return resBody;
};

// configuration for a hydra logout flow
interface HydraLogoutConfig{
  hydraBaseUrl: string,
  state: string,
  logoutUrl: string,
  originalHash: string,
}

// create a new logout flow
const newHydraLogoutFlow = async (hydraBaseUrl : string, idToken : string, redirectUri : string)
: Promise<HydraLogoutConfig> => {
  const state = generateRandomString();
  const logoutUrl = `${hydraBaseUrl}/oauth2/sessions/logout?
  state=${state}
  &id_token_hint=${idToken}
  &post_logout_redirect_uri=${redirectUri}
  `.replace(/\s/g, '');
  return {
    hydraBaseUrl,
    logoutUrl,
    state,
    originalHash: window.location.hash,
  };
};

export {
  newHydraAuthCodeFlow, getAccessToken, newHydraLogoutFlow,
};
