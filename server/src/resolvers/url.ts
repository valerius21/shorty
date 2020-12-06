import { nanoid } from "nanoid";
import { __idLength__ as __idSize__ } from "src/constants";
import { ShortyContext } from "src/types";
import { URL } from "src/entities/URL";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";

@InputType()
class URLInput {
  @Field()
  url: string;
  @Field()
  shorthand?: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class URLResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => URL, { nullable: true })
  url?: URL;
  @Field(() => String)
  secret?: string;
}

@Resolver()
export class URLResolver {
  @Mutation(() => URLResponse)
  async newURL(
    @Arg("options") options: URLInput,
    @Ctx() { em }: ShortyContext
  ): Promise<URLResponse> {
    if (!options.shorthand) {
      options.shorthand = nanoid(__idSize__);
      // TODO: Handle collisions
    }
    const secret = nanoid();
    const urlPair = em.create(URL, {
      secret,
      shorthand: options.shorthand,
      url: options.url,
    });

    try {
      await em.persistAndFlush(urlPair);
    } catch (err) {
      if (err.message) {
        return {
          errors: [
            {
              field: "",
              message: err.message,
            },
          ],
        };
      }
      console.log("messasge: ", err.message);
    }
    return {
      url: urlPair,
      secret,
    };
  }
}