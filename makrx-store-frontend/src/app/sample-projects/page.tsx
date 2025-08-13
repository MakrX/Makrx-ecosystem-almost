"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Eye,
  Clock,
  User,
  Heart,
  Share2,
  Filter,
  Search,
  Grid,
  List,
  Star,
  Bookmark,
  Play,
  FileText,
  Package,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  creator: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeToComplete: string;
  likes: number;
  downloads: number;
  images: string[];
  tags: string[];
  materials: string[];
  tools: string[];
  featured: boolean;
  tutorial?: boolean;
  createdAt: string;
}

export default function SampleProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    "all",
    "Home & Garden",
    "Toys & Games",
    "Electronics",
    "Art & Design",
    "Tools & Gadgets",
    "Fashion & Jewelry",
    "Educational",
    "Prototypes",
  ];

  const projects: Project[] = [
    {
      id: "1",
      title: "Modular Desk Organizer",
      description:
        "A customizable desk organizer system with interchangeable compartments for pens, papers, and gadgets.",
      creator: "DesignMaster",
      category: "Home & Garden",
      difficulty: "Beginner",
      timeToComplete: "2-3 hours",
      likes: 1250,
      downloads: 3420,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["functional", "office", "modular", "organizer"],
      materials: ["PLA", "PETG"],
      tools: ["3D Printer", "Sandpaper"],
      featured: true,
      tutorial: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Articulated Dragon",
      description:
        "A fully articulated dragon model that moves and poses beautifully. Perfect for decoration or gifts.",
      creator: "MythMaker",
      category: "Toys & Games",
      difficulty: "Advanced",
      timeToComplete: "8-10 hours",
      likes: 2840,
      downloads: 5120,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["articulated", "dragon", "decorative", "complex"],
      materials: ["PLA", "TPU"],
      tools: ["3D Printer", "Support removal tools"],
      featured: true,
      tutorial: false,
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      title: "Smart Phone Stand with Wireless Charging",
      description:
        "An elegant phone stand with built-in wireless charging capability and adjustable viewing angles.",
      creator: "TechCrafter",
      category: "Electronics",
      difficulty: "Intermediate",
      timeToComplete: "4-5 hours",
      likes: 980,
      downloads: 2340,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["phone", "wireless", "charging", "stand"],
      materials: ["PETG", "ABS"],
      tools: ["3D Printer", "Wireless charging coil", "Soldering iron"],
      featured: false,
      tutorial: true,
      createdAt: "2024-02-01",
    },
    {
      id: "4",
      title: "Geometric Wall Art",
      description:
        "Modern geometric wall art pieces that can be arranged in countless patterns.",
      creator: "ArtisticVision",
      category: "Art & Design",
      difficulty: "Beginner",
      timeToComplete: "1-2 hours",
      likes: 750,
      downloads: 1890,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["wall art", "geometric", "modern", "decorative"],
      materials: ["PLA", "Wood PLA"],
      tools: ["3D Printer", "Wall mounting hardware"],
      featured: false,
      tutorial: false,
      createdAt: "2024-02-10",
    },
    {
      id: "5",
      title: "Multi-tool Key Organizer",
      description:
        "Compact key organizer with built-in tools including bottle opener, screwdriver, and ruler.",
      creator: "UtilityPro",
      category: "Tools & Gadgets",
      difficulty: "Intermediate",
      timeToComplete: "3-4 hours",
      likes: 1450,
      downloads: 2780,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["keys", "tools", "edc", "utility"],
      materials: ["PETG", "TPU"],
      tools: ["3D Printer", "Metal inserts", "Assembly tools"],
      featured: true,
      tutorial: true,
      createdAt: "2024-02-15",
    },
    {
      id: "6",
      title: "Customizable Jewelry Box",
      description:
        "Elegant jewelry box with customizable compartments and soft-close hinges.",
      creator: "JewelCraft",
      category: "Fashion & Jewelry",
      difficulty: "Advanced",
      timeToComplete: "6-8 hours",
      likes: 890,
      downloads: 1560,
      images: ["https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project", "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Project"],
      tags: ["jewelry", "box", "storage", "elegant"],
      materials: ["Wood PLA", "Silk PLA"],
      tools: ["3D Printer", "Hinges", "Felt lining"],
      featured: false,
      tutorial: true,
      createdAt: "2024-02-20",
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === "all" || project.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || project.difficulty === selectedDifficulty;
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "downloads":
        return b.downloads - a.downloads;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sample Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover amazing 3D printing projects created by our community.
            Download models, follow tutorials, and get inspired for your next
            creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Upload Your Project
            </Link>
            <Link
              href="/3d-printing"
              className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Start Printing
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Award className="h-6 w-6 text-yellow-500 mr-2" />
              Featured Projects
            </h2>
            <Link
              href="#all-projects"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects
              .filter((p) => p.featured)
              .slice(0, 3)
              .map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative">
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 text-xs font-bold rounded">
                        FEATURED
                      </span>
                    </div>
                    {project.tutorial && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          Tutorial
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {project.creator}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}
                      >
                        {project.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {project.likes}
                        </span>
                        <span className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {project.downloads}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section id="all-projects" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">
              All Projects ({sortedProjects.length})
            </h2>

            {/* View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloaded</option>
              <option value="newest">Newest</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>

          {/* Projects Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative">
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {project.tutorial && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          Tutorial
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}
                      >
                        {project.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {project.creator}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.timeToComplete}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {project.likes}
                        </span>
                        <span className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {project.downloads}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex">
                    <div className="w-48 h-32 bg-gray-100 relative flex-shrink-0">
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">
                              {project.title}
                            </h3>
                            {project.tutorial && (
                              <span className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
                                <Play className="h-3 w-3 mr-1" />
                                Tutorial
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {project.creator}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {project.timeToComplete}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}
                            >
                              {project.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {project.likes}
                            </span>
                            <span className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {project.downloads}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                              <Bookmark className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {sortedProjects.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <Link
                href="/upload"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Upload Your Project
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Share Your Creations
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join our community of makers and inspire others with your projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upload Project
            </Link>
            <Link
              href="/3d-printing"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Start Printing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
