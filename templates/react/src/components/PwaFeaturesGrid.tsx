// src/components/PwaFeaturesGrid.tsx

import React, { useState, useCallback } from "react";

// --- Type Definitions for Safety ---
interface FeatureStatus {
  name: string;
  status: "Ready" | "Success" | "Denied" | "Not Supported";
  message: string;
  action: () => void;
  isSupported: boolean;
  icon?: string;
}

const PwaFeaturesGrid: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const appendLog = useCallback(
    (msg: string) => setLog((prev) => [...prev, msg]),
    []
  );

  // 1. Geolocation API Demo (PWA Feature: Location Access)
  const handleGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      return appendLog("Geolocation: Not Supported.");
    }
    appendLog("Geolocation: Requesting position...");
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        appendLog(
          `Geolocation: Success! Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`
        );
      },
      (error: GeolocationPositionError) => {
        appendLog(`Geolocation: Error ${error.code} - ${error.message}`);
      }
    );
  }, [appendLog]);

  // 2. Camera API Demo (PWA Feature: Media Capture)
  const handleCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return appendLog("Camera: Not Supported.");
      }
      appendLog("Camera: Requesting access...");
      // Request access to video stream (can be displayed in a <video> element later)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      appendLog("Camera: Access granted! Stream active.");
      stream.getTracks().forEach((track) => track.stop()); // Stop immediately to release resources
    } catch (err) {
      appendLog(
        `Camera: Access denied or failed. Error: ${(err as Error).message}`
      );
    }
  }, [appendLog]);

  // 3. Vibration API Demo (PWA Feature: Haptic Feedback)
  const handleVibrate = useCallback(() => {
    if (!("vibrate" in navigator)) {
      return appendLog("Vibration: Not Supported.");
    }
    navigator.vibrate([200, 100, 200]); // Vibrate pattern
    appendLog("Vibration: Success! Check your mobile device.");
  }, [appendLog]);

  // --- Grid Data Setup ---
  const features: FeatureStatus[] = [
    {
      name: "Geolocation",
      icon: "📍",
      action: handleGeolocation,
      isSupported: "geolocation" in navigator,
      status: "Ready" as const,
      message: "Get your current location.",
    },
    {
      name: "Camera",
      icon: "📷",
      action: handleCamera,
      isSupported: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      status: "Ready" as const,
      message: "Open/check camera access.",
    },
    {
      name: "Vibration",
      icon: "📳",
      action: handleVibrate,
      isSupported: "vibrate" in navigator,
      status: "Ready" as const,
      message: "Vibrate the device.",
    },
    // Add more features here (Web Share, Battery Status, etc.)
  ].map((f) => ({ ...f, status: f.isSupported ? f.status : "Not Supported" }));

  return (
    <div className="<%= useTailwind ? 'p-8' : '' %>">
      <h1 className="<%= useTailwind ? 'text-2xl font-bold mb-6' : '' %>">
        PWA Capabilities Dashboard
      </h1>

      <div className="<%= useTailwind ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : '' %>">
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={feature.isSupported ? feature.action : undefined}
            className={`
                        p-6 border rounded-lg cursor-pointer transition-shadow 
                        <%= useTailwind ? 'shadow-md hover:shadow-lg' : '' %>
                        ${
                          feature.isSupported
                            ? "bg-white"
                            : "bg-gray-100 opacity-60 pointer-events-none"
                        }
                    `}
          >
            <div className="<%= useTailwind ? 'text-4xl mb-3' : '' %>">
              {feature.icon}
            </div>
            <div className="<%= useTailwind ? 'font-semibold' : '' %>">
              {feature.name}
            </div>
            <p className="<%= useTailwind ? 'text-sm text-gray-500' : '' %>">
              {feature.message}
            </p>
          </div>
        ))}
      </div>

      <h2 className="<%= useTailwind ? 'text-xl font-semibold mt-10 mb-4' : '' %>">
        Event Log
      </h2>
      <div className="<%= useTailwind ? 'bg-gray-800 text-white p-4 h-48 overflow-y-scroll text-sm rounded-lg font-mono' : '' %>">
        {log.length > 0
          ? log.map((msg, i) => (
              <div key={i}>
                {i + 1}. {msg}
              </div>
            ))
          : "Click a feature card to see the results..."}
      </div>
    </div>
  );
};

export default PwaFeaturesGrid;
