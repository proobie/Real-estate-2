import React, { useState } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  IndianRupee,
  Calendar,
  Settings,
  LogOut,
  Home,
  UserCheck,
  FileText,
  BarChart3,
  PlusCircle,
  Search,
  Bell,
  Key,

} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import PropertyManagement from './PropertyManagement';
import ProjectManagement from './ProjectManagement';
import LeadManagement from './LeadManagement';
import ProfileSettings from './ProfileSettings';
import RolesManagement from './RolesManagement';
import LotliteLogo from '../../../assets/RedLotliteLogo.png';
import UserManagement from './UserManagement';
import KeyManagement from './KeyManagement';


const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = [
    {
      title: 'Total Properties',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: '2,567',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: '₹45.2L',
      change: '+15%',
      changeType: 'positive',
      icon: IndianRupee,
      color: 'bg-purple-500'
    },
    {
      title: 'Conversion Rate',
      value: '24.8%',
      change: '-2%',
      changeType: 'negative',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New property listed',
      details: '3 BHK Apartment in Bandra West',
      user: 'Priya Sharma',
      time: '2 hours ago',
      type: 'property'
    },
    {
      id: 2,
      action: 'User registered',
      details: 'Rahul Kumar joined as client',
      user: 'System',
      time: '4 hours ago',
      type: 'user'
    },
    {
      id: 3,
      action: 'Property sold',
      details: '2 BHK Flat in Andheri East',
      user: 'Amit Patel',
      time: '6 hours ago',
      type: 'sale'
    },
    {
      id: 4,
      action: 'Lead generated',
      details: 'Inquiry for Prestige Lakeside',
      user: 'Website',
      time: '8 hours ago',
      type: 'lead'
    }
  ];

  const topProperties = [
    {
      id: 1,
      title: 'Luxury Villa in Juhu',
      price: '₹8.5 Cr',
      views: 245,
      inquiries: 12,
      status: 'Featured'
    },
    {
      id: 2,
      title: 'Office Space in BKC',
      price: '₹2.8 Cr',
      views: 189,
      inquiries: 8,
      status: 'Hot'
    },
    {
      id: 3,
      title: 'Penthouse in Worli',
      price: '₹12 Cr',
      views: 167,
      inquiries: 15,
      status: 'Premium'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'projects', label: 'Projects', icon: Calendar },
    { id: 'leads', label: 'Leads', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles', icon: UserCheck },
    { id: 'keys', label: 'Keys', icon: Key },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}>
                          {stat.change} from last month
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts and Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${activity.type === 'property' ? 'bg-blue-100' :
                          activity.type === 'user' ? 'bg-green-100' :
                            activity.type === 'sale' ? 'bg-purple-100' :
                              'bg-orange-100'
                          }`}>
                          {activity.type === 'property' && <Building2 className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'user' && <UserCheck className="h-4 w-4 text-green-600" />}
                          {activity.type === 'sale' && <IndianRupee className="h-4 w-4 text-purple-600" />}
                          {activity.type === 'lead' && <TrendingUp className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Properties */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Top Properties</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {topProperties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{property.title}</h4>
                          <p className="text-lg font-bold text-blue-600">{property.price}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">{property.views} views</span>
                            <span className="text-xs text-gray-500">{property.inquiries} inquiries</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.status === 'Featured' ? 'bg-blue-100 text-blue-800' :
                          property.status === 'Hot' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                          {property.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('properties')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <PlusCircle className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Add Property</span>
                </button>
                <button onClick={() => setActiveTab('users')} className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Users className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Add User</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <FileText className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Generate Report</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Settings className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-600">Settings</span>
                </button>
              </div>
            </div>

            {/* Lead Management Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Leads</div>
                <div className="text-4xl font-extrabold mb-1">--</div> {/* Placeholder for total leads */}
                <div className="text-gray-500 mb-4">Total Leads</div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onClick={() => setActiveTab('leads')}>View All Leads</button>
              </div>
            </div>
          </div>
        );

      case 'properties':
        return <PropertyManagement />;

      case 'projects':
        return <ProjectManagement />;

      case 'leads':
        return <LeadManagement />;

      case 'users':
        return <UserManagement />;

      case 'roles':
        return <RolesManagement />;

      case 'keys':
        return <KeyManagement />;

      case 'settings':
        return <ProfileSettings />;

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-gray-500">
                This section is under development. The {activeTab} functionality will be implemented in the next phase.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex md:flex-col w-64 h-full bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col items-start">
            <div className=" p-3 ">
              <img src={LotliteLogo} alt="Lotlite Logo" className="h-7 md:h-9 w-auto" />
            </div>
            <p className="text-sm text-gray-500 -mt-1 ml-3">Admin Panel</p>
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

        <div className="mt-auto p-6 border-t">
          <div className="flex items-center">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
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
                <p className="text-xs text-gray-500 mt-1 ml-2">Admin Panel</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded hover:bg-gray-100">
                ✕
              </button>
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
                <img src={user?.avatar} alt={user?.name} className="h-8 w-8 rounded-full" />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
                </div>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
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
                <p className="text-gray-600">Welcome back, {user?.name}</p>
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
};

export default AdminDashboard; 