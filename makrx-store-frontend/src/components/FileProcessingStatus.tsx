"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  Download,
  Eye,
  Calculator,
} from "lucide-react";

interface FileProcessingStatusProps {
  uploadId: string;
  fileName: string;
  onComplete?: (result: any) => void;
}

const processingSteps = [
  { key: "uploaded", label: "File Uploaded", icon: FileText },
  { key: "analyzing", label: "Analyzing File", icon: Loader },
  { key: "calculating", label: "Calculating Price", icon: Calculator },
  { key: "completed", label: "Quote Ready", icon: CheckCircle },
];

export default function FileProcessingStatus({
  uploadId,
  fileName,
  onComplete,
}: FileProcessingStatusProps) {
  const [status, setStatus] = useState("uploaded");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let ws: WebSocket;

    // Setup WebSocket for real-time updates
    const setupWebSocket = () => {
      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/processing/${uploadId}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Connected to file processing WebSocket");
        };

        ws.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);

            if (update.status) {
              setStatus(update.status);
            }

            if (update.progress !== undefined) {
              setProgress(update.progress);
            }

            if (update.error) {
              setError(update.error);
              addNotification({
                type: "error",
                title: "Processing Failed",
                message: `Failed to process ${fileName}: ${update.error}`,
              });
            }

            if (update.status === "completed" && update.result) {
              setResult(update.result);
              addNotification({
                type: "success",
                title: "Quote Ready!",
                message: `Your quote for ${fileName} is ready`,
                actionUrl: `/3d-printing/quote/${uploadId}`,
                actionLabel: "View Quote",
              });
              onComplete?.(update.result);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          console.log("Processing WebSocket disconnected");
          // Try to reconnect after 3 seconds
          setTimeout(setupWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to setup WebSocket:", error);
      }
    };

    // Fallback polling every 5 seconds
    const pollStatus = async () => {
      try {
        const status = await api.getProcessingStatus(uploadId);
        setStatus(status.status);
        setProgress(status.progress || 0);

        if (status.error) {
          setError(status.error);
        }

        if (status.status === "completed" && status.result) {
          setResult(status.result);
          onComplete?.(status.result);
        }
      } catch (error) {
        console.error("Failed to poll processing status:", error);
      }
    };

    setupWebSocket();
    interval = setInterval(pollStatus, 5000);

    return () => {
      if (ws) {
        ws.close();
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [uploadId, fileName, onComplete, addNotification]);

  const getCurrentStepIndex = () => {
    return processingSteps.findIndex((step) => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-red-800">
              Processing Failed
            </h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">
          Processing {fileName}
        </h4>
        {status === "completed" && result && (
          <div className="flex space-x-2">
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Processing Steps */}
      <div className="space-y-3">
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-6 h-6 rounded-full border-2 
                ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                }
              `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : isCurrent && step.key === "analyzing" ? (
                  <Loader className="h-3 w-3 animate-spin" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>

              <div className="ml-3">
                <p
                  className={`text-xs font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-blue-600">
                    {step.key === "analyzing"
                      ? "Analyzing geometry..."
                      : step.key === "calculating"
                        ? "Calculating materials and time..."
                        : "In progress..."}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Summary */}
      {result && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Quote Summary
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Material:</span>
              <span className="font-medium">{result.material}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Print Time:</span>
              <span className="font-medium">{result.print_time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium">{result.volume} cm³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-green-600">
                ${result.price}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
