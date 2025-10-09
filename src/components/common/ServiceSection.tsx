import React, { useState } from 'react';
import { Home, Search, DollarSign, FileText, Key, Shield, Calculator, Users } from 'lucide-react';

const ServiceSection: React.FC = () => {
  const services = [
    {
      icon: Search,
      title: 'Property Search & Site Visits',
      description: 'Find verified properties with clear titles and arrange site visits with our expert team.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: Home,
      title: 'Property Management',
      description: 'Complete property management services including tenant verification and rent collection.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: DollarSign,
      title: 'Property Valuation & Market Analysis',
      description: 'Get accurate property valuations and market analysis for informed investment decisions.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: FileText,
      title: 'Legal Documentation & RERA Compliance',
      description: 'Complete legal assistance including title verification, registration, and RERA compliance.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: Key,
      title: 'Rent & Lease Services',
      description: 'Comprehensive rental services with tenant verification, agreement drafting, and deposit management.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: Calculator,
      title: 'Home Loan Assistance',
      description: 'Expert guidance for home loans with pre-approved offers from leading banks and NBFCs.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: Shield,
      title: 'Investment Advisory',
      description: 'Strategic real estate investment advice for maximum returns and portfolio diversification.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    },
    {
      icon: Users,
      title: 'NRI Services',
      description: 'Specialized services for NRI clients including remote property management and investment guidance.',
      color: 'bg-[#A8DADC]/40 text-[#1D3557]'
    }
  ];

  const serviceDetails: Record<string, {
    intro: string;
    highlights: string[];
    steps: string[];
    extras?: string[];
  }> = {
    'Property Search & Site Visits': {
      intro: 'We shortlist verified properties that match your budget, location, and lifestyle needs, and coordinate seamless site visits with builders or owners.',
      highlights: [
        'Verified listings with title and builder background checks',
        'Curated shortlists based on commute, schools, hospitals, and amenities',
        'On-site assistance, photos/videos, and comparative checklists',
        'Negotiation support for pricing and inclusions'
      ],
      steps: [
        'Share your preferences: budget, location, BHK, timeline',
        'Receive a curated shortlist with pros/cons',
        'Schedule site visits (virtual/in-person) at your convenience',
        'Finalize options and proceed to negotiation'
      ]
    },
    'Property Management': {
      intro: 'End-to-end management for your property including tenanting, rent collection, maintenance, and inspections—ideal for outstation and NRI owners.',
      highlights: [
        'Tenant screening and police verification',
        'Digital rent collection and reminders',
        'Periodic inspections with photo reports',
        'Maintenance coordination with trusted vendors'
      ],
      steps: [
        'Property onboarding and documentation',
        'Tenant discovery and background checks',
        'Agreement drafting and move-in checklist',
        'Ongoing rent/maintenance management and reporting'
      ]
    },
    'Property Valuation & Market Analysis': {
      intro: 'Accurate fair market valuation using comparable sale data, rental yields, locality trends, and builder/redevelopment plans.',
      highlights: [
        'Comparative market analysis (CMA)',
        'Demand-supply and absorption metrics',
        'Price trendlines and yield benchmarks',
        'Bank loan and LTV suitability checks'
      ],
      steps: [
        'Share property details and documents',
        'Data-driven analysis with locality comps',
        'Valuation report with pricing band and strategy',
        'Listing strategy for sale/rent as needed'
      ]
    },
    'Legal Documentation & RERA Compliance': {
      intro: 'Full legal support—from title diligence to agreement drafting, registration, stamp duty, and RERA compliance for new projects.',
      highlights: [
        'Title search and encumbrance checks',
        'Agreement for Sale/Lease drafting and vetting',
        'Registration and stamp duty facilitation',
        'RERA advisory for under-construction purchases'
      ],
      steps: [
        'Collect property papers and KYC',
        'Legal review with actionable observations',
        'Drafting/vetting and negotiation support',
        'Registration and compliant documentation handover'
      ]
    },
    'Rent & Lease Services': {
      intro: 'End-to-end rental journey—tenant discovery, background verification, agreement, deposit handling, and move-in formalities.',
      highlights: [
        'Targeted tenant marketing and screening',
        'Police verification and document checks',
        'E-stamped agreements and inventory checklist',
        'Handover support and move-in coordination'
      ],
      steps: [
        'List the property with photos and details',
        'Prospect discovery and verification',
        'Agreement drafting and e-stamp execution',
        'Move-in checklist and deposit settlement'
      ]
    },
    'Home Loan Assistance': {
      intro: 'Advisory for the best-fit home loans—compare bank/NBFC offers, get pre-approval, and complete documentation without hassle.',
      highlights: [
        'Comparison across leading banks/NBFCs',
        'Preferential interest rates wherever applicable',
        'End-to-end document support and coordination',
        'Eligibility calculation and pre-approval'
      ],
      steps: [
        'Understand eligibility and select lenders',
        'Document preparation and application',
        'Sanction, processing, and disbursal coordination',
        'Post-sanction registration and possession support'
      ]
    },
    'Investment Advisory': {
      intro: 'Goal-based real estate planning for capital appreciation and stable yields across residential and commercial assets.',
      highlights: [
        'Location and builder risk evaluation',
        'Projected cashflows and exit strategy',
        'Portfolio diversification and REIT options',
        'Tax efficiency and compliance pointers'
      ],
      steps: [
        'Capture goals, horizon, and risk profile',
        'Identify asset classes and micro-markets',
        'Shortlist projects with risk-return mapping',
        'Execution and periodic portfolio review'
      ]
    },
    'NRI Services': {
      intro: 'Dedicated NRI desk for remote buying/selling, leasing, PoA handling, taxation, and on-ground property management.',
      highlights: [
        'Remote onboarding and virtual tours',
        'PoA, TAN/PAN, and bank coordination',
        'Property management, rent, and compliance',
        'Repatriation guidance and CA connections'
      ],
      steps: [
        'Define scope: buy/sell/lease/manage',
        'KYC and document readiness (remote)',
        'Execution via local team and video confirmations',
        'Periodic reports, audits, and compliance'
      ]
    }
  };

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const isOpen = selectedIdx !== null;
  const closeModal = () => setSelectedIdx(null);

  return (<>
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            Our <span className="text-[#E63946]">Services</span>
          </h2>
          <p className="text-lg text-[#457B9D] max-w-2xl mx-auto">
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
                <h3 className="text-lg font-bold text-[#1D3557] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#457B9D] text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-4">
                  <button onClick={() => setSelectedIdx(index)} className="text-[#1D3557] hover:text-[#0f2746] font-semibold text-sm flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300">
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
          <div className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Find Your <span className="text-[#E63946]">Dream Property?</span>
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact our expert team today for personalized property consultation and end-to-end assistance in your real estate journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#E63946] text-white hover:bg-[#d12d3a] font-semibold py-3 px-8 rounded-lg transition-colors">
                Schedule Site Visit
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#1D3557] font-semibold py-3 px-8 rounded-lg transition-colors">
                Get Property Valuation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Service Details Modal */}
    {
      isOpen && selectedIdx !== null && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  {(() => {
                    const S = services[selectedIdx].icon;
                    return <div className={`w-10 h-10 ${services[selectedIdx].color} rounded-xl flex items-center justify-center`}><S size={20} /></div>;
                  })()}
                  <h3 className="text-xl font-bold text-[#1D3557]">{services[selectedIdx].title}</h3>
                </div>
                <button onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close">
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
                {(() => {
                  const title = services[selectedIdx].title;
                  const details = serviceDetails[title];
                  return (
                    <>
                      <p className="text-gray-700 leading-relaxed">
                        {details.intro}
                      </p>

                      <div>
                        <h4 className="text-[#1D3557] font-semibold mb-2">Key Highlights</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                          {details.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-[#1D3557] font-semibold mb-2">How It Works</h4>
                        <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-sm">
                          {details.steps.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>

                      {details.extras && details.extras.length > 0 && (
                        <div>
                          <h4 className="text-[#1D3557] font-semibold mb-2">Additional Info</h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                            {details.extras.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Access */}
                      <div className="pt-3 border-t">
                        <h4 className="text-[#1D3557] font-semibold mb-2">Quick Access to Other Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {services.map((s, i) => (
                            i !== selectedIdx ? (
                              <button
                                key={s.title}
                                onClick={() => setSelectedIdx(i)}
                                className="px-3 py-1.5 rounded-full text-sm border border-gray-300 hover:border-[#1D3557] hover:text-[#1D3557] transition-colors"
                                aria-label={`Open ${s.title}`}
                              >
                                {s.title}
                              </button>
                            ) : null
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                <button onClick={closeModal} className="px-4 py-2 rounded-md border hover:bg-gray-100">Close</button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  </>);
};

export default ServiceSection;