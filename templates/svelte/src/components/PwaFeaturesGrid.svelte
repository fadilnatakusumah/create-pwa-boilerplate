<script lang="ts">
  import { onMount } from "svelte";

  interface FeatureStatus {
    name: string;
    action: () => void;
    isSupported: boolean;
    icon: string;
    message: string;
    status: string;
  }
  let battery: BatteryManager | null = null;

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

  // --- 1. State Management (Svelte Reactivity) ---
  let log: string[] = [];
  let cameraActive: boolean = false;
  let batteryLevel: number | null = null;
  let videoRef: HTMLVideoElement;
  let stream: MediaStream | null = null;

  // Feature status flags
  let isBatterySupported = false;
  let isGeolocationSupported = false;
  let isNotificationSupported = false;

  // --- 2. Logging Helper ---
  const appendLog = (message: string, isError = false) => {
    const status = isError ? "ERROR" : "INFO";
    const timestamp = new Date().toLocaleTimeString();
    // Simple array update triggers Svelte's reactivity
    log = [...log, `[${timestamp}] [${status}] ${message}`];
  };

  // --- 3. PWA Feature Actions ---

  // 1. Geolocation API Demo (PWA Feature: Location Access)
  const handleGeolocation = async () => {
    appendLog("Attempting to get current Geolocation...");
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );
      appendLog(
        `Location received: Lat=${position.coords.latitude.toFixed(4)}, Lon=${position.coords.longitude.toFixed(4)}`
      );
    } catch (error) {
      appendLog(
        `Geolocation Error: ${(error as GeolocationPositionError).message}`,
        true
      );
    }
  };

  // 2. Camera API Demo (PWA Feature: Media Capture)
  const handleCamera = async () => {
    if (cameraActive) {
      // Cleanup existing stream
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      cameraActive = false;
      appendLog("Camera stream stopped.");
      return;
    }

    appendLog("Requesting camera access...");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      stream = mediaStream;
      videoRef.srcObject = mediaStream;
      cameraActive = true;
      appendLog("Camera stream started successfully.");
    } catch (error) {
      appendLog(
        `Camera Access Denied: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  };

  // 3. Vibration API Demo (PWA Feature: Haptic Feedback)
  const handleVibrate = async () => {
    if (!("vibrate" in navigator)) {
      return appendLog("Vibration: Not Supported.");
    }
    navigator.vibrate([200, 100, 200]); // Vibrate pattern
    appendLog("Vibration: Success! Check your mobile device.");
  };

  // 4. Web Share API Demo
  const handleWebShare = async () => {
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
  };

  // 5. Battery Status API Demo
  const updateBatteryStatus = () => {
    if (battery) {
      batteryLevel = Math.round(battery.level * 100);
      appendLog(`Battery Status Updated: ${batteryLevel}%`);
    }
  };

  // 6. Push Notification Implementation
  const handlePushSubscription = async () => {
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
      const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"; // Must be replaced
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
        }`,
        true
      );
    }
  };

  // 7. Clipboard API Demo
  const handleClipboard = async () => {
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
      appendLog("Text copied using fallback (document.execCommand).", true);
    }
  };

  // --- 5. Lifecycle Hooks (onMount for initialization and cleanup) ---
  onMount(async () => {
    // Check initial support for APIs
    isGeolocationSupported = "geolocation" in navigator;
    isNotificationSupported = "Notification" in window;
    isBatterySupported = "getBattery" in navigator;

    // Battery API Setup
    if (isBatterySupported) {
      try {
        battery = await (navigator as any).getBattery();
        updateBatteryStatus();

        // Add listeners
        if (battery) {
          battery.addEventListener("levelchange", updateBatteryStatus);
        }
      } catch (e) {
        appendLog("Could not access Battery Status API.", true);
        isBatterySupported = false;
      }
    }

    appendLog("PWA Dashboard loaded and feature support checked.");

    // 🔑 Function returned by onMount acts as onDestroy/cleanup hook
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (battery) {
        battery.removeEventListener("levelchange", updateBatteryStatus);
      }
    };
  });

  // --- 6. Feature Data Structure (Reactive Statement) ---

  // $: features is Svelte's reactive statement. It re-runs whenever
  // any dependency (like cameraActive or isBatterySupported) changes.
  $: features = [
    {
      name: "Geolocation",
      action: handleGeolocation,
      isSupported: isGeolocationSupported,
      icon: "📍",
      message: "Accesses your current latitude and longitude.",
      status: "Ready" as const,
    },
    {
      name: `Camera (${cameraActive ? "ON" : "OFF"})`,
      action: handleCamera,
      isSupported:
        "mediaDevices" in navigator && !!navigator.mediaDevices.getUserMedia,
      icon: cameraActive ? "🛑" : "📸",
      status: "Ready" as const,
      message: cameraActive
        ? "Click to stop the live video feed."
        : "Captures live video from your device camera.",
    },
    {
      name: "Vibration",
      icon: "📳",
      action: handleVibrate,
      isSupported: "vibrate" in navigator,
      status: "Ready" as const,
      message: "Vibrate the device (mobile only).",
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
      action: () => appendLog(`Current Battery Level: ${batteryLevel}%`),
      isSupported: isBatterySupported,
      icon: "🔋",
      status: "Ready" as const,
      message: `Monitor device battery level. Current: ${batteryLevel === null ? "Checking..." : batteryLevel + "%"}`,
    },
    {
      name: "Push Notifications",
      icon: "🔔",
      action: handlePushSubscription,
      isSupported: "Notification" in window && "PushManager" in window,
      message: "Request permission and register for push messages.",
      status: "Ready" as const,
    },
  ];

  interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener: (
      type: "chargingchange" | "levelchange",
      listener: (this: this, ev: Event) => any,
      useCapture?: boolean
    ) => void;
    removeEventListener: (
      type: "chargingchange" | "levelchange",
      listener: (this: this, ev: Event) => any,
      useCapture?: boolean
    ) => void;
  }
