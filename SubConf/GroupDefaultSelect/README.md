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

```bash
npx wrangler secret put GROUP_DEFAULT_SELECT_GITHUB_TOKEN
```

不要把这个 token 提交到本仓库，也不要写进 Surge 配置模板。
