import React from 'react';
import { Calendar, User, Tag } from 'lucide-react';

export default function Blog() {
  // Mock blog posts
  const posts = [
    {
      id: 1,
      title: "The Future of Digital Manufacturing in India",
      excerpt: "Exploring how digital fabrication is transforming the maker ecosystem and enabling rapid innovation across industries.",
      author: "Team MakrX",
      date: "2024-01-15",
      category: "Industry Insights",
      image: "/blog/manufacturing-future.jpg"
    },
    {
      id: 2,
      title: "Building Your First IoT Project: A Complete Guide",
      excerpt: "Step-by-step tutorial on creating connected devices using Arduino, sensors, and cloud platforms available through MakrX.",
      author: "Priya Sharma",
      date: "2024-01-10",
      category: "Tutorials",
      image: "/blog/iot-guide.jpg"
    },
    {
      id: 3,
      title: "Spotlight: Mumbai Makerspace Success Story",
      excerpt: "How TechSpace Mumbai transformed from a small community workshop to a thriving innovation hub using MakrCave.",
      author: "Raj Kumar",
      date: "2024-01-05",
      category: "Success Stories",
      image: "/blog/mumbai-makerspace.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            MakrX Blog
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Insights, tutorials, and stories from the maker community. 
            Stay updated with the latest in digital fabrication and innovation.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Blog Image</span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {post.category}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3 hover:text-makrx-blue transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <button className="text-makrx-blue font-medium hover:text-blue-700 transition-colors">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-makrx-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-makrx-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/90 mb-8">
            Get the latest maker insights, tutorials, and community stories delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-makrx-yellow"
            />
            <button className="px-6 py-3 bg-makrx-yellow text-makrx-blue font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
