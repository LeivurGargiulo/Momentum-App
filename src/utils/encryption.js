/**
 * Encryption utilities for secure data sync
 * Uses Web Crypto API for client-side encryption
 */

// Convert string to ArrayBuffer
function str2ab(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert ArrayBuffer to string
function ab2str(buffer) {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert ArrayBuffer to base64
function ab2b64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function b642ab(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random salt
export function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return ab2b64(salt);
}

// Generate a random IV (Initialization Vector)
export function generateIV() {
  const iv = new Uint8Array(12); // GCM recommends 96-bit IV
  crypto.getRandomValues(iv);
  return iv;
}

// Derive encryption key from sync code
export async function deriveKey(syncCode, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    str2ab(syncCode),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b642ab(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data with AES-GCM
export async function encryptData(data, syncCode) {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(syncCode, salt);
    
    const dataString = JSON.stringify(data);
    const encodedData = str2ab(dataString);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );
    
    // Combine salt, iv, and encrypted data for transport
    const result = {
      salt: salt,
      iv: ab2b64(iv),
      data: ab2b64(encrypted),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    return JSON.stringify(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data with AES-GCM
export async function decryptData(encryptedString, syncCode) {
  try {
    const encryptedObj = JSON.parse(encryptedString);
    
    // Validate structure
    if (!encryptedObj.salt || !encryptedObj.iv || !encryptedObj.data) {
      throw new Error('Invalid encrypted data structure');
    }
    
    const key = await deriveKey(syncCode, encryptedObj.salt);
    const iv = b642ab(encryptedObj.iv);
    const encryptedData = b642ab(encryptedObj.data);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );
    
    const decryptedString = ab2str(decrypted);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - invalid sync code or corrupted data');
  }
}

// Generate a random sync code
export function generateSyncCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 8 character code
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 8; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  
  // Format as XXXX-XXXX for readability
  return code.slice(0, 4) + '-' + code.slice(4);
}

// Validate sync code format
export function validateSyncCode(code) {
  // Remove spaces and convert to uppercase
  const cleanCode = code.replace(/\s/g, '').toUpperCase();
  
  // Check format: XXXX-XXXX or XXXXXXXX
  const pattern = /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/;
  return pattern.test(cleanCode);
}

// Normalize sync code (remove formatting)
export function normalizeSyncCode(code) {
  return code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

// Calculate checksum for data integrity
export async function calculateChecksum(data) {
  const dataString = JSON.stringify(data);
  const encoded = str2ab(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 8); // Return first 8 chars of hash
}

// Compress data before encryption (optional, for large datasets)
export function compressData(data) {
  // For now, just stringify. Could add compression library later
  return JSON.stringify(data);
}

// Decompress data after decryption
export function decompressData(compressedData) {
  // For now, just parse. Could add decompression library later
  return typeof compressedData === 'string' ? JSON.parse(compressedData) : compressedData;
}