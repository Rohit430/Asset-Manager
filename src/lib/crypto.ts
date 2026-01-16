/**
 * Professional End-to-End Encryption Engine (AES-GCM + PBKDF2)
 * Ensures data is encrypted locally before ever reaching the database.
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT_LEN = 16;
const IV_LEN = 12;

/**
 * Derives a cryptographic key from a password and salt.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
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
      salt,
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
 * Encrypts data using AES-GCM.
 * Payload structure: salt (16 bytes) + iv (12 bytes) + ciphertext
 */
export async function encryptData(data: any, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
  
  const key = await deriveKey(password, salt);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const encryptedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
  encryptedBuffer.set(salt, 0);
  encryptedBuffer.set(iv, salt.byteLength);
  encryptedBuffer.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode(...encryptedBuffer));
}

/**
 * Decrypts data using AES-GCM.
 */
export async function decryptData(cipherText: string, password: string): Promise<any> {
  try {
    const encryptedBuffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    
    const salt = encryptedBuffer.slice(0, SALT_LEN);
    const iv = encryptedBuffer.slice(SALT_LEN, SALT_LEN + IV_LEN);
    const ciphertext = encryptedBuffer.slice(SALT_LEN + IV_LEN);
    
    const key = await deriveKey(password, salt);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer));
  } catch (error) {
    console.error('Decryption failed. Incorrect password or corrupted data.', error);
    throw new Error('DECRYPTION_FAILED');
  }
}