"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  Play,
  Pause,
  Check,
  X,
  Clock,
  Settings,
  FileText,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";

interface ServiceJob {
  id: string;
  jobNumber: string;
  customerName: string;
  customerEmail: string;
  service: string;
  fileName: string;
  material: string;
  quantity: number;
  status:
    | "queued"
    | "printing"
    | "post-processing"
    | "quality-check"
    | "completed"
    | "failed"
    | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo?: string;
  dateSubmitted: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  printTime: string;
  price: number;
  specifications: {
    layerHeight: string;
    infill: string;
    supports: boolean;
    quality: string;
  };
  progress: number;
  notes?: string;
}

const mockServiceJobs: ServiceJob[] = [
  {
    id: "1",
    jobNumber: "SJ-2024-001",
    customerName: "Alex Chen",
    customerEmail: "alex.chen@email.com",
    service: "3D Printing",
    fileName: "custom_bracket.stl",
    material: "PLA+",
    quantity: 2,
    status: "printing",
    priority: "normal",
    assignedTo: "Tech Station 1",
    dateSubmitted: "2024-01-15T10:30:00",
    estimatedCompletion: "2024-01-16T14:00:00",
    printTime: "8h 45m",
    price: 45.99,
    specifications: {
      layerHeight: "0.2mm",
      infill: "20%",
      supports: true,
      quality: "Standard",
    },
    progress: 65,
    notes: "Customer requested blue color",
  },
  {
    id: "2",
    jobNumber: "SJ-2024-002",
    customerName: "Maria Rodriguez",
    customerEmail: "maria.r@email.com",
    service: "3D Printing",
    fileName: "prototype_housing.stl",
    material: "PETG",
    quantity: 1,
    status: "queued",
    priority: "high",
    assignedTo: undefined,
    dateSubmitted: "2024-01-14T16:45:00",
    estimatedCompletion: "2024-01-17T10:00:00",
    printTime: "12h 30m",
    price: 89.5,
    specifications: {
      layerHeight: "0.15mm",
      infill: "25%",
      supports: false,
      quality: "High",
    },
    progress: 0,
    notes: "Rush order - customer needs by Friday",
  },
  {
    id: "3",
    jobNumber: "SJ-2024-003",
    customerName: "David Johnson",
    customerEmail: "david.j@email.com",
    service: "CNC Machining",
    fileName: "aluminum_plate.step",
    material: "Aluminum 6061",
    quantity: 5,
    status: "post-processing",
    priority: "normal",
    assignedTo: "CNC Station A",
    dateSubmitted: "2024-01-13T09:15:00",
    estimatedCompletion: "2024-01-15T17:00:00",
    printTime: "4h 20m",
    price: 234.75,
    specifications: {
      layerHeight: "N/A",
      infill: "N/A",
      supports: false,
      quality: "Precision",
    },
    progress: 85,
    notes: "Anodizing required after machining",
  },
  {
    id: "4",
    jobNumber: "SJ-2024-004",
    customerName: "Lisa Wong",
    customerEmail: "lisa.w@email.com",
    service: "3D Printing",
    fileName: "miniature_set.stl",
    material: "Resin (Clear)",
    quantity: 10,
    status: "completed",
    priority: "low",
    assignedTo: "Resin Station 1",
    dateSubmitted: "2024-01-12T14:20:00",
    estimatedCompletion: "2024-01-14T12:00:00",
    actualCompletion: "2024-01-14T11:30:00",
    printTime: "6h 15m",
    price: 156.25,
    specifications: {
      layerHeight: "0.05mm",
      infill: "Solid",
      supports: true,
      quality: "Ultra High",
    },
    progress: 100,
  },
  {
    id: "5",
    jobNumber: "SJ-2024-005",
    customerName: "Robert Smith",
    customerEmail: "robert.s@email.com",
    service: "Laser Cutting",
    fileName: "acrylic_panels.dxf",
    material: "Acrylic 3mm",
    quantity: 8,
    status: "failed",
    priority: "urgent",
    assignedTo: "Laser Station B",
    dateSubmitted: "2024-01-11T11:00:00",
    estimatedCompletion: "2024-01-12T15:00:00",
    printTime: "2h 45m",
    price: 78.9,
    specifications: {
      layerHeight: "N/A",
      infill: "N/A",
      supports: false,
      quality: "Standard",
    },
    progress: 0,
    notes: "Material defect detected - need to reorder acrylic",
  },
];

