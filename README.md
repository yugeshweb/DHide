# DHide

DHide is a lightweight Chrome extension built with Manifest V3 that
blurs sensitive and interactive form fields on webpages to protect user
privacy while browsing.

It helps prevent shoulder surfing, screen recording exposure, and
accidental disclosure of form data by applying a real-time blur effect
to interactive elements.

------------------------------------------------------------------------

## Overview

DHide provides a simple toggle mechanism that allows users to instantly
blur form inputs and other editable elements on a webpage. The extension
operates entirely within the browser and does not collect, store, or
transmit any user data.

The extension is designed to be minimal, fast, and compatible with
modern web applications, including single-page applications (SPAs).

------------------------------------------------------------------------

## Features

-   Blur interactive form elements instantly
-   Toggle masking per browser tab
-   Detect dynamically added elements using MutationObserver
-   Display real-time count of detected fields
-   Memory-only state management (no persistence)
-   No external dependencies
-   No network requests
-   Fully compliant with Chrome Manifest V3

------------------------------------------------------------------------

## Targeted Elements

When activated, DHide blurs the following elements:

-   input
-   textarea
-   select
-   Elements with contenteditable="true"
-   Elements with role="textbox"
-   iframe

Blur is applied using a CSS filter:

    filter: blur(8px);

------------------------------------------------------------------------

## Architecture

### Popup UI

The popup provides:

-   A circular toggle button
-   Status indicator (active/inactive)
-   Detected field counter

The popup ensures that the content script is injected into the active
tab and communicates with the background service worker to synchronize
state.

------------------------------------------------------------------------

### Content Script

The content script:

-   Injects a CSS class that applies blur
-   Scans the DOM for interactive elements
-   Uses MutationObserver to detect dynamically added fields
-   Automatically applies blur to newly added elements
-   Cleans up observers and styles when disabled
-   Prevents duplicate script injection

No form values are accessed, modified, stored, or transmitted.

------------------------------------------------------------------------

### Background Service Worker

The background script:

-   Maintains tab-specific state in memory
-   Tracks whether masking is active
-   Tracks number of detected fields
-   Clears state when a tab is closed
-   Clears state when a new page loads

All state is stored in memory only and resets when the extension
reloads.

------------------------------------------------------------------------

## Project Structure

DHide/ │ ├── manifest.json ├── background.js ├── content.js ├──
popup.html ├── popup.css └── popup.js

------------------------------------------------------------------------

## Installation (Developer Mode)

1.  Open Chrome
2.  Navigate to chrome://extensions
3.  Enable Developer Mode
4.  Click "Load unpacked"
5.  Select the DHide project folder

------------------------------------------------------------------------

## Usage

1.  Navigate to a webpage containing forms
2.  Click the DHide extension icon
3.  Press the toggle button to enable masking
4.  All supported interactive elements will blur immediately
5.  Click again to disable masking

The popup displays the current masking state and the number of detected
fields.

------------------------------------------------------------------------

## Privacy and Security

DHide:

-   Does not read input values
-   Does not store user data
-   Does not intercept form submissions
-   Does not make network requests
-   Does not use external APIs
-   Does not persist information

All functionality runs locally in the browser.

------------------------------------------------------------------------

## Limitations

DHide cannot operate on:

-   chrome:// pages
-   Chrome Web Store pages
-   Browser internal pages

Some cross-origin iframes may restrict script injection due to browser
security policies.

------------------------------------------------------------------------

## Technical Design Principles

-   Manifest V3 compliant
-   Memory-only state management
-   Clean injection lifecycle
-   MutationObserver-based dynamic detection
-   Zero dependency architecture
-   Performance-focused implementation
-   Compatible with modern SPA frameworks

------------------------------------------------------------------------

## License

MIT License
