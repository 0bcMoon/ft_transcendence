// Load environment variables before running tests
// First load the main .env file, then override with .env.test if it exists
require('dotenv').config();
require('dotenv').config({ path: '.env.test' });

// Override DB_PATH for tests if not already set
// if (!process.env.DB_PATH) {
process.env.DB_PATH = '/tmp/test.db';
// }

// Set NODE_ENV to test if not already set
// if (!process.env.NODE_ENV) {
process.env.NODE_ENV = 'test';
// }
