"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ContentTransition } from "@/components/layout/ContentTransition";
import {
  User,
  Building2,
  Users,
  Shield,
  Bell,
  Layers,
  CreditCard,
  Palette,
  Cpu,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FileText,
  Copy,
  Check,
  Webhook,
  Key,
  Zap,
  Clock,
  ExternalLink,
  Trash2,
  Upload,
  Lock,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Smartphone,
  Globe,
  Info,
  Calendar,
  Eye,
  EyeOff,
  AlertOctagon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RbacGuard } from "@/components/auth/RbacGuard";
import { useToast } from "@/components/ui/Toast";
import { EditOrganizationModal } from "@/components/settings/EditOrganizationModal";
import { GenerateApiKeyModal } from "@/components/settings/GenerateApiKeyModal";
import type { OrganizationSettings } from "@/types/settings";

type SettingsTab =
  | "Account"
  | "Organization"
  | "Team"
  | "Security"
  | "Notifications"
  | "Integrations"
  | "Billing"
  | "Appearance"
  | "Advanced";

const SETTINGS_NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType; sublabel: string }[] = [
  { id: "Account", label: "Account", icon: User, sublabel: "Profile, preferences & danger zone" },
  { id: "Organization", label: "Organization", icon: Building2, sublabel: "Company identity & invoice tax data" },
  { id: "Team", label: "Team", icon: Users, sublabel: "Members, seats & role access" },
  { id: "Security", label: "Security", icon: Shield, sublabel: "Password, 2FA & active sessions" },
  { id: "Notifications", label: "Notifications", icon: Bell, sublabel: "Spike alerts, thresholds & webhooks" },
  { id: "Integrations", label: "Integrations", icon: Layers, sublabel: "Connected upstream AI providers" },
  { id: "Billing", label: "Billing", icon: CreditCard, sublabel: "Subscription tier & usage charges" },
  { id: "Appearance", label: "Appearance", icon: Palette, sublabel: "Theme sync & display density" },
  { id: "Advanced", label: "Advanced", icon: Cpu, sublabel: "Debug headers, hard quotas & retention" },
];

const SUPPORTED_FALLBACK_MODELS = [
  { id: "claude-3-7-sonnet", label: "Anthropic Claude 3.7 Sonnet (Hybrid Reasoning)", provider: "Anthropic" },
  { id: "gpt-4o", label: "OpenAI GPT-4o Omni (High-Speed Multimodal)", provider: "OpenAI" },
  { id: "gemini-2.0-flash", label: "Google Gemini 2.0 Flash (Sub-100ms Inference)", provider: "Google" },
  { id: "claude-3-5-sonnet", label: "Anthropic Claude 3.5 Sonnet (Production Standard)", provider: "Anthropic" },
  { id: "gpt-4o-mini", label: "OpenAI GPT-4o Mini (Cost-Optimized Fallback)", provider: "OpenAI" },
];

