/**
 * Fortress Crypto Engine v2
 * Implements Master Key (MK) architecture with Recovery support.
 * Data -> Encrypted with MK
 * MK -> Encrypted with Password (stored in DB)
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT_LEN = 16;
const IV_LEN = 12;

/**
 * Generates a cryptographically strong random Master Key.
 */
export function generateMasterKey(): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Derives a key from a password to wrap/unwrap the Master Key.
 */
async function deriveWrappingKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts the Master Key using the user's password.
 */
export async function wrapMasterKey(masterKey: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
  
  const wrappingKey = await deriveWrappingKey(password, salt);
  const encryptedMK = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    encoder.encode(masterKey)
  );

  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedMK.byteLength);
  buffer.set(salt, 0);
  buffer.set(iv, salt.byteLength);
  buffer.set(new Uint8Array(encryptedMK), salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode(...buffer));
}

/**
 * Decrypts the Master Key using the user's password.
 */
export async function unwrapMasterKey(wrappedKey: string, password: string): Promise<string> {
  try {
    const buffer = Uint8Array.from(atob(wrappedKey), c => c.charCodeAt(0));
    const salt = buffer.slice(0, SALT_LEN);
    const iv = buffer.slice(SALT_LEN, SALT_LEN + IV_LEN);
    const ciphertext = buffer.slice(SALT_LEN + IV_LEN);

    const wrappingKey = await deriveWrappingKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error('INVALID_PASSWORD');
  }
}

/**
 * Hashes the recovery key so we can verify it without storing the key itself.
 */
export async function hashRecoveryKey(recoveryKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(recoveryKey);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

/**
 * Standard data encryption using the Master Key.
 */
export async function encryptData(data: any, masterKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
  
  const key = await window.crypto.subtle.importKey(
    'raw',
    Uint8Array.from(atob(masterKey), c => c.charCodeAt(0)),
    'AES-GCM',
    false,
    ['encrypt']
  );

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  const buffer = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(ciphertext), iv.byteLength);

  return btoa(String.fromCharCode(...buffer));
}

/**
 * Standard data decryption using the Master Key.
 */
export async function decryptData(cipherText: string, masterKey: string): Promise<any> {
  try {
    const buffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const iv = buffer.slice(0, IV_LEN);
    const ciphertext = buffer.slice(IV_LEN);

    const key = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(masterKey), c => c.charCodeAt(0)),
      'AES-GCM',
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    console.error('Decryption failed', e);
    throw new Error('DECRYPTION_FAILED');
  }
}
