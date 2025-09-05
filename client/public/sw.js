// Service Worker for GasFlow App
// Handles push notifications and offline caching

const CACHE_NAME = "gasflow-v4"; // bump version para fresh cache
const APP_SHELL_URLS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
];

// Install event - cache app shell
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // 🔑 Always fetch fresh login page (never cached)
  if (event.request.url.includes("/login")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle API requests with cache-first strategy for products
  if (event.request.url.includes("/api/products")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response immediately, but still try to fetch fresh data
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(() => {
            // Ignore fetch errors when returning cached data
          });
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Return a basic offline response for products
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        });
      })
    );
    return;
  }

  // Skip other API requests
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: "You have a new update!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon.ico",
      },
    ],
  };

  let title = "GasFlow";
  let body = "You have a new update!";

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || title;
      body = payload.body || body;
      options.data = payload.data || options.data;
      options.icon = payload.icon || options.icon;
    } catch (error) {
      console.error("Error parsing push payload:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      ...options,
      body,
    })
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Handle notification click - open app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If app is already open, focus it
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }

      // If app is not open, open a new window
      if (clients.openWindow) {
        const url = event.notification.data?.url || "/";
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag);

  if (event.tag === "cart-sync") {
    event.waitUntil(syncCart());
  }
});

// Function to sync cart data when back online
async function syncCart() {
  try {
    console.log("Syncing cart data...");
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log("No auth token found, skipping cart sync");
      return;
    }
    
    // Open IndexedDB to get cart data
    const db = await openDB();
    const transaction = db.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');
    const cartData = await promiseRequest(store.getAll());
    
    if (cartData && cartData.length > 0) {
      // Sync cart items with server
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log("Cart synchronized successfully");
      }
    }
    
  } catch (error) {
    console.error("Cart sync failed:", error);
  }
}
