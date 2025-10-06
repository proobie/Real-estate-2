import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Pornima Deshpande',
      location: 'Pune, Maharashtra',
      rating: 5,
      text: `Dear Gayatri,\n\nI wanted to take a moment to express my heartfelt thanks for the excellent service you provided in renting out and selling my flat. Your professionalism, expertise, and dedication made the entire process smooth and stress-free.\n\nYour knowledge of the market, negotiation skills, and attention to detail were impressive. I'm grateful for the time and effort you invested in finding suitable tenants and buyers for my property.\n\nThank you again for your hard work and commitment. I highly recommend your services to anyone looking for a reliable and efficient broker.\n\nBest regards,\nPornima`,
      image: 'https://lh3.googleusercontent.com/a/ACg8ocLu6BRrz3ivOkfSxDfaqA8G05v4zwX_xKUxkIVcGV41KcelmA=w72-h72-p-rp-mo-br100',
      propertyType: 'Flat Sale & Rent'
    },
    {
      id: 2,
      name: 'Dnyan Shah',
      location: 'Hinjewadi, Pune',
      rating: 5,
      text: `Gayatri and team are extremely professional in their work.\nShe managed my property two flats in Blue Ridge and also helped me sell them in the given time to two different buyers.\nHer team is adept at handling the legal and administrative jobs and it was a breeze for me to get the transaction completed.\nI definitely would propose her name for a real estate dealing in and around Hingewadi. Thank you very much for all your effort and delivering on what was committed.`,
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjUW0YYZbp95gH8U3w2TOcLSy75fwl3FdI3JGo63id0VnZOwhtGWUg=w216-h216-p-rp-mo-br100',
      propertyType: 'Flat Sale'
    },
    {
      id: 3,
      name: 'Sushant Patil',
      location: 'Hinjewadi, Pune',
      rating: 5,
      text: `I wanted to take a moment to share my positive experience with Lotlite Property and Kunal, who assisted me in finding a flat for rent in the Hinjewadi area of Pune.\n\nKunal's professionalism, attentiveness, and in-depth knowledge of the local rental market made the entire process incredibly smooth. He understood my requirements quickly and showed me several options that perfectly fit my needs. I am grateful for his patience and commitment in ensuring I found the right place.\n\nI would highly recommend his services to others looking for a reliable and professional real estate agent.\n\nThank you once again.`,
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjWqoozSsiKyt1LuzMO_T_YJ6lHjMcOTd4H-ZgkqyOITGiwRYT5n=w72-h72-p-rp-mo-br100',
      propertyType: 'Flat Rental'
    },
    {
      id: 4,
      name: 'Sushil Bhasme',
      location: 'Hinjewadi, Pune',
      rating: 5,
      text: `I have recently come in touch with Lotlite Property. The owner Gayatri and her entire team is very helpful and professional. Mukesh and Mohit are the gems of Lotlite. My experience to purchase a flat in Hinjewadi is excellent. They managed everything from helping for purchase a flat, it's legal, documentation to renting my flat. They are real professional. I will highly recommend this name.\nA trusted professional..\nThank you Gayatri, Mohit and Mukesh for every help...`,
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjVRXW68hMUWvoMtuIvUIb-TBCOwImCovVKVZawJ-wvJkxuZh0g=w72-h72-p-rp-mo-br100',
      propertyType: 'Flat Purchase & Rent'
    },
    {
      id: 5,
      name: 'Imran Ghumara',
      location: 'Pune, Maharashtra',
      rating: 5,
      text: `Excellent service, very good behaviour of the owner miss Gayatri ji.\nAlso very good behaviour of all their employees as well.\n\nThey are also honest with the price, charging less brokrage then all the other Pune brokers.\n\nMust must recommended.`,
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjWjF5pJX8No1ordcCUD-O932OSkug7p_pTk1SjSSFsW_TgtsnoC=w72-h72-p-rp-mo-ba4-br100',
      propertyType: 'Brokerage'
    },
    {
      id: 6,
      name: 'Aditi Kulkarni',
      location: 'Pune, Maharashtra',
      rating: 5,
      text: `They provide excellent service. Mr Mukesh Goswami is very dedicated and extremely helpful and completely trustworthy. He helped me Resolve all my problems.`,
      image: 'https://lh3.googleusercontent.com/a-/ALV-UjUyGX0dt_8E_fBT1SfKr-FEW-42OokzAPpYfyNB-iUCUaugq9hu=w72-h72-p-rp-mo-br100',
      propertyType: 'Consultation'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-secondary fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D3557] mb-4">
            What Our <span className="text-[#E63946]">Customers Say</span>
          </h2>
          <p className="text-lg text-[#457B9D] max-w-2xl mx-auto">
            Over 25,000 happy families have found their dream properties through Lotlite. Here's what they have to say about our services.
          </p>
        </div>

        {/* Testimonials: horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="snap-center shrink-0 w-[85%] sm:w-[420px] md:w-auto">
              <div className="bg-[#F1FAEE] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-[#1D3557]/20">
                  <Quote size={32} />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}.0)</span>
                </div>

                {/* Testimonial Text */}
                <p className="text-[#1D3557] mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}`;
                    }}
                  />
                  <div>
                    <div className="font-semibold text-[#1D3557]">{testimonial.name}</div>
                    <div className="text-sm text-[#457B9D]">{testimonial.location}</div>
                    <div className="text-xs text-[#1D3557] font-medium">{testimonial.propertyType}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-[#457B9D] to-[#1D3557] rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Trusted by Thousands Across <span className="text-[#E63946]">India</span>
            </h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Our commitment to transparency, quality service, and customer satisfaction has made us India's preferred real estate partner.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">25,000+</div>
              <div className="text-[#A8DADC]">Happy Families</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-[#A8DADC]">Properties Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">150+</div>
              <div className="text-[#A8DADC]">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-[#A8DADC]">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;