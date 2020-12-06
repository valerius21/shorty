import { Migration } from '@mikro-orm/migrations';

export class Migration20201206134815 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "url" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "shorthand" text not null, "url" text not null, "secret" text not null);');
    this.addSql('alter table "url" add constraint "url_shorthand_unique" unique ("shorthand");');
  }

}
