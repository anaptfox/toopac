/**
 * webhook.ts
 */

type WebhookConfig = {
  method: string;
  token: string;
  auth: string;
  host: string;
  path: string;
};

const webhook = async (msg: any, config: WebhookConfig) => {
  fetch(`${config.host}${config.path || "/"}`, {
    method: "POST",
    body: JSON.stringify(msg),
    headers: {
      "content-type": "application/json",
    },
  });
}

export default webhook;