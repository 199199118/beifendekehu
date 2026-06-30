// 云存储层 — 用 GitHub Contents API 替代 localStorage
// 公开读 (raw.githubusercontent.com) / 写 (Contents API with token baked at build)

const OWNER = "199199118";
const REPO = "beifendekehu";
const PATH = "data/customers.json";
const BRANCH = "main";

const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH}`;
// Token 是构建期 bake 的，runtime 已经看不见，但 compiled bundle 里会有
// 这个 token 注入到 GH Pages bundle 对"只前端"就是这个项目的唯一选项。
const GH_TOKEN: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GH_TOKEN) || "";

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

let cachedSha: string | null = null;
let cachedCustomers: any[] = [];

export async function loadCustomers(): Promise<{ customers: any[]; sha: string | null; ok: boolean; error?: string }> {
  try {
    // 公开拉（最高频失败模式来自 dev fetch，第二次后用 sha）
    const res = await fetch(`${RAW_BASE}?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) {
      return { customers: [], sha: null, ok: false, error: `HTTP ${res.status}` };
    }
    const txt = await res.text();
    let data: any[];
    try {
      data = JSON.parse(txt);
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }
    cachedCustomers = data;
    return { customers: data, sha: null, ok: true };
  } catch (e: any) {
    return { customers: [], sha: null, ok: false, error: e?.message || String(e) };
  }
}

export async function getSha(): Promise<string | null> {
  if (cachedSha) return cachedSha;
  try {
    const res = await fetch(`${API_BASE}?ref=${BRANCH}`, {
      headers: GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    cachedSha = data.sha;
    return data.sha;
  } catch {
    return null;
  }
}

export async function saveCustomers(customers: any[]): Promise<{ ok: boolean; error?: string }> {
  if (!GH_TOKEN) {
    return { ok: false, error: "GitHub token 未配置 — 无法写云端" };
  }
  try {
    const sha = await getSha();
    const content = JSON.stringify(customers, null, 2);
    const body: any = {
      message: `data: update customers (${customers.length})`,
      content: utf8ToBase64(content),
      branch: BRANCH,
    };
    if (sha) body.sha = sha;
    const res = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errTxt = await res.text();
      // 409 = sha conflict (someone else wrote); retry once after re-reading
      if (res.status === 409) {
        cachedSha = null;
        return saveCustomers(customers);
      }
      return { ok: false, error: `HTTP ${res.status}: ${errTxt.slice(0, 200)}` };
    }
    const data = await res.json();
    cachedSha = data.content?.sha || sha || null;
    cachedCustomers = customers;
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function utf8ToBase64(s: string): string {
  // 浏览器侧高效 base64 编码
  return btoa(unescape(encodeURIComponent(s)));
}
