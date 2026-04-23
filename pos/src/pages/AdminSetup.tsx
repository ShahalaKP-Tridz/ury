import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, GitBranch, Store, BedDouble, Table2,
  UtensilsCrossed, CreditCard, Users, Layers, TrendingUp,
  ShoppingBag, DollarSign, Clock, Edit2, Plus, Trash2,
  MoreHorizontal, Bell, Search, ChevronDown, Check,
  ArrowDownRight, WifiOff, PanelRightOpen, ChevronRight,
  LogOut, User, Settings
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "../components/ui/button";
import { useRootStore } from "../store/root-store";

interface DashboardProps {
  onBack?: () => void;
}

type Section =
  | "overview" | "branch" | "restaurant" | "rooms" | "tables"
  | "menu" | "payment" | "users" | "integration";

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; group: string }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, group: "Main" },
  { id: "branch", label: "Branch", icon: <GitBranch className="w-4 h-4" />, group: "Management" },
  { id: "restaurant", label: "Restaurant", icon: <Store className="w-4 h-4" />, group: "Management" },
  { id: "rooms", label: "Rooms", icon: <BedDouble className="w-4 h-4" />, group: "Operations" },
  { id: "tables", label: "Tables", icon: <Table2 className="w-4 h-4" />, group: "Operations" },
  { id: "menu", label: "Menu", icon: <UtensilsCrossed className="w-4 h-4" />, group: "Content" },
  { id: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" />, group: "Financial" },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, group: "System" },
  { id: "integration", label: "Integration", icon: <Layers className="w-4 h-4" />, group: "System" },
];

const revenueData = [
  { time: "09:00", amount: 4500 },
  { time: "11:00", amount: 7200 },
  { time: "13:00", amount: 12500 },
  { time: "15:00", amount: 9800 },
  { time: "17:00", amount: 11200 },
  { time: "19:00", amount: 18500 },
  { time: "21:00", amount: 14200 },
];

const pieData = [
  { name: "Dine-in", value: 55 },
  { name: "Takeaway", value: 30 },
  { name: "Delivery", value: 15 },
];

const COLORS = ["hsl(var(--primary))", "#6366f1", "#10b981"];

const popularItems = [
  { name: "Chicken Tikka", sales: 42, revenue: 12500 },
  { name: "Paneer Butter Masala", sales: 38, revenue: 8400 },
  { name: "Garlic Naan", sales: 85, revenue: 4250 },
  { name: "Mango Lassi", sales: 25, revenue: 3125 },
];

export function AdminSetup({ onBack }: DashboardProps) {
  const { user } = useRootStore();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const groups = Array.from(new Set(NAV_ITEMS.map((item) => item.group)));

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-card border-r border-border flex-shrink-0 flex flex-col z-30"
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className={`flex items-center mb-8 ${sidebarOpen ? 'px-3' : 'justify-center'}`}>
            <img src="/assets/ury/pos/ury_pos.png" alt="URY POS" className="h-8 w-auto object-contain" />
          </div>



          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {groups.map((group) => (
              <div key={group} className={sidebarOpen ? "mb-6" : "mb-2"}>
                {sidebarOpen && (
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-3 opacity-60">
                    {group}
                  </p>
                )}
                <div className="space-y-1">
                  {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center rounded-lg text-sm transition-all duration-200 ${activeSection === item.id
                        ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        } ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'}`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center">
                        {item.icon}
                      </div>
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center rounded-lg text-sm transition-all text-muted-foreground hover:bg-secondary hover:text-foreground ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'}`}
              title={!sidebarOpen ? "Expand" : "Collapse"}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <PanelRightOpen className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
              </div>
              {sidebarOpen && <span className="font-medium">Collapse</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-semibold capitalize">{activeSection}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search settings..."
                className="bg-secondary/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button className="relative p-2 text-muted-foreground hover:text-primary hover:bg-primary-50 rounded-full transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>
            
            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 cursor-pointer hover:scale-105 transition-transform"
              >
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
              </div>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-5 border-b border-border bg-secondary/30">
                      <p className="text-sm font-bold text-foreground">{user?.full_name || 'Admin User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.name || 'admin@urypos.com'}</p>
                      {user?.roles && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.roles.slice(0, 2).map((role, i) => (
                            <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all group">
                        <div className="p-1.5 bg-secondary rounded-lg group-hover:bg-background transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium">My Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all group">
                        <div className="p-1.5 bg-secondary rounded-lg group-hover:bg-background transition-colors">
                          <Settings className="w-4 h-4" />
                        </div>
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-border bg-secondary/5">
                      <button 
                        onClick={() => {
                          window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-all group"
                      >
                        <div className="p-1.5 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span className="font-bold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeSection === "overview" ? (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 shadow-sm">
                      <Clock className="w-4 h-4" />
                      Today
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: "₹84,250", trend: "+12.5%", icon: <DollarSign className="w-4 h-4" />, color: "primary" },
                    { label: "Total Orders", value: "156", trend: "+8.2%", icon: <ShoppingBag className="w-4 h-4" />, color: "indigo" },
                    { label: "Average Order", value: "₹540", trend: "-2.4%", icon: <Clock className="w-4 h-4" />, color: "emerald" },
                    { label: "Active Tables", value: "12/20", trend: "Steady", icon: <Table2 className="w-4 h-4" />, color: "orange" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-primary/10 text-primary rounded-xl`}>
                          {stat.icon}
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-foreground">Revenue Analytics</h3>
                      <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} />
                          <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-8">Order Sources</h3>
                    <div className="h-56 mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                            <span className="text-muted-foreground font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Items */}
                <div className="bg-card p-8 rounded-2xl border border-border shadow-sm overflow-hidden">
                  <h3 className="text-lg font-bold text-foreground mb-8">Popular Items Today</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="pb-4 font-bold uppercase tracking-wider text-[10px]">Item Name</th>
                          <th className="pb-4 font-bold uppercase tracking-wider text-[10px] text-right">Sales</th>
                          <th className="pb-4 font-bold uppercase tracking-wider text-[10px] text-right">Revenue</th>
                          <th className="pb-4 font-bold uppercase tracking-wider text-[10px] text-right">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {popularItems.map((item, i) => (
                          <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 font-semibold text-foreground">{item.name}</td>
                            <td className="py-4 text-right text-muted-foreground font-medium">{item.sales}</td>
                            <td className="py-4 text-right text-foreground font-bold">₹{item.revenue}</td>
                            <td className="py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 text-primary bg-primary/5 px-2.5 py-1 rounded-full text-xs font-bold">
                                <TrendingUp className="w-3 h-3" />
                                {Math.floor(Math.random() * 20) + 1}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-24 h-24 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-primary/10">
                  {NAV_ITEMS.find(i => i.id === activeSection)?.icon}
                </div>
                <h2 className="text-3xl font-extrabold text-foreground capitalize mb-3">{activeSection} Module</h2>
                <p className="text-muted-foreground max-w-lg text-lg">
                  We're currently perfecting the {activeSection} management tools. Stay tuned for advanced analytics and control features!
                </p>
                <Button className="mt-8 px-8 py-6 rounded-2xl text-lg shadow-xl shadow-primary/20" onClick={() => setActiveSection("overview")}>
                  Return to Dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default AdminSetup;
