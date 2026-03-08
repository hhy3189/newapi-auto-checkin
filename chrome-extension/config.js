// 默认站点配置（首次安装时写入 storage）
const DEFAULT_SITES = [
  { domain: 'test.com', name: 'test.com', enabled: true }
];

// 全局配置
const GLOBAL_CONFIG = {
  autoSignTime: '09:00',
  retryTimes: 2,
  requestTimeout: 10000
};

// 从域名生成完整站点配置（所有 New API 站点通用）
function buildSiteConfig(site) {
  const d = site.domain;
  return {
    siteId: d.replace(/\./g, '_'),
    siteName: site.name || d,
    enabled: site.enabled !== false,
    cookieDomain: d,
    signExecUrl: `https://${d}/api/user/checkin`,
    signExecMethod: 'POST',
    signExecParams: {},
    signQueryUrl: `https://${d}/api/user/checkin`,
    signQueryMethod: 'GET',
    cookieTestUrl: `https://${d}/`,
    unauthKeywords: ['未登录', '请登录']
  };
}

// 从 storage 加载站点列表
async function loadSitesConfig() {
  const data = await chrome.storage.local.get('userSites');
  const sites = data.userSites || DEFAULT_SITES;
  return sites.map(buildSiteConfig);
}

// 保存站点列表到 storage
async function saveSitesConfig(sites) {
  await chrome.storage.local.set({ userSites: sites });
}

// 读取原始站点列表（简化格式）
async function loadRawSites() {
  const data = await chrome.storage.local.get('userSites');
  return data.userSites || DEFAULT_SITES;
}
