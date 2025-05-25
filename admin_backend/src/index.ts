import "reflect-metadata";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServer } from "@apollo/server";
import dotenv from "dotenv";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { AppDataSource } from "./datasource";

dotenv.config();

const PORT = Number(process.env.PORT) || 3003;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: async () => ({}),
    });

    console.log(`So now its working at ${url}`);
  } catch (err) {
    console.error("didn't got connected", err);
  }
};

startServer();
