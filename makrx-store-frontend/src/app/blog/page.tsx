"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Cog,
  ChevronRight,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  imageUrl: string;
}

interface Category {
  name: string;
  count: number;
  icon: any;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of On-Demand Manufacturing: Trends to Watch in 2024",
    excerpt:
      "Explore the emerging trends that are reshaping the manufacturing landscape, from AI-powered design optimization to sustainable production methods.",
    content:
      "The manufacturing industry is undergoing a dramatic transformation...",
    author: {
      name: "Sarah Chen",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "CEO & Founder",
    },
    date: "2024-01-20",
    readTime: "8 min read",
    category: "Industry Insights",
    tags: ["Manufacturing", "AI", "Trends", "Sustainability"],
    featured: true,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
  {
    id: "2",
    title:
      "Design for Manufacturing: 10 Tips to Reduce Costs and Improve Quality",
    excerpt:
      "Learn practical design principles that can significantly reduce manufacturing costs while improving product quality and reliability.",
    content: "Design for Manufacturing (DFM) is a critical consideration...",
    author: {
      name: "Marcus Rodriguez",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "CTO",
    },
    date: "2024-01-15",
    readTime: "12 min read",
    category: "Design & Engineering",
    tags: ["DFM", "Cost Reduction", "Quality", "Best Practices"],
    featured: true,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
  {
    id: "3",
    title: "Case Study: How Startup XYZ Reduced Prototyping Costs by 70%",
    excerpt:
      "A detailed look at how one startup leveraged our platform to dramatically reduce their prototyping costs and accelerate time to market.",
    content: "Startup XYZ came to us with a challenge...",
    author: {
      name: "Emily Park",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "Head of Customer Success",
    },
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Case Studies",
    tags: ["Startup", "Prototyping", "Cost Reduction", "Success Story"],
    featured: false,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
  {
    id: "4",
    title: "Understanding Material Properties: A Guide for Makers",
    excerpt:
      "Comprehensive guide to selecting the right materials for your projects, covering everything from plastics to metals to composites.",
    content: "Material selection is one of the most critical decisions...",
    author: {
      name: "Dr. James Wilson",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "Materials Engineer",
    },
    date: "2024-01-08",
    readTime: "15 min read",
    category: "Technical Guides",
    tags: ["Materials", "Properties", "Selection", "Engineering"],
    featured: false,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
  {
    id: "5",
    title: "Sustainability in Manufacturing: Our Carbon Neutral Journey",
    excerpt:
      "Learn about our journey to achieve carbon neutrality and how sustainable manufacturing practices benefit both business and environment.",
    content: "Sustainability has been a core value at MakrX since day one...",
    author: {
      name: "Lisa Thompson",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "Sustainability Director",
    },
    date: "2024-01-05",
    readTime: "10 min read",
    category: "Sustainability",
    tags: [
      "Sustainability",
      "Carbon Neutral",
      "Environment",
      "Green Manufacturing",
    ],
    featured: false,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
  {
    id: "6",
    title: "Getting Started with 3D Printing: A Beginner's Complete Guide",
    excerpt:
      "Everything you need to know to start your 3D printing journey, from choosing your first printer to mastering advanced techniques.",
    content: "3D printing has revolutionized the way we create...",
    author: {
      name: "Alex Kumar",
      avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=A",
      role: "Community Manager",
    },
    date: "2024-01-03",
    readTime: "20 min read",
    category: "Tutorials",
    tags: ["3D Printing", "Beginner", "Tutorial", "Getting Started"],
    featured: false,
    imageUrl: "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Blog",
  },
];

const categories: Category[] = [
  { name: "All Posts", count: blogPosts.length, icon: BookOpen },
  { name: "Industry Insights", count: 8, icon: TrendingUp },
  { name: "Design & Engineering", count: 12, icon: Cog },
  { name: "Case Studies", count: 6, icon: Lightbulb },
  { name: "Technical Guides", count: 15, icon: BookOpen },
  { name: "Tutorials", count: 10, icon: BookOpen },
  { name: "Sustainability", count: 4, icon: TrendingUp },
];

const featuredTopics = [
  "Manufacturing Trends",
  "Design for Manufacturing",
  "3D Printing",
  "CNC Machining",
  "Sustainability",
  "AI in Manufacturing",
  "Prototyping",
  "Material Science",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts = blogPosts.filter((post) => {
    const categoryMatch =
      selectedCategory === "All Posts" || post.category === selectedCategory;
    const searchMatch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return categoryMatch && searchMatch;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              MakrX Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Insights, tutorials, and stories from the world of manufacturing.
              Learn from our experts and community of makers.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedCategory === category.name
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-xs">{category.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Popular Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {featuredTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSearchTerm(topic)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Get the latest articles and insights delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {selectedCategory === "All Posts" && featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(post.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {post.author.name}
                            </span>
                          </div>
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory === "All Posts"
                    ? "Latest Articles"
                    : selectedCategory}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredPosts.length} articles
                </span>
              </div>

              <div className="space-y-6">
                {regularPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex gap-6">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(post.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="text-sm">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {post.author.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 ml-1">
                                • {post.author.role}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                  Load More Articles
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  ✕
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {selectedPost.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(selectedPost.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedPost.readTime}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedPost.title}
                </h1>

                <div className="flex items-center gap-3 mb-6 pb-6 border-b dark:border-gray-600">
                  <img
                    src={selectedPost.author.avatar}
                    alt={selectedPost.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedPost.author.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPost.author.role}
                    </p>
                  </div>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {selectedPost.excerpt}
                  </p>
                  <div className="text-gray-700 dark:text-gray-300">
                    {selectedPost.content}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-8 pt-6 border-t dark:border-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