interface ConnectedProviderState {
  id: string;
  name: string;
  provider: "anthropic" | "openai" | "gemini" | "groq";
  status: "Active" | "Failed probe" | "Not connected";
  latencyMs: number;
  modelsCount: number;
  lastProbe: string;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const { user, currentOrg, signOut } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("Account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountPhrase, setDeleteAccountPhrase] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
  const [isGenerateKeyOpen, setIsGenerateKeyOpen] = useState(false);
  const [disconnectingProvider, setDisconnectingProvider] = useState<ConnectedProviderState | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Quick action copy feedback
  const [copiedOrgId, setCopiedOrgId] = useState(false);
  const [copiedKeyHint, setCopiedKeyHint] = useState(false);

  // ---------------------------------------------------------------------------
  // Account Form State
  // ---------------------------------------------------------------------------
  const [fullName, setFullName] = useState(user?.displayName || "Naveen Chief Architect");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [language, setLanguage] = useState("en-US (English)");
  const [dateFormat, setDateFormat] = useState("DD MMM, YYYY");
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  // ---------------------------------------------------------------------------
  // Organization / Profile Form State
  // ---------------------------------------------------------------------------
  const [companyName, setCompanyName] = useState(currentOrg?.name || "OsterdOps AI Corp");
  const [billingEmail, setBillingEmail] = useState(user?.email || "billing@osterdops.com");
  const [taxId, setTaxId] = useState("");
  const [billingAddress, setBillingAddress] = useState(
    "100 Enterprise Way, Suite 400\nSan Francisco, CA 94107\nUnited States"
  );
  const [country, setCountry] = useState("United States");

  // ---------------------------------------------------------------------------
  // Security Form State
  // ---------------------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // Notification Policies Form State
  // ---------------------------------------------------------------------------
  const [alertEmail, setAlertEmail] = useState(user?.email || "alerts@osterdops.com");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [notifyRunawayLoop, setNotifyRunawayLoop] = useState(true);
  const [notify80Percent, setNotify80Percent] = useState(true);
  const [notify100Percent, setNotify100Percent] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
  const [notifyProviderFailover, setNotifyProviderFailover] = useState(true);

  // ---------------------------------------------------------------------------
  // Integrations State
  // ---------------------------------------------------------------------------
  const [providers, setProviders] = useState<ConnectedProviderState[]>([
    {
      id: "conn_anthropic_prod",
      name: "Anthropic Enterprise Suite",
      provider: "anthropic",
      status: "Active",
      latencyMs: 14,
      modelsCount: 4,
      lastProbe: "1 min ago (HTTP 200 OK)",
    },
    {
      id: "conn_openai_prod",
      name: "OpenAI Direct API Proxy",
      provider: "openai",
      status: "Active",
      latencyMs: 22,
      modelsCount: 6,
      lastProbe: "4 mins ago (HTTP 200 OK)",
    },
    {
      id: "conn_gemini_prod",
      name: "Google Vertex & Gemini Studio",
      provider: "gemini",
      status: "Active",
      latencyMs: 18,
      modelsCount: 5,
      lastProbe: "2 mins ago (HTTP 200 OK)",
    },
    {
      id: "conn_groq_prod",
      name: "Groq Ultra-Low Latency LPU",
      provider: "groq",
      status: "Not connected",
      latencyMs: 0,
      modelsCount: 0,
      lastProbe: "Never connected",
    },
  ]);

  // ---------------------------------------------------------------------------
  // Advanced & Gateway State
  // ---------------------------------------------------------------------------
  const [defaultModel, setDefaultModel] = useState("claude-3-7-sonnet");
  const [requestTimeoutSeconds, setRequestTimeoutSeconds] = useState(30);
  const [hardBudgetCapUsd, setHardBudgetCapUsd] = useState(1000);
  const [enableCircuitBreaker, setEnableCircuitBreaker] = useState(true);
  const [enableRunawayLoopGuard, setEnableRunawayLoopGuard] = useState(true);
  const [rateLimitDebugMode, setRateLimitDebugMode] = useState(false);
  const [hardQuotaEnforcement, setHardQuotaEnforcement] = useState(true);
  const [telemetryRetentionDays, setTelemetryRetentionDays] = useState(90);

  // Initial baseline settings for change tracking
  const [initialSettings, setInitialSettings] = useState<OrganizationSettings | null>(null);

  const orgId = currentOrg?.id || "org_default";

  // ---------------------------------------------------------------------------
  // Load Settings from Backend API
  // ---------------------------------------------------------------------------
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/v1/settings?orgId=${encodeURIComponent(orgId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        const data: OrganizationSettings = json.data;
        if (data) {
          setCompanyName(data.companyName || currentOrg?.name || "OsterdOps AI Corp");
          setBillingEmail(data.billingEmail || user?.email || "billing@osterdops.com");
          setTaxId(data.taxId || "");
          setBillingAddress(
            data.billingAddress ||
              "100 Enterprise Way, Suite 400\nSan Francisco, CA 94107\nUnited States"
          );
          setCountry(data.country || "United States");
          setDefaultModel(data.defaultModel || "claude-3-7-sonnet");
          setRequestTimeoutSeconds(data.requestTimeoutSeconds || 30);
          setHardBudgetCapUsd(data.hardBudgetCapUsd !== undefined ? data.hardBudgetCapUsd : 1000);
          setEnableCircuitBreaker(
            data.enableCircuitBreaker !== undefined ? data.enableCircuitBreaker : true
          );
          setEnableRunawayLoopGuard(
            data.enableRunawayLoopGuard !== undefined ? data.enableRunawayLoopGuard : true
          );
          setRateLimitDebugMode(Boolean(data.rateLimitDebugMode));
          setHardQuotaEnforcement(data.hardQuotaEnforcement !== undefined ? Boolean(data.hardQuotaEnforcement) : true);
          setTelemetryRetentionDays(data.telemetryRetentionDays || 90);
          setTimezone(data.timezone || "UTC (Coordinated Universal Time)");
          setLanguage(data.language || "en-US (English)");
          setDateFormat(data.dateFormat || "DD MMM, YYYY");
          setDarkMode(data.darkMode !== undefined ? Boolean(data.darkMode) : true);
          setEmailNotifications(data.emailNotifications !== undefined ? Boolean(data.emailNotifications) : true);
          setProductUpdates(Boolean(data.productUpdates));
          setAlertEmail(data.alertEmail || user?.email || "alerts@osterdops.com");
          setSlackWebhookUrl(data.slackWebhookUrl || "");
          setNotifyRunawayLoop(data.notifyRunawayLoop !== undefined ? Boolean(data.notifyRunawayLoop) : true);
          setNotify80Percent(data.notify80Percent !== undefined ? Boolean(data.notify80Percent) : true);
          setNotify100Percent(data.notify100Percent !== undefined ? Boolean(data.notify100Percent) : true);
          setNotifyWeeklyDigest(data.notifyWeeklyDigest !== undefined ? Boolean(data.notifyWeeklyDigest) : true);
          setNotifyProviderFailover(data.notifyProviderFailover !== undefined ? Boolean(data.notifyProviderFailover) : true);

          setInitialSettings(data);
        }
      }
    } catch (err) {
      console.warn("[Dashboard Settings] Fallback to context values:", err);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, currentOrg?.name, user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Check dirty status
  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    return (
      companyName !== initialSettings.companyName ||
      billingEmail !== initialSettings.billingEmail ||
      taxId !== (initialSettings.taxId || "") ||
      billingAddress !== initialSettings.billingAddress ||
      country !== initialSettings.country ||
      defaultModel !== initialSettings.defaultModel ||
      requestTimeoutSeconds !== initialSettings.requestTimeoutSeconds ||
      hardBudgetCapUsd !== initialSettings.hardBudgetCapUsd ||
      enableCircuitBreaker !== initialSettings.enableCircuitBreaker ||
      enableRunawayLoopGuard !== initialSettings.enableRunawayLoopGuard ||
      rateLimitDebugMode !== Boolean(initialSettings.rateLimitDebugMode) ||
      hardQuotaEnforcement !== (initialSettings.hardQuotaEnforcement ?? true) ||
      telemetryRetentionDays !== (initialSettings.telemetryRetentionDays ?? 90) ||
      timezone !== (initialSettings.timezone ?? "UTC (Coordinated Universal Time)") ||
      language !== (initialSettings.language ?? "en-US (English)") ||
      dateFormat !== (initialSettings.dateFormat ?? "DD MMM, YYYY") ||
      darkMode !== (initialSettings.darkMode ?? true) ||
      emailNotifications !== (initialSettings.emailNotifications ?? true) ||
      productUpdates !== Boolean(initialSettings.productUpdates) ||
      alertEmail !== initialSettings.alertEmail ||
      slackWebhookUrl !== (initialSettings.slackWebhookUrl || "") ||
      notifyRunawayLoop !== (initialSettings.notifyRunawayLoop ?? true) ||
      notify80Percent !== (initialSettings.notify80Percent ?? true) ||
      notify100Percent !== (initialSettings.notify100Percent ?? true) ||
      notifyWeeklyDigest !== (initialSettings.notifyWeeklyDigest ?? true) ||
      notifyProviderFailover !== (initialSettings.notifyProviderFailover ?? true)
    );
  }, [
    initialSettings,
    companyName,
    billingEmail,
    taxId,
    billingAddress,
    country,
    defaultModel,
    requestTimeoutSeconds,
    hardBudgetCapUsd,
    enableCircuitBreaker,
    enableRunawayLoopGuard,
    rateLimitDebugMode,
    hardQuotaEnforcement,
    telemetryRetentionDays,
    timezone,
    language,
    dateFormat,
    darkMode,
    emailNotifications,
    productUpdates,
    alertEmail,
    slackWebhookUrl,
    notifyRunawayLoop,
    notify80Percent,
    notify100Percent,
    notifyWeeklyDigest,
    notifyProviderFailover,
  ]);

