"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface EventMessage {
  type: "event" | "subscription_confirmed" | "unsubscription_confirmed";
  event_type?: string;
  event_id?: string;
  source?: string;
  payload?: any;
  timestamp?: string;
  event_types?: string[];
}

interface RealTimeEvent {
  id: string;
  type: string;
  source: string;
  payload: any;
  timestamp: Date;
}

type EventHandler = (event: RealTimeEvent) => void;

interface UseRealTimeUpdatesOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const eventHandlers = useRef<Map<string, EventHandler[]>>(new Map());

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null);

  const eventServiceUrl =
    process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || "ws://localhost:8004";

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || wsRef.current) {
      return;
    }

    setConnectionStatus("connecting");

    try {
      const wsUrl = `${eventServiceUrl}/ws/${user.id}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected to event service");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;

        // Subscribe to default events for Store
        ws.send(
          JSON.stringify({
            type: "subscribe",
            event_types: [
              "order.updated",
              "order.payment_received",
              "order.shipped",
              "order.delivered",
              "service_order.quoted",
              "service_order.accepted",
              "service_order.in_progress",
              "service_order.completed",
              "job.progress_update",
              "bom.exported_to_cart",
              "inventory.low_stock",
            ],
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const message: EventMessage = JSON.parse(event.data);

          if (
            message.type === "event" &&
            message.event_type &&
            message.payload
          ) {
            const realtimeEvent: RealTimeEvent = {
              id: message.event_id || "",
              type: message.event_type,
              source: message.source || "",
              payload: message.payload,
              timestamp: message.timestamp
                ? new Date(message.timestamp)
                : new Date(),
            };

            setLastEvent(realtimeEvent);

            // Call registered handlers
            const handlers =
              eventHandlers.current.get(message.event_type) || [];
            handlers.forEach((handler) => {
              try {
                handler(realtimeEvent);
              } catch (error) {
                console.error("Error in event handler:", error);
              }
            });

            // Call global handlers
            const globalHandlers = eventHandlers.current.get("*") || [];
            globalHandlers.forEach((handler) => {
              try {
                handler(realtimeEvent);
              } catch (error) {
                console.error("Error in global event handler:", error);
              }
            });
          } else if (message.type === "subscription_confirmed") {
            console.log("Subscribed to events:", message.event_types);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(
            `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`,
          );

          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.log("Max reconnect attempts reached");
          setConnectionStatus("error");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
    }
  }, [
    isAuthenticated,
    user,
    eventServiceUrl,
    maxReconnectAttempts,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
    reconnectAttempts.current = 0;
  }, []);

  const subscribe = useCallback(
    (eventTypes: string[]) => {
      if (wsRef.current && isConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "subscribe",
            event_types: eventTypes,
          }),
        );
      }
    },
    [isConnected],
  );

  const unsubscribe = useCallback(
    (eventTypes: string[]) => {
      if (wsRef.current && isConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "unsubscribe",
            event_types: eventTypes,
          }),
        );
      }
    },
    [isConnected],
  );

  const addEventListener = useCallback(
    (eventType: string, handler: EventHandler) => {
      const handlers = eventHandlers.current.get(eventType) || [];
      handlers.push(handler);
      eventHandlers.current.set(eventType, handlers);

      return () => {
        const updatedHandlers = eventHandlers.current.get(eventType) || [];
        const index = updatedHandlers.indexOf(handler);
        if (index > -1) {
          updatedHandlers.splice(index, 1);
          if (updatedHandlers.length === 0) {
            eventHandlers.current.delete(eventType);
          } else {
            eventHandlers.current.set(eventType, updatedHandlers);
          }
        }
      };
    },
    [],
  );

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastEvent,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    addEventListener,
  };
}

// Specialized hooks for specific event types

export function useOrderUpdates() {
  const { addEventListener } = useRealTimeUpdates();
  const [orderUpdates, setOrderUpdates] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    const removeListener = addEventListener("order.updated", (event) => {
      setOrderUpdates((prev) => [event, ...prev.slice(0, 9)]); // Keep last 10 updates
    });

    return removeListener;
  }, [addEventListener]);

  return orderUpdates;
}

export function useServiceOrderUpdates() {
  const { addEventListener } = useRealTimeUpdates();
  const [serviceOrderUpdates, setServiceOrderUpdates] = useState<
    RealTimeEvent[]
  >([]);

  useEffect(() => {
    const removeListeners = [
      addEventListener("service_order.quoted", (event) => {
        setServiceOrderUpdates((prev) => [event, ...prev.slice(0, 9)]);
      }),
      addEventListener("service_order.accepted", (event) => {
        setServiceOrderUpdates((prev) => [event, ...prev.slice(0, 9)]);
      }),
      addEventListener("service_order.in_progress", (event) => {
        setServiceOrderUpdates((prev) => [event, ...prev.slice(0, 9)]);
      }),
      addEventListener("service_order.completed", (event) => {
        setServiceOrderUpdates((prev) => [event, ...prev.slice(0, 9)]);
      }),
      addEventListener("job.progress_update", (event) => {
        setServiceOrderUpdates((prev) => [event, ...prev.slice(0, 9)]);
      }),
    ];

    return () => {
      removeListeners.forEach((remove) => remove());
    };
  }, [addEventListener]);

  return serviceOrderUpdates;
}

export function useInventoryAlerts() {
  const { addEventListener } = useRealTimeUpdates();
  const [inventoryAlerts, setInventoryAlerts] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    const removeListeners = [
      addEventListener("inventory.low_stock", (event) => {
        setInventoryAlerts((prev) => [event, ...prev.slice(0, 4)]); // Keep last 5 alerts
      }),
      addEventListener("inventory.out_of_stock", (event) => {
        setInventoryAlerts((prev) => [event, ...prev.slice(0, 4)]);
      }),
    ];

    return () => {
      removeListeners.forEach((remove) => remove());
    };
  }, [addEventListener]);

  return inventoryAlerts;
}

export function useBOMExportUpdates() {
  const { addEventListener } = useRealTimeUpdates();
  const [bomExports, setBomExports] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    const removeListener = addEventListener("bom.exported_to_cart", (event) => {
      setBomExports((prev) => [event, ...prev.slice(0, 4)]); // Keep last 5 exports
    });

    return removeListener;
  }, [addEventListener]);

  return bomExports;
}
