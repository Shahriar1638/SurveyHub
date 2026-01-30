require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

console.log("--- Debug Info ---");
console.log(`DB_USER from env: ${user ? user : 'undefined'}`);
console.log(`DB_PASS from env: ${pass ? 'Defined (Length: ' + pass.length + ')' : 'undefined'}`);

if (!user || !pass) {
    console.error("ERROR: DB_USER or DB_PASS is missing in .env file");
    process.exit(1);
}

// Check for special characters in password that might need encoding
const specialChars = ['@', ':', '/', '?', '#', '[', ']'];
const hasSpecialChars = specialChars.some(char => pass.includes(char));

if (hasSpecialChars) {
    console.warn("\nWARNING: Your password contains special characters that might break the URI connection string.");
    console.warn("Try URL encoding your password in the .env file.");
    console.warn(`Example: If password is 'p@ss', try 'p%40ss'`);
}

const uri = `mongodb+srv://${user}:${pass}@cluster0.uwwtyq1.mongodb.net/?appName=Cluster0`;

// Mask password for display
const maskedUri = uri.replace(pass, '****');
console.log(`\nConstructed URI: ${maskedUri}`);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("\nAttempting to connect...");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("SUCCESS: Connected to MongoDB!");
  } catch (error) {
    console.error("\nCONNECTION FAILED:");
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