  // ---------------------------------------------------------------------------
  // Save Settings Handler
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (isSaving) return;

    if (!companyName.trim()) {
      toast("Company name cannot be empty.", "warning");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const token = await user?.getIdToken();
      const payload: Partial<OrganizationSettings> & { orgId: string } = {
        orgId,
        companyName: companyName.trim(),
        billingEmail: billingEmail.trim(),
        taxId: taxId.trim(),
        billingAddress: billingAddress.trim(),
        country: country.trim(),
        defaultModel,
        requestTimeoutSeconds: Number(requestTimeoutSeconds),
        enableCircuitBreaker,
        enableRunawayLoopGuard,
        hardBudgetCapUsd: Number(hardBudgetCapUsd),
        rateLimitDebugMode,
        hardQuotaEnforcement,
        telemetryRetentionDays: Number(telemetryRetentionDays),
        timezone,
        language,
        dateFormat,
        darkMode,
        emailNotifications,
        productUpdates,
        alertEmail: alertEmail.trim(),
        slackWebhookUrl: slackWebhookUrl.trim(),
        notifyRunawayLoop,
        notify80Percent,
        notify100Percent,
        notifyWeeklyDigest,
        notifyProviderFailover,
      };

      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Failed to persist settings.");
      }

      const updated: OrganizationSettings = json.data;
      setInitialSettings(updated);
      setSaveSuccessMsg("Settings updated & synchronized across Firestore and Gateway.");
      toast("Settings saved successfully", "success");

      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings.";
      toast(msg, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // ---------------------------------------------------------------------------
  // Disconnect / Delete Integration Handler
  // ---------------------------------------------------------------------------
  const handleConfirmDisconnectProvider = async () => {
    if (!disconnectingProvider) return;
    setIsDisconnecting(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch(
        `/api/v1/providers/${encodeURIComponent(disconnectingProvider.id)}?organizationId=${encodeURIComponent(
          orgId
        )}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error("Failed to revoke integration credentials.");
      }

      setProviders((prev) =>
        prev.map((p) =>
          p.id === disconnectingProvider.id
            ? { ...p, status: "Not connected", latencyMs: 0, modelsCount: 0, lastProbe: "Disconnected just now" }
            : p
        )
      );

      toast(`${disconnectingProvider.name} disconnected successfully. Credentials purged.`, "success");
      setDisconnectingProvider(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke provider connection.";
      toast(msg, "danger");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Account Permanently Handler
  // ---------------------------------------------------------------------------
  const handleDeleteAccount = async () => {
    const phrase = deleteAccountPhrase.trim();
    const isValid =
      phrase === "DELETE MY ACCOUNT" ||
      (user?.email && phrase.toLowerCase() === user.email.toLowerCase());

    if (!isValid) {
      toast("Confirmation mismatch. Type 'DELETE MY ACCOUNT' or your email to confirm.", "warning");
      return;
    }

    setIsDeletingAccount(true);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/v1/user/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirmationPhrase: phrase }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Account deletion failed.");
      }

      toast("Account deleted permanently. Redirecting to login...", "info");
      await signOut();
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account.";
      toast(msg, "danger");
      setIsDeletingAccount(false);
    }
  };

  // Quick Copy Helpers
  const copyOrgId = () => {
    navigator.clipboard.writeText(orgId);
    setCopiedOrgId(true);
    setTimeout(() => setCopiedOrgId(false), 2000);
    toast("Organization ID copied to clipboard", "info");
  };

  const copyKeyHint = () => {
    navigator.clipboard.writeText("sk-ost-live-89f4b1e7c992a014b472");
    setCopiedKeyHint(true);
    setTimeout(() => setCopiedKeyHint(false), 2000);
    toast("API Key prefix copied", "info");
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col lg:flex-row selection:bg-[#dfba82] selection:text-black font-sans">
      <AppSidebar />

      <main className="flex-1 p-3 sm:p-5 lg:p-7 overflow-y-auto max-w-[1700px] mx-auto w-full pb-28">
        <ContentTransition>
          <div className="space-y-5">
            {/* Top Page Breadcrumb / Status Banner */}
            {saveSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{saveSuccessMsg}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-500/70">Synced to Cloud</span>
              </div>
            )}

            {/* 3-COLUMN RESPONSIVE LAYOUT CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* ================================================================= */}
              {/* COLUMN 1: LEFT SUB-NAVIGATION (~220px on desktop)                 */}
              {/* ================================================================= */}
              <aside className="lg:col-span-3 xl:col-span-2 space-y-1.5 bg-[#0c0e17] border border-[#1b1e2c] p-2.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div className="px-3 py-2 text-[10.5px] font-mono font-semibold tracking-wider text-[#73788c] uppercase border-b border-[#161824] mb-1">
                  Settings Menu
                </div>

                {SETTINGS_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#141724] border border-[#dfba82]/40 text-[#dfba82] shadow-[0_0_15px_rgba(223,186,130,0.12)] font-semibold"
                          : "bg-transparent border border-transparent text-[#8e93a6] hover:text-white hover:bg-[#10121c]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-[#dfba82]/20 text-[#dfba82]"
                            : "bg-[#10131e] border border-[#1d2133] text-[#73788c]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] tracking-tight truncate">{item.label}</div>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#dfba82]" />}
                    </button>
                  );
                })}
              </aside>

              {/* ================================================================= */}
              {/* COLUMN 2: CENTER CONTENT VIEW (Flexible flex-1)                  */}
              {/* ================================================================= */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-5">
                {/* --------------------------------------------------------------- */}
                {/* TAB: ACCOUNT                                                    */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Account" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    {/* Header with Save Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Account Settings
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Manage your user identity, personal locale preferences, and security lifecycle.
                        </p>
                      </div>

                      <RbacGuard permission="org:settings:manage">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.25)] disabled:opacity-50"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                          ) : (
                            <Save className="w-3.5 h-3.5 text-black" />
                          )}
                          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </button>
                      </RbacGuard>
                    </div>

                    {/* Profile Photo Avatar with Edit Overlay */}
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dfba82]/20 to-[#dfba82]/5 border border-[#dfba82]/40 flex items-center justify-center text-[#dfba82] font-bold text-xl shadow-[0_0_15px_rgba(223,186,130,0.15)]">
                          {(user?.displayName || fullName || "O").slice(0, 2).toUpperCase()}
                        </div>
                        <button
                          type="button"
                          onClick={() => toast("Profile photo upload is enabled via OAuth SSO.", "info")}
                          className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          title="Change Profile Photo"
                        >
                          <Upload className="w-4 h-4 text-[#dfba82]" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {user?.displayName || fullName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82] border border-[#dfba82]/30">
                            Owner
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#73788c]">
                          Primary administrator of <span className="text-white font-medium">{companyName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Personal Information Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            value={user?.email || billingEmail}
                            className="w-full p-2.5 pr-8 rounded-xl bg-[#0b0d14] border border-[#181b29] text-[#787d91] font-mono cursor-not-allowed"
                          />
                          <Lock className="w-3.5 h-3.5 text-[#595e72] absolute right-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    {/* Preferences Grid */}
                    <div className="pt-2 border-t border-[#161824] space-y-3">
                      <div className="text-xs font-semibold text-[#f4efe6]">Locale & Regional Preferences</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[#8e93a6] block mb-1">Time Zone</label>
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82] transition-colors cursor-pointer text-[11.5px]"
                          >
                            <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                            <option value="America/Los_Angeles (Pacific Time)">America/Los_Angeles (Pacific Time)</option>
                            <option value="America/New_York (Eastern Time)">America/New_York (Eastern Time)</option>
                            <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                            <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                            <option value="Asia/Singapore (SGT +8:00)">Asia/Singapore (SGT +8:00)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[#8e93a6] block mb-1">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82] transition-colors cursor-pointer text-[11.5px]"
                          >
                            <option value="en-US (English)">en-US (English)</option>
                            <option value="en-GB (British English)">en-GB (British English)</option>
                            <option value="de-DE (Deutsch)">de-DE (Deutsch)</option>
                            <option value="ja-JP (日本語)">ja-JP (日本語)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[#8e93a6] block mb-1">Date Format</label>
                          <select
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82] transition-colors cursor-pointer text-[11.5px]"
                          >
                            <option value="DD MMM, YYYY">DD MMM, YYYY (e.g. 06 Sep, 2026)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* System Switches */}
                    <div className="pt-2 border-t border-[#161824] space-y-3">
                      <div className="text-xs font-semibold text-[#f4efe6]">System Toggles</div>

                      {/* Dark Mode */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Dark Luxury Mode</div>
                          <div className="text-[11px] text-[#73788c]">Active theme for dashboard and gateway consoles.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={darkMode}
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            darkMode ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              darkMode ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Security & Account Emails</div>
                          <div className="text-[11px] text-[#73788c]">Receive login alerts and credential rotation reminders.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={emailNotifications}
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            emailNotifications ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              emailNotifications ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Updates */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Product Updates & Model Releases</div>
                          <div className="text-[11px] text-[#73788c]">Changelog notes when new frontier models enter the registry.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={productUpdates}
                          onClick={() => setProductUpdates(!productUpdates)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            productUpdates ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              productUpdates ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Danger Zone: Irreversible Account Action</span>
                      </div>
                      <p className="text-[11px] text-rose-300/80 leading-relaxed">
                        Permanently delete your personal profile, de-provision your credentials, and revoke active gateway keys. Once executed, this action cannot be recovered.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteAccountPhrase("");
                          setIsDeleteAccountModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.25)] flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Account Permanently</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: ORGANIZATION                                               */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Organization" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Organization & Invoicing
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Legal entity specifications feeding directly into PDF invoices and multi-cloud FinOps.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.25)] disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-black" />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Company / Legal Entity Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                        />
                      </div>

                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Accounts Payable Email</label>
                        <input
                          type="email"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                        />
                      </div>

                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Tax ID / GSTIN / VAT Number</label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                          placeholder="e.g. GSTIN-29AAACN1234F1Z8"
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white font-mono outline-none focus:border-[#dfba82]"
                        />
                      </div>

                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Jurisdiction / Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Registered Business Address</label>
                        <textarea
                          rows={3}
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white font-mono text-xs outline-none focus:border-[#dfba82] leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Live Invoice Header Preview */}
                    <div className="p-4 rounded-xl bg-[#080a10] border border-[#181c2b] space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#dfba82]">
                        <FileText className="w-3.5 h-3.5" />
                        Live Invoice PDF Header Preview
                      </div>
                      <div className="text-[11.5px] text-white font-medium">{companyName}</div>
                      {taxId && <div className="text-[11px] text-[#8e93a6] font-mono">Tax ID / GSTIN: {taxId}</div>}
                      <div className="text-[10.5px] text-[#63687c] font-mono">
                        {billingAddress.replace(/\n/g, " · ")}
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: TEAM                                                       */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Team" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Team & Role Access
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Granular workspace seat allocation and role-based access control (RBAC).
                        </p>
                      </div>

                      <a
                        href="/dashboard/members"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] transition-all"
                      >
                        <span>Manage All Seats</span>
                        <ChevronRight className="w-3.5 h-3.5 text-black" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div className="text-xs text-[#73788c]">Active Members</div>
                        <div className="text-2xl font-bold text-white mt-1">3 / 10</div>
                        <div className="text-[11px] text-emerald-400 mt-1">Enterprise Tier Seats</div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div className="text-xs text-[#73788c]">RBAC Enforcement</div>
                        <div className="text-2xl font-bold text-[#dfba82] mt-1">Strict</div>
                        <div className="text-[11px] text-[#73788c] mt-1">Owner · Admin · Dev · Viewer</div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div className="text-xs text-[#73788c]">SSO SAML / OAuth</div>
                        <div className="text-2xl font-bold text-white mt-1">Ready</div>
                        <div className="text-[11px] text-emerald-400 mt-1">Google & Microsoft Entra</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: SECURITY                                                   */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Security" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                        Security & Credentials
                      </h2>
                      <p className="text-xs text-[#8e93a6] mt-0.5">
                        Manage passwords, authentication factors, and active cryptographic sessions.
                      </p>
                    </div>

                    {/* Password Change Form */}
                    <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134] space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <Lock className="w-3.5 h-3.5 text-[#dfba82]" />
                        <span>Update Master Password</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[#8e93a6] block mb-1">Current Password</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                          />
                        </div>
                        <div>
                          <label className="text-[#8e93a6] block mb-1">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 10 chars"
                            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                          />
                        </div>
                        <div>
                          <label className="text-[#8e93a6] block mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!currentPassword || !newPassword) {
                            toast("Please complete all password fields.", "warning");
                            return;
                          }
                          if (newPassword !== confirmPassword) {
                            toast("New passwords do not match.", "warning");
                            return;
                          }
                          setIsUpdatingPassword(true);
                          setTimeout(() => {
                            setIsUpdatingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                            toast("Password updated successfully.", "success");
                          }, 800);
                        }}
                        disabled={isUpdatingPassword}
                        className="px-3.5 py-2 rounded-xl bg-[#171a29] border border-[#272d45] hover:border-[#dfba82]/50 text-xs font-semibold text-[#dfba82] transition-all cursor-pointer"
                      >
                        {isUpdatingPassword ? "Updating..." : "Change Password"}
                      </button>
                    </div>

                    {/* Active Sessions List */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-white">Active Sessions & Authorized Devices</div>
                      <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1d2134] flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">Google Chrome on Windows (x64)</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                              CURRENT SESSION
                            </span>
                          </div>
                          <div className="text-[11px] text-[#73788c] font-mono">
                            IP: 192.168.1.5 · Bengaluru, IN · TLS 1.3
                          </div>
                        </div>
                        <span className="text-[11px] text-[#61667b]">Active now</span>
                      </div>
                    </div>

                    {/* Two-Factor Authentication Status */}
                    <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#dfba82]/15 text-[#dfba82]">
                            SSO ENFORCED
                          </span>
                        </div>
                        <p className="text-[11px] text-[#787d91]">
                          Protected via hardware security key and enterprise ID token verification.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast("2FA is enforced globally by workspace policy.", "info")}
                        className="px-3 py-1.5 rounded-lg bg-[#161a28] border border-[#232a40] text-xs text-[#b0b5c7] hover:text-white"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: NOTIFICATIONS                                              */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Notifications" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Incident & Alert Policies
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Set automated financial threshold triggers, runaway loop dropped notifications, and webhooks.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.25)] disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-black" />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-3">
                      {/* Runaway loop alert */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Immediate Runaway Loop Detections</div>
                          <div className="text-[11px] text-[#73788c]">Dispatches notification instantly when recurring identical requests are auto-dropped.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifyRunawayLoop}
                          onClick={() => setNotifyRunawayLoop(!notifyRunawayLoop)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            notifyRunawayLoop ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${notifyRunawayLoop ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* 80% Threshold */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">80% Monthly Spend Warning Threshold</div>
                          <div className="text-[11px] text-[#73788c]">Warning sent when consumption reaches ${(hardBudgetCapUsd * 0.8).toFixed(0)}.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notify80Percent}
                          onClick={() => setNotify80Percent(!notify80Percent)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            notify80Percent ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${notify80Percent ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* 100% Threshold */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">100% Hard Budget Cap Breach Pager</div>
                          <div className="text-[11px] text-[#73788c]">Critical alert dispatched when the financial circuit breaker engages.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notify100Percent}
                          onClick={() => setNotify100Percent(!notify100Percent)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            notify100Percent ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${notify100Percent ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* Weekly cost digest */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Weekly FinOps Cost Digest & Insights</div>
                          <div className="text-[11px] text-[#73788c]">Consolidated summary of model cost efficiency delivered every Monday morning.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifyWeeklyDigest}
                          onClick={() => setNotifyWeeklyDigest(!notifyWeeklyDigest)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            notifyWeeklyDigest ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${notifyWeeklyDigest ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* Provider failover */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="text-xs font-semibold text-white">Provider Outage & Dynamic Failover Alerts</div>
                          <div className="text-[11px] text-[#73788c]">Notifies when upstream API errors trigger automated fallback to secondary model.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifyProviderFailover}
                          onClick={() => setNotifyProviderFailover(!notifyProviderFailover)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            notifyProviderFailover ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${notifyProviderFailover ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Webhook & Email Input */}
                    <div className="pt-2 border-t border-[#161824] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Slack / Discord Webhook URL</label>
                        <div className="relative">
                          <Webhook className="w-3.5 h-3.5 text-[#73788c] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={slackWebhookUrl}
                            onChange={(e) => setSlackWebhookUrl(e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                            className="w-full p-2.5 pl-8 rounded-xl bg-[#111422] border border-[#1d2136] text-white font-mono text-[11px] outline-none focus:border-[#dfba82]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[#b0b5c7] font-medium block mb-1.5">Alert Dispatch Email</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-[#73788c] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={alertEmail}
                            onChange={(e) => setAlertEmail(e.target.value)}
                            placeholder="ops-alerts@company.com"
                            className="w-full p-2.5 pl-8 rounded-xl bg-[#111422] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: INTEGRATIONS                                               */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Integrations" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Connected LLM Providers
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Upstream provider connections storing AES-256 encrypted API keys in the OsterdOps vault.
                        </p>
                      </div>

                      <a
                        href="/dashboard/providers"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#151928] border border-[#262c45] hover:border-[#dfba82]/50 text-xs font-semibold text-[#dfba82] transition-all"
                      >
                        <span>Add Provider</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Providers Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#181b29] text-[#73788c] font-mono">
                            <th className="pb-3 font-semibold">Provider</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Latency</th>
                            <th className="pb-3 font-semibold">Last Probe</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#131624]">
                          {providers.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5">
                                <div className="font-semibold text-white">{p.name}</div>
                                <div className="text-[10.5px] text-[#73788c] font-mono uppercase">{p.provider}</div>
                              </td>
                              <td className="py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono ${
                                    p.status === "Active"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                      : p.status === "Failed probe"
                                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      p.status === "Active"
                                        ? "bg-emerald-400 animate-pulse"
                                        : p.status === "Failed probe"
                                        ? "bg-amber-400"
                                        : "bg-neutral-500"
                                    }`}
                                  />
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3.5 font-mono text-[#b0b5c7]">
                                {p.latencyMs > 0 ? `${p.latencyMs}ms` : "—"}
                              </td>
                              <td className="py-3.5 text-[#73788c] text-[11px]">{p.lastProbe}</td>
                              <td className="py-3.5 text-right">
                                {p.status !== "Not connected" ? (
                                  <button
                                    type="button"
                                    onClick={() => setDisconnectingProvider(p)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-950/30 border border-rose-500/30 hover:bg-rose-900/50 text-rose-300 text-[11px] font-medium transition-colors cursor-pointer"
                                  >
                                    Disconnect / Delete
                                  </button>
                                ) : (
                                  <a
                                    href="/dashboard/providers"
                                    className="px-2.5 py-1 rounded-lg bg-[#141724] border border-[#202538] hover:border-[#dfba82]/40 text-[#dfba82] text-[11px] font-medium transition-colors"
                                  >
                                    Connect
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: BILLING                                                    */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Billing" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Subscription & Billing Hub
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Enterprise tier status, current usage spend, and historical invoices.
                        </p>
                      </div>

                      <a
                        href="/dashboard/subscription"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] transition-all"
                      >
                        <span>Upgrade / Change Tier</span>
                        <ChevronRight className="w-3.5 h-3.5 text-black" />
                      </a>
                    </div>

                    <div className="p-4 rounded-xl bg-[#111422] border border-[#1d2134] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Enterprise FinOps Tier</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-[#73788c] mt-1">
                          $499.00 / month · Renews Oct 01, 2026 via Stripe Merchant
                        </p>
                      </div>

                      <a
                        href="/dashboard/billing/invoices"
                        className="px-3.5 py-2 rounded-xl bg-[#161a29] border border-[#262c45] text-xs font-semibold text-[#dfba82] hover:text-white transition-all text-center"
                      >
                        View Invoices & Receipts &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: APPEARANCE                                                 */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Appearance" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                        Appearance & Aesthetic Sync
                      </h2>
                      <p className="text-xs text-[#8e93a6] mt-0.5">
                        Customize console styling, carbon surface tone, and typography density.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#141724] border border-[#dfba82] shadow-[0_0_15px_rgba(223,186,130,0.15)] space-y-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Dark Luxury</span>
                          <div className="w-2 h-2 rounded-full bg-[#dfba82]" />
                        </div>
                        <p className="text-[11px] text-[#73788c]">
                          Default OsterdOps executive theme with gold accents.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0c12] border border-[#1c1f2e] space-y-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white">Midnight Obsidian</span>
                        <p className="text-[11px] text-[#73788c]">
                          Pure OLED pitch-black background for multi-monitor command centers.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0a0c12] border border-[#1c1f2e] space-y-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white">System Synchronized</span>
                        <p className="text-[11px] text-[#73788c]">
                          Follows your operating system daylight preference automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* TAB: ADVANCED                                                   */}
                {/* --------------------------------------------------------------- */}
                {activeTab === "Advanced" && (
                  <div className="p-6 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161824]">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#f4efe6] font-serif">
                          Advanced FinOps & Debugging
                        </h2>
                        <p className="text-xs text-[#8e93a6] mt-0.5">
                          Configure low-level gateway telemetry headers, hard quota enforcement, and retention windows.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dfba82] text-black text-xs font-bold hover:bg-[#ebd5ab] transition-all cursor-pointer shadow-[0_0_15px_rgba(223,186,130,0.25)] disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-black" />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Rate Limit Debug Mode */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="font-semibold text-white">Rate-Limit Diagnostic Headers</div>
                          <div className="text-[11px] text-[#73788c]">Attaches X-OsterdOps-RateLimit and microsecond execution headers to proxy responses.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={rateLimitDebugMode}
                          onClick={() => setRateLimitDebugMode(!rateLimitDebugMode)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            rateLimitDebugMode ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${rateLimitDebugMode ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* Hard Quota Enforcement */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111422] border border-[#1d2134]">
                        <div>
                          <div className="font-semibold text-white">Strict Hard Quota Drop</div>
                          <div className="text-[11px] text-[#73788c]">Instantly drops incoming requests with HTTP 429 when monthly cap is exhausted.</div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={hardQuotaEnforcement}
                          onClick={() => setHardQuotaEnforcement(!hardQuotaEnforcement)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            hardQuotaEnforcement ? "bg-[#dfba82]" : "bg-[#1f2334]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${hardQuotaEnforcement ? "translate-x-4 bg-black" : "translate-x-0 bg-[#8e93a6]"}`} />
                        </button>
                      </div>

                      {/* Telemetry Raw Retention Days */}
                      <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1d2134] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-white">Raw Telemetry & Request Log Retention</div>
                          <span className="font-mono text-[#dfba82] font-bold">{telemetryRetentionDays} Days</span>
                        </div>
                        <p className="text-[11px] text-[#73788c]">
                          Determines how long sub-millisecond execution logs and tokens counts are retained before automated archival.
                        </p>
                        <select
                          value={telemetryRetentionDays}
                          onChange={(e) => setTelemetryRetentionDays(Number(e.target.value))}
                          className="w-full sm:w-60 p-2 rounded-lg bg-[#0c0e17] border border-[#1d2136] text-white outline-none focus:border-[#dfba82] mt-1"
                        >
                          <option value={30}>30 Days (Standard Audit)</option>
                          <option value={60}>60 Days (Compliance Extended)</option>
                          <option value={90}>90 Days (Enterprise Default)</option>
                          <option value={180}>180 Days (Financial Strict)</option>
                          <option value={365}>365 Days (Full Fiscal Year)</option>
                        </select>
                      </div>

                      {/* Gateway Controls */}
                      <div className="p-3.5 rounded-xl bg-[#111422] border border-[#1d2134] grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#8e93a6] block mb-1">Default Fallback Model</label>
                          <select
                            value={defaultModel}
                            onChange={(e) => setDefaultModel(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1d2136] text-white outline-none focus:border-[#dfba82]"
                          >
                            {SUPPORTED_FALLBACK_MODELS.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[#8e93a6] block mb-1">Upstream Timeout (Seconds)</label>
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={requestTimeoutSeconds}
                            onChange={(e) => setRequestTimeoutSeconds(Number(e.target.value))}
                            className="w-full p-2.5 rounded-xl bg-[#0c0e17] border border-[#1d2136] text-white font-mono outline-none focus:border-[#dfba82]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* COLUMN 3: RIGHT QUICK-ACTION RAIL (~300px)                       */}
              {/* ================================================================= */}
              <aside className="lg:col-span-3 xl:col-span-3 space-y-4">
                {/* Card 1: Organization Details */}
                <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#dfba82]/15 border border-[#dfba82]/30 flex items-center justify-center text-[#dfba82] font-bold text-xs">
                        {(currentOrg?.name || companyName || "O").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">
                          {currentOrg?.name || companyName}
                        </div>
                        <div className="text-[10px] text-[#73788c]">Enterprise Org</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#dfba82]/20 text-[#dfba82] border border-[#dfba82]/30">
                      Enterprise
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1 border-t border-[#161824]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#73788c]">Organization ID:</span>
                      <div className="flex items-center gap-1.5 font-mono text-white">
                        <span>{orgId.length > 14 ? `${orgId.slice(0, 14)}...` : orgId}</span>
                        <button
                          type="button"
                          onClick={copyOrgId}
                          className="text-[#73788c] hover:text-[#dfba82] transition-colors cursor-pointer"
                          title="Copy Org ID"
                        >
                          {copiedOrgId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#73788c]">Created Date:</span>
                      <span className="text-[#b0b5c7]">Aug 12, 2026</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditOrgOpen(true)}
                    className="w-full py-2 rounded-xl bg-[#141724] border border-[#202538] hover:border-[#dfba82]/40 text-[#dfba82] text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    Edit Organization Profile
                  </button>
                </div>

                {/* Card 2: API Keys Quick Manager */}
                <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Gateway API Keys</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                      2 Active Keys
                    </span>
                  </div>

                  <div className="bg-[#080a10] p-2.5 rounded-xl border border-[#171a28] flex items-center justify-between font-mono text-[11px] text-[#73788c]">
                    <span>sk-ost-live-••••••••b472</span>
                    <button
                      type="button"
                      onClick={copyKeyHint}
                      className="hover:text-white transition-colors cursor-pointer"
                      title="Copy Key Hint"
                    >
                      {copiedKeyHint ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="text-[10.5px] text-[#63687c]">
                    Last used: <span className="text-white">4 minutes ago</span> (Claude 3.7)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGenerateKeyOpen(true)}
                      className="flex-1 py-1.5 rounded-xl bg-[#dfba82] text-black text-[11.5px] font-bold hover:bg-[#ebd5ab] transition-all cursor-pointer text-center"
                    >
                      + Generate Key
                    </button>
                    <a
                      href="/dashboard/keys"
                      className="px-2.5 py-1.5 rounded-xl bg-[#141724] border border-[#202538] hover:border-[#dfba82]/40 text-[#c5c9d6] text-[11.5px] font-medium transition-all text-center"
                    >
                      Manage
                    </a>
                  </div>
                </div>

                {/* Card 3: Plan & Billing Status */}
                <div className="p-5 rounded-2xl bg-[#0c0e17] border border-[#1b1e2c] space-y-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#dfba82]/10 border border-[#dfba82]/25 flex items-center justify-center text-[#dfba82]">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Plan & Spend</span>
                    </div>
                    <span className="text-[11px] font-mono text-white font-bold">$499 / mo</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#73788c]">
                      <span>Monthly Spend Cap</span>
                      <span className="font-mono text-white font-semibold">${hardBudgetCapUsd} USD</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#161a28] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-[#dfba82] w-[34%]" />
                    </div>
                  </div>

                  <a
                    href="/dashboard/subscription"
                    className="flex items-center justify-between pt-1 text-[11.5px] text-[#dfba82] hover:text-[#ebd5ab] transition-colors font-medium cursor-pointer"
                  >
                    <span>View Billing Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Card 4: Brand Visual Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c0e17] to-[#121624] border border-[#1b1e2c] space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#dfba82]/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-xs font-mono text-[#dfba82]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OSTEROPS CORE</span>
                  </div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    "Your AI infrastructure. Under control."
                  </div>
                  <p className="text-[11px] text-[#787d91] leading-relaxed">
                    Sub-millisecond proxy firewall, pre-flight token interceptors, and automated provider failovers.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </ContentTransition>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: IRREVERSIBLE ACCOUNT DELETION                                      */}
      {/* ========================================================================= */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#0c0e17] border border-rose-500/40 rounded-2xl shadow-[0_10px_50px_rgba(225,29,72,0.3)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Delete Account Permanently?</h3>
                <p className="text-xs text-rose-300/80">
                  This action is irreversible. All your project API keys, active gateway proxies, and personal profile data will be permanently purged.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 space-y-1">
                <div className="font-semibold">To confirm deletion, please type:</div>
                <div className="font-mono text-white bg-black/40 px-2 py-1 rounded select-all text-center">
                  DELETE MY ACCOUNT
                </div>
                <div className="text-[11px] text-rose-300/70 text-center">or your email: {user?.email}</div>
              </div>

              <div>
                <input
                  type="text"
                  value={deleteAccountPhrase}
                  onChange={(e) => setDeleteAccountPhrase(e.target.value)}
                  placeholder="Type confirmation phrase here"
                  className="w-full p-2.5 rounded-xl bg-[#111422] border border-[#1d2136] text-white text-xs text-center font-mono outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2 rounded-xl bg-[#141724] border border-[#23283c] text-xs font-semibold text-[#8e93a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={
                    isDeletingAccount ||
                    (deleteAccountPhrase.trim() !== "DELETE MY ACCOUNT" &&
                      deleteAccountPhrase.trim().toLowerCase() !== user?.email?.toLowerCase())
                  }
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                >
                  {isDeletingAccount ? "Purging..." : "Confirm Deletion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISCONNECT PROVIDER CONFIRMATION                                    */}
      {/* ========================================================================= */}
      {disconnectingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#0c0e17] border border-[#23273a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Disconnect {disconnectingProvider.name}?</h3>
              <p className="text-xs text-[#8e93a6] leading-relaxed">
                This will immediately purge the upstream API key from encrypted vault storage. Traffic that attempts to invoke {disconnectingProvider.name} will failover to the configured fallback model.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisconnectingProvider(null)}
                disabled={isDisconnecting}
                className="flex-1 py-2 rounded-xl bg-[#141724] border border-[#23283c] text-xs font-semibold text-[#8e93a6] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnectProvider}
                disabled={isDisconnecting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Integration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: EDIT ORGANIZATION & GENERATE KEY                                  */}
      {/* ========================================================================= */}
      <EditOrganizationModal
        isOpen={isEditOrgOpen}
        onClose={() => setIsEditOrgOpen(false)}
        orgData={{
          name: companyName,
          domain: "osterdops.io",
          email: billingEmail,
          plan: "Enterprise",
          members: 3,
          projects: 2,
        }}
        onSave={(updated) => {
          setCompanyName(updated.name);
          setBillingEmail(updated.email);
          toast("Organization profile updated.", "success");
        }}
      />

      <GenerateApiKeyModal
        isOpen={isGenerateKeyOpen}
        onClose={() => setIsGenerateKeyOpen(false)}
        onKeyCreated={() => toast("New API Key generated.", "success")}
      />
    </div>
  );
}
