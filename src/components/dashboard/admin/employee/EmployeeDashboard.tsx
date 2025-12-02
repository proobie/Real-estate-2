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
  Search,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import EmployeePropertyView from './EmployeePropertyView';
import EmployeeProjectView from './EmployeeProjectView';
import EmployeeLeadManagement from './EmployeeLeadManagement';
import LotliteLogo from '../../../../assets/RedLotliteLogo.png';
import ProfileSettings from '../ProfileSettings';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = [
    { title: 'Assigned Leads', value: '—', change: '+0%', changeType: 'positive', icon: TrendingUp, color: 'bg-orange-500' },
    { title: 'Projects', value: '—', change: '+0%', changeType: 'positive', icon: Calendar, color: 'bg-blue-500' },
    { title: 'Properties', value: '—', change: '+0%', changeType: 'positive', icon: Building2, color: 'bg-green-500' },
    { title: 'Performance', value: '—', change: '+0%', changeType: 'positive', icon: IndianRupee, color: 'bg-purple-500' },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'projects', label: 'Projects', icon: Calendar },
    { id: 'leads', label: 'Leads', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                        <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change} from last period
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'properties':
        return <EmployeePropertyView />;
      case 'projects':
        return <EmployeeProjectView />;
      case 'leads':
        return <EmployeeLeadManagement />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:flex md:flex-col w-64 h-full bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col items-start">
            <div className=" p-3 ">
              <img src={LotliteLogo} alt="Lotlite Logo" className="h-7 md:h-9 w-auto" />
            </div>
            <p className="text-sm text-gray-500 -mt-1 ml-3">Employee Panel</p>
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

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex flex-col items-start">
                <img src={LotliteLogo} alt="Lotlite Logo" className="h-6 w-auto" />
                <p className="text-xs text-gray-500 mt-1 ml-2">Employee Panel</p>
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

      <div className="flex-1 overflow-hidden">
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
                <p className="text-gray-600">Welcome, {user?.name}</p>
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
        <main className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


