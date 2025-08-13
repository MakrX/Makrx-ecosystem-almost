"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import { CheckCircle, Clock, Package, Truck, MapPin } from "lucide-react";

interface OrderStatusProps {
  orderId: string;
  currentStatus: string;
}

const statusSteps = [
  { key: "pending", label: "Order Received", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "printing", label: "3D Printing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

export default function RealTimeOrderStatus({
  orderId,
  currentStatus,
}: OrderStatusProps) {
  const [status, setStatus] = useState(currentStatus);
  const [statusHistory, setStatusHistory] = useState<
    Array<{ status: string; timestamp: Date; note?: string }>
  >([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let ws: WebSocket;

    // Setup WebSocket for real-time updates
    const setupWebSocket = () => {
      try {
        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/orders/${orderId}/status`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Connected to order status WebSocket");
        };

        ws.onmessage = (event) => {
          try {
            const update = JSON.parse(event.data);
            if (update.status !== status) {
              setStatus(update.status);
              setStatusHistory((prev) => [
                ...prev,
                {
                  status: update.status,
                  timestamp: new Date(update.timestamp),
                  note: update.note,
                },
              ]);

              // Show notification for status change
              const statusStep = statusSteps.find(
                (step) => step.key === update.status,
              );
              addNotification({
                type: "info",
                title: "Order Status Updated",
                message: `Your order #${orderId.slice(-8)} is now ${statusStep?.label || update.status}`,
                actionUrl: `/account/orders/${orderId}`,
                actionLabel: "View Order",
              });
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          console.log("Order status WebSocket disconnected");
          // Try to reconnect after 5 seconds
          setTimeout(setupWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to setup WebSocket:", error);
      }
    };

    // Fallback polling every 30 seconds
    const pollStatus = async () => {
      try {
        const order = await api.getOrder(orderId);
        if (order.status !== status) {
          setStatus(order.status);
          setStatusHistory((prev) => [
            ...prev,
            {
              status: order.status,
              timestamp: new Date(),
              note: `Status updated to ${order.status}`,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to poll order status:", error);
      }
    };

    setupWebSocket();
    interval = setInterval(pollStatus, 30000);

    return () => {
      if (ws) {
        ws.close();
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [orderId, status, addNotification]);

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Order Progress
      </h3>

      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 
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
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="ml-4 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-blue-600 mt-1">In progress...</p>
                )}
              </div>

              {index < statusSteps.length - 1 && (
                <div
                  className={`
                  absolute left-4 mt-8 w-0.5 h-6 
                  ${isCompleted ? "bg-green-500" : "bg-gray-300"}
                `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Updates
          </h4>
          <div className="space-y-2">
            {statusHistory
              .slice(-3)
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs text-gray-600"
                >
                  <span>
                    {entry.note || `Status updated to ${entry.status}`}
                  </span>
                  <span>{entry.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
