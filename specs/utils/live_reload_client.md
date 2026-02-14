# SPEC: Live Reload Client Utility Module

## 1. Module Description

This document describes the specifications for the `live-reload-client` utility module. This client-side JavaScript module is designed to enable live reloading functionality for Chrome extensions during development. It establishes a connection to a server-sent events (SSE) endpoint and listens for specific reload commands, triggering a `chrome.runtime.reload()` upon receipt. It includes basic error handling and reconnection logic.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions and Classes

The `live-reload-client.js` module consists of an anonymous immediate-invoked function expression (IIFE) that encapsulates the entire live reload logic.

### IIFE Structure and Components

The module is structured as an IIFE that defines and immediately calls a `setupLiveReload` function.

*   **`setupLiveReload()` Function:**
    *   This function encapsulates the logic for establishing and managing the Server-Sent Events (SSE) connection.
    *   **`eventSource` Initialization:**
        *   Establishes a connection to an SSE endpoint at `http://localhost:3000/events` using `EventSource`.
    *   **`reload` Event Listener:**
        *   Listens for a custom event named `"reload"` from the `eventSource`.
        *   When a `"reload"` event is received, it attempts to trigger a reload of the Chrome extension using `chrome.runtime.reload()`.
        *   Includes a fallback `console.warn` message if `chrome.runtime.reload()` is not available, indicating that a manual reload might be necessary.
    *   **`onerror` Handler:**
        *   Handles errors occurring during the SSE connection.
        *   Logs the error to the console.
        *   Closes the current `eventSource` connection.
        *   Attempts to re-establish the connection after a 1-second delay by calling `setupLiveReload()` recursively.
*   **Initial Call:** The `setupLiveReload()` function is called once immediately after its definition within the IIFE to initiate the live reload process.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC:

*   **Server-side Implementation:** The SPEC does not cover the implementation details of the server that provides the `/events` SSE endpoint.
*   **Non-Chrome Browser Support:** The module is specifically designed for Chrome extensions and does not include logic for other browser environments.
*   **Advanced Error Handling:** Error handling is basic; advanced retry mechanisms, exponential backoff, or custom error reporting are not included.
*   **Custom Reload Logic:** The module only triggers `chrome.runtime.reload()`. More granular or conditional reloading logic is not supported.
*   **Hot Module Replacement (HMR):** This module provides a full reload, not HMR.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/utils/live_reload_client.md` (this file, for its updates).
*   `core/utils/live-reload-client.js` (the source code file for the live reload client).

## 6. Edge Cases

The following edge cases must be considered:

*   **`chrome.runtime.reload()` Unavailable:** If the script runs in an environment where `chrome` or `chrome.runtime.reload` is not defined (e.g., a standard web page context or a different browser), a warning should be logged, and the reload will not occur.
*   **Server Disconnection/Errors:** If the SSE server disconnects or sends an error, the client should attempt to log the error, close the existing connection, and re-establish it after a delay.
*   **Repeated Connection Attempts:** In case of persistent server issues, the client will repeatedly try to reconnect, potentially leading to a continuous stream of connection attempts.
*   **Network Issues:** Transient network problems could lead to temporary disconnections and reconnection attempts.
*   **Multiple Reload Events:** Rapid fire "reload" events would cause rapid, successive reloads of the extension.
