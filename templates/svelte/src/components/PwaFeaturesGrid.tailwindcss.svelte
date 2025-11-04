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
      // const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"; // Must be replaced
      const VAPID_PUBLIC_KEY =
        "BAFrs8mYnzzczIx22KVRS98Eaw4BM8lkyivs0vMrjSuWv5IpM5oOR8yl7l7W1rF0KS11vAHxzCU4Mdpl2DdnMuY"; // Must be replaced
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

  const handleVibrate = async () => {
    if (!("vibrate" in navigator)) {
      return appendLog("Vibration: Not Supported.");
    }
    navigator.vibrate([200, 100, 200]); // Vibrate pattern
    appendLog("Vibration: Success! Check your mobile device.");
  };

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

  // --- 4. Battery Status Logic ---

  const updateBatteryStatus = () => {
    if (battery) {
      batteryLevel = Math.round(battery.level * 100);
      appendLog(`Battery Status Updated: ${batteryLevel}%`);
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
        battery.addEventListener("levelchange", updateBatteryStatus);
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

<div class="p-8">
  <h1 class="text-2xl font-bold mb-6 flex items-center justify-center">
    PWA Capabilities Dashboard
  </h1>

  <!-- Live Camera Stream -->
  <div
    class="mb-8 border-4 border-indigo-500 rounded-lg overflow-hidden"
    hidden={!cameraActive}
  >
    <video
      bind:this={videoRef}
      autoplay
      playsinline
      muted
      class="w-full h-auto aspect-video object-cover block"
    ></video>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 🔑 Explicitly type the iterator 'feature: FeatureStatus' to prevent TS errors -->
    {#each features as feature, index}
      <div
        role="button"
        class={`p-6 border rounded-lg cursor-pointer transition-shadow shadow-md hover:shadow-lg ring-2 ring-teal-600 ${
          feature.isSupported
            ? "bg-green-200 hover:bg-green-300 ring-2 ring-indigo-200"
            : "bg-gray-100 opacity-60 pointer-events-none"
        }`}
        on:click={feature.isSupported ? feature.action : undefined}
      >
        <div class="text-4xl mb-3">
          {feature.icon}
        </div>
        <div class="font-semibold text-xl text-teal-800">
          {feature.name}
        </div>
        <small class="text-red-500">
          {!feature.isSupported ? "(Not Supported on this device)" : ""}
        </small>
        <p class="text-sm text-gray-600 mt-1">
          {feature.message}
        </p>
      </div>
    {/each}
  </div>

  <h2 class="text-xl font-semibold mt-10 mb-3">Event Log</h2>
  <div
    class="bg-gray-900 text-white p-4 h-40 overflow-y-scroll text-sm rounded-lg font-mono"
  >
    {#each log as msg, i (i)}
      <div>{i + 1}. {msg}</div>
    {:else}
      <div>Click a feature card to see the results...</div>
    {/each}
  </div>
</div>

<style>
  /* Empty style block. All styling has been converted to Tailwind CSS classes
  and applied directly in the template above.
  */
</style>
