// popup.js
// Handles popup UI + messaging with background/content scripts.

(async function () {
  const btn = document.getElementById("toggleBtn");
  const statusText = document.getElementById("statusText");
  const fieldCountEl = document.getElementById("fieldCount");
  const infoBar = document.getElementById("infoBar");
  const pulseRing = document.querySelector(".pulse-ring");

  const EYE_OPEN =
    `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>` +
    `<circle cx="12" cy="12" r="3"/>`;

  const EYE_SLASH =
    `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>` +
    `<path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>` +
    `<line x1="1" y1="1" x2="23" y2="23"/>`;

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  function getState(tabId) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: "GET_STATE", tabId }, res => {
        resolve(res || { active: false, fieldCount: 0 });
      });
    });
  }

  async function ensureInjected(tab) {
    try {
      const pong = await chrome.tabs
        .sendMessage(tab.id, { type: "PING" }, { frameId: 0 })
        .catch(() => null);

      if (!pong || !pong.pong) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: ["content.js"]
        });
      }

      return true;
    } catch {
      return false; // restricted pages like chrome://
    }
  }

  async function toggle(tab) {
    const result = await chrome.tabs
      .sendMessage(tab.id, { type: "TOGGLE" }, { frameId: 0 })
      .catch(() => null);

    // Try toggling sub-frames too (best effort)
    chrome.webNavigation?.getAllFrames({ tabId: tab.id })
      .then(frames => {
        frames?.forEach(f => {
          if (f.frameId !== 0) {
            chrome.tabs
              .sendMessage(tab.id, { type: "TOGGLE" }, { frameId: f.frameId })
              .catch(() => {});
          }
        });
      })
      .catch(() => {});

    return result;
  }

  function updateUI(active, count) {
    const icon = btn.querySelector(".btn-icon");

    btn.classList.toggle("active", active);
    pulseRing.classList.toggle("animating", active);
    statusText.classList.toggle("active", active);

    statusText.textContent = active
      ? "Masking active"
      : "Click to hide fields";

    icon.innerHTML = active ? EYE_OPEN : EYE_SLASH;

    if (count != null) {
      infoBar.classList.toggle("has-fields", count > 0);

      fieldCountEl.textContent =
        count === 0
          ? "No sensitive fields found"
          : `${count} sensitive field${count !== 1 ? "s" : ""} detected`;
    }
  }

  // Initial load
  const tab = await getActiveTab();
  const state = await getState(tab.id);
  updateUI(state.active, state.fieldCount);

  btn.addEventListener("click", async () => {
    const tab = await getActiveTab();

    const ok = await ensureInjected(tab);
    if (!ok) {
      statusText.textContent = "Cannot run on this page";
      return;
    }

    const result = await toggle(tab);
    if (!result) {
      statusText.textContent = "Communication error. Reload and try again.";
      return;
    }

    chrome.runtime.sendMessage({
      type: "SET_STATE",
      tabId: tab.id,
      active: result.active,
      fieldCount: result.fieldCount
    });

    updateUI(result.active, result.fieldCount);

    // Re-check count after a short delay (for lazy-loaded fields)
    if (result.active) {
      setTimeout(async () => {
        const updated = await chrome.tabs
          .sendMessage(tab.id, { type: "GET_COUNT" }, { frameId: 0 })
          .catch(() => null);

        if (updated && updated.fieldCount != null) {
          updateUI(result.active, updated.fieldCount);

          chrome.runtime.sendMessage({
            type: "SET_STATE",
            tabId: tab.id,
            active: result.active,
            fieldCount: updated.fieldCount
          });
        }
      }, 600);
    }
  });
})();