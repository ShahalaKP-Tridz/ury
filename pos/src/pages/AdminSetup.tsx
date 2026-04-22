import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  GitBranch,
  UtensilsCrossed,
  Printer,
  CreditCard,
  Users,
  Table2,
  BedDouble,
  Settings,
  ChevronRight,
  Layers,
  Bell,
  Shield,
  Database,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
};

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, group: "General" },
  { id: "restaurant", label: "Restaurant", icon: <Store className="w-4 h-4" />, group: "General" },
  { id: "branch", label: "Branch", icon: <GitBranch className="w-4 h-4" />, group: "General" },
  { id: "menu", label: "Menu & Items", icon: <UtensilsCrossed className="w-4 h-4" />, group: "Operations" },
  { id: "tables", label: "Tables", icon: <Table2 className="w-4 h-4" />, group: "Operations" },
  { id: "rooms", label: "Rooms", icon: <BedDouble className="w-4 h-4" />, group: "Operations" },
  { id: "printer", label: "Printers", icon: <Printer className="w-4 h-4" />, group: "Operations" },
  { id: "payment", label: "Payments", icon: <CreditCard className="w-4 h-4" />, group: "Finance" },
  { id: "inventory", label: "Inventory", icon: <Package className="w-4 h-4" />, group: "Finance" },
  { id: "users", label: "Users & Roles", icon: <Users className="w-4 h-4" />, group: "Administration" },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, group: "Administration" },
  { id: "security", label: "Security", icon: <Shield className="w-4 h-4" />, group: "Administration" },
  { id: "data", label: "Data & Backup", icon: <Database className="w-4 h-4" />, group: "Administration" },
  { id: "integrations", label: "Integrations", icon: <Layers className="w-4 h-4" />, group: "Administration" },
];

const groups = ["General", "Operations", "Finance", "Administration"];

const moduleCards = [
  {
    label: "Restaurant Profile",
    icon: <Store className="w-5 h-5" />,
    desc: "Configure name, logo, address, operating hours",
    status: "Not Started",
    color: "blue",
  },
  {
    label: "Branch Management",
    icon: <GitBranch className="w-5 h-5" />,
    desc: "Set up multiple locations and branch-level settings",
    status: "Not Started",
    color: "violet",
  },
  {
    label: "Menu Configuration",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    desc: "Full menu builder with categories, modifiers and pricing",
    status: "Not Started",
    color: "amber",
  },
  {
    label: "Table & Room Layout",
    icon: <Table2 className="w-5 h-5" />,
    desc: "Visual floor plan editor, table groups and reservations",
    status: "Not Started",
    color: "emerald",
  },
  {
    label: "Payment Gateways",
    icon: <CreditCard className="w-5 h-5" />,
    desc: "Integrate UPI, card terminals, wallets and more",
    status: "Not Started",
    color: "rose",
  },
  {
    label: "User Roles & Permissions",
    icon: <Users className="w-5 h-5" />,
    desc: "Granular access control for every staff role",
    status: "Not Started",
    color: "slate",
  },
];

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", iconBg: "bg-violet-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", iconBg: "bg-rose-100" },
  slate: { bg: "bg-slate-50", text: "text-slate-600", iconBg: "bg-slate-100" },
};

export function AdminSetup() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0 z-10">
        <div className="w-px h-5 bg-gray-200" />

        <div className="flex items-center gap-2">
          <img
            src="/assets/ury/pos/ury_pos.png"
            alt="URY POS"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button onClick={() => navigate('/')} className="hidden sm:inline-flex" size="sm">
            Start Taking Orders
          </Button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 220 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden flex-shrink-0 hidden lg:block"
          style={{ width: 220 }}
        >
          <div className="p-4">
            {groups.map((group) => (
              <div key={group} className="mb-5">
                <p
                  className="text-gray-400 uppercase mb-2 px-2"
                  style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em" }}
                >
                  {group}
                </p>
                {navItems
                  .filter((n) => n.group === group)
                  .map((nav) => (
                    <button
                      key={nav.id}
                      onClick={() => setActiveNav(nav.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-left transition-colors ${activeNav === nav.id
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      style={{ fontSize: "0.875rem", fontWeight: activeNav === nav.id ? 600 : 400 }}
                    >
                      {nav.icon}
                      {nav.label}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white blur-2xl" />
                <div className="absolute bottom-0 left-16 w-24 h-24 rounded-full bg-primary-400 blur-xl" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full mb-4 border border-white/20">
                  <Settings className="w-3 h-3" />
                  Advanced Setup
                </span>
                <h2 className="text-white mb-2" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                  Advanced setup allows full control over all modules
                </h2>
                <p className="text-slate-300" style={{ fontSize: "0.9375rem" }}>
                  Configure every aspect of your restaurant ERP — from multi-branch operations to granular user permissions. Take your time and set it up the right way.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Modules", value: "14" },
                { label: "Configured", value: "0" },
                { label: "Remaining", value: "14" },
                { label: "Completion", value: "0%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center"
                >
                  <div className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-500 mt-0.5" style={{ fontSize: "0.8125rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Module Cards */}
            <div className="mb-6">
              <h3 className="text-gray-900 mb-4" style={{ fontSize: "1.0625rem", fontWeight: 600 }}>
                Core Modules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {moduleCards.map((mod) => {
                  const clr = colorMap[mod.color];
                  return (
                    <button
                      key={mod.label}
                      onClick={() => setActiveNav(mod.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))}
                      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-primary-300 hover:shadow-md transition-all group"
                    >
                      <div
                        className={`w-10 h-10 ${clr.iconBg} rounded-xl flex items-center justify-center ${clr.text} mb-3`}
                      >
                        {mod.icon}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1" style={{ fontSize: "0.9375rem" }}>
                        {mod.label}
                      </div>
                      <p className="text-gray-500 mb-4" style={{ fontSize: "0.8125rem" }}>
                        {mod.desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {mod.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coming Soon notice */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-primary-900" style={{ fontSize: "0.9375rem" }}>
                  Full Advanced Configuration
                </p>
                <p className="text-primary-700 mt-0.5" style={{ fontSize: "0.875rem" }}>
                  Each module above opens a detailed configuration dashboard. Advanced mode gives you granular control over tax rules, integrations, inventory, multi-currency support, and more. Use the sidebar to navigate between modules.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default AdminSetup;
