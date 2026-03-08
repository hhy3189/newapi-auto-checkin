# 多网站自动签到 Chrome 扩展

基于 linux.do OAuth2 授权的多网站自动签到 Chrome 扩展，支持所有使用 New API 平台的站点。

## 功能特性

- **自动 OAuth 登录**：自动完成 linux.do OAuth2 授权流程
- **后台签到**：完全后台执行，不打开可见窗口
- **Badge 通知**：扩展图标显示签到进度和结果
- **定时签到**：每天 09:00 自动执行签到
- **站点管理**：可视化添加、删除、启用/禁用站点
- **配置导入导出**：支持站点配置的备份和迁移
- **缓存机制**：认证信息缓存，减少重复登录
- **Cloudflare 防护绕过**：自动检测并绕过 Cloudflare Bot Management

## 安装方法

1. 下载或克隆本项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension` 文件夹

## 使用说明

### 首次使用

1. 确保已在 linux.do 登录
2. 点击扩展图标打开弹窗
3. 点击"+ 添加站点"按钮
4. 输入站点域名（如 `example.com`）
5. 点击"立即签到"测试

### 自动签到

扩展会在每天 09:00 自动执行签到，无需手动操作。

### Badge 通知

- **签到中**：显示进度（如 "1/3"、"2/3"）
- **签到成功**：绿色背景 + "✓"
- **有失败**：红色背景 + "✗N"（N为失败数量）
- Badge 会在 5 秒后自动消失

### 站点管理

- **启用/禁用**：点击站点前的开关
- **删除站点**：点击站点右侧的 "×" 按钮
- **查看状态**：每个站点显示最近一次签到结果

### 配置导入导出

- **导出**：点击"导出配置"按钮，保存为 JSON 文件
- **导入**：点击"导入配置"按钮，选择 JSON 文件
  - 覆盖模式：替换所有现有站点
  - 合并模式：只添加新站点，保留现有站点

## 支持的站点

所有使用 New API 平台且支持 linux.do OAuth 登录的站点。

添加新站点时，只需输入域名即可，扩展会自动配置签到接口。

## 技术说明

### OAuth 流程

1. 在浏览器标签页中获取站点的 `linuxdo_client_id`（绕过 Cloudflare）
2. 在标签页中获取 OAuth `state` 参数（CSRF 保护）
3. 在同一标签页中打开 linux.do 授权页面
4. 自动点击"允许"按钮
5. 捕获回调 URL 中的 `code` 参数
6. 调用站点的 OAuth 回调 API 完成登录
7. 验证 session 是否建立（检查 localStorage['user']）
8. 导航到登录页并捕获认证请求头（Cookie + New-API-User）
9. 验证认证头有效性

### 认证机制

New API 平台使用两种认证方式：

1. **Session Cookie**：服务端 session 认证
2. **New-API-User 请求头**：从 localStorage['user'] 读取用户 ID

扩展会同时捕获这两种认证信息，确保签到请求成功。

### 缓存策略

- 认证头缓存在 `chrome.storage.local` 中
- 每次签到前检查缓存是否有效
- 401 错误时自动重新登录并更新缓存
- Cloudflare 错误时自动重新登录并标记站点

### Cloudflare 防护处理

扩展采用智能检测机制处理 Cloudflare Bot Management：

1. **默认模式**：优先使用 service worker 发起请求（速度快）
2. **自动检测**：当检测到 Cloudflare 拦截（返回 HTML 验证页面）时
3. **自动切换**：标记该站点并切换到浏览器标签页执行模式
4. **持久化标记**：标记保存在缓存中，后续签到直接使用标签页模式
5. **绕过验证**：在真实浏览器环境中执行请求，获取有效的 cf_clearance cookie

这种机制确保：
- 无 Cloudflare 防护的站点保持高速签到
- 有 Cloudflare 防护的站点自动绕过验证
- 无需手动配置，全自动识别和处理

## 常见问题

### 签到失败

1. 确保已在 linux.do 登录
2. 检查站点是否支持 linux.do OAuth
3. 查看浏览器控制台日志（F12 → Console）

### 无法添加站点

1. 确保输入的是有效域名（如 `example.com`）
2. 不要包含 `https://` 或路径
3. 域名必须包含 `.`

### Badge 不显示

1. 在 `chrome://extensions/` 重新加载扩展
2. 检查扩展图标是否固定在工具栏

## 文件结构

```
chrome-extension/
├── manifest.json       # 扩展清单
├── background.js       # 后台服务（OAuth、签到逻辑）
├── config.js          # 配置文件（默认站点、全局配置）
├── popup.html         # 弹窗界面
├── popup.js           # 弹窗脚本（UI 交互）
└── icons/             # 扩展图标
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 开发说明

### 修改定时时间

编辑 `config.js` 中的 `GLOBAL_CONFIG.autoSignTime`：

```javascript
const GLOBAL_CONFIG = {
  autoSignTime: '09:00',  // 修改为你想要的时间
  // ...
};
```

### 添加默认站点

编辑 `config.js` 中的 `DEFAULT_SITES`：

```javascript
const DEFAULT_SITES = [
  { domain: 'example.com', name: 'Example Site', enabled: true },
  // 添加更多站点...
];
```

### 调试

1. 打开 `chrome://extensions/`
2. 找到扩展，点击"service worker"
3. 在 DevTools 中查看日志

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request。
