import React from 'react';
import { Download, ExternalLink, Calendar, Users } from 'lucide-react';

export default function Press() {
  const mediaKit = [
    {
      name: "MakrX Logo Pack",
      description: "High-resolution logos in various formats (PNG, SVG, EPS)",
      size: "2.4 MB",
      downloadUrl: "/press/makrx-logo-pack.zip"
    },
    {
      name: "Product Screenshots",
      description: "High-quality screenshots of all MakrX applications",
      size: "15.8 MB",
      downloadUrl: "/press/product-screenshots.zip"
    },
    {
      name: "Company Fact Sheet",
      description: "Key statistics, timeline, and company information",
      size: "1.2 MB",
      downloadUrl: "/press/makrx-fact-sheet.pdf"
    },
    {
      name: "Executive Photos",
      description: "Professional headshots of leadership team",
      size: "8.5 MB",
      downloadUrl: "/press/executive-photos.zip"
    }
  ];

  const mediaMentions = [
    {
      publication: "TechCrunch India",
      title: "MakrX Raises $5M to Democratize Digital Manufacturing in India",
      date: "2024-01-20",
      url: "#"
    },
    {
      publication: "The Economic Times",
      title: "Startup Spotlight: How MakrX is Transforming India's Maker Ecosystem",
      date: "2024-01-15",
      url: "#"
    },
    {
      publication: "YourStory",
      title: "From Idea to Reality: MakrX's Vision for Connected Makerspaces",
      date: "2024-01-10",
      url: "#"
    },
    {
      publication: "Inc42",
      title: "The Future of Manufacturing: MakrX's Digital-First Approach",
      date: "2024-01-05",
      url: "#"
    }
  ];

  const companyBoilerplate = `
MakrX is India's leading digital manufacturing platform that connects creators, makerspaces, and service providers through an integrated ecosystem of tools and services. Founded in 2023, MakrX operates MakrCave (makerspace management), MakrX.Store (marketplace for tools and components), and 3D.MakrX.Store (custom fabrication platform).

The company serves over 100,000 active users across 50+ cities in India, facilitating millions of dollars in transactions annually. MakrX is backed by leading investors and is headquartered in Bangalore with offices in Mumbai and Delhi.

Key Statistics:
• 50+ Partner Makerspaces
• 100K+ Active Users  
• 1M+ Projects Created
• 25+ Cities Served
• Founded: 2023
• Headquarters: Bangalore, India
• Funding: Series A ($5M)
  `;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Press & Media
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-8">
            Resources, news, and updates about MakrX. For media inquiries, 
            please contact our press team at press@makrx.org
          </p>
          <div className="text-center">
            <a
              href="mailto:press@makrx.org"
              className="inline-flex items-center px-6 py-3 bg-makrx-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Press Team
            </a>
          </div>
        </div>
      </section>

      {/* Press Kit */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Media Kit</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {mediaKit.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.size}</span>
                  <a
                    href={item.downloadUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-makrx-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Boilerplate */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Company Boilerplate</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {companyBoilerplate.trim()}
              </pre>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => navigator.clipboard.writeText(companyBoilerplate.trim())}
                className="px-6 py-2 border border-makrx-blue text-makrx-blue rounded-lg font-medium hover:bg-makrx-blue hover:text-white transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Media Mentions */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Recent Media Mentions</h2>
          
          <div className="space-y-6">
            {mediaMentions.map((mention, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-makrx-blue">{mention.publication}</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(mention.date).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{mention.title}</h3>
                  </div>
                  
                  <div className="md:ml-8">
                    <a
                      href={mention.url}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Read Article
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Leadership Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adit Luthra</h3>
              <p className="text-gray-600 mb-3">Founder & CEO</p>
              <p className="text-sm text-gray-500">
                Former product leader with 10+ years experience in digital platforms and manufacturing technology.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dr. Priya Sharma</h3>
              <p className="text-gray-600 mb-3">CTO</p>
              <p className="text-sm text-gray-500">
                PhD in Computer Science, expert in distributed systems and IoT platforms for industrial applications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rajesh Kumar</h3>
              <p className="text-gray-600 mb-3">VP of Operations</p>
              <p className="text-sm text-gray-500">
                15+ years in supply chain and operations, previously led manufacturing operations at major tech companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-makrx-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Media Inquiries
          </h2>
          <p className="text-xl text-white/90 mb-8">
            For interviews, comments, or additional information, please reach out to our press team.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="mailto:press@makrx.org"
              className="px-8 py-4 bg-makrx-yellow text-makrx-blue font-semibold rounded-xl hover:bg-yellow-300 transition-colors"
            >
              press@makrx.org
            </a>
            <a
              href="tel:+918047258000"
              className="px-8 py-4 border border-white text-white font-semibold rounded-xl hover:bg-white hover:text-makrx-blue transition-colors"
            >
              +91 80472 58000
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
