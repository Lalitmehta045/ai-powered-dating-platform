/**
 * Global test setup.
 *
 * Sets required environment variables before any test module
 * imports. This ensures the centralized env config parses
 * successfully without a real .env file.
 */

process.env.PORT = "5001";
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/heartsync-test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-unit-tests";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key";
process.env.CLOUDINARY_NAME = "test-cloud";
process.env.CLOUDINARY_KEY = "test-key";
process.env.CLOUDINARY_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:5173";
