/**
 * GitHub Gist API service wrapper
 * Handles creation and retrieval of anonymous gists for sync
 */

const GITHUB_API_BASE = 'https://api.github.com';
const GIST_DESCRIPTION = 'Momentum Sync Data (Encrypted)';
const GIST_FILENAME = 'momentum-sync.json';

// Rate limiting tracking
let requestCount = 0;
let resetTime = Date.now() + 3600000; // 1 hour from now

// Check rate limiting
function checkRateLimit() {
  const now = Date.now();
  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 3600000;
  }
  
  if (requestCount >= 55) { // Leave 5 requests as buffer
    const minutesLeft = Math.ceil((resetTime - now) / 60000);
    throw new Error(`Rate limit reached. Please try again in ${minutesLeft} minutes.`);
  }
  
  requestCount++;
}

/**
 * Create an anonymous Gist
 * @param {string} encryptedData - The encrypted data string
 * @returns {Promise<{id: string, url: string}>} Gist info
 */
export async function createGist(encryptedData) {
  checkRateLimit();
  
  const gistData = {
    description: `${GIST_DESCRIPTION} - ${new Date().toISOString()}`,
    public: false,
    files: {
      [GIST_FILENAME]: {
        content: encryptedData
      }
    }
  };
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(gistData)
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to create gist: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      id: result.id,
      url: result.html_url,
      rawUrl: result.files[GIST_FILENAME].raw_url,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Error creating gist:', error);
    throw new Error(`Failed to upload sync data: ${error.message}`);
  }
}

/**
 * Retrieve a Gist by ID
 * @param {string} gistId - The Gist ID
 * @returns {Promise<string>} The encrypted data content
 */
export async function getGist(gistId) {
  checkRateLimit();
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Sync code not found or has expired.');
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to retrieve gist: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Check if the expected file exists
    if (!result.files || !result.files[GIST_FILENAME]) {
      throw new Error('Invalid sync data format');
    }
    
    return result.files[GIST_FILENAME].content;
  } catch (error) {
    console.error('Error retrieving gist:', error);
    throw new Error(`Failed to download sync data: ${error.message}`);
  }
}

/**
 * Delete a Gist (requires authentication, optional feature)
 * For now, we'll rely on manual expiry or GitHub's retention
 * @param {string} gistId - The Gist ID
 * @param {string} token - GitHub personal access token (optional)
 */
export async function deleteGist(gistId, token) {
  if (!token) {
    console.warn('Cannot delete gist without authentication token');
    return false;
  }
  
  checkRateLimit();
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting gist:', error);
    return false;
  }
}

/**
 * Parse Gist ID from a sync code
 * Sync codes contain the Gist ID embedded
 * @param {string} syncCode - The formatted sync code
 * @returns {string|null} The Gist ID or null if invalid
 */
export function parseGistIdFromSyncCode(syncCode, gistIdMapping) {
  // For simple implementation, we'll store the mapping in localStorage
  // In production, you might encode the Gist ID in the sync code itself
  return gistIdMapping[syncCode] || null;
}

/**
 * Get rate limit status
 * @returns {object} Rate limit info
 */
export function getRateLimitStatus() {
  const now = Date.now();
  const remaining = Math.max(0, 55 - requestCount);
  const resetInMinutes = Math.max(0, Math.ceil((resetTime - now) / 60000));
  
  return {
    remaining,
    resetInMinutes,
    isLimited: remaining === 0
  };
}

/**
 * Format a Gist URL for display
 * @param {string} gistId - The Gist ID
 * @returns {string} The formatted URL
 */
export function formatGistUrl(gistId) {
  return `https://gist.github.com/${gistId}`;
}

/**
 * Validate a Gist ID format
 * @param {string} gistId - The Gist ID to validate
 * @returns {boolean} True if valid format
 */
export function validateGistId(gistId) {
  // GitHub Gist IDs are 32 character hex strings
  return /^[a-f0-9]{32}$/i.test(gistId);
}

/**
 * Create a shareable link from sync code
 * @param {string} syncCode - The sync code
 * @returns {string} A shareable URL
 */
export function createShareableLink(syncCode) {
  const baseUrl = window.location.origin;
  return `${baseUrl}?sync=${encodeURIComponent(syncCode)}`;
}

// Export rate limit info for UI display
export const RATE_LIMIT = {
  MAX_REQUESTS: 60,
  WINDOW_MS: 3600000 // 1 hour
};