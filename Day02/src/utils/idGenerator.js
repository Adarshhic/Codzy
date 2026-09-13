const crypto = require('crypto');

/**
 * Generates a 24-character hexadecimal string.
 * Perfectly mirrors the MongoDB ObjectId format and entropy.
 * Used for creating new entity IDs in PostgreSQL post-migration.
 */
const generateId = () => crypto.randomBytes(12).toString('hex');

module.exports = { generateId };
