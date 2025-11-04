// src/components/PwaFeaturesGrid.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";

import styles from "./PwaFeaturesGrid.module.css";

// --- Type Definitions for Safety ---
interface FeatureStatus {
  name: string;
  status: "Ready" | "Success" | "Denied" | "Not Supported";
  message: string;
  action: () => void;
  isSupported: boolean;
  icon?: string;
}

// Extend Window interface for Battery Status API
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => unknown) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => unknown) | null;
}

const PwaFeaturesGrid: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const appendLog = useCallback((msg: string, isError = false) => {
    const status = isError ? "ERROR" : "INFO";
    const timestamp = new Date().toLocaleTimeString();

    setLog((prev) => [...prev, `[${timestamp}] [${status}] ${msg}`]);
  }, []);

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
    if (stream) {
      // Stop current stream
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
      return appendLog("Camera: Stream stopped.");
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return appendLog("Camera: Not Supported.");
      }
      appendLog("Camera: Requesting access...");
      // Request access to video stream (can be displayed in a <video> element later)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      appendLog("Camera: Access granted! Displaying stream.");

      // 🔑 CRITICAL FIX: Explicitly call .play() to start the video element
      // This is often required after setting srcObject dynamically.
    } catch (err) {
      setCameraActive(false);
      appendLog(
        `Camera: Access denied or failed. Error: ${(err as Error).message}`
      );
    }
  }, [appendLog, stream]);

  // 🔑 NEW: Separate Effect to assign stream after video element renders
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      // Imperative play() is still necessary for immediate start
      videoRef.current
        .play()
        .catch((e) => console.error("Video play failed:", e));
    }

    // Cleanup effect to stop stream when it's removed or component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]); // Run this effect ONLY when the 'stream' state changes

  // 3. Vibration API Demo (PWA Feature: Haptic Feedback)
  const handleVibrate = useCallback(() => {
    if (!("vibrate" in navigator)) {
      return appendLog("Vibration: Not Supported.");
    }
    navigator.vibrate([200, 100, 200]); // Vibrate pattern
    appendLog("Vibration: Success! Check your mobile device.");
  }, [appendLog]);

  // 4. Web Share API Demo
  const handleWebShare = useCallback(async () => {
    if (!navigator.share) {
      return appendLog("Web Share: Not Supported.");
    }

    try {
      await navigator.share({
        title: "PWA Share Demo",
        text: "Check out this awesome PWA Boilerplate!",
        url: window.location.href,
      });
      appendLog("Web Share: Successfully shared content.");
    } catch (err) {
      // User canceled the share operation
      appendLog(
        `Web Share: Failed or user cancelled. Error: ${(err as Error).message}`
      );
    }
  }, [appendLog]);

  // 5. Battery Status API Demo
  const handleBatteryStatus = useCallback(async () => {
    if (!navigator.getBattery) {
      return appendLog("Battery Status: Not Supported.");
    }

    try {
      const battery: BatteryManager = await navigator.getBattery(); // Type assertion for safety
      const chargingStatus = battery.charging ? "Charging" : "Discharging";
      const level = Math.round(battery.level * 100);

      appendLog(`Battery Status: ${level}% and ${chargingStatus}.`);
    } catch (err) {
      appendLog(
        `Battery Status: Failed to read status. Error: ${
          (err as Error).message
        }`
      );
    }
  }, [appendLog]);

  // 6. Push Notification Implementation
  const handlePushSubscription = useCallback(async () => {
    if (!("Notification" in window) || !("PushManager" in window)) {
      return appendLog("Push Notifications: Not Supported.");
    }

    try {
      // 1. Request Notification Permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return appendLog(`Push Notifications: Permission denied or dismissed.`);
      }
      appendLog("Push Notifications: Permission granted.");

      // 2. Get Service Worker Registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Subscribe the user (using placeholder public key for demo)
      // In a real app, this VAPID public key comes from your backend server.
      // const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"; // Must be replaced
      const VAPID_PUBLIC_KEY = ""; // Must be replaced
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // 4. Send subscription data to the (simulated) backend
      appendLog("Push Notifications: Successfully subscribed user.");
      // NOTE: In a real app, you would send this 'subscription' object to your server via fetch()
      console.log(subscription);
      new Notification("PWA Notification Test", {
        body: "Permission granted! This is a test notification.",
        icon: "https://placehold.co/64x64/000000/FFFFFF?text=P",
      });
    } catch (err) {
      appendLog(
        `Push Notifications: Subscription failed. Error: ${
          (err as Error).message
        }`
      );
    }
  }, [appendLog]);

  // 7. Clipboard API Demo
  const handleClipboard = useCallback(async () => {
    const textToCopy = `PWA Clipboard Test successful at ${new Date().toLocaleTimeString()}`;
    appendLog(`Attempting to copy text: "${textToCopy}"`);
    try {
      await navigator.clipboard.writeText(textToCopy);
      appendLog("Text copied to clipboard!");
    } catch (error) {
      // Fallback for non-secure contexts (like iframes)
      const input = document.createElement("textarea");
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      // fallback for "writeText" method
      document.execCommand("copy");
      document.body.removeChild(input);
      appendLog(
        `Text copy failed: ${
          (error as Error).message
        }Text copied using fallback (document.execCommand).`
      );
    }
  }, [appendLog]);

  // --- Utility Function to convert VAPID key (add outside the component) ---
  // Note: This must be defined outside the component or imported.
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

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
      name: `Camera (${cameraActive ? "ON" : "OFF"})`,
      icon: cameraActive ? "🛑" : "📸",
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
    {
      name: "Web Share",
      icon: "📤",
      action: handleWebShare,
      isSupported: !!navigator.share,
      message: "Share content with native system dialogue.",
      status: "Ready" as const,
    },
    {
      name: "Clipboard Write",
      action: handleClipboard,
      isSupported: "clipboard" in navigator && !!navigator.clipboard.writeText,
      icon: "📋",
      message: "Copies a simple text string to your device clipboard.",
      status: "Ready" as const,
    },
    {
      name: "Battery Status",
      icon: "🔋",
      action: handleBatteryStatus,
      isSupported: !!navigator.getBattery,
      message: "Get current charge level and status.",
      status: "Ready" as const,
    },
    {
      name: "Push Notifications",
      icon: "🔔",
      action: handlePushSubscription,
      isSupported: "Notification" in window && "PushManager" in window,
      message: "Request permission and register for push messages.",
      status: "Ready" as const,
    },
    // Add more features here (Web Share, Battery Status, etc.)
  ].map((f) => ({ ...f, status: f.isSupported ? f.status : "Not Supported" }));

  return (
    <div className={styles.grid}>
      <h1 className={styles.header}>PWA Capabilities Dashboard</h1>
      {/* Live Camera Stream */}
      {cameraActive && (
        <div className={styles.cameraContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
        </div>
      )}

      <div className={styles.cardList}>
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={feature.isSupported ? feature.action : undefined}
            // 🔑 Applying the base class and the modifier class
            className={`${styles.featureCard} ${
              !feature.isSupported ? styles.unsupported : ""
            }`}
          >
            <div className={styles.featureIcon}>{feature.icon}</div>
            <div className={styles.featureName}>{feature.name}</div>
            <small className={styles.featureStatusText}>
              {!feature.isSupported && "(Not Supported on this device)"}
            </small>
            <p className={styles.featureMessage}>{feature.message}</p>{" "}
          </div>
        ))}
      </div>

      <h2 className={styles.logHeader}>Event Log</h2>
      <div className={styles.logContainer}>
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
