import React, { useState, useRef } from 'react';
import { Search, Menu, X, Phone, Mail, MapPin, User, Heart, Bell, LogOut, Settings, UserCircle, Home, Building2, Star, LayoutGrid, ChevronDown, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LotliteLogo from '../../assets/RedLotliteLogo.png';
import { buildProjectsListUrl, buildSearchUrl } from '../../utils/urlUtils';
import { addLead } from '../../api';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const projectsDropdownCloseTimeout = useRef<number | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewProjectsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(buildProjectsListUrl({ city: 'pune', location: 'all' }));
  };

  const goBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'sale' }));
  };

  const goRent = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'rent' }));
  };

  const goFeaturedProperties = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate('/', { state: { scrollTo: 'featured-properties' } });
  };

const goBlogs = (e?: React.MouseEvent) => {
  e?.preventDefault();
  navigate('/blogs');
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
      navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'sale', query: searchQuery }));
    }
  };


  const openContactModal = () => {
    setContactForm({
      name: user?.name || '',
      phone: user?.phone || '',
      message: ''
    });
    setContactError(null);
    setContactSuccess(null);
    setShowContactModal(true);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(null);

    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError('Name and phone are required.');
      return;
    }

    setContactLoading(true);
    try {
      await addLead({
        name: contactForm.name,
        email: '',
        phone: contactForm.phone,
        source: 'website',
        type: 'buyer',
        priority: 'medium',
        status: 'New',
        assignedTo: '',
        notes: contactForm.message ? `Contact request: ${contactForm.message}` : 'Contact request from top menu',
      });
      setContactSuccess('Thanks! We will contact you shortly.');
      setContactForm({ name: user?.name || '', phone: user?.phone || '', message: '' });
    } catch (err: any) {
      setContactError(err?.message || 'Failed to submit.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">

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
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-12 md:transition md:duration-300 md:ease-out">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="text-gray-700 hover:text-secondary font-medium transition transform duration-200 hover:-translate-y-0.5 hover:scale-105 border-b-2 border-transparent hover:border-secondary"
            >
              Home
            </a>
            <a
              href="#"
              onClick={goBuy}
              className="text-gray-700 hover:text-secondary font-medium transition transform duration-200 hover:-translate-y-0.5 hover:scale-105 border-b-2 border-transparent hover:border-secondary"
            >
              Buy
            </a>
            <a
              href="#"
              onClick={goRent}
              className="text-gray-700 hover:text-secondary font-medium transition transform duration-200 hover:-translate-y-0.5 hover:scale-105 border-b-2 border-transparent hover:border-secondary"
            >
              Rent
            </a>
            <div
              className="relative"
              onMouseEnter={() => {
                if (projectsDropdownCloseTimeout.current) {
                  window.clearTimeout(projectsDropdownCloseTimeout.current);
                  projectsDropdownCloseTimeout.current = null;
                }
                setIsProjectsDropdownOpen(true);
              }}
              onMouseLeave={() => {
                // small delay to avoid flicker when moving between button and dropdown
                projectsDropdownCloseTimeout.current = window.setTimeout(() => {
                  setIsProjectsDropdownOpen(false);
                  projectsDropdownCloseTimeout.current = null;
                }, 150);
              }}
            >
              <button
                onClick={(e) => { e.preventDefault(); navigate(buildProjectsListUrl({ city: 'pune', location: 'all' })); }}
                aria-haspopup="menu"
                aria-expanded={isProjectsDropdownOpen}
                className="text-gray-700 hover:text-secondary font-medium transition transform duration-200 hover:-translate-y-0.5 hover:scale-105 border-b-2 border-transparent hover:border-secondary flex items-center gap-2"
              >
                <span>New Projects</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProjectsDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {/* Desktop-only dropdown - stays open while hovered */}
              {isProjectsDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top z-50">
                  <div className="py-2">
                    <div className="px-3">
                      <div className="text-xs text-gray-400 mb-2">Featured Builders</div>
                      <div className="bg-gradient-to-b from-white via-white to-gray-50 rounded-md p-1 shadow-inner">
                        <ul className="py-1">
                          <li>
                            <button onClick={() => { navigate(buildProjectsListUrl({ city: 'pune', location: 'all', developer: 'Godrej' })); setIsProjectsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary rounded-md transition flex items-center gap-3">
                              <Building2 size={16} className="text-primary" />
                              <span className="font-medium">Godrej</span>
                            </button>
                          </li>
                          <li>
                            <button onClick={() => { navigate(buildProjectsListUrl({ city: 'pune', location: 'all', developer: 'VTP Realty' })); setIsProjectsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary rounded-md transition flex items-center gap-3">
                              <Building2 size={16} className="text-primary" />
                              <span className="font-medium">VTP Realty</span>
                            </button>
                          </li>
                          <li>
                            <button onClick={() => { navigate(buildProjectsListUrl({ city: 'pune', location: 'all', developer: 'Kolte Patil' })); setIsProjectsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary rounded-md transition flex items-center gap-3">
                              <Building2 size={16} className="text-primary" />
                              <span className="font-medium">Kolte Patil</span>
                            </button>
                          </li>
                          <li>
                            <button onClick={() => { navigate(buildProjectsListUrl({ city: 'pune', location: 'all', developer: 'Paranjape' })); setIsProjectsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary rounded-md transition flex items-center gap-3">
                              <Building2 size={16} className="text-primary" />
                              <span className="font-medium">Paranjape</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-2 px-3">
                      <div className="text-xs text-gray-400">Click a builder to filter projects</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a
              href="#"
              onClick={goBlogs}
              className="text-gray-700 hover:text-secondary font-medium transition transform duration-200 hover:-translate-y-0.5 hover:scale-105 border-b-2 border-transparent hover:border-secondary"
            >
              Blogs
            </a>
          </nav>


          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 ml-4">
            <button
              onClick={openContactModal}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <MessageCircle size={16} />
              Post Property
            </button>
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 hover:border-gray-300 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <UserCircle size={18} />
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (user?.role === 'admin') {
                          navigate('/admin');
                        } else if (user?.role === 'employee') {
                          navigate('/employee');
                        } else if (user?.role === 'client') {
                          navigate('/client');
                        } else {
                          navigate('/login');
                        }
                      }}
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
                className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                <User size={16} />
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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
                <button onClick={() => navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'sale' }))} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
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
                 <button onClick={goBlogs} className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm active:scale-[0.99]">
                    <div className="text-left">
                      <div className="text-base font-semibold text-gray-900">Blogs</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <LayoutGrid size={18} className="text-primary" />
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
                        <button
                          onClick={() => {
                            if (user?.role === 'admin') {
                              navigate('/admin');
                            } else {
                              navigate('/client-dashboard');
                            }
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings size={16} className="mr-2" />
                          Dashboard
                        </button>
                        <button onClick={handleLogout} className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">Logout</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Bottom spacer to prevent last items being hidden behind mobile nav */}
              <div className="h-10 md:h-0" />
            </div>

            {/* Drawer Footer */}
            <div className="px-3 py-3 border-t text-xs text-gray-500">© {new Date().getFullYear()} Lotlite</div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Post Property</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  name="message"
                  rows={3}
                  value={contactForm.message}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  placeholder="Tell us what you are looking for"
                />
              </div>
              {contactError && <div className="text-sm text-red-600">{contactError}</div>}
              {contactSuccess && <div className="text-sm text-green-600">{contactSuccess}</div>}
              <button
                type="submit"
                disabled={contactLoading}
                className="w-full rounded-lg bg-primary text-white py-2.5 font-semibold hover:bg-primary-dark transition disabled:opacity-60"
              >
                {contactLoading ? 'Submitting...' : 'Post Property'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

















