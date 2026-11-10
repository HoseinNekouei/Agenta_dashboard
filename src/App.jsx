import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Settings, Database, Ticket, 
  Wallet, Key, Plus, Trash2, 
  RefreshCw, CheckCircle2, ShieldAlert, AlertCircle,
  LogOut, Loader2, ArrowRight, UploadCloud, FileText, Upload, MessageSquare, Globe, Code, Copy
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

const AGENT_TYPES_CONFIG = [
  { value: "support", label: "Support" },
  { value: "sales", label: "Sales" }
];

// --- TRANSLATION DICTIONARY ---
const translations = {
  en: {
    app_title: "Agenta Dashboard",
    app_desc: "AI Autonomous Platform",
    tab_overview: "Overview",
    tab_settings: "Agent Settings",
    tab_knowledge: "Knowledge Base",
    tab_tickets: "Tickets & Leads",
    tab_finances: "Finances & Quota",
    tab_widget: "Widget Token",
    tab_apikeys: "API Keys",
    KB_Records: "KKnowledge Base Records",
    logout: "Logout",
    welcome: "Welcome back!",
    welcome_sub: "Sign in to manage your AI Autonomous Agents.",
    signup_title: "Create an Account",
    signup_sub: "Get started with Agenta AI.",
    name_label: "Company Name",
    signup_btn: "Sign Up",
    no_account: "Don't have an account? Sign up",
    has_account: "Already have an account? Log in",
    reg_success: "Account created! Please request an OTP to log in.",
    email_label: "Email Address",
    req_otp_btn: "Request OTP",
    dev_token_link: "Use Developer Token instead",
    otp_label: "Verification Code (OTP)",
    verify_btn: "Verify & Login",
    back_email_link: "Back to Email Input",
    dev_token_label: "Developer API Token (JWT/Key)",
    connect_dash_btn: "Connect Dashboard",
    overview_title: "Dashboard Overview",
    overview_desc: "Real-time performance metrics and credit standing.",
    avail_balance: "Available Balance",
    total_funded: "Total funded",
    chat_used: "Chat Messages Used",
    reset_in: "Reset in",
    days: "days",
    active_agents: "Active Agents",
    settings_title: "Agent Settings",
    settings_desc: "Configure core identity, persona, behavior and third-party integrations.",
    identity_sec: "Identity & Base",
    agent_name: "Agent Name",
    domain_topic: "Domain / Topic",
    language_iso: "Language (ISO)",
    agent_type: "Agent Type",
    persona_sec: "Persona & Behavior",
    role_desc: "Role Description",
    persona_inst: "Persona Instructions",
    lead_sec: "Lead Collection & Summaries",
    lead_questions: "Lead Collection Questions (Ordered)",
    add_question: "Add Question",
    ticket_summary_inst: "Ticket Summary Instruction (Optional)",
    integrations_sec: "Integrations & Webhooks",
    telegram_bot: "Telegram Bot Token",
    telegram_chat: "Telegram Admin Chat ID",
    bale_bot: "Bale Bot Token",
    bale_chat: "Bale Admin Chat ID",
    crm_webhook: "CRM Webhook URL",
    live_widget_sec: "Live Widget Token",
    live_widget_desc: "Insert your real widget token (`wgt_...`) to activate the live web widget simulator on this page.",
    save_config: "Save Agent Configuration",
    kb_title: "Knowledge Base & Vectors",
    kb_desc: "Manage ChromaDB vectorized FAQ entries and product catalogs.",
    faq_upload_title: "Upload FAQ (.json, .csv, .xlsx)",
    catalog_upload_title: "Upload Catalog (.json only)",
    select_file: "Select a file",
    upload_btn: "Upload & Vectorize",
    vector_id: "Vector ID",
    doc_content: "Document / Content",
    metadata: "Metadata",
    tickets_title: "Support & Lead Tickets",
    tickets_desc: "Autonomous customer escalations and captured leads.",
    ticket_id: "Ticket ID",
    user_id: "User ID",
    summary: "Summary",
    created_at: "Created At",
    finances_title: "Finances & Quotas",
    finances_desc: "Credit consumption, margin tracking and rate limits.",
    billing_overview: "Billing Overview",
    curr_balance: "Current Balance",
    total_alloc: "Total Credits Allocated",
    total_cons: "Total Debits Consumed",
    rate_limits: "Rate Limits & Quota",
    chat_daily: "Chat Daily Quota",
    audio_daily: "Audio Daily Quota",
    widget_title: "Widget Token Generation",
    widget_desc: "Generate a JWT token for a specific domain to embed the live widget.",
    domain_label: "Website Domain",
    generate_widget_btn: "Generate Token",
    copy: "Copy",
    copied: "Copied!",
    api_title: "API Key Management",
    api_desc: "Securely rotate or revoke programmatic authentication keys.",
    api_warn: "Never expose your API key in client-side public code or repositories. New keys are securely emailed to your account.",
    api_key_hidden: "Hidden for security. Regenerate to obtain a new key.",
    regen_key: "Regenerate API Key",
    no_vectors: "No vectors found in collection.",
    no_tickets: "No tickets generated yet.",
    plan: "Plan",
    status: "Status",
    type: "Type",
    loading_text: "Loading...",
    plan_basic: "Basic",
    status_active: "Active",
    status_unknown: "Unknown",
    type_sales: "Sales",
    type_support: "Support",
    metric_leads_desc: "Leads & Support escalations",
    metric_kb_desc: "FAQ & Catalog items",
    placeholder_name: "Agenta Inc.",
    placeholder_email: "admin@company.com",
    placeholder_domain: "https://example.com",
    select_json: "Select a JSON file",
    back_btn: "Back",
    toast_signup_otp_sent: "Signup OTP sent to your email.",
    toast_signup_otp_failed: "Failed to request signup OTP.",
    toast_signup_success: "Signed up successfully!",
    toast_otp_sent: "OTP code sent to your email.",
    toast_otp_failed: "Failed to request OTP.",
    toast_login_success: "Logged in successfully!",
    toast_invalid_otp: "Invalid verification code.",
    toast_settings_saved: "Agent settings updated successfully!",
    toast_settings_failed: "Failed to save settings.",
    toast_key_regen_success: "API Key regenerated and emailed to admin.",
    toast_key_regen_failed: "Failed to regenerate key.",
    toast_domain_req: "Please enter a domain.",
    toast_token_gen_success: "Token generated successfully.",
    toast_token_gen_failed: "Failed to generate token.",
    toast_file_req: "Please select a file first.",
    toast_upload_success: "File uploaded successfully!",
    toast_upload_failed: "Failed to upload file.",
    confirm_logout: "Are you sure you want to log out?",
    confirm_regen_key: "Regenerate API Key? The old key will be invalidated immediately.",
    generated_jwt_label: "Generated JWT Token",
    logout_success: "Logged out successfully.",
    api_key_generated: "New API Key Generated",
    api_key_once_warning: "Please copy this key now. You will not be able to see it again!",
    toast_api_key_success: "API Key generated successfully.",
    resend_otp: "Resend Code",
    resend_in: "Resend available in:",
    switch_agent: "Switch Agent",
    create_agent: "Create New Agent",
    create_agent_title: "Create a New Agent",
    create_agent_desc: "Each agent operates independently with its own Knowledge Base.",
    agent_name_placeholder: "e.g. Sales Bot",
    cancel: "Cancel",
    create: "Create Agent",
    toast_agent_created: "New agent created successfully.",
    toast_agent_create_failed: "Failed to create agent."
  },
  fa: {
    app_title: "داشبورد ایجنتا",
    app_desc: "پلتفرم ایجنت‌های خودمختار",
    tab_overview: "پیشخوان",
    tab_settings: "تنظیمات ایجنت",
    tab_knowledge: "پایگاه دانش",
    tab_tickets: "تیکت‌ها و لیدها",
    tab_finances: "امور مالی",
    tab_widget: "توکن ویجت",
    tab_apikeys: "کلیدهای API",
    KB_Records: "پایگاه دانش",
    logout: "خروج",
    welcome: "خوش آمدید!",
    welcome_sub: "برای مدیریت ایجنت‌های هوشمند خود وارد شوید.",
    signup_title: "ایجاد حساب کاربری",
    signup_sub: "به پلتفرم ایجنتا بپیوندید.",
    name_label: "نام شرکت",
    signup_btn: "ثبت‌نام",
    no_account: "حساب کاربری ندارید؟ ثبت‌نام کنید",
    has_account: "قبلاً ثبت‌نام کرده‌اید؟ وارد شوید",
    reg_success: "حساب شما ساخته شد! لطفا برای ورود کد تایید دریافت کنید.",
    email_label: "آدرس ایمیل",
    req_otp_btn: "دریافت کد تایید",
    dev_token_link: "ورود با توکن توسعه‌دهنده (JWT)",
    otp_label: "کد تایید (OTP)",
    verify_btn: "تایید و ورود",
    back_email_link: "بازگشت به مرحله ایمیل",
    dev_token_label: "توکن توسعه‌دهنده API",
    connect_dash_btn: "اتصال به داشبورد",
    overview_title: "پیشخوان آمار",
    overview_desc: "مشاهده وضعیت لحظه‌ای و میزان مصرف منابع.",
    avail_balance: "موجودی در دسترس",
    total_funded: "کل شارژ شده",
    chat_used: "پیام‌های مصرف شده",
    reset_in: "تمدید در",
    days: "روز",
    active_agents: "ایجنت‌های فعال",
    settings_title: "تنظیمات ایجنت",
    settings_desc: "پیکربندی هویت، پرسونا، رفتارها و ادغام با سرویس‌های دیگر.",
    identity_sec: "هویت و اطلاعات پایه",
    agent_name: "نام ایجنت",
    domain_topic: "حوزه کاری / موضوع",
    language_iso: "زبان (کد دو حرفی)",
    agent_type: "نوع فعالیت ایجنت",
    persona_sec: "پرسونا و لحن تعامل",
    role_desc: "شرح نقش ایجنت",
    persona_inst: "دستورالعمل‌های پرسونا (لحن)",
    lead_sec: "جمع‌آوری اطلاعات (Lead) و خلاصه‌سازی",
    lead_questions: "سوالات جمع‌آوری لید (به ترتیب)",
    add_question: "افزودن سوال",
    ticket_summary_inst: "دستورالعمل خلاصه‌سازی تیکت (اختیاری)",
    integrations_sec: "ادغام‌ها و وب‌هوک‌ها",
    telegram_bot: "توکن ربات تلگرام",
    telegram_chat: "آیدی عددی ادمین تلگرام",
    bale_bot: "توکن ربات بله",
    bale_chat: "آیدی عددی ادمین بله",
    crm_webhook: "آدرس وب‌هوک CRM",
    live_widget_sec: "توکن ویجت زنده",
    live_widget_desc: "توکن واقعی ویجت (`wgt_...`) را وارد کنید تا ویجت در همین صفحه فعال شود.",
    save_config: "ذخیره تنظیمات ایجنت",
    kb_title: "پایگاه دانش (Vector Data)",
    kb_desc: "مدیریت فایل‌های FAQ و کاتالوگ محصولات.",
    faq_upload_title: "آپلود فایل FAQ (فرمت .json, .csv, .xlsx)",
    catalog_upload_title: "آپلود کاتالوگ (فقط .json)",
    select_file: "انتخاب فایل",
    upload_btn: "آپلود و پردازش",
    vector_id: "شناسه وکتور",
    doc_content: "محتوا / سند",
    metadata: "متا دیتا",
    tickets_title: "تیکت‌های پشتیبانی و لیدها",
    tickets_desc: "گزارشات ارجاع شده و اطلاعات جمع‌آوری شده مشتریان.",
    ticket_id: "شناسه تیکت",
    user_id: "شناسه کاربر",
    summary: "خلاصه گفتگو",
    created_at: "تاریخ ایجاد",
    finances_title: "امور مالی و سهمیه‌ها",
    finances_desc: "مصرف کردیت، پیگیری حاشیه‌ها و محدودیت‌ها.",
    billing_overview: "خلاصه صورت‌حساب",
    curr_balance: "موجودی فعلی",
    total_alloc: "کل کردیت اختصاص یافته",
    total_cons: "کل کردیت مصرف شده",
    rate_limits: "سهمیه‌ها و محدودیت‌ها",
    chat_daily: "سهمیه پیام متنی روزانه",
    audio_daily: "سهمیه صوتی روزانه",
    widget_title: "تولید توکن ویجت سایت",
    widget_desc: "برای قرار دادن ویجت در سایت خود، یک توکن اختصاصی برای دامنه سایت بسازید.",
    domain_label: "دامنه وب‌سایت",
    generate_widget_btn: "تولید توکن",
    copy: "کپی",
    copied: "کپی شد!",
    api_title: "مدیریت کلیدهای API",
    api_desc: "چرخش یا ابطال امن کلیدهای دسترسی برنامه‌نویسی.",
    api_warn: "هرگز کلید API خود را در کدهای سمت کلاینت قرار ندهید. کلیدهای جدید به ایمیل شما ارسال می‌شوند.",
    api_key_hidden: "به دلایل امنیتی مخفی شده است. برای دریافت کلید جدید، آن را مجددا بسازید.",
    regen_key: "ساخت مجدد کلید API",
    no_vectors: "هیچ وکتوری در این مجموعه یافت نشد.",
    no_tickets: "هیچ تیکتی تا کنون ایجاد نشده است.",
    plan: "پلن",
    status: "وضعیت",
    type: "نوع",
    loading_text: "در حال بارگذاری...",
    basic: "پایه",
    plan_basic: "پایه",
    status_active: "فعال",
    status_unknown: "نامشخص",
    type_sales: "فروش",
    type_support: "پشتیبانی",
    metric_leads_desc: "لیدها و ارجاعات پشتیبانی",
    metric_kb_desc: "آیتم‌های پایگاه دانش و کاتالوگ",
    placeholder_name: "شرکت ایجنتا",
    placeholder_email: "admin@company.com",
    placeholder_domain: "https://example.com",
    select_json: "انتخاب فایل JSON",
    back_btn: "بازگشت",
    toast_signup_otp_sent: "کد تایید ثبت‌نام به ایمیل شما ارسال شد.",
    toast_signup_otp_failed: "خطا در ارسال کد تایید ثبت‌نام.",
    toast_signup_success: "ثبت‌نام با موفقیت انجام شد!",
    toast_otp_sent: "کد تایید به ایمیل شما ارسال شد.",
    toast_otp_failed: "خطا در ارسال کد تایید.",
    toast_login_success: "با موفقیت وارد شدید!",
    toast_invalid_otp: "کد تایید نامعتبر است.",
    toast_settings_saved: "تنظیمات ایجنت با موفقیت ذخیره شد!",
    toast_settings_failed: "خطا در ذخیره تنظیمات.",
    toast_key_regen_success: "کلید API جدید ساخته و ایمیل شد.",
    toast_key_regen_failed: "خطا در ساخت کلید.",
    toast_domain_req: "لطفا یک دامنه وارد کنید.",
    toast_token_gen_success: "توکن با موفقیت ایجاد شد.",
    toast_token_gen_failed: "خطا در تولید توکن.",
    toast_file_req: "لطفا ابتدا یک فایل انتخاب کنید.",
    toast_upload_success: "فایل با موفقیت آپلود شد!",
    toast_upload_failed: "خطا در آپلود فایل.",
    confirm_logout: "آیا از خروج اطمینان دارید؟",
    confirm_regen_key: "آیا از ساخت مجدد کلید API اطمینان دارید؟ کلید قبلی فورا باطل می‌شود.",
    generated_jwt_label: "توکن JWT تولید شده",
    logout_success: "با موفقیت خارج شدید.",
    api_key_generated: "کلید API جدید تولید شد",
    api_key_once_warning: "لطفاً این کلید را همین الان کپی کنید. دیگر قادر به مشاهده آن نخواهید بود!",
    toast_api_key_success: "کلید API با موفقیت تولید شد.",
    resend_otp: "ارسال مجدد کد",
    resend_in: "امکان درخواست مجدد:",
    switch_agent: "تغییر ایجنت فعال",
    create_agent: "ساخت ایجنت جدید",
    create_agent_title: "ایجاد ایجنت جدید",
    create_agent_desc: "هر ایجنت به صورت مستقل و با پایگاه دانش مجزا عمل می‌کند.",
    agent_name_placeholder: "مثلاً: دستیار فروش",
    cancel: "انصراف",
    create: "ساخت ایجنت",
    toast_agent_created: "ایجنت جدید با موفقیت ساخته شد.",
    toast_agent_create_failed: "خطا در ساخت ایجنت."
  }
};

