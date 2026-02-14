/**
 * This script is injected into the background service worker during development
 * to enable live reloading. It establishes a connection to the development server
 * via Server-Sent Events (SSE) and listens for reload signals.
 */
(() => {
    /**
     * Sets up the live reload functionality by creating an EventSource connection
     * to the development server. When a "reload" event is received, it triggers
     * the browser extension to reload. If the connection fails, it attempts to
     * reconnect after a short delay.
     */
    function setupLiveReload() {
        const eventSource = new EventSource("http://localhost:3000/events");

        eventSource.addEventListener("reload", () => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.reload) {
                chrome.runtime.reload();
            } else {
                console.warn("`chrome.runtime.reload()` not available. Manual reload may be required.");
            }
        });

        eventSource.onerror = (error) => {
            console.error("Live reload error:", error);
            eventSource.close();
            setTimeout(setupLiveReload, 1000);
        };
    }

    setupLiveReload();
})();