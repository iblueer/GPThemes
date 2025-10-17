import browser from "webextension-polyfill";
import {
  icon_sun,
  icon_moon,
  icon_moon_full,
  icon_settings,
} from "../../js/app/components/icons";

const ACTIONS_CONTAINER_ID = "quick-actions";
let statusTimer = null;

const CHATGPT_URL_PREFIXES = [
  "https://chat.openai.com/",
  "https://chatgpt.com/",
];
const CHATGPT_URL_PATTERNS = [
  "https://chat.openai.com/*",
  "https://chatgpt.com/*",
];

const actions = [
  {
    id: "light",
    label: "Light",
    icon: icon_sun,
    action: () => applyTheme("light"),
  },
  {
    id: "dark",
    label: "Dark",
    icon: icon_moon,
    action: () => applyTheme("dark"),
  },
  {
    id: "oled",
    label: "OLED",
    icon: icon_moon_full,
    action: () => applyTheme("oled"),
  },
  {
    id: "settings",
    label: "Settings",
    icon: icon_settings,
    action: () => openSettings(),
  },
];

function renderQuickActions() {
  const container = document.getElementById(ACTIONS_CONTAINER_ID);
  if (!container) return;

  container.innerHTML = actions
    .map(
      ({ id, label, icon }) => `
				<button id="quick-action-${id}" class="quick-action__btn">
					<span class="quick-action__icon">${icon}</span>
					<span class="quick-action__label">${label}</span>
				</button>
			`,
    )
    .join("");

  actions.forEach(({ id, action }) => {
    const button = document.getElementById(`quick-action-${id}`);
    if (!button) return;
    button.addEventListener("click", async () => {
      setStatus("");
      button.disabled = true;
      try {
        await action();
        setStatus(
          id === "settings" ? "Settings opened" : `Applied ${id} theme`,
        );
      } catch (error) {
        console.error("[popup] quick action failed", error);
        setStatus(resolveErrorMessage(error), true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function applyTheme(theme) {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error("CHATGPT_TAB_NOT_FOUND");
  await sendMessageWithRetry(tab.id, { action: "applyTheme", theme });
}

async function openSettings() {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error("CHATGPT_TAB_NOT_FOUND");
  await sendMessageWithRetry(tab.id, { action: "openSettingsPanel" });
}

async function getActiveTab() {
  try {
    const tabs = await browser.tabs.query({
      url: CHATGPT_URL_PATTERNS,
      windowType: "normal",
    });

    if (!tabs?.length) return undefined;

    const activeTab = tabs.find((tab) => tab.active);
    if (activeTab) return activeTab;

    const [recentTab] = tabs
      .filter((tab) => typeof tab.lastAccessed === "number")
      .sort((a, b) => b.lastAccessed - a.lastAccessed);

    if (recentTab) return recentTab;

    return tabs[0];
  } catch (error) {
    console.warn("[popup] failed to locate ChatGPT tab", error);
    return undefined;
  }
}

function setStatus(message, isError = false) {
  const statusEl = document.getElementById("quick-actions-status");
  if (!statusEl) return;

  if (!message) {
    clearTimeout(statusTimer);
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.classList.remove("quick-actions__status--error");
    return;
  }

  statusEl.textContent = message;
  statusEl.hidden = false;
  statusEl.classList.toggle("quick-actions__status--error", isError);

  clearTimeout(statusTimer);
  if (!isError) {
    statusTimer = setTimeout(() => setStatus(""), 2000);
  }
}

function resolveErrorMessage(error) {
  if (error?.message === "CHATGPT_TAB_NOT_FOUND") {
    return "请先激活 chatgpt.com 或 chat.openai.com 标签页后再试。";
  }

  if (
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("could not establish")
  ) {
    return "扩展未能连接页面，请刷新 ChatGPT 页后重试。";
  }

  return "Action failed. Is ChatGPT tab active?";
}

function isChatGptUrl(url = "") {
  return CHATGPT_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

async function sendMessageWithRetry(tabId, payload, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await browser.tabs.sendMessage(tabId, payload);
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      const shouldRetry = message.includes("Could not establish connection") || message.includes("Receiving end");

      if (!shouldRetry || i === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw lastError;
}

export { renderQuickActions };
