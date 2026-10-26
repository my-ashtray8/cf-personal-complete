# CF Personal — 独立仓库完整包（候选版）
基于此前已经验证登录/KV 的版本整理；本包未上线到你的 Cloudflare，连接功能尚需实际环境测试。**不要把旧项目覆盖或删除。**

## 已包含
- 响应式中文后台、管理员登录（8 小时 HMAC Cookie）、KV 入口配置
- V2RayNG VLESS WS+TLS 订阅生成（Base64）、订阅令牌保护
- `/api/diagnostics`：登录后显示当前运行环境中变量/绑定是否存在或格式正确，不泄露其值
- `/connect`：实验性 VLESS TCP over WebSocket 转发；不支持 UDP、自动 ProxyIP、自动测速，可能受 Cloudflare 产品限制
- ProxyIP 列表仅保存，不参与转发。入口 IP/域名必须能将 TLS 和 WebSocket 请求路由到本项目域名。

## GitHub 仓库结构
仓库根目录应直接包含 `public/` 和 `functions/`，不要再套一层 CF-Personal-Complete 文件夹。

## Cloudflare Pages 配置（前提：项目/账户允许部署；如显示 blocked，请先向 Cloudflare 复核，不要用新仓库绕过封控）
1. GitHub 新建私有仓库，上传本 ZIP **解压后的内容**；原仓库保持不变。
2. Pages 连接仓库，Framework preset: None；Build command: `exit 0`；Build output directory: `public`；Root directory: 默认。
3. Settings → Bindings → KV namespace binding：变量名 `CF_PERSONAL_KV`，选择你的 KV（建议新建独立 KV，避免与旧项目共用数据）。
4. Settings → Variables and Secrets → Production：创建四个 Secret：
   - `ADMIN_PASSWORD`：强管理密码
   - `SESSION_SECRET`：至少 32 字符随机值
   - `VLESS_UUID`：标准 UUID，如使用 PowerShell `[guid]::NewGuid().ToString()`
   - `SUB_TOKEN`：至少 24 字符随机值，与上述三项不同
   不要将真实值写入 GitHub、截图、工单或聊天。
5. 保存后确认有使用新配置的**成功 Production 部署**。仅改 Cloudflare Secret 不等于 GitHub 新提交；必要时使用官方提供的重新部署操作，若显示 blocked 则停止并联系 Cloudflare。
6. 用正式 Production 域名登录，先点“检查当前部署”，确认全部 ✓；添加入口并保存，再生成订阅链接。
7. 用 Android V2RayNG 导入并进行真实连接测试。订阅能生成≠TCP 节点已经验证可用。

## 排查
- 后台能登录但 `sub-link` 报 503：登录后点击“检查当前部署”，只报告状态和域名，核对 Production/Preview、最新部署时间。
- 订阅接口 400：尚未保存有效入口。
- 项目显示 `Your Pages project has been blocked`：这是平台层限制，不是普通变量格式错误；停止重复部署，向 Cloudflare 官方申请复核。
- 不要公开分享 `/api/subscription?token=...` 链接；若泄露，轮换 SUB_TOKEN 并重新部署。

## 限制和安全
这是单管理员实验性项目，未实现登录限流、细粒度访问审计、完整代理协议兼容、UDP 或自动故障转移；请仅在你有权使用且符合平台条款的环境中部署。生产使用前需做连接、安全和兼容测试。
