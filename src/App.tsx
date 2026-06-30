import { useState, useEffect, useRef, createContext, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { loadCustomers, saveCustomers } from "./store";

// ========== 认证配置 ==========
const AUTH_CONFIG = {
  username: "admin",
  password: "asdasd123",
};

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// ========== 认证 Provider ==========
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  const login = (username: string, password: string): boolean => {
    if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
      setIsLoggedIn(true);
      sessionStorage.setItem("isLoggedIn", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== 登录页面 ==========
function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }
    const success = login(username, password);
    if (!success) {
      setError("用户名或密码错误");
      setPassword("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <span className="text-4xl">👥</span>
          </div>
          <h1 className="text-3xl font-bold text-white">客户备注本</h1>
          <p className="text-slate-400 mt-2">请登录以继续使用</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                用户名
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入用户名"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 active:scale-95 mt-2"
            >
              登 录
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            <p>本应用仅供授权用户使用</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 主应用数据 ==========
const ENTRY_TYPES = [
  { id: "order", name: "订单", icon: "📦", color: "bg-blue-500/30 text-blue-300" },
  { id: "note", name: "备注", icon: "📝", color: "bg-amber-500/30 text-amber-300" },
  { id: "content", name: "内容", icon: "📄", color: "bg-emerald-500/30 text-emerald-300" },
  { id: "follow", name: "跟进", icon: "📞", color: "bg-purple-500/30 text-purple-300" },
  { id: "other", name: "其他", icon: "📌", color: "bg-pink-500/30 text-pink-300" },
];

interface Entry {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  entries: Entry[];
  createdAt: string;
}

// ========== 主应用 ==========
function MainApp() {
  const { logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [entryType, setEntryType] = useState("order");
  const [entryContent, setEntryContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  // 启动时拉一次
  useEffect(() => {
    let stale = false;
    (async () => {
      const r = await loadCustomers();
      if (!stale) {
        setCustomers(r.customers);
        if (!r.ok) {
          msg(`读取数据失败: ${r.error}（首次可能 5-10 秒后会下载）`, "error");
        } else if (r.customers.length) {
          msg(`已从云端同步 ${r.customers.length} 客户`, "success");
        }
      }
    })();
    return () => { stale = true; };
  }, []);

  // 改变就同步写云端
  useEffect(() => {
    if (!lastSavedAt) return;  // 首次跳过
    setSyncing(true);
    const t = setTimeout(async () => {
      const r = await saveCustomers(customers);
      setSyncing(false);
      if (r.ok) {
        setLastSavedAt(new Date().toLocaleTimeString("zh-CN"));
      } else {
        msg(`同步失败: ${r.error}`, "error");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [customers]);

  useEffect(() => {
    if (selected) {
      const fresh = customers.find((c) => c.id === selected.id);
      setSelected(fresh || null);
    }
  }, [customers]);

  const msg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const now = () => new Date().toLocaleString("zh-CN");
  const getTypeInfo = (id: string) => ENTRY_TYPES.find((t) => t.id === id) || ENTRY_TYPES[4];

  const addCustomer = () => {
    if (!newId.trim()) return msg("请输入客户编号", "error");
    if (!newName.trim()) return msg("请输入客户名称", "error");
    if (customers.some((c) => c.id === newId.trim())) return msg("该编号已存在", "error");
    const c: Customer = { id: newId.trim(), name: newName.trim(), entries: [], createdAt: now() };
    setCustomers([c, ...customers]);
    setSelected(c);
    setNewId("");
    setNewName("");
    setSidebarOpen(false);
    msg("客户添加成功 - 正在同步到云端", "success");
  };

  const deleteCustomer = (id: string) => {
    if (!confirm("确定删除该客户及其所有记录？")) return;
    setCustomers(customers.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    msg("客户已删除", "success");
  };

  const saveEntry = () => {
    if (!selected) return;
    if (!entryContent.trim()) return msg("请输入内容", "error");
    let updatedEntries: Entry[];
    if (editingEntry) {
      updatedEntries = selected.entries.map((e) =>
        e.id === editingEntry.id ? { ...e, type: entryType, content: entryContent.trim() } : e
      );
      msg("已更新", "success");
    } else {
      const entry: Entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type: entryType,
        content: entryContent.trim(),
        createdAt: now(),
      };
      updatedEntries = [entry, ...selected.entries];
      msg("添加成功", "success");
    }
    setCustomers(customers.map((c) => (c.id === selected.id ? { ...c, entries: updatedEntries } : c)));
    setEntryContent("");
    setEditingEntry(null);
  };

  const startEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setEntryType(entry.type);
    setEntryContent(entry.content);
  };

  const deleteEntry = (entryId: string) => {
    if (!selected || !confirm("确定删除此条记录？")) return;
    setCustomers(customers.map((c) => (c.id === selected.id ? { ...c, entries: c.entries.filter((e) => e.id !== entryId) } : c)));
    msg("已删除", "success");
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.entries.some((e) => e.content.toLowerCase().includes(q))
    );
  });

  const filteredEntries = selected?.entries.filter((e) => filterType === "all" || e.type === filterType) || [];

  const exportExcel = () => {
    if (!customers.length) return msg("无数据可导出", "error");
    const rows: Record<string, string>[] = [];
    customers.forEach((c) => {
      if (!c.entries.length) {
        rows.push({ 客户编号: c.id, 客户名称: c.name, 创建时间: c.createdAt, 类型: "-", 内容: "-", 记录时间: "-" });
      } else {
        c.entries.forEach((e) => {
          rows.push({ 客户编号: c.id, 客户名称: c.name, 创建时间: c.createdAt, 类型: getTypeInfo(e.type).name, 内容: e.content, 记录时间: e.createdAt });
        });
      }
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "客户数据");
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 8 }, { wch: 50 }, { wch: 20 }];
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `客户数据_${new Date().toLocaleDateString("zh-CN")}.xlsx`);
    msg("导出成功", "success");
  };

  const exportTxt = () => {
    if (!customers.length) return msg("无数据可导出", "error");
    let txt = `客户备注数据 - ${now()}\n共 ${customers.length} 个客户\n${"═".repeat(50)}\n\n`;
    customers.forEach((c, i) => {
      txt += `【${i + 1}】#${c.id} ${c.name} | 创建: ${c.createdAt}\n`;
      if (!c.entries.length) {
        txt += `  (暂无记录)\n`;
      } else {
        c.entries.forEach((e) => {
          txt += `  [${getTypeInfo(e.type).name}] ${e.content}  (${e.createdAt})\n`;
        });
      }
      txt += `${"─".repeat(50)}\n`;
    });
    saveAs(new Blob([txt], { type: "text/plain;charset=utf-8" }), `客户数据_${new Date().toLocaleDateString("zh-CN")}.txt`);
    msg("TXT导出成功", "success");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, string>[];
        const map = new Map<string, Customer>();
        customers.forEach((c) => map.set(c.id, { ...c, entries: [...c.entries] }));
        rows.forEach((row) => {
          const cid = String(row["客户编号"] || "").trim();
          if (!cid) return;
          if (!map.has(cid)) map.set(cid, { id: cid, name: String(row["客户名称"] || ""), entries: [], createdAt: String(row["创建时间"] || now()) });
          const typeName = String(row["类型"] || "").trim();
          const content = String(row["内容"] || "").trim();
          if (content && content !== "-") {
            const typeId = ENTRY_TYPES.find((t) => t.name === typeName)?.id || "other";
            map.get(cid)!.entries.push({
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              type: typeId,
              content,
              createdAt: String(row["记录时间"] || now()),
            });
          }
        });
        setCustomers(Array.from(map.values()));
        msg("导入成功", "success");
      } catch {
        msg("导入失败", "error");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKey = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fn();
    }
  };

  const totalEntries = customers.reduce((s, c) => s + c.entries.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl animate-fade-in text-white ${message.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          {message.text}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />

      {/* 顶部导航栏 */}
      <div className="bg-black/30 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">👥 客户备注本</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{customers.length} 客户 · {totalEntries} 记录</span>
          {syncing ? (
            <span className="text-xs text-amber-400">⏳ 同步中…</span>
          ) : lastSavedAt ? (
            <span className="text-xs text-emerald-400">✓ 已同步 {lastSavedAt}</span>
          ) : null}
          <button onClick={logout} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/15 transition-all flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* 左侧 */}
        <div className={`${sidebarOpen ? "fixed inset-0 z-40 md:relative" : "hidden"} md:flex w-full md:w-80 lg:w-96 border-r border-white/10 flex-col bg-slate-900 md:bg-black/20 shrink-0`}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3 md:hidden">
              <h2 className="text-white font-medium">客户列表</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-white hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索编号、名称、内容..." className="w-full pl-9 pr-8 py-2 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>}
            </div>
          </div>

          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="flex gap-1.5">
              <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} onKeyDown={(e) => handleKey(e, addCustomer)} placeholder="编号" className="w-20 px-2 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => handleKey(e, addCustomer)} placeholder="客户名称" className="flex-1 px-2 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <button onClick={addCustomer} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shrink-0 transition-colors">+</button>
            </div>
            <div className="flex gap-1.5">
              <button onClick={exportTxt} className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg border border-white/10 transition-colors">📄 TXT</button>
              <button onClick={exportExcel} className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg border border-white/10 transition-colors">📊 Excel</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg border border-white/10 transition-colors">📥 导入</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center text-slate-500 py-16 text-sm">{searchQuery ? "未找到匹配客户" : "暂无客户"}</div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setSelected(c); setSidebarOpen(false); }}
                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selected?.id === c.id ? "bg-blue-600/30 border border-blue-500/40" : "hover:bg-white/10 border border-transparent"}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">#{c.id}</span>
                        <span className="text-white font-medium truncate text-sm">{c.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.entries.length} 条记录</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteCustomer(c.id); }} className="p-1 text-rose-500/50 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div className="hidden md:flex flex-1 flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-lg">请从左侧选择客户</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-white/10 bg-black/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">{selected.name[0]}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white truncate">{selected.name}</h2>
                    <span className="text-sm font-mono bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded shrink-0">#{selected.id}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selected.entries.length} 条记录 · 创建于 {selected.createdAt}</p>
                </div>
              </div>

              <div className="p-4 border-b border-white/10 bg-white/5">
                {editingEntry && (
                  <div className="text-xs text-amber-400 mb-2 flex items-center justify-between">
                    ✏️ 正在编辑
                    <button onClick={() => { setEditingEntry(null); setEntryContent(""); }} className="text-slate-400 hover:text-white">取消</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <select value={entryType} onChange={(e) => setEntryType(e.target.value)} className="px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer shrink-0">
                    {ENTRY_TYPES.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-800">{t.icon} {t.name}</option>
                    ))}
                  </select>
                  <textarea value={entryContent} onChange={(e) => setEntryContent(e.target.value)} onKeyDown={(e) => handleKey(e, saveEntry)} placeholder="输入内容..." rows={1} className="flex-1 px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[40px]" onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
                  <button onClick={saveEntry} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shrink-0 transition-colors">{editingEntry ? "更新" : "添加"}</button>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-white/10 flex gap-1.5 overflow-x-auto">
                <button onClick={() => setFilterType("all")} className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all ${filterType === "all" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>全部 ({selected.entries.length})</button>
                {ENTRY_TYPES.map((t) => {
                  const count = selected.entries.filter((e) => e.type === t.id).length;
                  if (!count) return null;
                  return (
                    <button key={t.id} onClick={() => setFilterType(t.id)} className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all ${filterType === t.id ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}>
                      {t.icon} {t.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredEntries.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p>{filterType === "all" ? "暂无记录" : "该分类暂无记录"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEntries.map((entry) => {
                      const t = getTypeInfo(entry.type);
                      return (
                        <div key={entry.id} className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 transition-all">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.icon} {t.name}</span>
                                <span className="text-xs text-slate-500">{entry.createdAt}</span>
                              </div>
                              <p className="text-slate-200 whitespace-pre-wrap break-words text-sm leading-relaxed">{entry.content}</p>
                            </div>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => handleCopy(entry.content, entry.id)} className={`p-1.5 rounded-md transition-all ${copiedId === entry.id ? "bg-emerald-500/30 text-emerald-300" : "text-slate-400 hover:bg-white/10 hover:text-white"}`} title="复制">
                                {copiedId === entry.id ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                              </button>
                              <button onClick={() => startEdit(entry)} className="p-1.5 text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/20 rounded-md transition-all" title="编辑">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/20 rounded-md transition-all" title="删除">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== 根组件 ==========
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <MainApp /> : <LoginPage />;
}
