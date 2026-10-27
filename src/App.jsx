import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Settings, Database, Ticket, 
  Wallet, Key, Sun, Moon, Plus, Trash2, 
  RefreshCw, CheckCircle2, ShieldAlert, AlertCircle,
  LogOut, Loader2, ArrowRight, UploadCloud, FileText, Upload, MessageSquare
} from 'lucide-react';

const API_BASE = "https://dashboard.aiagenta.ir";

const AGENT_TYPES_CONFIG = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" }
];

export default function App() {
  // --- APP & AUTH STATE ---
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- TOKENS ---
  const [apiToken, setApiToken] = useState(localStorage.getItem("access_token") || "");
  const [liveWidgetToken, setLiveWidgetToken] = useState(localStorage.getItem("live_widget_token") || "");

  // --- LOGIN UI STATE ---
  const [loginStep, setLoginStep] = useState(1); // 1: Email, 2: OTP, 3: Dev Token
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [apiTokenInput, setApiTokenInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // --- DATA STATE ---
  const [tenantOverview, setTenantOverview] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [tickets, setTickets] = useState([]);
  
  // Knowledge Base State
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [kbKind, setKbKind] = useState('faq');
  const [kbTotalCount, setKbTotalCount] = useState(0);
  const [faqFile, setFaqFile] = useState(null);
  const [catalogFile, setCatalogFile] = useState(null);
  const [uploadingKb, setUploadingKb] = useState(false);

  // --- AGENT SETTINGS STATE ---
  const [agentSettings, setAgentSettings] = useState({
    name: "", topic: "", role: "", persona: "",
    language: "en", agent_type: "",
    max_single_audio_minutes: 10, lead_questions: [],
    ticket_summary_instruction: "", telegram_bot_token: "",
    telegram_admin_chat_id: "", bale_bot_token: "",
    bale_admin_chat_id: "", crm_webhook_url: "",
    widget_token_input: ""
  });

  // --- CLOUDFLARE TURNSTILE ---
  useEffect(() => {
    if (!document.getElementById('turnstile-script')) {
      const tsScript = document.createElement('script');
      tsScript.id = 'turnstile-script';
      tsScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      tsScript.async = true;
      tsScript.defer = true;
      document.head.appendChild(tsScript);
    }
  }, []);

  // --- LIVE WIDGET INJECTION ---
  useEffect(() => {
    const cleanupWidget = () => {
      const script = document.getElementById('agenta-widget-script');
      if (script) script.remove();
      const host = document.getElementById('ava-widget-host');
      if (host) host.remove();
    };

    if (isAuthenticated && activeAgent?.agent_id && liveWidgetToken) {
      console.log("Injecting live widget with token:", liveWidgetToken);
      
      cleanupWidget(); 

      const script = document.createElement('script');
      script.id = 'agenta-widget-script';
      
      script.src = "https://api.aiagenta.ir/widget.js"; 
      
      script.setAttribute('data-widget-token', liveWidgetToken);
      script.setAttribute('data-agent-id', activeAgent.agent_id);
      script.setAttribute('data-greeting', "Hi, I am an AI Assitant, How can I help you?");
      script.setAttribute('data-dir', "ltr");
      script.setAttribute('data-position', "right");
      script.setAttribute('data-agent-name', activeAgent.name || "Anya");
      script.setAttribute('data-launcher-text', "Online Support");
      script.setAttribute('data-primary-color', "#396dab");
      script.setAttribute('data-lang', "en");
      script.setAttribute('data-api-base', API_BASE);
      
      script.async = true; 
      document.body.appendChild(script);

      return cleanupWidget; 
    } else {
      cleanupWidget();
    }
  }, [isAuthenticated, activeAgent, liveWidgetToken]);

  // --- CORE API HELPER ---
  const fetchWithAuth = async (endpoint, options = {}, isRetry = false) => {
    const token = localStorage.getItem("access_token");
    const isApiKey = token && !token.includes('.');
    
    const headers = {
      "Content-Type": "application/json",
      ...(token && !isApiKey && { Authorization: `Bearer ${token}` }),
      ...(token && isApiKey && { "X-API-Key": token }),
      ...options.headers,
    };
    
    try {
      let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      
      if (res.status === 401 && !isRetry && !isApiKey) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken })
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              localStorage.setItem("access_token", refreshData.access_token);
              if (refreshData.refresh_token) {
                localStorage.setItem("refresh_token", refreshData.refresh_token);
              }
              return fetchWithAuth(endpoint, options, true);
            }
          } catch (refreshErr) {
            console.error("Token refresh failed", refreshErr);
          }
        }
        handleLogout(true);
        throw new Error("Unauthorized. Token expired.");
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP Error: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.error("API Fetch Error:", err);
      throw err;
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async (silent = false) => {
    if (!silent && !confirm("Are you sure you want to log out?")) return;

    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (e) {
        console.warn("Logout request failed or network issue", e);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setApiToken("");
    setIsAuthenticated(false);
    setTenantOverview(null);
    setActiveAgent(null);
    setFinanceData(null);
    setLoginStep(1); // Reset to email step
    if (!silent) showToast("Logged out successfully.", "success");
  };

  // --- DATA LOADING ---
  const loadDashboardData = async () => {
    if (!apiToken) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }
    
    setLoading(true);
    try {
      const overviewData = await fetchWithAuth("/tenants/me/overview");
      
      if (overviewData?.tenant) {
        setTenantOverview(overviewData.tenant);
        
        if (overviewData.agents?.length > 0) {
          const agent = overviewData.agents[0];
          setActiveAgent(agent);
          setAgentSettings(prev => ({
            ...prev,
            name: agent.name || "",
            topic: agent.topic || "",
            role: agent.role || "",
            persona: agent.persona || "",
            language: agent.language || "en",
            agent_type: agent.agent_type || "",
            max_single_audio_minutes: agent.max_single_audio_minutes || 10,
            lead_questions: agent.lead_questions || [],
            ticket_summary_instruction: agent.ticket_summary_instruction || "",
            telegram_bot_token: agent.telegram_bot_token || "",
            telegram_admin_chat_id: agent.telegram_admin_chat_id || "",
            bale_bot_token: agent.bale_bot_token || "",
            bale_admin_chat_id: agent.bale_admin_chat_id || "",
            crm_webhook_url: agent.crm_webhook_url || "",
            widget_token_input: liveWidgetToken
          }));
        }
        setIsAuthenticated(true);
        
        try {
          const finData = await fetchWithAuth("/tenants/me/finances");
          setFinanceData(finData);
        } catch (e) {
          console.warn("Failed to load finances", e);
        }
      }
    } catch (err) {
      console.error("Dashboard validation failed:", err);
      if (err.message.includes("Unauthorized") || err.message.includes("401")) {
        setIsAuthenticated(false);
        setApiToken("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiToken) {
      localStorage.setItem("access_token", apiToken);
      loadDashboardData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [apiToken]);

  const loadKbAndTickets = async () => {
    if (!isAuthenticated || !activeAgent?.agent_id) return;
    
    try {
      // Clear old KB data before fetching new kind
      setKnowledgeBase([]);
      const kbData = await fetchWithAuth(`/agents/${activeAgent.agent_id}/knowledge_base_list?kind=${kbKind}`);
      if (kbData) {
        setKnowledgeBase(kbData.data || []);
        setKbTotalCount(kbData.total_count || 0);
      }
      
      const tktData = await fetchWithAuth(`/agents/${activeAgent.agent_id}/agent_tickets`);
      if (tktData?.data) setTickets(tktData.data);
    } catch (e) {
      console.warn("Silent load failure for specific tabs");
      setKnowledgeBase([]);
      setKbTotalCount(0);
    }
  };

  useEffect(() => {
    loadKbAndTickets();
  }, [isAuthenticated, activeAgent, kbKind]);

  // --- AUTH HANDLERS ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/request_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cf_token: "mock-token" })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to send OTP");
      }
      setLoginStep(2);
      showToast("OTP code sent to your email.", "success");
    } catch (err) {
      showToast(err.message || "Failed to request OTP. Ensure backend is running.", "error");
    }
    setLoginLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (!res.ok) throw new Error("Invalid OTP");
      
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      setApiToken(data.access_token);
      showToast("Logged in successfully!", "success");
    } catch (err) {
      showToast("Invalid verification code.", "error");
    }
    setLoginLoading(false);
  };

  const handleDevLogin = (e) => {
    e.preventDefault();
    if (!apiTokenInput.trim()) return;
    localStorage.setItem("access_token", apiTokenInput.trim());
    setApiToken(apiTokenInput.trim());
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!activeAgent) return;
    setIsSaving(true);
    
    if (agentSettings.widget_token_input) {
      localStorage.setItem("live_widget_token", agentSettings.widget_token_input);
      setLiveWidgetToken(agentSettings.widget_token_input);
    }

    const payload = { ...agentSettings };
    delete payload.widget_token_input;
    
    Object.keys(payload).forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    try {
      await fetchWithAuth(`/agents/${activeAgent.agent_id}/update_agent`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      showToast("Agent settings updated successfully!");
    } catch (e) {
      showToast("Failed to save settings.", "error");
    }
    setIsSaving(false);
  };

  const handleRegenerateKey = async () => {
    if (confirm("Regenerate API Key? The old key will be invalidated immediately.")) {
      try {
        await fetchWithAuth(`/regenerate_api_key?tenant_id=${tenantOverview?.tenant_id}`, { method: "POST" });
        showToast("API Key regenerated and emailed to admin.", "success");
      } catch(e) {
        showToast("Failed to regenerate key.", "error");
      }
    }
  };

  // --- FILE UPLOAD HANDLERS ---
  const handleFileUpload = async (type) => {
    const file = type === 'faq' ? faqFile : catalogFile;
    if (!file) {
      showToast("Please select a file first.", "error");
      return;
    }

    setUploadingKb(true);
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = type === 'faq' 
      ? `/agents/${activeAgent.agent_id}/faq_upload?reload=true`
      : `/agents/${activeAgent.agent_id}/product_upload`;

    try {
      const token = localStorage.getItem("access_token");
      const isApiKey = token && !token.includes('.');
      const headers = {};
      if (token && !isApiKey) headers['Authorization'] = `Bearer ${token}`;
      if (token && isApiKey) headers['X-API-Key'] = token;
      // Note: Do NOT set Content-Type for FormData, the browser sets it with the correct boundary.

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Upload failed");
      }

      showToast(`${type === 'faq' ? 'FAQ' : 'Catalog'} uploaded successfully!`, "success");
      loadKbAndTickets(); // Refresh data

      if (type === 'faq') setFaqFile(null);
      else setCatalogFile(null);

    } catch (err) {
      showToast(err.message || "Failed to upload file.", "error");
    } finally {
      setUploadingKb(false);
    }
  };

  // --- RENDER BLOCKS ---
  if (loading && !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className={`${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} min-h-screen flex items-center justify-center font-sans transition-colors duration-300`}>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-[#2563EB] to-[#22D3EE] shadow-lg">A</div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 tracking-tight">Welcome to Agenta</h2>
          <p className="text-zinc-500 text-center text-sm mb-8">Sign in to manage your AI Autonomous Agents.</p>

          {toast && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
              {toast.type === 'error' ? <ShieldAlert size={18}/> : <CheckCircle2 size={18}/>}
              {toast.message}
            </div>
          )}

          {loginStep === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder="admin@company.com" 
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : "Request OTP"}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setLoginStep(3)} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">Use Developer Token instead</button>
              </div>
            </form>
          )}

          {loginStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Verification Code (OTP)</label>
                <input 
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] tracking-[0.5em] text-center text-xl font-mono" 
                  placeholder="------" maxLength={6}
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : "Verify & Login"}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setLoginStep(1)} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">Back to Email Input</button>
              </div>
            </form>
          )}

          {loginStep === 3 && (
            <form onSubmit={handleDevLogin} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Developer API Token (JWT/Key)</label>
                <input 
                  type="password" required value={apiTokenInput} onChange={e => setApiTokenInput(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder="eyJhbGciOi..." 
                />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                <ArrowRight size={18} /> Connect Dashboard
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setLoginStep(1)} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">Back to Login</button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className={`${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} min-h-screen flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Top Navbar */}
      <header className={`h-16 border-b ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md bg-gradient-to-br from-[#2563EB] to-[#22D3EE]">
            A
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-tight">Agenta Dashboard</h1>
            <p className="text-xs text-zinc-500">{tenantOverview?.name || 'Loading...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`w-64 border-r ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'} p-4 flex flex-col justify-between`}>
          <div className="flex flex-col gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'settings', label: 'Agent Settings', icon: Settings },
              { id: 'knowledge', label: 'Knowledge Base', icon: Database },
              { id: 'tickets', label: 'Tickets & Leads', icon: Ticket },
              { id: 'finances', label: 'Finances & Quota', icon: Wallet },
              { id: 'apikeys', label: 'API Keys', icon: Key },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#2563EB] text-white shadow-md' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
            <button
              onClick={() => handleLogout(false)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-sm text-zinc-500">Comprehensive view of your AI agent performance and account status.</p>
              </div>

              {/* Tenant Identity Card */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                  {tenantOverview?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-bold">{tenantOverview?.name || 'Loading...'}</h3>
                  <p className="text-sm text-zinc-500">{tenantOverview?.email || 'email@example.com'}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Plan: {tenantOverview?.plan || 'Basic'}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenantOverview?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>Status: {tenantOverview?.status || 'Unknown'}</span>
                    {activeAgent && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 capitalize">
                        Type: {activeAgent.agent_type === 'sales' ? 'Sales' : activeAgent.agent_type === 'support' ? 'Support' : activeAgent.agent_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm`}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Wallet size={16}/> Available Balance</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-[#22D3EE]">
                    {financeData ? `${financeData.balance} ${financeData.currency}` : '---'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Total funded: {financeData?.total_credits || 0}</p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm`}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><MessageSquare size={16}/> Chat Messages</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-[#2563EB] dark:text-blue-400">
                    {financeData?.tenant_totals?.total_messages || 0}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Quota used: {financeData?.rate_limits?.chat_used_this_month || 0} / {financeData?.rate_limits?.chat_monthly_limit || 0}</p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm`}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Ticket size={16}/> Total Tickets</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-amber-500">
                    {tickets.length}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Leads & Support escalations</p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm`}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Database size={16}/> KB Records</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-purple-500">
                    {kbTotalCount}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">FAQ & Catalog items</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Agent Settings</h2>
                <p className="text-sm text-zinc-500">Configure core identity, persona, behavior and third-party integrations.</p>
              </div>

              <form onSubmit={handleSaveSettings} className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} space-y-8 shadow-sm`}>
                
                {/* Identity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Identity & Base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Agent Name</label>
                      <input type="text" value={agentSettings.name} onChange={e => setAgentSettings({...agentSettings, name: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Domain / Topic</label>
                      <input type="text" value={agentSettings.topic} onChange={e => setAgentSettings({...agentSettings, topic: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Language (ISO)</label>
                      <input type="text" value={agentSettings.language} onChange={e => setAgentSettings({...agentSettings, language: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Agent Type</label>
                      <select 
                        value={agentSettings.agent_type || "support"} 
                        onChange={e => setAgentSettings({...agentSettings, agent_type: e.target.value})} 
                        className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                      >
                        {AGENT_TYPES_CONFIG.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Persona & Behavior */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Persona & Behavior</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Role Description</label>
                      <textarea rows={3} value={agentSettings.role || ""} onChange={e => setAgentSettings({...agentSettings, role: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" placeholder="Functional identity..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Persona Instructions</label>
                      <textarea rows={3} value={agentSettings.persona || ""} onChange={e => setAgentSettings({...agentSettings, persona: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" placeholder="Tone and style..." />
                    </div>
                  </div>
                </div>

                {/* Sales & Leads */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Lead Collection & Summaries</h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Lead Collection Questions (Ordered)</label>
                    <div className="space-y-2">
                      {agentSettings.lead_questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text" value={q}
                            onChange={e => {
                              const updated = [...agentSettings.lead_questions];
                              updated[idx] = e.target.value;
                              setAgentSettings({...agentSettings, lead_questions: updated});
                            }}
                            className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#2563EB]"
                          />
                          <button type="button" onClick={() => {
                              const updated = agentSettings.lead_questions.filter((_, i) => i !== idx);
                              setAgentSettings({...agentSettings, lead_questions: updated});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setAgentSettings({...agentSettings, lead_questions: [...agentSettings.lead_questions, "New Question?"]})} className="text-xs font-semibold text-[#2563EB] dark:text-[#22D3EE] mt-2 flex items-center gap-1 hover:underline">
                        <Plus size={16} /> Add Question
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2 mt-4">Ticket Summary Instruction (Optional)</label>
                    <textarea rows={2} value={agentSettings.ticket_summary_instruction || ""} onChange={e => setAgentSettings({...agentSettings, ticket_summary_instruction: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" placeholder="Custom instruction for generating handoff summaries..." />
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Integrations & Webhooks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Telegram Bot Token</label>
                      <input type="password" value={agentSettings.telegram_bot_token || ""} onChange={e => setAgentSettings({...agentSettings, telegram_bot_token: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Telegram Admin Chat ID</label>
                      <input type="text" value={agentSettings.telegram_admin_chat_id || ""} onChange={e => setAgentSettings({...agentSettings, telegram_admin_chat_id: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Bale Bot Token</label>
                      <input type="password" value={agentSettings.bale_bot_token || ""} onChange={e => setAgentSettings({...agentSettings, bale_bot_token: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">Bale Admin Chat ID</label>
                      <input type="text" value={agentSettings.bale_admin_chat_id || ""} onChange={e => setAgentSettings({...agentSettings, bale_admin_chat_id: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">CRM Webhook URL</label>
                      <input type="url" value={agentSettings.crm_webhook_url || ""} onChange={e => setAgentSettings({...agentSettings, crm_webhook_url: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                {/* Live Widget Test */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold">Live Widget Token</h3>
                  <p className="text-xs text-zinc-500">Insert your real widget token (`wgt_...`) to activate the live web widget simulator on this page.</p>
                  <input type="text" value={agentSettings.widget_token_input || ""} onChange={e => setAgentSettings({...agentSettings, widget_token_input: e.target.value})} className="w-full max-w-md bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="wgt_..." />
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 bg-[#2563EB]">
                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : null}
                    Save Agent Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Knowledge Base & Vectors</h2>
                  <p className="text-sm text-zinc-500">Manage ChromaDB vectorized FAQ entries and product catalogs. (Total: {kbTotalCount})</p>
                </div>
                <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
                  <button onClick={() => setKbKind('faq')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${kbKind === 'faq' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>FAQ</button>
                  <button onClick={() => setKbKind('catalog')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${kbKind === 'catalog' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Catalog</button>
                </div>
              </div>

              {/* Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FAQ Upload */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm flex flex-col items-center justify-center text-center gap-3`}>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-semibold">Upload FAQ (.json, .csv, .xlsx)</h3>
                  <input type="file" id="faq-upload" className="hidden" accept=".json,.csv,.xlsx" onChange={e => setFaqFile(e.target.files[0])} />
                  <label htmlFor="faq-upload" className="cursor-pointer text-sm text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400">
                    {faqFile ? faqFile.name : "Select a file to upload"}
                  </label>
                  <button 
                    onClick={() => handleFileUpload('faq')}
                    disabled={!faqFile || uploadingKb}
                    className="mt-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploadingKb && faqFile ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Upload & Vectorize
                  </button>
                </div>

                {/* Catalog Upload */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} shadow-sm flex flex-col items-center justify-center text-center gap-3`}>
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center dark:bg-cyan-900/30 dark:text-cyan-400">
                    <Database size={24} />
                  </div>
                  <h3 className="font-semibold">Upload Catalog (.json only)</h3>
                  <input type="file" id="catalog-upload" className="hidden" accept=".json" onChange={e => setCatalogFile(e.target.files[0])} />
                  <label htmlFor="catalog-upload" className="cursor-pointer text-sm text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400">
                    {catalogFile ? catalogFile.name : "Select a JSON file"}
                  </label>
                  <button 
                    onClick={() => handleFileUpload('catalog')}
                    disabled={!catalogFile || uploadingKb}
                    className="mt-2 px-4 py-2 bg-[#22D3EE] text-zinc-900 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploadingKb && catalogFile ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Upload Catalog
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className={`rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} overflow-hidden shadow-sm`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-200 bg-gray-50'} text-xs font-semibold text-zinc-500 uppercase tracking-wider`}>
                      <th className="p-4">Vector ID</th>
                      <th className="p-4">Document / Content</th>
                      <th className="p-4">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                    {knowledgeBase.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-zinc-500">No vectors found in {kbKind} collection.</td>
                      </tr>
                    ) : (
                      knowledgeBase.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono text-xs text-[#2563EB] dark:text-[#22D3EE]">{item.Id}</td>
                          <td className="p-4 max-w-md truncate text-zinc-700 dark:text-zinc-300">{item.Document}</td>
                          <td className="p-4 text-xs font-mono text-zinc-500 truncate max-w-xs">{JSON.stringify(item.Metadata)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Support & Lead Tickets</h2>
                <p className="text-sm text-zinc-500">Autonomous customer escalations and captured leads.</p>
              </div>

              <div className={`rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} overflow-hidden shadow-sm`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-200 bg-gray-50'} text-xs font-semibold text-zinc-500 uppercase tracking-wider`}>
                      <th className="p-4">Ticket ID</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4">Summary</th>
                      <th className="p-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-zinc-500">No tickets generated yet.</td>
                      </tr>
                    ) : (
                      tickets.map((t, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">{t.ticket_id}</td>
                          <td className="p-4 font-mono text-xs text-zinc-500">{t.user_id}</td>
                          <td className="p-4 text-zinc-800 dark:text-zinc-200">{t.summary}</td>
                          <td className="p-4 text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCES */}
          {activeTab === 'finances' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Finances & Quotas</h2>
                <p className="text-sm text-zinc-500">Credit consumption, margin tracking and rate limits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} space-y-4 shadow-sm`}>
                  <h3 className="font-bold text-lg">Billing Overview</h3>
                  <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                    <span className="text-zinc-500">Current Balance</span>
                    <span className="font-bold text-[#2563EB] dark:text-[#22D3EE]">{financeData?.balance || 0} {financeData?.currency || 'CRD'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                    <span className="text-zinc-500">Total Credits Allocated</span>
                    <span className="font-semibold">{financeData?.total_credits || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">Total Debits Consumed</span>
                    <span className="font-semibold text-red-500">{financeData?.total_debits || 0}</span>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} space-y-4 shadow-sm`}>
                  <h3 className="font-bold text-lg">Rate Limits & Quota</h3>
                  <div className="flex justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                    <span className="text-zinc-500">Chat Daily Quota</span>
                    <span className="font-semibold">{financeData?.rate_limits?.chat_used_today || 0} / {financeData?.rate_limits?.chat_daily_limit || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">Audio Daily Quota</span>
                    <span className="font-semibold">{financeData?.rate_limits?.audio_used_today || 0} / {financeData?.rate_limits?.audio_daily_limit || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: API KEYS */}
          {activeTab === 'apikeys' && (
            <div className="max-w-xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">API Key Management</h2>
                <p className="text-sm text-zinc-500">Securely rotate or revoke programmatic authentication keys.</p>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'} space-y-6 shadow-sm`}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                  <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                  <p>Never expose your API key in client-side public code or repositories. New keys are securely emailed to your account upon generation.</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleRegenerateKey}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 flex items-center gap-2 transition-opacity bg-[#2563EB]"
                  >
                    <RefreshCw size={16} /> Regenerate API Key
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}