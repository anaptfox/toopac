import * as log from "https://deno.land/std/log/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";
import toJsonSchema from "https://cdn.skypack.dev/to-json-schema";
import { parse } from "https://deno.land/std@0.100.0/encoding/yaml.ts";
import deepDiff from "https://cdn.skypack.dev/deep-diff";
import { Database } from "https://deno.land/x/aloedb/mod.ts";

import webhook from "./outputs/webhook.ts";
import meroxa from "./outputs/meroxa.ts";

const configText = await Deno.readTextFile("./toopac.config.yaml");

type ToopacConfig = {
  request: {
    method: string;
    token: string;
    auth: string;
    host: string;
    path: string;
  };
  output: {
    meroxa: {
      endpoint: string;
      username: string;
      password: string;
    };
  
    webhook: {
      method: string;
      token: string;
      auth: string;
      host: string;
      path: string;
    };
  };
  polling: number;
  heartbeat: number;
  persistance: string;
  log: {
    filename: string;
    maxBytes: number;
    maxBackupCount: number;
  };
};

const config: ToopacConfig = parse(configText) as ToopacConfig;

await log.setup({
  //define handlers
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: "{msg}",
    }),
    file: new log.handlers.RotatingFileHandler("INFO", {
      filename: `./${config.log?.filename || "tupac"}.log`,
      maxBytes: config.log?.maxBytes || 15,
      maxBackupCount: config.log?.maxBackupCount || 5,
      formatter: (rec) =>
        JSON.stringify({
          region: rec.loggerName,
          ts: rec.datetime,
          level: rec.levelName,
          data: rec.msg,
        }),
    }),
  },

  //assign handlers to loggers
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
    client: {
      level: "INFO",
      handlers: ["file"],
    },
  },
});

const dl = log.getLogger();

// Initialization
const db = new Database<any>(config.persistance);

const main = async (time: number) => {
  if (config.heartbeat) {
    setInterval(() => {
      heartbeat();
    }, config.heartbeat * 1000);
  }

  while (true) {
    let opts: RequestInit = {
      method: config.request.method,
    };

    if (config.request.auth === "bearer") {
      opts.headers = new Headers({
        "Authorization": `Bearer ${config.request.token}`,
      });
    }

    const response = await fetch(
      `${config.request.host}${config.request.path}`,
      {
        method: config.request.method,
        headers: new Headers({
          "Authorization": `Bearer ${config.request.token}`,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Fetch error: ${response.statusText}`);
    }

    const after = await response.json();

    let lastResponse = await db.findOne({ key: 1 });

    if (!lastResponse) {
      await db.insertOne({ key: 1, data: after });

      await out(cdc("r", null, after, []));
    } else {
      const before = lastResponse.data;

      var differences = deepDiff.diff(before, after);

      if (differences) {
        lastResponse = await db.updateOne({ key: 1 }, { data: after });
        await out(cdc("u", before, after, differences));
      }
    }

    await sleep(time);
  }
};

const heartbeat = () => {
  dl.info({ heartbeat: true });
};

const cdc = (op: string, before: any, after: any, changes: []) => {
  let cdc = {
    schema: {
      before: toJsonSchema(before),
      after: toJsonSchema(after),
    },
    schemaChanges: [],
    changes: changes,
    payload: {
      before: before,
      after: after,
    },
    op: op,
    ts_ms: Date.now(),
  };

  var schemaDifferences = deepDiff.diff(cdc.schema.before, cdc.schema.after);

  if (schemaDifferences) {
    cdc.schemaChanges = schemaDifferences;
  }
  return cdc;
};

const out = async (msg: any) => {
  log.info(msg);

  if(!config.output) return;

  if (config.output.webhook) {
    webhook(msg, config.output.webhook)
  }
  if (config.output.meroxa) {
    meroxa(msg, config.output.meroxa)
  }
};

await main(config.polling || 10);
