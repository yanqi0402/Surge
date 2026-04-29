# SubConf

`surge.template.conf` is a public-safe Surge subscription template.

It intentionally keeps sensitive values out of GitHub:

- `psk=hidden` is replaced by Cloudflare Worker Secrets before the subscription is returned.
- `{{SURGE_CONTROLLER_SECRET}}` is replaced by a Cloudflare Worker Secret before the subscription is returned.

Use the Cloudflare Worker subscription URL in Surge, not the GitHub raw URL.

Current Worker template source:

```text
https://raw.githubusercontent.com/yanqi0402/Surge/main/SubConf/surge.template.conf
```

After changing this template on GitHub, refresh the Cloudflare Worker subscription URL in Surge. The Worker injects Cloudflare Secrets at request time.
