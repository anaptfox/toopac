/**
 * meroxa.ts
 */

import { encode } from "https://deno.land/std/encoding/base64.ts"

 type MeroxaConfig = {
  endpoint: string;
  username: string;
  password: string;
};

export default async (msg: any, config: MeroxaConfig) => {
  let headers = new Headers();

  headers.set('Authorization', 'Basic ' + encode(config.username + ":" + config.password));

  await fetch(config.endpoint, {
    method: "POST",
    body: JSON.stringify(msg),
    headers
  });
}
