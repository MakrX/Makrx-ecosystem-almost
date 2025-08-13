"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  FileText,
  Printer,
  Zap,
  Clock,
  Star,
  Check,
  ChevronRight,
  Camera,
  Package,
  Shield,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const SUPPORTED_FORMATS = [".stl", ".obj", ".3mf", ".step", ".stp"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const MATERIALS = [
  {
    id: "pla",
    name: "PLA",
    description: "Easy to print, biodegradable",
    price: 0.15,
  },
  {
    id: "pla+",
    name: "PLA+",
    description: "Enhanced PLA with better strength",
    price: 0.18,
  },
  {
    id: "abs",
    name: "ABS",
    description: "Durable, heat resistant",
    price: 0.18,
  },
  {
    id: "petg",
    name: "PETG",
    description: "Chemical resistant, food safe",
    price: 0.2,
  },
  { id: "tpu", name: "TPU", description: "Flexible, rubber-like", price: 0.3 },
  {
    id: "resin",
    name: "Resin",
    description: "High detail, smooth finish",
    price: 0.35,
  },
];

const QUALITIES = [
  {
    id: "draft",
    name: "Draft",
    description: "0.3mm layers, fast printing",
    multiplier: 0.7,
  },
  {
    id: "standard",
    name: "Standard",
    description: "0.2mm layers, balanced",
    multiplier: 1.0,
  },
  {
    id: "high",
    name: "High",
    description: "0.15mm layers, fine details",
    multiplier: 1.4,
  },
  {
    id: "ultra",
    name: "Ultra",
    description: "0.1mm layers, premium quality",
    multiplier: 2.0,
  },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "processed" | "failed";
  volume_mm3?: number;
  dimensions?: { x: number; y: number; z: number };
  error?: string;
}

export default function PrintingServicesPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("pla");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [selectedColor, setSelectedColor] = useState("natural");
  const [quantity, setQuantity] = useState(1);
  const [infillPercentage, setInfillPercentage] = useState(20);
  const [supports, setSupports] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
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
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    for (const file of files) {
      // Validate file
      if (!validateFile(file)) {
        continue;
      }

      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add file to state
      const uploadedFile: UploadedFile = {
        id: uploadId,
        name: file.name,
        size: file.size,
        status: "uploading",
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      try {
        // Get upload URL
        const uploadResponse = await api.createUploadUrl(
          file.name,
          file.type || "application/octet-stream",
          file.size,
        );

        // Upload file to S3/MinIO
        const formData = new FormData();
        Object.entries(uploadResponse.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        const uploadResult = await fetch(uploadResponse.upload_url, {
          method: "POST",
          body: formData,
        });

        if (!uploadResult.ok) {
          throw new Error("Upload failed");
        }

        // Mark upload as complete
        await api.completeUpload(
          uploadResponse.upload_id,
          uploadResponse.file_key,
        );

        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, status: "processing" } : f,
          ),
        );

        // Poll for processing completion
        pollUploadStatus(uploadResponse.upload_id, uploadId);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId
              ? { ...f, status: "failed", error: "Upload failed" }
              : f,
          ),
        );
      }
    }
  };

  const pollUploadStatus = async (uploadId: string, localId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      try {
        const upload = await api.getUpload(uploadId);

        if (upload.status === "processed") {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: "processed",
                    volume_mm3: upload.volume_mm3
                      ? Number(upload.volume_mm3)
                      : undefined,
                    dimensions: upload.dimensions ? {
                      x: upload.dimensions.x || 0,
                      y: upload.dimensions.y || 0,
                      z: upload.dimensions.z || 0
                    } : undefined,
                  }
                : f,
            ),
          );
          return;
        } else if (upload.status === "failed") {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: "failed",
                    error: upload.error_message || "Processing failed",
                  }
                : f,
            ),
          );
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: "failed",
                    error: "Processing timeout",
                  }
                : f,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to check upload status:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === localId
              ? {
                  ...f,
                  status: "failed",
                  error: "Failed to check status",
                }
              : f,
          ),
        );
      }
    };

    poll();
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!SUPPORTED_FORMATS.includes(extension)) {
      alert(
        `Unsupported file format. Please use: ${SUPPORTED_FORMATS.join(", ")}`,
      );
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return false;
    }

    return true;
  };

  const generateQuote = async () => {
    const processedFiles = uploadedFiles.filter(
      (f) => f.status === "processed",
    );
    if (processedFiles.length === 0) {
      alert("Please upload and process at least one file");
      return;
    }

    setQuoteLoading(true);
    try {
      // For now, use the first file for quote generation
      const file = processedFiles[0];

      const quoteData = await api.createQuote({
        upload_id: file.id,
        material: selectedMaterial,
        quality: selectedQuality,
        color: selectedColor,
        infill_percentage: infillPercentage,
        supports,
        quantity,
      });

      setQuote(quoteData);
    } catch (error) {
      console.error("Failed to generate quote:", error);
      alert("Failed to generate quote. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setQuote(null); // Clear quote when files change
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional 3D Printing Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your digital designs into high-quality physical objects
            with our state-of-the-art 3D printing technology and premium
            materials.
          </p>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Instant Quotes
            </h3>
            <p className="text-gray-600">
              Upload your file and get pricing instantly. No waiting, no hidden
              fees.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Fast Turnaround
            </h3>
            <p className="text-gray-600">
              Most orders completed within 24-48 hours. Rush orders available.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Premium Quality
            </h3>
            <p className="text-gray-600">
              Professional-grade printers and materials for exceptional results.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Upload Your Files
              </h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-600 mb-4">
                  Supported formats: {SUPPORTED_FORMATS.join(", ")}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={SUPPORTED_FORMATS.join(",")}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Files
                  </h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(file.size)}
                            </p>
                            {file.volume_mm3 && (
                              <p className="text-sm text-gray-600">
                                Volume: {(file.volume_mm3 / 1000).toFixed(2)}{" "}
                                cm³
                              </p>
                            )}
                            {file.dimensions && (
                              <p className="text-sm text-gray-600">
                                Size: {file.dimensions.x.toFixed(1)} ×{" "}
                                {file.dimensions.y.toFixed(1)} ×{" "}
                                {file.dimensions.z.toFixed(1)} mm
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {file.status === "uploading" && (
                            <div className="flex items-center text-blue-600">
                              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              <span className="text-sm">Uploading...</span>
                            </div>
                          )}
                          {file.status === "processing" && (
                            <div className="flex items-center text-yellow-600">
                              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              <span className="text-sm">Processing...</span>
                            </div>
                          )}
                          {file.status === "processed" && (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-sm">Ready</span>
                            </div>
                          )}
                          {file.status === "failed" && (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {file.error || "Failed"}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Print Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Print Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Material Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Material
                  </label>
                  <div className="space-y-2">
                    {MATERIALS.map((material) => (
                      <label
                        key={material.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="material"
                          value={material.id}
                          checked={selectedMaterial === material.id}
                          onChange={(e) => setSelectedMaterial(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {material.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {material.description}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${material.price}/cm³
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quality Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Print Quality
                  </label>
                  <div className="space-y-2">
                    {QUALITIES.map((quality) => (
                      <label
                        key={quality.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="quality"
                          value={quality.id}
                          checked={selectedQuality === quality.id}
                          onChange={(e) => setSelectedQuality(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {quality.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {quality.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="natural">Natural</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Infill Percentage
                  </label>
                  <select
                    value={infillPercentage}
                    onChange={(e) =>
                      setInfillPercentage(parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10% - Lightweight</option>
                    <option value={20}>20% - Standard</option>
                    <option value={50}>50% - Strong</option>
                    <option value={100}>100% - Solid</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={supports}
                    onChange={(e) => setSupports(e.target.checked)}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Add supports (recommended for overhangs)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quote Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Get Quote
              </h2>

              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Sign in to upload files and get instant quotes
                  </p>
                  <button
                    onClick={login}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={generateQuote}
                    disabled={
                      uploadedFiles.filter((f) => f.status === "processed")
                        .length === 0 || quoteLoading
                    }
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
                  >
                    {quoteLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Calculating...
                      </div>
                    ) : (
                      "Get Instant Quote"
                    )}
                  </button>

                  {quote && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Estimated Price
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(quote.price, quote.currency)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Estimated Weight:</span>
                            <span>{quote.estimated_weight_g}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Print Time:</span>
                            <span>
                              {Math.round(quote.estimated_time_minutes / 60)}h{" "}
                              {quote.estimated_time_minutes % 60}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Material Cost:</span>
                          <span>
                            {formatPrice(
                              quote.breakdown.material_cost,
                              quote.currency,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Machine Time:</span>
                          <span>
                            {formatPrice(
                              quote.breakdown.machine_cost,
                              quote.currency,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Labor:</span>
                          <span>
                            {formatPrice(
                              quote.breakdown.labor_cost,
                              quote.currency,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Setup Fee:</span>
                          <span>
                            {formatPrice(
                              quote.breakdown.setup_fee,
                              quote.currency,
                            )}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>
                            {formatPrice(quote.price, quote.currency)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/checkout")}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
                      >
                        Order Now
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Trust Signals */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure file handling
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Quality guaranteed
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Fast turnaround
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Gallery */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sample Work
            </h2>
            <p className="text-lg text-gray-600">
              See the quality of our 3D printing services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/sample-projects"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Samples <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
