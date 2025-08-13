"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Zap,
  Heart,
  Trophy,
  Globe,
  ChevronRight,
  Mail,
  ExternalLink,
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  level: "Entry" | "Mid" | "Senior" | "Lead";
  salary: string;
  description: string;
  requirements: string[];
  posted: string;
  remote: boolean;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

const jobListings: JobListing[] = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    level: "Senior",
    salary: "$140k - $180k",
    description:
      "Join our engineering team to build the next generation of maker tools and platforms. You'll work on our core platform, API services, and frontend applications.",
    requirements: [
      "5+ years experience with React/Node.js",
      "Experience with TypeScript and modern web technologies",
      "Knowledge of cloud platforms (AWS/GCP)",
      "Understanding of manufacturing processes is a plus",
    ],
    posted: "2 days ago",
    remote: true,
  },
  {
    id: "2",
    title: "Manufacturing Engineer",
    department: "Operations",
    location: "Austin, TX",
    type: "Full-time",
    level: "Mid",
    salary: "$85k - $110k",
    description:
      "Drive manufacturing process optimization and quality improvement across our global network of manufacturing partners.",
    requirements: [
      "3+ years in manufacturing engineering",
      "Experience with 3D printing, CNC, or injection molding",
      "Strong analytical and problem-solving skills",
      "Lean manufacturing knowledge preferred",
    ],
    posted: "1 week ago",
    remote: false,
  },
  {
    id: "3",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    level: "Mid",
    salary: "$90k - $120k",
    description:
      "Shape the user experience of our platforms used by makers worldwide. Design intuitive interfaces for complex manufacturing workflows.",
    requirements: [
      "4+ years of product design experience",
      "Proficiency in Figma, Sketch, or similar tools",
      "Experience with design systems",
      "Understanding of manufacturing or technical products",
    ],
    posted: "3 days ago",
    remote: true,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Seattle, WA",
    type: "Full-time",
    level: "Senior",
    salary: "$130k - $160k",
    description:
      "Build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems that support millions of users globally.",
    requirements: [
      "5+ years DevOps/SRE experience",
      "Expertise with Kubernetes, Docker, and cloud platforms",
      "Experience with monitoring and observability tools",
      "Infrastructure as Code (Terraform, CloudFormation)",
    ],
    posted: "5 days ago",
    remote: true,
  },
  {
    id: "5",
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "New York, NY",
    type: "Full-time",
    level: "Mid",
    salary: "$70k - $95k",
    description:
      "Help our enterprise customers succeed with MakrX platforms. Drive adoption, retention, and expansion of our manufacturing services.",
    requirements: [
      "3+ years in customer success or account management",
      "Experience with B2B SaaS products",
      "Strong communication and problem-solving skills",
      "Manufacturing or technical background preferred",
    ],
    posted: "1 week ago",
    remote: true,
  },
  {
    id: "6",
    title: "Engineering Intern",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Internship",
    level: "Entry",
    salary: "$25 - $35/hour",
    description:
      "Join our summer internship program and work on real projects that impact thousands of makers. Mentorship and learning opportunities included.",
    requirements: [
      "Currently pursuing Computer Science or related degree",
      "Knowledge of web technologies (React, Node.js preferred)",
      "Passion for making and manufacturing",
      "Strong problem-solving skills",
    ],
    posted: "2 weeks ago",
    remote: false,
  },
];

const teamMembers: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "CEO & Founder",
    image: "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Team",
    bio: "Former SpaceX manufacturing engineer with a passion for democratizing access to manufacturing technology.",
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    image: "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Team",
    bio: "Tech veteran with 15 years building scalable platforms. Previously at Google and Uber.",
  },
  {
    name: "Emily Park",
    role: "Head of Design",
    image: "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Team",
    bio: "Design leader focused on creating intuitive experiences for complex manufacturing workflows.",
  },
  {
    name: "David Kim",
    role: "VP Engineering",
    image: "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Team",
    bio: "Engineering leader who believes in the power of automation to transform manufacturing.",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health, dental, and vision insurance. Mental health support and wellness stipends.",
  },
  {
    icon: Globe,
    title: "Remote First",
    description:
      "Work from anywhere with flexible hours. We provide home office setup and co-working stipends.",
  },
  {
    icon: Trophy,
    title: "Growth & Learning",
    description:
      "Professional development budget, conference attendance, and internal learning programs.",
  },
  {
    icon: DollarSign,
    title: "Competitive Package",
    description:
      "Competitive salary, equity participation, and performance bonuses.",
  },
  {
    icon: Clock,
    title: "Time Off",
    description:
      "Unlimited PTO policy and company-wide maker weeks for passion projects.",
  },
  {
    icon: Users,
    title: "Inclusive Culture",
    description:
      "Diverse team committed to building an inclusive workplace where everyone can thrive.",
  },
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const departments = [
    "All",
    "Engineering",
    "Design",
    "Operations",
    "Customer Success",
  ];
  const locations = [
    "All",
    "Remote",
    "San Francisco, CA",
    "Austin, TX",
    "Seattle, WA",
    "New York, NY",
  ];

  const filteredJobs = jobListings.filter((job) => {
    const departmentMatch =
      selectedDepartment === "All" || job.department === selectedDepartment;
    const locationMatch =
      selectedLocation === "All" ||
      (selectedLocation === "Remote" && job.remote) ||
      job.location === selectedLocation;
    return departmentMatch && locationMatch;
  });

  const handleApply = (jobId: string) => {
    console.log(`Applying for job ${jobId}`);
    // Handle job application
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join the MakrX Team
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Help us build the future of manufacturing. We're looking for
              passionate individuals who want to democratize access to making
              and manufacturing worldwide.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>50+ Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Remote First</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Fast Growing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Work at MakrX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Open Positions ({filteredJobs.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                        {job.remote && " (Remote)"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                      {job.level}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {job.posted}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {job.description}
                </p>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Requirements:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      careers@makrx.com
                    </span>
                  </div>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Don't See the Right Role?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're always looking for talented individuals who share our
              passion for making. Send us your resume and tell us how you'd like
              to contribute to MakrX.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="mailto:careers@makrx.com"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Your Resume
              </a>
              <a
                href="#"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Our Values
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
