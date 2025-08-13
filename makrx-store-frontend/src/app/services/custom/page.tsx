"use client";

import { useState } from "react";
import {
  Upload,
  Cog,
  Factory,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

interface ServiceCategory {
  name: string;
  description: string;
  icon: any;
  capabilities: string[];
  applications: string[];
  leadTime: string;
  minOrder: string;
}

interface ProjectStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    name: "Injection Molding",
    description: "High-volume plastic parts with excellent surface finish",
    icon: Factory,
    capabilities: [
      "Thermoplastic materials",
      "Multi-cavity molds",
      "Insert molding",
      "Overmolding",
    ],
    applications: [
      "Consumer products",
      "Automotive parts",
      "Medical devices",
      "Electronics housings",
    ],
    leadTime: "4-8 weeks",
    minOrder: "1,000 pcs",
  },
  {
    name: "Die Casting",
    description: "Precision metal parts with tight tolerances",
    icon: Cog,
    capabilities: [
      "Aluminum, zinc, magnesium",
      "Thin wall sections",
      "Complex geometries",
      "Secondary machining",
    ],
    applications: [
      "Automotive components",
      "Aerospace parts",
      "Electronic enclosures",
      "Hardware",
    ],
    leadTime: "6-12 weeks",
    minOrder: "500 pcs",
  },
  {
    name: "Sheet Metal Fabrication",
    description: "Custom metal enclosures and structural components",
    icon: Shield,
    capabilities: [
      "Laser cutting",
      "CNC punching",
      "Forming/bending",
      "Welding assembly",
    ],
    applications: [
      "Enclosures",
      "Brackets",
      "Chassis",
      "Architectural elements",
    ],
    leadTime: "2-4 weeks",
    minOrder: "50 pcs",
  },
  {
    name: "Composite Manufacturing",
    description:
      "Carbon fiber and fiberglass parts for high-performance applications",
    icon: Zap,
    capabilities: [
      "Carbon fiber",
      "Fiberglass",
      "Prepreg materials",
      "Vacuum infusion",
    ],
    applications: [
      "Aerospace",
      "Automotive racing",
      "Sports equipment",
      "Drones",
    ],
    leadTime: "3-6 weeks",
    minOrder: "25 pcs",
  },
];

const projectSteps: ProjectStep[] = [
  {
    step: 1,
    title: "Project Consultation",
    description:
      "Discuss your requirements, timeline, and budget with our engineering team",
    duration: "1-2 days",
  },
  {
    step: 2,
    title: "Design for Manufacturing",
    description:
      "Optimize your design for production efficiency and cost-effectiveness",
    duration: "3-5 days",
  },
  {
    step: 3,
    title: "Prototype & Testing",
    description:
      "Create functional prototypes to validate design and manufacturing process",
    duration: "1-3 weeks",
  },
  {
    step: 4,
    title: "Tooling & Setup",
    description:
      "Design and manufacture necessary tooling, fixtures, and production setup",
    duration: "2-8 weeks",
  },
  {
    step: 5,
    title: "Production & Quality",
    description:
      "Full-scale production with comprehensive quality control and testing",
    duration: "Varies",
  },
  {
    step: 6,
    title: "Delivery & Support",
    description:
      "Packaging, shipping, and ongoing production support as needed",
    duration: "1-2 weeks",
  },
];

export default function CustomManufacturingPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    description: "",
    quantity: "",
    timeline: "",
  });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
  };

  const handleSubmitRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("RFQ submitted:", { projectDetails, selectedCategory });
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Factory className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Custom Manufacturing Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From concept to production, we partner with manufacturers
              worldwide to bring your custom products to life. Injection
              molding, die casting, and specialized processes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Manufacturing Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Manufacturing Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory?.name === category.name
                      ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {category.description}
                      </p>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Capabilities:
                          </h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {category.capabilities.map((capability) => (
                              <li
                                key={capability}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {capability}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Applications:
                          </h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {category.applications.map((application) => (
                              <li
                                key={application}
                                className="flex items-center gap-2"
                              >
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                {application}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-600">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Lead time:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.leadTime}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Min order:{" "}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.minOrder}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Our Project Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {step.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{step.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RFQ Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Request for Quote (RFQ)
            </h2>

            <form onSubmit={handleSubmitRFQ} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectDetails.name}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={projectDetails.company}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={projectDetails.email}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={projectDetails.phone}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={projectDetails.description}
                  onChange={(e) =>
                    setProjectDetails((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your project, materials, specifications, and any special requirements..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Quantity
                  </label>
                  <input
                    type="text"
                    value={projectDetails.quantity}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 1,000 pcs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timeline
                  </label>
                  <select
                    value={projectDetails.timeline}
                    onChange={(e) =>
                      setProjectDetails((prev) => ({
                        ...prev,
                        timeline: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select timeline</option>
                    <option value="Rush (2-4 weeks)">Rush (2-4 weeks)</option>
                    <option value="Standard (4-8 weeks)">
                      Standard (4-8 weeks)
                    </option>
                    <option value="Extended (8+ weeks)">
                      Extended (8+ weeks)
                    </option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {selectedCategory && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Selected service: <strong>{selectedCategory.name}</strong>
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Submit RFQ
              </button>
            </form>
          </div>

          {/* File Upload & Contact */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Project Files
              </h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  CAD files, drawings, specifications, reference images
                </p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Choose Files
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      +1 (555) 123-4567
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mon-Fri 8AM-6PM PST
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      manufacturing@makrx.com
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Live Chat
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Available during business hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Why Choose MakrX Manufacturing?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Global network of certified manufacturers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Quality guarantee on all products
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Competitive pricing with transparent quotes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Dedicated project management support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
