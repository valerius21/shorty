import { nanoid } from "nanoid";
import { __idLength__ as __idSize__ } from "../constants";
import { ShortyContext } from "../types";
import { URL } from "../entities/URL";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

@InputType()
class URLInput {
  @Field()
  url: string;
  @Field(() => String, { nullable: true })
  shorthand?: string;
}

@InputType()
class URLChange {
  @Field()
  shorthand: string;
  @Field(() => String, { nullable: true })
  newURL?: string;
  @Field()
  secret: string;
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
  @Field(() => String, { nullable: true })
  secret?: string;
}

@ObjectType()
class URLRead {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => String, { nullable: true })
  targetURL?: string;
}

@Resolver()
export class URLResolver {
  @Mutation(() => URLResponse)
  async newURL(
    @Arg("options") options: URLInput,
    @Ctx() { em }: ShortyContext
  ): Promise<URLResponse> {
    if (options.shorthand) {
      // check if ID is taken
      const [_, number] = await em.findAndCount(URL, {
        shorthand: options.shorthand,
      });
      if (number > 0)
        return {
          errors: [
            { field: "shorthand", message: "shorthand is already taken!" },
          ],
        };
    } else {
      // generate random id
      do {
        options.shorthand = nanoid(__idSize__);
      } while (await em.findOne(URL, { shorthand: options.shorthand }));
    }
    const secret = nanoid();
    const hashedSecret = await argon2.hash(secret);
    const urlPair = em.create(URL, {
      secret: hashedSecret,
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
      console.log("message: ", err.message);
    }
    return {
      url: urlPair,
      secret,
    };
  }

  @Query(() => URLRead)
  async lookupURL(
    @Arg("shorthand") shorthand: string,
    @Ctx() { em }: ShortyContext
  ): Promise<URLRead> {
    let url: string;
    try {
      url = (await em.findOne(URL, { shorthand: shorthand }))!.url;
      console.log("url:", url);
    } catch (err) {
      console.log(err.message);
      if (err.message === "Cannot read property 'url' of null")
        return {
          errors: [{ field: "shorthand", message: "shorthand not known" }],
        };
      else {
        return {
          errors: [{ field: "shorthand", message: err.message }],
        };
      }
    }

    return {
      targetURL: url,
    };
  }

  @Mutation(() => URLResponse)
  async updateURL(
    @Arg("options") options: URLChange,
    @Ctx() { em }: ShortyContext
  ): Promise<URLResponse> {
    if (!options.shorthand || !options.secret) {
      const shrt = !options.shorthand
        ? { field: "shorthand", message: "no shorthand provided!" }
        : null;
      if (shrt)
        return {
          errors: [shrt],
        };
      else
        return {
          errors: [{ field: "secret", message: "no secret provided!" }],
        };
    }
    if (!options.newURL) {
      return {
        errors: [{ field: "newURL", message: "no new URL provided!" }],
      };
    }
    const url = await em.findOne(URL, { shorthand: options.shorthand });
    if (!url) {
      // url == null
      return {
        errors: [
          { field: "shorthand", message: "could not find shorthand entry!" },
        ],
      };
    }
    const verified = await argon2.verify(url.secret, options.secret);
    if (!verified) {
      return {
        errors: [{ field: "secret", message: "wrong secret" }],
      };
    }
    const newSecret = nanoid();
    const newHashedSecret = await argon2.hash(newSecret);
    url.secret = newHashedSecret;
    url.url = options.newURL;
    url.updatedAt = new Date();

    await em.flush();

    return {
      url,
      secret: newSecret,
    };
  }

  @Mutation(() => Boolean)
  async deleteURL(
    @Arg("options") options: URLChange,
    @Ctx() { em }: ShortyContext
  ): Promise<Boolean> {
    const url = await em.findOne(URL, { shorthand: options.shorthand });
    if (!url) return false;
    const valid = argon2.verify(url.secret, options.secret);
    if (!valid) return false;
    await em.removeAndFlush(url);
    return true;
  }
}