export default function App() {
  // --- LANGUAGE STATE ---
  const [lang, setLang] = useState(localStorage.getItem('preferred_lang') || 'en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- AGENTS LIST STATE ---
  const [agentsList, setAgentsList] = useState([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [creatingAgent, setCreatingAgent] = useState(false);

  // Translation helper
  const t = (key) => translations[lang][key] || key;

  // --- IP DETECTION FOR LANGUAGE ---
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
        const text = await response.text();
        const lines = text.split('\n');
        const locLine = lines.find(line => line.startsWith('loc='));
        if (locLine) {
          const countryCode = locLine.split('=')[1];
          if (countryCode === 'IR') {
            setLang('fa');
          }
        }
      } catch (error) {
        console.error("Location detection failed");
      }
    };
    if (!localStorage.getItem('preferred_lang')) {
      detectLocation();
    }
  }, []);

  // --- TOKENS ---
  const [apiToken, setApiToken] = useState(localStorage.getItem("access_token") || "");
  const [liveWidgetToken, setLiveWidgetToken] = useState(localStorage.getItem("live_widget_token") || "");

  // --- LOGIN UI STATE ---
  const [loginStep, setLoginStep] = useState(1);
  const [email, setEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [otp, setOtp] = useState("");
  const [apiTokenInput, setApiTokenInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

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

  // --- WIDGET TOKEN STATE ---
  const [widgetDomain, setWidgetDomain] = useState("");
  const [generatedWidgetToken, setGeneratedWidgetToken] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [newApiKey, setNewApiKey] = useState(""); // استیت برای نمایش کلید جدید

  // --- AGENT SETTINGS STATE ---
  const [agentSettings, setAgentSettings] = useState({
    name: "", topic: "", role: "", persona: "",
    language: "en", agent_type: "support",
    max_single_audio_minutes: 10, lead_questions: [],
    ticket_summary_instruction: "", telegram_bot_token: "",
    telegram_admin_chat_id: "", bale_bot_token: "",
    bale_admin_chat_id: "", crm_webhook_url: "",
    widget_token_input: ""
  });

  // --- TIMER STATE LOGIC ---
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- LIVE WIDGET INJECTION ---
  useEffect(() => {
    const cleanupWidget = () => {
      const script = document.getElementById('agenta-widget-script');
      if (script) script.remove();
      const host = document.getElementById('ava-widget-host');
      if (host) host.remove();
    };

    if (isAuthenticated && activeAgent?.agent_id && liveWidgetToken) {
      cleanupWidget(); 

      const script = document.createElement('script');
      script.id = 'agenta-widget-script';
      script.src = "https://api.aiagenta.ir/widget.js"; 
      script.setAttribute('data-widget-token', liveWidgetToken);
      script.setAttribute('data-agent-id', activeAgent.agent_id);
      script.setAttribute('data-greeting', lang === 'fa' ? "سلام، من دستیار هوشمند هستم. چطور می‌توانم کمک کنم؟" : "Hi, I am an AI Assistant, How can I help you?");
      script.setAttribute('data-dir', lang === 'fa' ? "rtl" : "ltr");
      script.setAttribute('data-position', lang === 'fa' ? "left" : "right");
      script.setAttribute('data-agent-name', activeAgent.name || "Anya");
      script.setAttribute('data-launcher-text', lang === 'fa' ? "پشتیبانی آنلاین" : "Online Support");
      script.setAttribute('data-primary-color', "#396dab");
      script.setAttribute('data-lang', lang);
      script.setAttribute('data-api-base', API_BASE);
      // Added missing default turnstile key as requested
      
      document.body.appendChild(script);
      return cleanupWidget; 
    } else {
      cleanupWidget();
    }
  }, [isAuthenticated, activeAgent, liveWidgetToken, lang]);

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
            console.error("Token refresh failed");
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
      console.error("API Fetch Error:", err.message);
      throw err;
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async (silent = false) => {
    if (!silent && !confirm(t('confirm_logout'))) return;

    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (e) {
        console.warn("Logout request failed", e);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setApiToken("");
    setIsAuthenticated(false);
    setTenantOverview(null);
    setActiveAgent(null);
    setFinanceData(null);
    setLoginStep(1); 
    if (!silent) showToast(t('logout_success'), "success");
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
          setAgentsList(overviewData.agents);
          const agent = overviewData.agents[0];
          setActiveAgent(agent);
          setAgentSettings(prev => ({
            ...prev,
            name: agent.name || "",
            topic: agent.topic || "",
            role: agent.role || "",
            persona: agent.persona || "",
            language: agent.language || "en",
            agent_type: agent.agent_type || "support",
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
          console.warn("Failed to load finances");
        }
      }
    } catch (err) {
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
      setKnowledgeBase([]);
      const kbData = await fetchWithAuth(`/agents/${activeAgent.agent_id}/knowledge_base_list?kind=${kbKind}`);
      if (kbData) {
        setKnowledgeBase(kbData.data || []);
        setKbTotalCount(kbData.total_count || 0);
      }
    } catch (e) {
      setKnowledgeBase([]);
      setKbTotalCount(0);
    }

    try {
      const tktData = await fetchWithAuth(`/agents/${activeAgent.agent_id}/agent_tickets`);
      if (tktData?.data) {
        setTickets(tktData.data);
      } else {
        setTickets([]);
      }
    } catch (e) {
      setTickets([]);
    }
  };

  const handleSwitchAgent = (agentId) => {
    const selected = agentsList.find(a => a.agent_id === agentId);
    if (selected) {
      setActiveAgent(selected);
      setAgentSettings(prev => ({
        ...prev,
        name: selected.name || "",
        topic: selected.topic || "",
        role: selected.role || "",
        persona: selected.persona || "",
        language: selected.language || "en",
        agent_type: selected.agent_type || "support",
        max_single_audio_minutes: selected.max_single_audio_minutes || 10,
        lead_questions: selected.lead_questions || [],
        ticket_summary_instruction: selected.ticket_summary_instruction || "",
        telegram_bot_token: selected.telegram_bot_token || "",
        telegram_admin_chat_id: selected.telegram_admin_chat_id || "",
        bale_bot_token: selected.bale_bot_token || "",
        bale_admin_chat_id: selected.bale_admin_chat_id || "",
        crm_webhook_url: selected.crm_webhook_url || "",
        widget_token_input: localStorage.getItem("live_widget_token") || ""
      }));
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    
    setCreatingAgent(true);
    try {
      const res = await fetchWithAuth("/dashboard/agents", {
        method: 'POST',
        body: JSON.stringify({ 
          name: newAgentName.trim(),
          topic: "General",
          role: "Assistant",
          persona: "Helpful",
          language: "en",
          agent_type: "support",
          lead_questions: [],
          status: "active",
          max_single_audio_minutes: 10,
          has_telegram: false,
          has_bale: false,
          has_crm_webhook: false
        })
      });
      
      showToast(res.message || t('toast_agent_created'), "success");
      setIsAgentModalOpen(false);
      setNewAgentName("");
      await loadDashboardData(); // بارگذاری مجدد لیست ایجنت‌ها
    } catch (err) {
      showToast(err.message || t('toast_agent_create_failed'), "error");
    } finally {
      setCreatingAgent(false);
    }
  };

  useEffect(() => {
    loadKbAndTickets();
  }, [isAuthenticated, activeAgent, kbKind]);

  // --- AUTH HANDLERS ---
  const handleSignupRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/request_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName.trim(), 
          email: email.trim(), 
          cf_token: "mock-token"
        }) 
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || t('toast_signup_otp_failed'));
      }
      setLoginStep(5); 
      setOtpTimer(300); // 5 minutes timer
      showToast(t('toast_signup_otp_sent'), "success");
    } catch (err) {
      showToast(err.message || t('toast_signup_otp_failed'), "error");
    }
    setLoginLoading(false);
  };

  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || t('toast_invalid_otp'));
      }
      
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      setApiToken(data.access_token);
      showToast(t('toast_signup_success'), "success");
    } catch (err) {
      showToast(err.message || t('toast_invalid_otp'), "error");
    }
    setLoginLoading(false);
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/request_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cf_token: "mock-token" })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t('toast_otp_failed'));
      }
      setLoginStep(2);
      setOtpTimer(300); // 5 minutes timer
      showToast(t('toast_otp_sent'), "success");
    } catch (err) {
      showToast(err.message || t('toast_otp_failed'), "error");
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
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = Array.isArray(errData.detail) ? errData.detail[0].msg : errData.detail;
        throw new Error(errMsg || t('toast_invalid_otp'));
      }
      
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      setApiToken(data.access_token);
      showToast(t('toast_login_success'), "success");
    } catch (err) {
      showToast(err.message || t('toast_invalid_otp'), "error");
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
      showToast(t('toast_settings_saved'));
    } catch (e) {
      showToast(t('toast_settings_failed'), "error");
    }
    setIsSaving(false);
  };

  const handleRegenerateKey = async () => {
    if (confirm(t('confirm_regen_key'))) {
      try {
        const res = await fetchWithAuth(`/dashboard/keys/generate-api-key`, { method: "POST" });
        setNewApiKey(res.api_key);
        showToast(t('toast_api_key_success'), "success");
      } catch(e) {
        showToast(e.message || t('toast_key_regen_failed'), "error");
      }
    }
  };

  const handleGenerateWidgetToken = async (e) => {
    e.preventDefault();
    if (!widgetDomain.trim()) {
      showToast(t('toast_domain_req'), "error");
      return;
    }
    if (!activeAgent?.agent_id) return;
    
    setGeneratingToken(true);
    try {
      const res = await fetchWithAuth(`/dashboard/keys/agents/${activeAgent.agent_id}/generate-widget-token`, {
        method: 'POST',
        body: JSON.stringify({ allowed_origins: [widgetDomain.trim()] })
      });
      setGeneratedWidgetToken(res.token);
      showToast(t('toast_token_gen_success'), "success");
    } catch (err) {
      showToast(err.message || t('toast_token_gen_failed'), "error");
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleFileUpload = async (type) => {
    const file = type === 'faq' ? faqFile : catalogFile;
    if (!file) {
      showToast(t('toast_file_req'), "error");
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

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || t('toast_upload_failed'));
      }

      showToast(t('toast_upload_success'), "success");
      loadKbAndTickets(); 

      if (type === 'faq') setFaqFile(null);
      else setCatalogFile(null);

    } catch (err) {
      showToast(err.message || t('toast_upload_failed'), "error");
    } finally {
      setUploadingKb(false);
    }
  };

  // --- RENDER BLOCKS ---
  if (loading && !isAuthenticated) {
    return (
      <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
        <p className="text-zinc-500 font-medium text-sm">{t('loading_text')}</p>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="bg-zinc-50 text-zinc-900 min-h-screen flex items-center justify-center font-sans transition-colors duration-300 relative">
        <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300 relative">
          
          <div className="absolute top-6 end-6">
            <button onClick={() => { const newLang = lang === 'en' ? 'fa' : 'en'; setLang(newLang); localStorage.setItem('preferred_lang', newLang); }} className="text-xs font-bold p-2 text-zinc-500 hover:text-zinc-900 bg-zinc-100 rounded-lg">
              {lang === 'en' ? 'FA' : 'EN'}
            </button>
          </div>

          <div className="flex items-center justify-center mb-6">
            <img src="https://aiagenta.ir/assets/logo/Agenta-LogoType2.svg" alt="Agenta Logo" className="h-16 w-auto" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 tracking-tight">
            {loginStep === 4 ? t('signup_title') : t('welcome')}
          </h2>
          <p className="text-zinc-500 text-center text-sm mb-8">
            {loginStep === 4 ? t('signup_sub') : t('welcome_sub')}
          </p>

          {toast && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {toast.type === 'error' ? <ShieldAlert size={18}/> : <CheckCircle2 size={18}/>}
              {toast.message}
            </div>
          )}

          {loginStep === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('email_label')}</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder={t('placeholder_email')} 
                  dir="ltr"
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : t('req_otp_btn')}
              </button>
              <div className="flex flex-col gap-3 text-center pt-2">
                <button type="button" onClick={() => { setLoginStep(4); setEmail(""); setOtp(""); setOtpTimer(0); }} className="text-sm text-[#2563EB] font-semibold hover:underline transition-colors">{t('no_account')}</button>
                <button type="button" onClick={() => { setLoginStep(3); setOtpTimer(0); }} className="text-xs text-zinc-400 hover:text-zinc-700 font-medium transition-colors">{t('dev_token_link')}</button>
              </div>
            </form>
          )}

          {loginStep === 4 && (
            <form onSubmit={handleSignupRequestOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('name_label')}</label>
                <input 
                  type="text" required value={regName} onChange={e => setRegName(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder={t('placeholder_name')} 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('email_label')}</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder={t('placeholder_email')} 
                  dir="ltr"
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : t('signup_btn')}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setLoginStep(1); setOtpTimer(0); }} className="text-sm text-zinc-500 hover:text-[#2563EB] font-semibold transition-colors">{t('has_account')}</button>
              </div>
            </form>
          )}

          {loginStep === 5 && (
            <form onSubmit={handleVerifySignupOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('otp_label')}</label>
                <input 
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] tracking-[0.5em] text-center text-xl font-mono" 
                  placeholder="------" maxLength={6}
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : t('verify_btn')}
              </button>
              <div className="flex flex-col gap-3 text-center pt-2">
                {otpTimer > 0 ? (
                  <p className="text-xs text-zinc-500 font-medium">{t('resend_in')} <span className="font-mono font-bold text-[#2563EB]" dir="ltr">{formatTimer(otpTimer)}</span></p>
                ) : (
                  <button type="button" onClick={handleSignupRequestOtp} className="text-sm font-semibold text-[#2563EB] hover:underline transition-colors">{t('resend_otp')}</button>
                )}
                <button type="button" onClick={() => { setLoginStep(4); setOtpTimer(0); }} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">{t('back_btn')}</button>
              </div>
            </form>
          )}

          {loginStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('otp_label')}</label>
                <input 
                  type="text" required value={otp} onChange={e => setOtp(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB] tracking-[0.5em] text-center text-xl font-mono" 
                  placeholder="------" maxLength={6}
                />
              </div>
              <button disabled={loginLoading} type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {loginLoading ? <Loader2 size={18} className="animate-spin"/> : t('verify_btn')}
              </button>
              <div className="flex flex-col gap-3 text-center pt-2">
                {otpTimer > 0 ? (
                  <p className="text-xs text-zinc-500 font-medium">{t('resend_in')} <span className="font-mono font-bold text-[#2563EB]" dir="ltr">{formatTimer(otpTimer)}</span></p>
                ) : (
                  <button type="button" onClick={handleRequestOtp} className="text-sm font-semibold text-[#2563EB] hover:underline transition-colors">{t('resend_otp')}</button>
                )}
                <button type="button" onClick={() => { setLoginStep(1); setOtpTimer(0); }} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">{t('back_email_link')}</button>
              </div>
            </form>
          )}

          {loginStep === 3 && (
            <form onSubmit={handleDevLogin} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-700">{t('dev_token_label')}</label>
                <input 
                  type="password" required value={apiTokenInput} onChange={e => setApiTokenInput(e.target.value)} 
                  className="mt-1.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]" 
                  placeholder="eyJhbGciOi..." 
                  dir="ltr"
                />
              </div>
              <button type="submit" className="w-full bg-zinc-900 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                <ArrowRight size={18} /> {t('connect_dash_btn')}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setLoginStep(1); setOtpTimer(0); }} className="text-xs text-zinc-400 hover:text-[#2563EB] font-medium transition-colors">{t('back_email_link')}</button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="bg-zinc-50 text-zinc-900 min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <img 
            src="https://aiagenta.ir/assets/logo/Agenta-LogoType2.svg" 
            alt="Agenta Logo" 
            className="h-10 w-auto" 
          />
          <div className="border-s border-zinc-200 ps-4 flex items-center gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-700">{tenantOverview?.name || t('app_desc')}</p>
              {agentsList.length > 0 && (
                <select
                  value={activeAgent?.agent_id || ""}
                  onChange={(e) => handleSwitchAgent(e.target.value)}
                  className="block w-full text-xs bg-transparent border-none text-zinc-500 cursor-pointer outline-none font-medium mt-0.5 p-0"
                  title={t('switch_agent')}
                >
                  {agentsList.map(a => (
                    <option key={a.agent_id} value={a.agent_id}>{a.name || 'Unnamed Agent'}</option>
                  ))}
                </select>
              )}
            </div>
            <button 
              onClick={() => setIsAgentModalOpen(true)} 
              className="p-1.5 bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg text-zinc-500 transition-colors" 
              title={t('create_agent')}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const newLang = lang === 'en' ? 'fa' : 'en';
              setLang(newLang);
              localStorage.setItem('preferred_lang', newLang);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors text-sm font-semibold text-zinc-600"
          >
            <Globe size={16} /> {lang === 'en' ? 'FA' : 'EN'}
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {toast && (
        <div className={`fixed top-20 end-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Create Agent Modal */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl m-4">
            <h3 className="text-lg font-bold mb-1">{t('create_agent_title')}</h3>
            <p className="text-sm text-zinc-500 mb-6">{t('create_agent_desc')}</p>
            <form onSubmit={handleCreateAgent}>
              <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('agent_name')}</label>
              <input 
                type="text" 
                autoFocus 
                required 
                value={newAgentName} 
                onChange={e => setNewAgentName(e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] mb-6" 
                placeholder={t('agent_name_placeholder')} 
              />
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAgentModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={creatingAgent} 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                >
                  {creatingAgent ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 border-e border-zinc-200 bg-white p-4 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            {[
              { id: 'overview', trans: 'tab_overview', icon: LayoutDashboard },
              { id: 'settings', trans: 'tab_settings', icon: Settings },
              { id: 'knowledge', trans: 'tab_knowledge', icon: Database },
              { id: 'tickets', trans: 'tab_tickets', icon: Ticket },
              { id: 'finances', trans: 'tab_finances', icon: Wallet },
              { id: 'widget', trans: 'tab_widget', icon: Code },
              { id: 'apikeys', trans: 'tab_apikeys', icon: Key },
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
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <Icon size={18} />
                  {t(tab.trans)}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 pt-4 mt-4">
            <button
              onClick={() => handleLogout(false)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              {t('logout')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('overview_title')}</h2>
                <p className="text-sm text-zinc-500">{t('overview_desc')}</p>
              </div>

              {/* Tenant Identity Card */}
              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#22D3EE] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                  {tenantOverview?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 space-y-1 text-center md:text-start">
                  <h3 className="text-xl font-bold">{tenantOverview?.name || t('loading_text')}</h3>
                  <p className="text-sm text-zinc-500">{tenantOverview?.email || t('placeholder_email')}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{t('plan')}: {tenantOverview?.plan || t('plan_basic')}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenantOverview?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{t('status')}: {tenantOverview?.status === 'active' ? t('status_active') : t('status_unknown')}</span>
                    {activeAgent && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 capitalize">
                        {t('type')}: {activeAgent.agent_type === 'sales' ? t('type_sales') : activeAgent.agent_type === 'support' ? t('type_support') : activeAgent.agent_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Wallet size={16}/> {t('avail_balance')}</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-[#22D3EE]" dir="ltr">
                    {financeData ? `${financeData.balance} ${financeData.currency}` : '---'}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{t('total_funded')}: {financeData?.total_credits || 0}</p>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><MessageSquare size={16}/> {t('chat_used')}</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-[#2563EB]" dir="ltr">
                    {financeData?.tenant_totals?.total_messages || 0}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{t('reset_in')} {financeData?.days_remaining_in_cycle || 30} {t('days')}</p>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Ticket size={16}/> {t('tab_tickets')}</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-amber-500" dir="ltr">
                    {tickets.length}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{t('metric_leads_desc')}</p>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Database size={16}/> {t('KB_Records')}</p>
                  <h3 className="text-2xl font-extrabold mt-3 text-purple-500" dir="ltr">
                    {kbTotalCount}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{t('metric_kb_desc')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('settings_title')}</h2>
                <p className="text-sm text-zinc-500">{t('settings_desc')}</p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-8 shadow-sm">
                
                {/* Identity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 pb-2">{t('identity_sec')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('agent_name')}</label>
                      <input type="text" value={agentSettings.name} onChange={e => setAgentSettings({...agentSettings, name: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('domain_topic')}</label>
                      <input type="text" value={agentSettings.topic} onChange={e => setAgentSettings({...agentSettings, topic: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('language_iso')}</label>
                      <input type="text" value={agentSettings.language} onChange={e => setAgentSettings({...agentSettings, language: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('agent_type')}</label>
                      <select 
                        value={agentSettings.agent_type || "support"} 
                        onChange={e => setAgentSettings({...agentSettings, agent_type: e.target.value})} 
                        className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]"
                      >
                        {AGENT_TYPES_CONFIG.map(type => (
                          <option key={type.value} value={type.value}>{type.value === 'support' ? t('type_support') : t('type_sales')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Persona & Behavior */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 pb-2">{t('persona_sec')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('role_desc')}</label>
                      <textarea rows={3} value={agentSettings.role || ""} onChange={e => setAgentSettings({...agentSettings, role: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" placeholder="..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('persona_inst')}</label>
                      <textarea rows={3} value={agentSettings.persona || ""} onChange={e => setAgentSettings({...agentSettings, persona: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" placeholder="..." />
                    </div>
                  </div>
                </div>

                {/* Sales & Leads */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 pb-2">{t('lead_sec')}</h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('lead_questions')}</label>
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
                            className="flex-1 bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#2563EB]"
                          />
                          <button type="button" onClick={() => {
                              const updated = agentSettings.lead_questions.filter((_, i) => i !== idx);
                              setAgentSettings({...agentSettings, lead_questions: updated});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setAgentSettings({...agentSettings, lead_questions: [...agentSettings.lead_questions, ""]})} className="text-xs font-semibold text-[#2563EB] mt-2 flex items-center gap-1 hover:underline">
                        <Plus size={16} /> {t('add_question')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2 mt-4">{t('ticket_summary_inst')}</label>
                    <textarea rows={2} value={agentSettings.ticket_summary_instruction || ""} onChange={e => setAgentSettings({...agentSettings, ticket_summary_instruction: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl p-4 text-sm outline-none focus:border-[#2563EB]" />
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-zinc-200 pb-2">{t('integrations_sec')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('telegram_bot')}</label>
                      <input type="password" value={agentSettings.telegram_bot_token || ""} onChange={e => setAgentSettings({...agentSettings, telegram_bot_token: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('telegram_chat')}</label>
                      <input type="text" value={agentSettings.telegram_admin_chat_id || ""} onChange={e => setAgentSettings({...agentSettings, telegram_admin_chat_id: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('bale_bot')}</label>
                      <input type="password" value={agentSettings.bale_bot_token || ""} onChange={e => setAgentSettings({...agentSettings, bale_bot_token: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('bale_chat')}</label>
                      <input type="text" value={agentSettings.bale_admin_chat_id || ""} onChange={e => setAgentSettings({...agentSettings, bale_admin_chat_id: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" dir="ltr" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('crm_webhook')}</label>
                      <input type="url" value={agentSettings.crm_webhook_url || ""} onChange={e => setAgentSettings({...agentSettings, crm_webhook_url: e.target.value})} className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="https://..." dir="ltr" />
                    </div>
                  </div>
                </div>

                {/* Live Widget Test */}
                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <h3 className="text-lg font-semibold">{t('live_widget_sec')}</h3>
                  <p className="text-xs text-zinc-500">{t('live_widget_desc')}</p>
                  <input type="text" value={agentSettings.widget_token_input || ""} onChange={e => setAgentSettings({...agentSettings, widget_token_input: e.target.value})} className="w-full max-w-md bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" placeholder="wgt_..." dir="ltr" />
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 bg-[#2563EB]">
                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : null}
                    {t('save_config')}
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
                  <h2 className="text-2xl font-bold tracking-tight">{t('kb_title')}</h2>
                  <p className="text-sm text-zinc-500">{t('kb_desc')} (Total: {kbTotalCount})</p>
                </div>
                <div className="flex bg-zinc-200 p-1 rounded-xl shrink-0">
                  <button onClick={() => setKbKind('faq')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${kbKind === 'faq' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>FAQ</button>
                  <button onClick={() => setKbKind('catalog')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${kbKind === 'catalog' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Catalog</button>
                </div>
              </div>

              {/* Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-semibold text-sm">{t('faq_upload_title')}</h3>
                  <input type="file" id="faq-upload" className="hidden" accept=".json,.csv,.xlsx" onChange={e => setFaqFile(e.target.files[0])} />
                  <label htmlFor="faq-upload" className="cursor-pointer text-sm text-zinc-500 hover:text-blue-600">
                    {faqFile ? faqFile.name : t('select_file')}
                  </label>
                  <button onClick={() => handleFileUpload('faq')} disabled={!faqFile || uploadingKb} className="mt-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-2">
                    {uploadingKb && faqFile ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} {t('upload_btn')}
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
                    <Database size={24} />
                  </div>
                  <h3 className="font-semibold text-sm">{t('catalog_upload_title')}</h3>
                  <input type="file" id="catalog-upload" className="hidden" accept=".json" onChange={e => setCatalogFile(e.target.files[0])} />
                  <label htmlFor="catalog-upload" className="cursor-pointer text-sm text-zinc-500 hover:text-cyan-600">
                    {catalogFile ? catalogFile.name : t('select_json')}
                  </label>
                  <button onClick={() => handleFileUpload('catalog')} disabled={!catalogFile || uploadingKb} className="mt-2 px-4 py-2 bg-[#22D3EE] text-zinc-900 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-2">
                    {uploadingKb && catalogFile ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} {t('upload_btn')}
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-gray-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="p-4 text-start">{t('vector_id')}</th>
                      <th className="p-4 text-start">{t('doc_content')}</th>
                      <th className="p-4 text-start">{t('metadata')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm">
                    {knowledgeBase.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-zinc-500">{t('no_vectors')}</td>
                      </tr>
                    ) : (
                      knowledgeBase.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 font-mono text-xs text-[#2563EB] align-top">{item.Id}</td>
                          <td className="p-4 min-w-[300px] text-zinc-700 whitespace-pre-wrap break-words align-top leading-relaxed" dir="auto">
                            {item.Document}
                          </td>
                          <td className="p-4 min-w-[250px] align-top">
                            <div className="bg-zinc-100 p-3 rounded-xl text-[11px] font-mono text-zinc-600 whitespace-pre-wrap break-words text-left" dir="ltr">
                              {JSON.stringify(item.Metadata, null, 2)}
                            </div>
                          </td>
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
                <h2 className="text-2xl font-bold tracking-tight">{t('tickets_title')}</h2>
                <p className="text-sm text-zinc-500">{t('tickets_desc')}</p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-gray-50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="p-4 text-start">{t('ticket_id')}</th>
                      <th className="p-4 text-start">{t('user_id')}</th>
                      <th className="p-4 text-start">{t('summary')}</th>
                      <th className="p-4 text-start">{t('created_at')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-zinc-500">{t('no_tickets')}</td>
                      </tr>
                    ) : (
                      tickets.map((tkt, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 font-mono text-xs text-zinc-600">{tkt.ticket_id}</td>
                          <td className="p-4 font-mono text-xs text-zinc-500">{tkt.user_id}</td>
                          <td className="p-4 text-zinc-800" dir="auto">{tkt.summary}</td>
                          <td className="p-4 text-xs text-zinc-500" dir="ltr">{new Date(tkt.created_at).toLocaleString()}</td>
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
                <h2 className="text-2xl font-bold tracking-tight">{t('finances_title')}</h2>
                <p className="text-sm text-zinc-500">{t('finances_desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-4 shadow-sm">
                  <h3 className="font-bold text-lg">{t('billing_overview')}</h3>
                  <div className="flex justify-between py-2 border-b border-zinc-200 text-sm">
                    <span className="text-zinc-500">{t('curr_balance')}</span>
                    <span className="font-bold text-[#2563EB]" dir="ltr">{financeData?.balance || 0} {financeData?.currency || 'CRD'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-200 text-sm">
                    <span className="text-zinc-500">{t('total_alloc')}</span>
                    <span className="font-semibold">{financeData?.total_credits || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">{t('total_cons')}</span>
                    <span className="font-semibold text-red-500">{financeData?.total_debits || 0}</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-4 shadow-sm">
                  <h3 className="font-bold text-lg">{t('rate_limits')}</h3>
                  <div className="flex justify-between py-2 border-b border-zinc-200 text-sm">
                    <span className="text-zinc-500">{t('chat_daily')}</span>
                    <span className="font-semibold" dir="ltr">{financeData?.rate_limits?.chat_used_today || 0} / {financeData?.rate_limits?.chat_daily_limit || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-500">{t('audio_daily')}</span>
                    <span className="font-semibold" dir="ltr">{financeData?.rate_limits?.audio_used_today || 0} / {financeData?.rate_limits?.audio_daily_limit || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WIDGET TOKEN */}
          {activeTab === 'widget' && (
            <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('widget_title')}</h2>
                <p className="text-sm text-zinc-500">{t('widget_desc')}</p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-6 shadow-sm">
                <form onSubmit={handleGenerateWidgetToken} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2">{t('domain_label')}</label>
                    <input 
                      type="text" 
                      value={widgetDomain} 
                      onChange={e => setWidgetDomain(e.target.value)} 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB]" 
                      placeholder={t('placeholder_domain')} 
                      dir="ltr"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={generatingToken} 
                    className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 bg-[#2563EB] disabled:opacity-70"
                  >
                    {generatingToken ? <Loader2 size={16} className="animate-spin" /> : <Code size={16} />}
                    {t('generate_widget_btn')}
                  </button>
                </form>

                {generatedWidgetToken && (
                  <div className="pt-6 border-t border-zinc-200 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold uppercase text-emerald-600">{t('generated_jwt_label')}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={generatedWidgetToken} 
                        className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" 
                        dir="ltr"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedWidgetToken);
                          showToast(t('copied'), "success");
                        }}
                        className="p-2.5 bg-zinc-100 border border-zinc-300 rounded-xl hover:bg-zinc-200 text-zinc-600 transition-colors"
                        title={t('copy')}
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: API KEYS */}
          {activeTab === 'apikeys' && (
            <div className="max-w-xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('api_title')}</h2>
                <p className="text-sm text-zinc-500">{t('api_desc')}</p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-6 shadow-sm">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{t('api_warn')}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-zinc-500">{t('tab_apikeys')}</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="••••••••••••••••••••••••••••••••••••••" 
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-400 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" 
                    dir="ltr"
                  />
                  <p className="text-xs text-zinc-500">{t('api_key_hidden')}</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-zinc-200">
                  <button 
                    onClick={handleRegenerateKey}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-90 flex items-center gap-2 transition-opacity bg-red-600"
                  >
                    <RefreshCw size={16} /> {t('regen_key')}
                  </button>
                </div>

                {newApiKey && (
                  <div className="pt-6 border-t border-zinc-200 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold uppercase text-emerald-600">{t('api_key_generated')}</label>
                    <p className="text-xs text-amber-600 font-medium mb-2">{t('api_key_once_warning')}</p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={newApiKey} 
                        className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" 
                        dir="ltr"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey);
                          showToast(t('copied'), "success");
                        }}
                        className="p-2.5 bg-zinc-100 border border-zinc-300 rounded-xl hover:bg-zinc-200 text-zinc-600 transition-colors"
                        title={t('copy')}
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}