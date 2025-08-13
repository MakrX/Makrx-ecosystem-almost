'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb, 
  Award,
  MapPin,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Heart,
  Zap,
  Globe,
  Shield,
  Rocket,
  CheckCircle
} from 'lucide-react'

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former Tesla engineer with 10+ years in manufacturing automation",
      image: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Team",
      linkedin: "https://linkedin.com/in/sarahchen"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      bio: "3D printing pioneer, Stanford PhD in Materials Science",
      image: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Team",
      github: "https://github.com/mrodriguez"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Innovation",
      bio: "MIT researcher specializing in advanced manufacturing",
      image: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Team",
      linkedin: "https://linkedin.com/in/emilywatson"
    },
    {
      name: "Alex Kim",
      role: "Head of Community",
      bio: "Maker movement advocate, building the future of creation",
      image: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Team",
      twitter: "https://twitter.com/alexkim"
    }
  ]

  const milestones = [
    {
      year: "2019",
      title: "Founded",
      description: "Started with a vision to democratize manufacturing"
    },
    {
      year: "2020",
      title: "First 1000 Makers",
      description: "Built our initial community of passionate creators"
    },
    {
      year: "2021",
      title: "Series A",
      description: "Raised $10M to expand platform and services"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Launched international shipping and local hubs"
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Introduced smart design assistance and optimization"
    },
    {
      year: "2024",
      title: "100K+ Creators",
      description: "Became the largest maker ecosystem globally"
    }
  ]

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "Everything we do is centered around empowering our maker community"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in manufacturing"
    },
    {
      icon: Heart,
      title: "Quality",
      description: "We believe in creating products and services that last"
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making advanced manufacturing tools available to everyone"
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Building long-term relationships through transparency and reliability"
    },
    {
      icon: Rocket,
      title: "Impact",
      description: "Helping creators bring ideas to life and change the world"
    }
  ]

  const stats = [
    { number: "100K+", label: "Active Makers" },
    { number: "2M+", label: "Projects Created" },
    { number: "50+", label: "Countries Served" },
    { number: "99.9%", label: "Uptime" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering the Future of 
              <span className="text-blue-600 block">Making</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              MakrX is more than a marketplace – we're the bridge between imagination and reality, 
              connecting creators with the tools, services, and community they need to build the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Explore Products
              </Link>
              <Link href="/3d-printing" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We believe that everyone should have access to the tools and knowledge needed to bring their ideas to life. 
                From hobbyists to enterprises, we're democratizing manufacturing and empowering the next generation of creators.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Accessible Innovation</h3>
                    <p className="text-gray-600">Making advanced manufacturing accessible to creators worldwide</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality First</h3>
                    <p className="text-gray-600">Curating only the best tools and services for our community</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Community</h3>
                    <p className="text-gray-600">Building connections between makers across the globe</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src="https://via.placeholder.com/600x450/3B82F6/FFFFFF?text=Mission"
                  alt="MakrX Mission"
                  width={600}
                  height={450}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and shape our culture
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a simple idea to a global platform transforming manufacturing
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="text-sm font-semibold text-blue-600 mb-1">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals driving innovation in manufacturing
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {member.bio}
                </p>
                <div className="flex justify-center space-x-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions about our platform or want to partner with us? We'd love to hear from you.
              </p>
              <div className="space-y-6">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Headquarters</h4>
                    <p className="text-gray-600">San Francisco, CA</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">hello@makrx.store</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of makers who are already building the future with MakrX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/3d-printing" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
