"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload as UploadIcon,
  File,
  X,
  Check,
  AlertCircle,
  Info,
  Loader,
  Download,
  Eye,
  Calculator,
  Clock,
  DollarSign,
  Package,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  quote?: {
    price: number;
    material: string;
    print_time: string;
    volume: number;
  };
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("PLA");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [processingCount, setProcessingCount] = useState(0);

  const materials = [
    {
      id: "PLA",
      name: "PLA",
      description: "Biodegradable, easy to print",
      price_per_gram: 0.15,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "ABS",
      name: "ABS",
      description: "Strong, heat resistant",
      price_per_gram: 0.18,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "PETG",
      name: "PETG",
      description: "Chemical resistant, clear",
      price_per_gram: 0.22,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "TPU",
      name: "TPU",
      description: "Flexible, rubber-like",
      price_per_gram: 0.35,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  const qualities = [
    {
      id: "draft",
      name: "Draft (0.3mm)",
      description: "Fast, lower detail",
      time_multiplier: 0.7,
      price_multiplier: 0.8,
    },
    {
      id: "standard",
      name: "Standard (0.2mm)",
      description: "Balanced quality and speed",
      time_multiplier: 1.0,
      price_multiplier: 1.0,
    },
    {
      id: "fine",
      name: "Fine (0.1mm)",
      description: "High detail, slower",
      time_multiplier: 1.8,
      price_multiplier: 1.4,
    },
  ];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!isAuthenticated) {
        alert("Please sign in to upload files");
        login();
        return;
      }

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setProcessingCount((prev) => prev + newFiles.length);

      // Simulate file upload and processing
      for (const uploadFile of newFiles) {
        await processFile(uploadFile);
      }
    },
    [isAuthenticated, login],
  );

  const processFile = async (uploadFile: UploadedFile) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)),
        );
      }

      // Change to processing
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "processing", progress: 0 }
            : f,
        ),
      );

      // Simulate processing (file analysis)
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)),
        );
      }

      // Generate mock quote
      const materialData = materials.find((m) => m.id === selectedMaterial);
      const qualityData = qualities.find((q) => q.id === selectedQuality);

      const mockQuote = {
        price: Math.round((15 + Math.random() * 50) * 100) / 100,
        material: selectedMaterial,
        print_time: `${Math.round(2 + Math.random() * 8)}h ${Math.round(Math.random() * 60)}m`,
        volume: Math.round((5 + Math.random() * 45) * 100) / 100,
      };

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                quote: mockQuote,
              }
            : f,
        ),
      );
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: "Failed to process file",
              }
            : f,
        ),
      );
    } finally {
      setProcessingCount((prev) => prev - 1);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"],
      "model/3mf": [".3mf"],
      "model/ply": [".ply"],
    },
    maxFileSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const handleOrderAll = () => {
    const completedFiles = uploadedFiles.filter(
      (f) => f.status === "completed",
    );
    if (completedFiles.length > 0) {
      router.push("/checkout?source=3d-printing");
    }
  };

  const totalQuotePrice = uploadedFiles
    .filter((f) => f.status === "completed" && f.quote)
    .reduce((sum, f) => sum + (f.quote?.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload & Quote
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your 3D models and get instant quotes from our network of
            verified makers. Professional quality, competitive pricing, fast
            turnaround.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Files
              </h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive
                    ? "Drop files here"
                    : "Drag & drop your 3D files"}
                </h3>
                <p className="text-gray-600 mb-4">or click to browse files</p>
                <div className="text-sm text-gray-500">
                  Supports: STL, OBJ, 3MF, PLY • Max size: 100MB per file
                </div>
              </div>
            </div>

            {/* Material Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Material
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => setSelectedMaterial(material.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMaterial === material.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {material.name}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${material.color}`}
                      >
                        ${material.price_per_gram}/g
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {material.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Print Quality
              </h3>
              <div className="space-y-3">
                {qualities.map((quality) => (
                  <div
                    key={quality.id}
                    onClick={() => setSelectedQuality(quality.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuality === quality.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          {quality.name}
                        </span>
                        <p className="text-sm text-gray-600">
                          {quality.description}
                        </p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300">
                        {selectedQuality === quality.id && (
                          <div className="w-full h-full rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Files and Quotes */}
          <div className="space-y-6">
            {/* Processing Status */}
            {processingCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Loader className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Processing Files
                    </h4>
                    <p className="text-sm text-blue-700">
                      {processingCount} file{processingCount > 1 ? "s" : ""}{" "}
                      being analyzed...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    Uploaded Files
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {(file.status === "uploading" ||
                        file.status === "processing") && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>
                              {file.status === "uploading"
                                ? "Uploading..."
                                : "Analyzing..."}
                            </span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center text-sm">
                        {file.status === "completed" && (
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        {file.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`${
                            file.status === "completed"
                              ? "text-green-700"
                              : file.status === "error"
                                ? "text-red-700"
                                : "text-gray-600"
                          }`}
                        >
                          {file.status === "completed" && "Quote ready"}
                          {file.status === "error" &&
                            (file.error || "Processing failed")}
                          {file.status === "uploading" && "Uploading..."}
                          {file.status === "processing" &&
                            "Generating quote..."}
                        </span>
                      </div>

                      {/* Quote */}
                      {file.status === "completed" && file.quote && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 text-green-600 mr-1" />
                              <span className="font-medium">
                                ${file.quote.price}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 text-blue-600 mr-1" />
                              <span>{file.quote.print_time}</span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-3 w-3 text-purple-600 mr-1" />
                              <span>{file.quote.material}</span>
                            </div>
                            <div className="flex items-center">
                              <Calculator className="h-3 w-3 text-orange-600 mr-1" />
                              <span>{file.quote.volume} cm³</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quote Summary */}
            {uploadedFiles.some((f) => f.status === "completed") && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quote Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Files ready:</span>
                    <span className="font-medium">
                      {
                        uploadedFiles.filter((f) => f.status === "completed")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">{selectedMaterial}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium">
                      {qualities.find((q) => q.id === selectedQuality)?.name}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="font-bold text-lg text-blue-600">
                        ${totalQuotePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOrderAll}
                  disabled={
                    !uploadedFiles.some((f) => f.status === "completed")
                  }
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Order All (${totalQuotePrice.toFixed(2)})
                </button>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    How it works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload your 3D files</li>
                    <li>• Choose material and quality</li>
                    <li>• Get instant quotes</li>
                    <li>• Order with confidence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