</script>

<div class="grid-container">
  <h1 class="header">PWA Capabilities Dashboard</h1>

  <!-- Camera Stream Container -->
  <div class="camera-container" hidden={!cameraActive}>
    <video bind:this={videoRef} autoplay playsinline muted class="video-stream"
    ></video>
  </div>

  <div class="card-list">
    {#each features as feature, index}
      <div
        role="button"
        class:feature-card={true}
        class:unsupported={!feature.isSupported}
        tabindex="0"
        on:click={feature.isSupported ? feature.action : undefined}
        on:keydown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            feature.action();
          }
        }}
      >
        <div class="feature-icon">
          {feature.icon}
        </div>
        <div class="feature-name">
          {feature.name}
        </div>
        <small class="feature-status-text">
          {!feature.isSupported ? "(Not Supported on this device)" : ""}
        </small>
        <p class="feature-message">
          {feature.message}
        </p>
      </div>
    {/each}
  </div>

  <h2 class="log-header">Event Log</h2>
  <div class="log-container">
    {#each log as msg, i (i)}
      <div>{i + 1}. {msg}</div>
    {:else}
      <div>Click a feature card to see the results...</div>
    {/each}
  </div>
</div>

<style>
  .grid-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .card-list {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .card-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .card-list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .feature-card {
    padding: 1.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    cursor: pointer;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.06);
    transition:
      box-shadow 0.3s ease-in-out,
      background-color 0.3s ease-in-out;
    background-color: #b9f8cf;
  }

  .feature-card:hover {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.1);
    background-color: #7bf1a8;
  }

  .unsupported {
    background-color: #f3f4f6;
    opacity: 0.6;
    pointer-events: none;
    cursor: default;
    box-shadow: none;
  }

  .feature-icon {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }

  .feature-name {
    font-weight: 600;
    color: #4b5563;
  }

  .feature-message {
    margin: 0;
    padding: 0;
    color: #6a7282;
    font-size: 0.875rem;
  }

  .feature-status-text {
    color: #ef4444;
  }

  .camera-container {
    margin-bottom: 2rem;
    border: 4px solid #6366f1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .video-stream {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
  }

  .log-header {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .log-container {
    background-color: #1f2937;
    color: #ffffff;
    padding: 1rem;
    height: 10rem;
    overflow-y: scroll;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
      monospace;
  }
</style>
