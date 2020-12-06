import { __dbPassword__, __dbName__, __dbUser__, __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { URL } from "./entities/URL";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [URL],
  dbName: __dbName__,
  user: __dbUser__,
  password: __dbPassword__,
  debug: !__prod__,
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
