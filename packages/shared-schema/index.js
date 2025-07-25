const fs = require('fs');
const path = require('path');

// Export the schema as a string
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

module.exports = { typeDefs };