export default function AdminServices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateSubmitted");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = mockServiceJobs.filter((job) => {
      const matchesSearch =
        job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;
      const matchesService =
        serviceFilter === "all" || job.service === serviceFilter;
      const matchesPriority =
        priorityFilter === "all" || job.priority === priorityFilter;

      return (
        matchesSearch && matchesStatus && matchesService && matchesPriority
      );
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ServiceJob];
      let bValue: any = b[sortBy as keyof ServiceJob];

      if (sortBy === "dateSubmitted" || sortBy === "estimatedCompletion") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [
    searchTerm,
    statusFilter,
    serviceFilter,
    priorityFilter,
    sortBy,
    sortOrder,
  ]);

  const getStatusIcon = (status: ServiceJob["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="w-4 h-4" />;
      case "printing":
        return <Printer className="w-4 h-4" />;
      case "post-processing":
        return <Settings className="w-4 h-4" />;
      case "quality-check":
        return <Eye className="w-4 h-4" />;
      case "completed":
        return <Check className="w-4 h-4" />;
      case "failed":
        return <X className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ServiceJob["status"]) => {
    switch (status) {
      case "queued":
        return "bg-gray-100 text-gray-800";
      case "printing":
        return "bg-blue-100 text-blue-800";
      case "post-processing":
        return "bg-yellow-100 text-yellow-800";
      case "quality-check":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: ServiceJob["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const handleSelectAll = () => {
    setSelectedJobs(
      selectedJobs.length === filteredAndSortedJobs.length
        ? []
        : filteredAndSortedJobs.map((job) => job.id),
    );
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Jobs</h1>
              <p className="text-gray-600 mt-2">
                Manage 3D printing, CNC, and laser cutting jobs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Queued</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockServiceJobs.filter((j) => j.status === "queued").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    mockServiceJobs.filter((j) =>
                      ["printing", "post-processing", "quality-check"].includes(
                        j.status,
                      ),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    mockServiceJobs.filter((j) => j.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockServiceJobs.filter((j) => j.status === "failed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {mockServiceJobs
                    .filter((j) => j.status === "completed")
                    .reduce((sum, j) => sum + j.price, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs, customers, files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="queued">Queued</option>
                <option value="printing">Printing</option>
                <option value="post-processing">Post-Processing</option>
                <option value="quality-check">Quality Check</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Services</option>
                <option value="3D Printing">3D Printing</option>
                <option value="CNC Machining">CNC Machining</option>
                <option value="Laser Cutting">Laser Cutting</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedJobs.length} job(s) selected
              </span>
              <div className="flex items-center space-x-3">
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Update Status
                </button>
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Assign Technician
                </button>
                <button className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded">
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedJobs.length === filteredAndSortedJobs.length &&
                        filteredAndSortedJobs.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("jobNumber")}
                  >
                    <div className="flex items-center">
                      Job
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File & Service
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("dateSubmitted")}
                  >
                    <div className="flex items-center">
                      Submitted
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.jobNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.quantity} × {job.material}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.service}
                        </div>
                        {job.assignedTo && (
                          <div className="text-sm text-blue-600">
                            {job.assignedTo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(job.dateSubmitted)}
                      </div>
                      {job.estimatedCompletion && (
                        <div className="text-sm text-gray-500">
                          Est: {formatDateTime(job.estimatedCompletion)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">
                          {job.status.replace("-", " ")}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {job.progress}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {job.printTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(job.priority)}`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${job.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/services/${job.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {job.status === "printing" && (
                          <button className="text-orange-600 hover:text-orange-900">
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === "queued" && (
                          <button className="text-green-600 hover:text-green-900">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedJobs.length === 0 && (
            <div className="text-center py-12">
              <Printer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No service jobs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAndSortedJobs.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {filteredAndSortedJobs.length} of {mockServiceJobs.length}{" "}
              jobs
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
