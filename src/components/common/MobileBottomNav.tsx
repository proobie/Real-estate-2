import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Home, Building2, Calendar, UserCircle } from 'lucide-react';
import { buildSearchUrl } from '../../utils/urlUtils';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();

  const goFeaturedProperties = () => {
    navigate('/', { state: { scrollTo: 'featured-properties' } });
  };
  const goBuy = () => {
    navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'sale' }));
  };
  const goRent = () => {
    navigate(buildSearchUrl({ city: 'pune', location: 'all', listingType: 'rent' }));
  };
  const goNewProjects = () => {
    navigate('/projects');
  };
  const goLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-2">
        <ul className="grid grid-cols-5">
          <li>
            <button onClick={goBuy} className="w-full py-3 flex flex-col items-center text-gray-700 hover:text-primary">
              <Home size={22} />
              <span className="text-[11px] mt-0.5">Buy</span>
            </button>
          </li>
          <li>
            <button onClick={goRent} className="w-full py-3 flex flex-col items-center text-gray-700 hover:text-primary">
              <Building2 size={22} />
              <span className="text-[11px] mt-0.5">Rent</span>
            </button>
          </li>
          <li>
            <button onClick={goFeaturedProperties} className="w-full py-3 flex flex-col items-center text-gray-700 hover:text-primary">
              <LayoutGrid size={22} />
              <span className="text-[11px] mt-0.5">Featured</span>
            </button>
          </li>
          <li>
            <button onClick={goNewProjects} className="w-full py-3 flex flex-col items-center text-gray-700 hover:text-primary">
              <Calendar size={22} />
              <span className="text-[11px] mt-0.5">Projects</span>
            </button>
          </li>
          <li>
            <button onClick={goLogin} className="w-full py-3 flex flex-col items-center text-gray-700 hover:text-primary">
              <UserCircle size={22} />
              <span className="text-[11px] mt-0.5">Login</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;


