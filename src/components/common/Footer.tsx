import React from 'react';
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';
import LotliteLogo from '../../assets/WhiteLotliteLogo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0f2746] to-[#1D3557] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img src={LotliteLogo} alt="Lotlite Logo" className="h-12 w-auto mb-4" />
            <p className="text-[#A8DADC] mb-4">
              Your trusted partner in finding the perfect property across India. We specialize in residential and commercial real estate with over 15 years of experience in the Indian market.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/LotliteRealty/" className="text-[#A8DADC] hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.youtube.com/@lotliteproperty7994" className="text-[#A8DADC] hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://www.instagram.com/p/DHoivywzUiB/" className="text-[#A8DADC] hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/lotlite-it-realestate/posts/?feedView=all" className="text-[#A8DADC] hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#A8DADC]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/search?ltype=sale" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Buy Properties</a></li>
              <li><a href="/search?ltype=rent" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Rent Properties</a></li>
              <li><a href="/projects" className="text-[#F1FAEE]/80 hover:text-white transition-colors">New Projects</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Property Valuation</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Home Loans</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">NRI Services</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#A8DADC]">Property Types</h3>
            <ul className="space-y-2">
              <li><a href="/search?type=1bhk" className="text-[#F1FAEE]/80 hover:text-white transition-colors">1 BHK Flats</a></li>
              <li><a href="/search?type=2bhk" className="text-[#F1FAEE]/80 hover:text-white transition-colors">2 BHK Flats</a></li>
              <li><a href="/search?type=3bhk" className="text-[#F1FAEE]/80 hover:text-white transition-colors">3 BHK Flats</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Independent Houses</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Villas & Duplexes</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Plots & Agricultural Land</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">Commercial Spaces</a></li>
              <li><a href="#" className="text-[#F1FAEE]/80 hover:text-white transition-colors">PG & Hostels</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#A8DADC]">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#A8DADC] mt-1 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/Rjpzv3UUDYP3uirZ6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F1FAEE] hover:text-white underline-offset-2 hover:underline"
                >
                  Floor No. -2, Tower No. B-1, Office No. 0302, Blue Ridge, MIDC Phase 2 Main Road, Hinjewadi, Pune, Maharashtra, 411057
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-[#A8DADC] flex-shrink-0" />
                <a href="tel:+919011135889" className="text-[#F1FAEE] hover:underline">+91 9011135889</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-[#A8DADC] flex-shrink-0" />
                <span className="text-[#F1FAEE]">contact@lotlitetechnology.com</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-[#A8DADC]">Property Alerts</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email for alerts"
                  className="flex-1 px-3 py-2 bg-[#F1FAEE] text-[#1D3557] border border-[#A8DADC] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-sm"
                />
                <button className="bg-[#457B9D] hover:bg-[#1D3557] text-white font-semibold px-4 py-2 rounded-r-md transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1D3557] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-[#A8DADC] text-sm">
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