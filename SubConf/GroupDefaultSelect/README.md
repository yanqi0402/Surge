# GroupDefaultSelect

这个目录用于保存和应用 Surge `select` 策略组的当前选择。

公开的 `defaults.json` 文件只保存组名和选中的策略名。这里不能保存代理节点详情、PSK 值、控制器密码、`SUB_TOKEN` 或 GitHub token。

## 工作流程

1. 在一台 Surge 客户端里手动选好各个策略组。
2. 运行 `Group Default Export` 面板或 generic 脚本。
3. 脚本通过 Surge `$httpAPI` 读取本机当前选择。
4. Cloudflare Worker 根据当前模板校验这些选择，并把 `defaults.json` 写入这个 GitHub 目录。
5. 在另一台 Surge 客户端运行 `Group Default Import` 面板或 generic 脚本。

## Worker Secret

导出端点需要一个 GitHub fine-grained token，并且只需要给当前仓库 Contents read/write 权限。这个 token 只能保存为 Cloudflare Worker Secret：

1. 打开 <https://github.com/settings/personal-access-tokens/new>
2. `Token name` 填 `surge-group-default-export`
3. `Expiration` 可以选 `No expiration`
4. `Resource owner` 选 `yanqi0402`
5. `Repository access` 选 `Only select repositories`
6. 仓库只选 `yanqi0402/Surge`
7. `Repository permissions` 里把 `Contents` 设为 `Read and write`
8. 生成 token 后只复制一次，不要提交到 GitHub，也不要写进任何配置文件

写入 Worker Secret：

```bash
cd /Users/yanqi/codex/SubscribeSurgeConf
npx wrangler secret put GROUP_DEFAULT_SELECT_GITHUB_TOKEN
npm run deploy
```

确认 Secret 已存在：

```bash
npx wrangler secret list | rg GROUP_DEFAULT_SELECT_GITHUB_TOKEN
```

`Group Default Import` 只读取公开 raw `defaults.json`，不需要 GitHub token；`Group Default Export` 会写回 GitHub，所以需要这个 Worker Secret。

不要把这个 token 提交到本仓库，也不要写进 Surge 配置模板。
