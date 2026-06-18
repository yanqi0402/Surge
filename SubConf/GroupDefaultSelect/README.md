# GroupDefaultSelect

This directory stores and applies the selected policy for Surge `select` policy groups.

The public `defaults.json` file only contains group names and selected policy names. It must not contain proxy descriptors, PSK values, controller passwords, `SUB_TOKEN`, or GitHub tokens.

## Flow

1. Pick policy selections manually in one Surge client.
2. Run the `Group Default Export` panel or generic script.
3. The script reads local selections with Surge `$httpAPI`.
4. The Cloudflare Worker validates the selections against the current template and writes `defaults.json` to this GitHub directory.
5. Run the `Group Default Import` panel or generic script on another Surge client.

## Worker Secret

The export endpoint needs a GitHub fine-grained token with Contents read/write permission for this repository. Store it only as a Cloudflare Worker Secret:

```bash
npx wrangler secret put GROUP_DEFAULT_SELECT_GITHUB_TOKEN
```

Do not commit the token to this repository or to the Surge profile template.
