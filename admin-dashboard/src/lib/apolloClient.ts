import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3003/",
  cache: new InMemoryCache(),
});

export default client;
