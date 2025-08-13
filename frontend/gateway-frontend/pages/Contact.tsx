import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle, 
  Building2, ShoppingCart, GraduationCap, HelpCircle,
  MessageSquare, Calendar, ArrowRight, Star
} from 'lucide-react';

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  contact: string;
  href: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, description, contact, href }) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
    <div className="w-16 h-16 bg-makrx-blue/10 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    <a 
      href={href}
      className="text-makrx-blue font-semibold hover:text-makrx-blue/80 transition-colors"
    >
      {contact}
    </a>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-makrx-blue/20"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 pr-8">{question}</h3>
          <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 bg-gray-50">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const faqs = [
    {
      question: "How do I get access to a makerspace?",
      answer: "You can browse available makerspaces on our MakrCave platform, check their schedules, and book time slots directly. Most spaces offer day passes, monthly memberships, or project-based access."
    },
    {
      question: "What equipment is available in makerspaces?",
      answer: "Our makerspaces are equipped with 3D printers, laser cutters, CNC machines, electronics workbenches, wood workshops, and more. Each space has a detailed equipment list available on their profile page."
    },
    {
      question: "Do you offer training and workshops?",
      answer: "Yes! We have comprehensive learning programs including hands-on workshops, online courses, and certification programs for all skill levels from beginner to advanced."
    },
    {
      question: "How does the 3D printing service work?",
      answer: "Upload your design file, get an instant quote, choose materials and quality settings, then place your order. We'll match you with the best provider in our network and handle everything from printing to delivery."
    },
    {
      question: "What safety measures are in place?",
      answer: "All makerspaces follow strict safety protocols including equipment training requirements, protective gear provision, emergency procedures, and certified operator supervision for high-risk equipment."
    },
    {
      question: "Can I host events or workshops at makerspaces?",
      answer: "Absolutely! Many of our partner makerspaces offer event hosting services. Contact the specific makerspace or reach out to our team to discuss your requirements and availability."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-makrx-blue via-makrx-blue/90 to-purple-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Have questions? Need support? Want to partner with us? 
            We're here to help you succeed in your maker journey.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ContactCard
              icon={<Mail className="w-8 h-8 text-makrx-blue" />}
              title="General Inquiries"
              description="Questions about our platform, services, or getting started"
              contact="hello@makrx.org"
              href="mailto:hello@makrx.org"
            />
            <ContactCard
              icon={<HelpCircle className="w-8 h-8 text-makrx-blue" />}
              title="Technical Support"
              description="Need help with equipment, software, or technical issues"
              contact="support@makrx.org"
              href="mailto:support@makrx.org"
            />
            <ContactCard
              icon={<Building2 className="w-8 h-8 text-makrx-blue" />}
              title="Partnership"
              description="Interested in partnering with us or becoming a makerspace host"
              contact="partners@makrx.org"
              href="mailto:partners@makrx.org"
            />
            <ContactCard
              icon={<Phone className="w-8 h-8 text-makrx-blue" />}
              title="Call Us"
              description="Speak directly with our team for immediate assistance"
              contact="+91 12345 67890"
              href="tel:+911234567890"
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. We've received your message and will get back to you within 24 hours.
              </p>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    category: '',
                    message: '',
                    priority: 'normal'
                  });
                }}
                className="makrx-btn-primary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors"
                  >
                    <option value="">Select a category</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-makrx-blue/20 focus:border-makrx-blue transition-colors resize-none"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full makrx-btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-makrx-blue mr-3"></div>
                    Sending Message...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about MakrX
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for?
            </p>
            <a 
              href="/help" 
              className="inline-flex items-center text-makrx-blue font-semibold hover:text-makrx-blue/80 transition-colors"
            >
              Visit our Help Center
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Visit Our Offices
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We have offices across major cities in India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                city: "Bangalore",
                address: "HSR Layout, Sector 2\nBangalore, Karnataka 560102",
                phone: "+91 80 4567 8901",
                email: "bangalore@makrx.org",
                hours: "Mon-Sat: 9 AM - 8 PM"
              },
              {
                city: "Mumbai",
                address: "Bandra West, Off SV Road\nMumbai, Maharashtra 400050",
                phone: "+91 22 4567 8902",
                email: "mumbai@makrx.org",
                hours: "Mon-Sat: 9 AM - 8 PM"
              },
              {
                city: "Delhi",
                address: "Connaught Place\nNew Delhi, Delhi 110001",
                phone: "+91 11 4567 8903",
                email: "delhi@makrx.org",
                hours: "Mon-Sat: 9 AM - 8 PM"
              }
            ].map((office, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{office.city}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-makrx-blue mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 whitespace-pre-line">{office.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-makrx-blue mr-3 flex-shrink-0" />
                    <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="text-gray-700 hover:text-makrx-blue transition-colors">
                      {office.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-makrx-blue mr-3 flex-shrink-0" />
                    <a href={`mailto:${office.email}`} className="text-gray-700 hover:text-makrx-blue transition-colors">
                      {office.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-makrx-blue mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{office.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
