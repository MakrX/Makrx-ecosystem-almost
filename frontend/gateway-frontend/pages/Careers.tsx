import React from 'react';
import { MapPin, Clock, DollarSign, Users, Heart, Zap } from 'lucide-react';

export default function Careers() {
  const openRoles = [
    {
      id: 1,
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      description: "Join our engineering team to build the next generation of maker tools and platforms."
    },
    {
      id: 2,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Design intuitive interfaces for makers, creators, and makerspace operators across our platform."
    },
    {
      id: 3,
      title: "Community Manager",
      department: "Marketing",
      location: "Mumbai",
      type: "Full-time",
      description: "Build and nurture our growing community of makers, educators, and innovation enthusiasts."
    },
    {
      id: 4,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      description: "Scale our infrastructure to support millions of makers and thousands of makerspaces worldwide."
    }
  ];

  const benefits = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, wellness programs, and mental health support."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Learning & Growth",
      description: "Conference budget, online courses, and dedicated time for skill development."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and work-life balance."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Equity & Bonuses",
      description: "Competitive salary, equity participation, and performance bonuses."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-makrx-blue to-blue-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build the Future of Making
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Join our mission to democratize manufacturing and empower creators worldwide. 
            We're building tools that transform ideas into reality.
          </p>
          <div className="flex justify-center gap-6 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10+</div>
              <div className="text-sm">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">100K+</div>
              <div className="text-sm">Users Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our Culture & Values
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation First</h3>
              <p className="text-gray-600">We're constantly pushing boundaries and exploring new possibilities in digital manufacturing.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-600">Everything we build serves our maker community and helps creators bring their ideas to life.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">People First</h3>
              <p className="text-gray-600">We believe in work-life balance, continuous learning, and supporting each other's growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Benefits & Perks</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Open Positions</h2>
          
          <div className="space-y-6">
            {openRoles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {role.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {role.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {role.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:ml-8">
                    <a
                      href={`mailto:careers@makrx.org?subject=Application for ${role.title}`}
                      className="inline-flex items-center px-6 py-3 bg-makrx-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a role that fits? We're always looking for talented people.
            </p>
            <a
              href="mailto:careers@makrx.org?subject=General Application"
              className="inline-flex items-center px-6 py-3 border border-makrx-blue text-makrx-blue rounded-lg font-semibold hover:bg-makrx-blue hover:text-white transition-colors"
            >
              Send Us Your Resume
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-makrx-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Shape the Future?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join us in building the infrastructure that will power the next generation of creators and innovators.
          </p>
          <a
            href="mailto:careers@makrx.org"
            className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-yellow text-makrx-blue font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
