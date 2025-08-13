import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Mail, Phone, MapPin, MessageSquare, Headphones, Building, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    category: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({
      name: '',
      email: '',
      organization: '',
      subject: '',
      category: '',
      message: ''
    });
  };

  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'makerspace', label: 'Join as Makerspace' },
    { value: 'service_provider', label: 'Become Service Provider' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'billing', label: 'Billing & Accounts' },
    { value: 'feature', label: 'Feature Request' }
  ];

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Get help with technical issues and account management',
      contact: 'support@makrx.org',
      availability: 'Response within 24 hours'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Speak with our team for urgent matters',
      contact: '+1 (555) MAKRCAVE',
      availability: 'Mon-Fri 9AM-5PM PST'
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: 'Enterprise Sales',
      description: 'Custom solutions for institutions and large organizations',
      contact: 'enterprise@makrx.org',
      availability: 'Dedicated account manager'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Community Discord',
      description: 'Join thousands of makers for real-time support',
      contact: 'Join Discord Server',
      availability: '24/7 community support'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-2xl font-bold text-white">MakrCave</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
              <Link to="/find-makerspace" className="text-white/80 hover:text-white transition-colors">Find Makerspace</Link>
              <Link to="/contact" className="text-white hover:text-white font-semibold">Contact</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none">
                  Portal Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Have questions about MakrCave? Want to join the network? Need technical support? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="text-blue-400 mb-4 flex justify-center">{method.icon}</div>
                  <CardTitle className="text-white text-lg">{method.title}</CardTitle>
                  <CardDescription className="text-white/70 text-sm">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-blue-400 font-semibold mb-2">{method.contact}</div>
                  <div className="text-white/60 text-xs">{method.availability}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-white/70">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="text-green-400 text-6xl mb-4">✓</div>
                      <h3 className="text-white text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-white/70 mb-6">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                      <Button
                        onClick={() => setSubmitSuccess(false)}
                        variant="outline"
                        className="border-white/30 text-white/80"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-white/80">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder-white/40"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white/80">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder-white/40"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="organization" className="text-white/80">Organization</Label>
                          <Input
                            id="organization"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder-white/40"
                            placeholder="Your company or makerspace"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-white/80">Category *</Label>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="" className="bg-slate-800">Select a category</option>
                            {contactCategories.map((category) => (
                              <option key={category.value} value={category.value} className="bg-slate-800">
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-white/80">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder-white/40"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-white/80">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="bg-white/10 border-white/20 text-white placeholder-white/40"
                          placeholder="Please provide details about your inquiry..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info & FAQ */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Our Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 text-white/80">
                    <MapPin className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">MakrX Headquarters</div>
                      <div className="text-sm">123 Innovation Drive</div>
                      <div className="text-sm">San Francisco, CA 94107</div>
                      <div className="text-sm">United States</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-white font-semibold mb-1">Account Issues?</div>
                      <div className="text-white/70">Check our documentation at docs.makrx.org</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-1">Billing Questions?</div>
                      <div className="text-white/70">Email billing@makrx.org directly</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-1">Feature Requests?</div>
                      <div className="text-white/70">Use the "Feature Request" category above</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-1">Urgent Technical Issues?</div>
                      <div className="text-white/70">Call us at +1 (555) MAKRCAVE</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">General Inquiries</span>
                      <span className="text-blue-400">24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Technical Support</span>
                      <span className="text-blue-400">12 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Enterprise Sales</span>
                      <span className="text-blue-400">Same day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Billing Issues</span>
                      <span className="text-blue-400">6 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Makerspace?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join the growing network of MakrCaves and revolutionize how you manage your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-makerspace">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3">
                Find a MakrCave
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white/30 text-white/80 px-8 py-3">
                Start Your Application
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
