import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import LotliteLogo from '../../assets/lotlite-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img src={LotliteLogo} alt="Lotlite Logo" className="h-16 w-auto mb-4" />
            <p className="text-gray-300 mb-4">
              Your trusted partner in finding the perfect property across India. We specialize in residential and commercial real estate with over 15 years of experience in the Indian market.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-secondary-light transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary-light transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary-light transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary-light transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Buy Properties</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Rent Properties</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">New Projects</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Property Valuation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home Loans</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">NRI Services</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Property Types</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">1 BHK Flats</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">2 BHK Flats</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">3 BHK Flats</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Independent Houses</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Villas & Duplexes</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Plots & Agricultural Land</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Commercial Spaces</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">PG & Hostels</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-secondary mt-1 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white underline-offset-2 hover:underline"
                >
                  Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-secondary flex-shrink-0" />
                <span className="text-gray-300">+91 9146205267</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                <span className="text-gray-300">contact@lotlitetechnology.com</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-secondary">Property Alerts</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email for alerts"
                  className="flex-1 px-3 py-2 bg-primary-light border border-primary-dark rounded-l-md focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
                <button className="bg-secondary hover:bg-secondary-dark text-primary-dark font-semibold px-4 py-2 rounded-r-md transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; 2025 Lotlite. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">RERA Compliance</a>
              <a href="#" className="hover:text-white transition-colors">Grievance Redressal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;