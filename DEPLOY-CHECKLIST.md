# 一次部署检查单

- [ ] 旧仓库和旧 Pages 项目未删除或覆盖
- [ ] 新仓库根目录直接有 public 和 functions
- [ ] Framework=None；Build command=exit 0；Output=public
- [ ] 生产环境 KV 绑定名 CF_PERSONAL_KV
- [ ] Production 四个 Secret 名称准确，且值未写进 GitHub
- [ ] 保存 Secret 后有一次成功的 Production 部署
- [ ] 正式域名能登录，部署自检全部正常
- [ ] 保存入口，生成订阅，导入 V2RayNG
- [ ] 实测 WebSocket/TCP 连接（不能仅凭订阅成功判断）
- [ ] 若出现 blocked，停止重复部署并申请平台复核
