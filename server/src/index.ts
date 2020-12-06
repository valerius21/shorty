import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import { __hostname__, __port__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { URLResolver } from "./resolvers/url";

/**
 * Main entry
 */
const main = async () => {
  // init the ORM
  const orm = await MikroORM.init(microConfig);

  // starting the migration
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, URLResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.get("/", (_, res) => {
    res.send("hello");
  });

  app.listen(__port__, () =>
    console.log(
      `started server on http://${__hostname__}:${__port__}\ngraphql playground on http://${__hostname__}:${__port__}/graphql`
    )
  );
};

main().catch(console.error);
