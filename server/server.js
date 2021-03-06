const express = require('express');
const path = require('path');
const db = require('./config/connection');
const {ApolloServer} = require('apollo-server-express');
// const routes = require('./routes');
const {typeDefs, resolvers} = require('./schemas');
const {authMiddleware} = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  context: authMiddleware 
});

async function startup() {
  await server.start();
  server.applyMiddleware({ app });
}
// integrate our Apollo server with the Express application as middleware
startup();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.use(routes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    // log where we can go to test our GQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});