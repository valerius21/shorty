import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class URL {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: Date })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: Date })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text", unique: true })
  shorthand!: string;

  @Field()
  @Property({ type: "text" })
  url!: string;

  @Property({ type: "text" })
  secret!: string;
}
