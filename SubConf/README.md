# SubConf

`surge.template.conf` 是公开安全的 Surge 订阅模板。

这个模板会刻意把敏感值留在 GitHub 之外：

- `psk={{PSK_*}}` 会在 Worker 返回订阅前替换成 Cloudflare Worker Secret。
- `psk=hidden` 仍然保留兼容支持，会按节点名映射到对应 Secret。
- `{{SURGE_CONTROLLER_SECRET}}` 会在 Worker 返回订阅前替换成 Cloudflare Worker Secret。
- `{{GROUP_DEFAULT_SELECT_EXPORT_URL}}` 和 `{{GROUP_DEFAULT_SELECT_DEFAULTS_URL}}` 会在请求时由 Worker 替换，供 GroupDefaultSelect 导入/导出脚本使用。

在 Surge 里应使用 Cloudflare Worker 订阅地址，不要直接使用 GitHub Raw 地址。

当前 Worker 读取的模板源：

```text
https://raw.githubusercontent.com/yanqi0402/Surge/main/SubConf/surge.template.conf
```

在 GitHub 修改这个模板后，到 Surge 里刷新 Cloudflare Worker 订阅地址。Worker 会在请求时注入 Cloudflare Secrets。

`SubConf/GroupDefaultSelect/defaults.json` 用来保存 `select` 策略组当前选中的策略名。这个文件按设计就是公开文件，只能包含组名和策略名。

示例：

```ini
JP-CO-01 = snell, 172.81.102.21, 7891, psk={{PSK_JP_CO_01}}, version=5, reuse=true, tfo=true
```
