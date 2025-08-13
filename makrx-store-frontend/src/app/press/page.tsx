"use client";

import { useState } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Image,
  Mail,
  Phone,
  Users,
  Award,
  TrendingUp,
  Globe,
} from "lucide-react";

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  downloadUrl?: string;
}

interface MediaKit {
  type: "logo" | "photo" | "document";
  title: string;
  description: string;
  format: string;
  size: string;
  downloadUrl: string;
}

interface Award {
  title: string;
  organization: string;
  year: string;
  category: string;
}

const pressReleases: PressRelease[] = [
  {
    id: "1",
    title: "MakrX Raises $25M Series A to Democratize Manufacturing Access",
    date: "2024-01-15",
    excerpt:
      "Funding will accelerate global expansion of on-demand manufacturing platform and AI-powered quote generation system.",
    content:
      "MakrX, the leading platform for on-demand manufacturing services, today announced it has raised $25 million in Series A funding led by Andreessen Horowitz, with participation from existing investors including Y Combinator and Bessemer Venture Partners...",
    tags: ["Funding", "Series A", "Growth"],
  },
  {
    id: "2",
    title: "MakrX Launches AI-Powered Manufacturing Quote System",
    date: "2023-12-03",
    excerpt:
      "New system reduces quote time from days to minutes while improving accuracy by 40% through machine learning algorithms.",
    content:
      "MakrX today unveiled its revolutionary AI-powered quote generation system that instantly analyzes uploaded 3D models and provides accurate manufacturing quotes in under 60 seconds...",
    tags: ["Product", "AI", "Innovation"],
  },
  {
    id: "3",
    title:
      "MakrX Partners with Leading Universities for Maker Education Program",
    date: "2023-11-20",
    excerpt:
      "Partnership with MIT, Stanford, and UC Berkeley brings advanced manufacturing tools to 10,000+ students.",
    content:
      "MakrX announced partnerships with three leading universities to provide students with access to professional-grade manufacturing services through its educational platform...",
    tags: ["Education", "Partnership", "Universities"],
  },
  {
    id: "4",
    title: "MakrX Achieves Carbon Neutral Manufacturing Network",
    date: "2023-10-08",
    excerpt:
      "Company becomes first in industry to offset 100% of manufacturing emissions through renewable energy partnerships.",
    content:
      "MakrX today announced it has achieved carbon neutrality across its entire global manufacturing network, making it the first on-demand manufacturing platform to reach this milestone...",
    tags: ["Sustainability", "Environment", "Milestone"],
  },
  {
    id: "5",
    title: "MakrX Expands to European Market with €10M Investment",
    date: "2023-09-12",
    excerpt:
      "European expansion includes partnerships with 200+ manufacturers across Germany, France, and the Netherlands.",
    content:
      "MakrX announced its expansion into the European market with a €10 million investment from European VCs and strategic partnerships with leading manufacturers...",
    tags: ["Expansion", "Europe", "International"],
  },
];

const mediaKit: MediaKit[] = [
  {
    type: "logo",
    title: "MakrX Logo Package",
    description: "Official logos in various formats and colors",
    format: "ZIP (PNG, SVG, EPS)",
    size: "2.5 MB",
    downloadUrl: "#",
  },
  {
    type: "photo",
    title: "Executive Headshots",
    description: "High-resolution photos of leadership team",
    format: "ZIP (JPEG)",
    size: "15 MB",
    downloadUrl: "#",
  },
  {
    type: "photo",
    title: "Product Screenshots",
    description: "Platform interface and feature screenshots",
    format: "ZIP (PNG)",
    size: "8 MB",
    downloadUrl: "#",
  },
  {
    type: "document",
    title: "Company Fact Sheet",
    description: "Key statistics and company information",
    format: "PDF",
    size: "1.2 MB",
    downloadUrl: "#",
  },
  {
    type: "document",
    title: "Manufacturing Network Stats",
    description: "Global network statistics and capabilities",
    format: "PDF",
    size: "2.1 MB",
    downloadUrl: "#",
  },
];

const awards: Award[] = [
  {
    title: "Best Manufacturing Innovation",
    organization: "TechCrunch Disrupt",
    year: "2024",
    category: "Startup Battlefield Winner",
  },
  {
    title: "Sustainability Leadership Award",
    organization: "Manufacturing Institute",
    year: "2023",
    category: "Environmental Impact",
  },
  {
    title: "AI Excellence in Manufacturing",
    organization: "MIT Technology Review",
    year: "2023",
    category: "Innovators Under 35",
  },
  {
    title: "Forbes 30 Under 30",
    organization: "Forbes",
    year: "2023",
    category: "Manufacturing & Industry",
  },
];

const companyStats = [
  { label: "Manufacturing Partners", value: "500+", icon: Users },
  { label: "Countries Served", value: "25+", icon: Globe },
  { label: "Projects Completed", value: "100k+", icon: TrendingUp },
  { label: "Awards Won", value: "12+", icon: Award },
];

export default function PressPage() {
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(
    null,
  );

  const handleDownload = (item: MediaKit) => {
    console.log(`Downloading ${item.title}`);
    // Handle download
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Latest news, announcements, and media resources from MakrX.
              Building the future of accessible manufacturing technology.
            </p>

            {/* Company Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {companyStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Press Releases */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Latest Press Releases
            </h2>

            <div className="space-y-6">
              {pressReleases.map((release) => (
                <div
                  key={release.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRelease(release)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(release.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {release.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {release.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {release.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Read more →
                    </span>
                    {release.downloadUrl && (
                      <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Load More Press Releases
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Media Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Media Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Sarah Johnson
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      press@makrx.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      +1 (555) 123-4567
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Media Relations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Kit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Media Kit
              </h3>
              <div className="space-y-3">
                {mediaKit.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "logo" && (
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                      {item.type === "photo" && (
                        <Image className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {item.type === "document" && (
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.format} • {item.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Download Complete Kit
              </button>
            </div>

            {/* Awards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Awards & Recognition
              </h3>
              <div className="space-y-4">
                {awards.map((award, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {award.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {award.organization} • {award.year}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {award.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Press Updates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Get the latest press releases and company news delivered to your
                inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Press Release Modal */}
        {selectedRelease && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(selectedRelease.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRelease.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedRelease(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {selectedRelease.excerpt}
                  </p>
                  <div className="text-gray-700 dark:text-gray-300">
                    {selectedRelease.content}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    {selectedRelease.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <ExternalLink className="w-4 h-4" />
                      Share
                    </button>
                    {selectedRelease.downloadUrl && (
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
