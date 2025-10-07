import React, { useState } from 'react';
import { Search, Menu, X, Phone, Mail, MapPin, User, Heart, Bell, LogOut, Settings, UserCircle, Home, Building2, Star, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LotliteLogo from '../../assets/RedLotliteLogo.png';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewProjectsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/projects');
  };

  const goBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/search?ltype=sale');
  };

  const goRent = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/search?ltype=rent');
  };

  const goFeaturedProperties = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate('/', { state: { scrollTo: 'featured-properties' } });
  };

  const goServices = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate('/', { state: { scrollTo: 'services' } });
  };

  const goTestimonials = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate('/', { state: { scrollTo: 'testimonials' } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      {/* Desktop Top Bar (unchanged) */}
      <div className="bg-primary text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <a href="tel:+919011135889" className="hover:underline">+91 9011135889</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span>contact@lotlitetechnology.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={14} />
                <span>Pune</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:text-secondary-light transition-colors">
                <Heart size={16} />
              </button>
              <button className="hover:text-secondary-light transition-colors">
                <Bell size={16} />
              </button>
              {/* Authentication Section */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-6 w-6 rounded-full border-2 border-white"
                      />
                    ) : (
                      <UserCircle size={20} />
                    )}
                    <span className="hidden sm:inline text-sm">{user.name}</span>
                  </button>
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <button
                        onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings size={16} className="mr-2" />
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-1 bg-primary-light hover:bg-primary-dark px-3 py-1 rounded-md transition-colors"
                >
                  <User size={16} />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Top Bar (two rows) */}
      <div className="bg-primary text-white py-2 md:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 flex flex-col gap-1">
          {/* First row: phone and icons */}
          <div className="flex justify-between items-center text-sm w-full">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <a href="tel:+919011135889" className="hover:underline">+91 9011135889</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:text-secondary-light transition-colors">
                <Heart size={16} />
              </button>
              <button className="hover:text-secondary-light transition-colors">
                <Bell size={16} />
              </button>
              {isAuthenticated && user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center hover:text-blue-200 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full border-2 border-white"
                    />
                  ) : (
                    <UserCircle size={20} />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center bg-primary-light hover:bg-primary-dark px-2 py-1 rounded-md transition-colors"
                >
                  <User size={16} />
                </button>
              )}
            </div>
          </div>
          {/* Second row: email and location */}
          <div className="flex justify-between items-center text-xs sm:text-sm w-full mt-1">
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <span>contact@lotlitetechnology.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={14} />
              <span>Pune</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-2">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} aria-label="Go to home">
              <img src={LotliteLogo} alt="Lotlite Logo" className="h-7 sm:h-9 md:h-11 w-auto" />
            </a>
          </div>

          {/* Mobile Inline Search */}
          <div className="flex-1 min-w-0 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-md hover:bg-primary-dark transition-colors"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-12">
            <a href="#" onClick={goBuy} className="text-gray-700 hover:text-secondary font-medium transition-colors">
              Buy
            </a>
            <a href="#" onClick={goRent} className="text-gray-700 hover:text-secondary font-medium transition-colors">
              Rent
            </a>
            <a
              href="#featured-projects"
              onClick={handleNewProjectsClick}
              className="text-gray-700 hover:text-secondary font-medium transition-colors"
            >
              New Projects
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:block ml-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search properties, projects, localities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search (moved inline above) */}

        {/* Mobile Quick Links Chips */}
        <div className="md:hidden pb-3 -mt-1">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={goBuy} className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm border border-gray-200">
              Buy
            </button>
            <button onClick={goRent} className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm border border-gray-200">
              Rent
            </button>
            <button onClick={handleNewProjectsClick} className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm border border-gray-200">
              New Projects
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Side Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 h-full bg-gray-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-up">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <img src={LotliteLogo} alt="Lotlite" className="h-6 w-auto" />
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Welcome Banner */}
              <div className="m-3 rounded-2xl overflow-hidden bg-primary text-white">
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {isAuthenticated && user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full border-2 border-white/70" />
                    ) : (
                      <UserCircle size={36} className="text-white" />
                    )}
                    <div>
                      <p className="text-lg font-semibold">Welcome{isAuthenticated && user?.name ? `, ${user.name.split(' ')[0]}` : ''}</p>
                      {isAuthenticated ? (
                        <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} className="text-xs underline underline-offset-2 text-white/90">Manage Profile</button>
                      ) : (
                        <span className="text-sm text-white/90">Guest Profile</span>
                      )}
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <button
                      onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                      className="w-full mt-3 bg-white text-primary font-semibold py-2 rounded-lg"
                    >
                      Login / Register
                    </button>
                  )}
                </div>
              </div>

              {/* Action Cards */}
              <div className="px-3 space-y-3">
                <button onClick={goFeaturedProperties} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Featured Properties</div>
                    <div className="text-xs text-gray-500">Handpicked homes for you</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <LayoutGrid size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={goBuy} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Buy</div>
                    <div className="text-xs text-gray-500">Find properties for sale</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={goRent} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Rent</div>
                    <div className="text-xs text-gray-500">Explore rental homes</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={handleNewProjectsClick} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">New Projects</div>
                    <div className="text-xs text-gray-500">Upcoming and ongoing</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={() => navigate('/search')} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Search Properties</div>
                    <div className="text-xs text-gray-500">Filter by budget, type, location</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={goServices} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Services</div>
                    <div className="text-xs text-gray-500">Home loans, legal, more</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings size={18} className="text-primary" />
                  </div>
                </button>
                <button onClick={goTestimonials} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                  <div className="text-left">
                    <div className="text-base font-semibold text-gray-900">Testimonials</div>
                    <div className="text-xs text-gray-500">What customers say</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle size={18} className="text-primary" />
                  </div>
                </button>
              </div>

              {/* Contact & Account */}
              <div className="px-3 pt-4 pb-3 space-y-3">
                <div className="rounded-xl border border-gray-200 bg-white">
                  <div className="px-4 py-2 border-b text-xs text-gray-500">Contact</div>
                  <div className="px-4 py-3 text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-2"><Phone size={14} /><a href="tel:+919011135889" className="hover:text-secondary">+91 9011135889</a></div>
                    <div className="flex items-center gap-2"><Mail size={14} /><a href="mailto:contact@lotlitetechnology.com" className="hover:text-secondary">contact@lotlitetechnology.com</a></div>
                    <div className="flex items-start gap-2"><MapPin size={18} className="mt-0.5 flex-shrink-0" /><a href="https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6" target="_blank" rel="noopener noreferrer" className="hover:text-secondary underline-offset-2 hover:underline text-left">Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057</a></div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="px-4 py-2 border-b text-xs text-gray-500">Account</div>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                        ) : (
                          <UserCircle size={24} />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }} className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">Dashboard</button>
                        <button onClick={handleLogout} className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">Logout</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-3 py-3 border-t text-xs text-gray-500">© {new Date().getFullYear()} Lotlite</div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

















