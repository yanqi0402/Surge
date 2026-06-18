# SubConf

`surge.template.conf` is a public-safe Surge subscription template.

It intentionally keeps sensitive values out of GitHub:

- `psk={{PSK_*}}` is replaced by Cloudflare Worker Secrets before the subscription is returned.
- `psk=hidden` is still supported for backward compatibility and maps from the proxy name.
- `{{SURGE_CONTROLLER_SECRET}}` is replaced by a Cloudflare Worker Secret before the subscription is returned.
- `{{GROUP_DEFAULT_SELECT_EXPORT_URL}}` and `{{GROUP_DEFAULT_SELECT_DEFAULTS_URL}}` are replaced by the Worker at request time for the GroupDefaultSelect import/export scripts.

Use the Cloudflare Worker subscription URL in Surge, not the GitHub raw URL.

Current Worker template source:

```text
https://raw.githubusercontent.com/yanqi0402/Surge/main/SubConf/surge.template.conf
```

After changing this template on GitHub, refresh the Cloudflare Worker subscription URL in Surge. The Worker injects Cloudflare Secrets at request time.

`SubConf/GroupDefaultSelect/defaults.json` stores selected policy names for `select` policy groups. It is public by design and must only contain group names and policy names.

Example:

```ini
JP-CO-01 = snell, 172.81.102.21, 7891, psk={{PSK_JP_CO_01}}, version=5, reuse=true, tfo=true
```
