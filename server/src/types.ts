import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

export type ShortyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
