import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../../../contexts/AuthContext";
import { Settings, LogOut, Search, Bell, Bookmark, Mail, Star, Bed, Bath, Square, Trash2 } from "lucide-react";
import LotliteLogo from "../../../assets/RedLotliteLogo.png";
import { API_BASE_URL } from "../../../api";
import InquiryHistory from "./InquiryHistory.jsx";
import Recommendations from "./Recommendations.jsx";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("settings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Saved properties state
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Load saved properties when user is available
  useEffect(() => {
    (async () => {
      if (!user) return;
      setSavedLoading(true);
      setSavedError(null);
      try {
        // Try joined fetch: requires FK saved_properties.property_id -> properties.id with relation key 'properties'
        const { data, error } = await supabase
          .from('saved_properties')
          .select('property_id, properties(*)')
          .eq('user_id', user.id);
        if (!error && Array.isArray(data)) {
          const props = (data as any[]).map(r => r.properties).filter(Boolean);
          if (props.length > 0) {
            setSavedProperties(props);
            setSavedLoading(false);
            return;
          }
        }
        // Fallback: fetch IDs first
        const { data: idsData } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', user.id);
        const ids = (idsData || []).map((r: any) => r.property_id).filter(Boolean);
        if (ids.length > 0) {
          // Try Supabase properties fetch
          const { data: propsData, error: propsErr } = await supabase
            .from('properties')
            .select('*')
            .in('id', ids);
          if (!propsErr && Array.isArray(propsData)) {
            setSavedProperties(propsData);
            setSavedLoading(false);
            return;
          }
        }
        // Last resort: localStorage + backend properties list
        const key = `saved_props:${user.id}`;
        const savedIds: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (savedIds.length === 0) {
          setSavedProperties([]);
          setSavedLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/properties`);
        if (!res.ok) throw new Error('Failed to load properties');
        const all = await res.json();
        const setIds = new Set(savedIds);
        setSavedProperties(all.filter((p: any) => setIds.has(p.id)));
      } catch (e: any) {
        setSavedError(e?.message || 'Failed to load saved properties');
      } finally {
        setSavedLoading(false);
      }
    })();
  }, [user]);

  const sidebarItems = [
    { id: "saved", label: "Saved Properties", icon: Bookmark },
    { id: "inquiries", label: "Inquiry History", icon: Mail },
    { id: "recommendations", label: "Recommendations", icon: Star },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const renderContent = () => {
    if (activeTab === "settings") {
      return (
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            {loading ? (
              <p className="text-center text-gray-600 animate-pulse">Loading user info...</p>
            ) : user ? (
              <div className="space-y-4">
                {[
                  ["Name", user.user_metadata?.name || "N/A"],
                  ["Email", user.email],
                  ["Phone", user.user_metadata?.phone || "Not Provided"],
                  ["Role", user.user_metadata?.role || "client"],
                  ["Joined", new Date(user.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3">
                    <span className="font-semibold text-gray-700 w-full sm:w-1/3">{label}:</span>
                    <span className="text-lg text-gray-900 w-full sm:w-2/3">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No user data available.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "saved") {
      return (
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Properties</h3>
              {savedLoading && <span className="text-sm text-gray-500">Loading…</span>}
            </div>
            {feedback && (
              <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">{feedback}</div>
            )}
            {savedError && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{savedError}</div>
            )}
            {!savedLoading && savedProperties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-700 font-medium mb-2">You haven't saved any properties yet! Start exploring to find your favorites.</p>
                <button onClick={() => navigate('/search')} className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Go to Property Search</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProperties.map((p) => (
                  <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="relative h-40 bg-gray-100">
                      {Array.isArray(p.images) && p.images[0] && (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      )}
                      {p.status && (
                        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded ${String(p.status).toLowerCase().includes('sold') ? 'bg-gray-700 text-white' : String(p.status).toLowerCase().includes('price') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                          {String(p.status).toLowerCase().includes('new') ? 'New Listing' : (String(p.status).toLowerCase().includes('price') ? 'Price Reduced' : (String(p.status).toLowerCase().includes('sold') ? 'Sold' : p.status))}
                        </span>
                      )}
                      <button
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-600 hover:bg-red-50"
                        title="Remove from Saved"
                        onClick={async () => {
                          if (!user) return;
                          try {
                            const { error } = await supabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', p.id);
                            if (error) throw error;
                          } catch {
                            try {
                              const key = `saved_props:${user.id}`;
                              const savedIds: string[] = JSON.parse(localStorage.getItem(key) || '[]');
                              const next = savedIds.filter(id => id !== p.id);
                              localStorage.setItem(key, JSON.stringify(next));
                            } catch { /* ignore */ }
                          }
                          setSavedProperties(prev => prev.filter(x => x.id !== p.id));
                          setFeedback('Property removed successfully');
                          setTimeout(() => setFeedback(null), 2000);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{p.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{p.location?.address || p.location?.city || ''}</p>
                      <div className="mt-3 flex items-center justify-between text-gray-700">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Bed className="h-4 w-4" />
                            <span className="text-sm">{p.bedrooms || 0} BHK</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bath className="h-4 w-4" />
                            <span className="text-sm">{p.bathrooms || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Square className="h-4 w-4" />
                            <span className="text-sm">{p.area || 0} sq ft</span>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {p.listingType === 'rent' && p.rentAmount
                            ? `₹${Number(p.rentAmount).toLocaleString('en-IN')}/mo`
                            : (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—')}
                        </div>
                      </div>
                      <div className="mt-4">
                        <button onClick={() => navigate(`/properties/${p.id}`)} className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 rounded-md">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "inquiries") {
      return (
        <div className="p-4 md:p-6">
          <InquiryHistory />
        </div>
      );
    }

    if (activeTab === "recommendations") {
      return (
        <div className="p-4 md:p-6">
          <Recommendations />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col items-start">
            <div className="p-3">
              <img src={LotliteLogo} alt="Lotlite Logo" className="h-7 md:h-9 w-auto" />
            </div>
            <p className="text-sm text-gray-500 -mt-1 ml-3">Client Panel</p>
          </div>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${activeTab === item.id
                  ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                  : 'text-gray-700'
                  }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              {user?.user_metadata?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.user_metadata?.name || user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.user_metadata?.role || 'client'}</p>
            </div>
            <button className="text-gray-400" aria-label="Logout" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex flex-col items-start">
                <img src={LotliteLogo} alt="Lotlite Logo" className="h-6 w-auto" />
                <p className="text-xs text-gray-500 mt-1">Client Panel</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded hover:bg-gray-100">✕</button>
            </div>
            <nav className="mt-2 flex-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center px-5 py-3 text-left hover:bg-blue-50 transition-colors ${activeTab === item.id
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600'
                      : 'text-gray-700'
                      }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-5 border-t">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  {user?.user_metadata?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.user_metadata?.name || user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">{user?.user_metadata?.role || 'client'}</p>
                </div>
                <button className="text-gray-400" aria-label="Logout" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center">
              <button
                className="md:hidden mr-3 p-2 rounded border border-gray-200"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Menu"
              >
                ☰
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-gray-600">Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto h-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

