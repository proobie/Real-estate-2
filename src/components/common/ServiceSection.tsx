import React from 'react';
import { Home, Search, DollarSign, FileText, Key, Shield, Calculator, Users } from 'lucide-react';

const ServiceSection: React.FC = () => {
  const services = [
    {
      icon: Search,
      title: 'Property Search & Site Visits',
      description: 'Find verified properties with clear titles and arrange site visits with our expert team.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: Home,
      title: 'Property Management',
      description: 'Complete property management services including tenant verification and rent collection.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: DollarSign,
      title: 'Property Valuation & Market Analysis',
      description: 'Get accurate property valuations and market analysis for informed investment decisions.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: FileText,
      title: 'Legal Documentation & RERA Compliance',
      description: 'Complete legal assistance including title verification, registration, and RERA compliance.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: Key,
      title: 'Rent & Lease Services',
      description: 'Comprehensive rental services with tenant verification, agreement drafting, and deposit management.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: Calculator,
      title: 'Home Loan Assistance',
      description: 'Expert guidance for home loans with pre-approved offers from leading banks and NBFCs.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: Shield,
      title: 'Investment Advisory',
      description: 'Strategic real estate investment advice for maximum returns and portfolio diversification.',
      color: 'bg-secondary/20 text-secondary-dark'
    },
    {
      icon: Users,
      title: 'NRI Services',
      description: 'Specialized services for NRI clients including remote property management and investment guidance.',
      color: 'bg-secondary/20 text-secondary-dark'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive real estate services to help you buy, sell, rent, or invest in properties across India with complete transparency
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-4">
                  <button className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Find Your <span className="text-secondary">Dream Property?</span>
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact our expert team today for personalized property consultation and end-to-end assistance in your real estate journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-secondary text-primary-dark hover:bg-secondary-dark font-semibold py-3 px-8 rounded-lg transition-colors">
                Schedule Site Visit
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-dark font-semibold py-3 px-8 rounded-lg transition-colors">
                Get Property Valuation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;