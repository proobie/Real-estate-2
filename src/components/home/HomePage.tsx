import React, { useEffect } from 'react';
import Header from '../common/Header';
import Hero from './Hero';
import FeaturedProperties from '../properties/FeaturedProperties';
import FeaturedProjects from '../projects/FeaturedProjects';
import ServiceSection from '../common/ServiceSection';
import TestimonialSection from '../common/TestimonialSection';
import Footer from '../common/Footer';

import { useNavigate, useLocation } from 'react-router-dom';
import { Project } from '../../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const key = location.state?.scrollTo;
    if (!key) return;
    const targetId =
      key === 'featured-projects' ? 'featured-projects' :
        key === 'featured-properties' ? 'featured-properties' :
          key === 'services' ? 'services' :
            key === 'testimonials' ? 'testimonials' : undefined;
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const handleProjectViewDetails = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Header />
      <main>
        <Hero />
        <FeaturedProperties />
        <FeaturedProjects onViewDetails={handleProjectViewDetails} />
        <div id="services">
          <ServiceSection />
        </div>
        <div id="testimonials">
          <TestimonialSection />
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage; 