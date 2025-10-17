import browser from "webextension-polyfill";
import {
  EXT_CURR_VERSION,
  EXT_CURR_CHANGELOG_URL,
} from "../../js/app/config/consts";
import { RELEASE_CHANGES } from "./changes";
import { renderQuickActions } from "./quickActions";

const createFullChangelogLink = (version = EXT_CURR_VERSION) =>
  `<a href="${EXT_CURR_CHANGELOG_URL}" target="_blank" rel="noopener noreferrer" class="changelog__seefullchangelog">🚀 See full release notes</a>`;

const initChangelogUI = () => {
  const changelogChangesEl = document.querySelector(".changelog__changes");
  const footerVersionEl = document.querySelector('[data-role="version"]');
  const whatsNewBtn = document.getElementById("btn-whats-new");
  const changelog = document.querySelector(".changelog");

  if (!changelogChangesEl || !footerVersionEl || !whatsNewBtn || !changelog) {
    console.error("Changelog elements not found in the DOM");
    return;
  }

  changelogChangesEl.innerHTML = `
		<div class="changelog__section">
			${RELEASE_CHANGES}
			<p>${createFullChangelogLink()}</p>
		</div>
	`;

  footerVersionEl.textContent = `GPThemes v${EXT_CURR_VERSION}`;
  changelog.dataset.expanded = "false";
  whatsNewBtn.setAttribute("aria-expanded", "false");
  whatsNewBtn.addEventListener("click", () => toggleChangelog(whatsNewBtn));
};

function toggleChangelog(button) {
  const changelog = document.querySelector(".changelog");
  if (!changelog) return;

  const expanded = changelog.dataset.expanded === "true";
  const nextExpanded = !expanded;

  changelog.dataset.expanded = String(nextExpanded);
  button.setAttribute("aria-expanded", String(nextExpanded));
  button.textContent = nextExpanded ? "Hide updates" : "What's new";

  const changesContainer = document.querySelector(".changelog__changes");
  if (nextExpanded && changesContainer) {
    changesContainer.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const updateBadge = async () => {
  console.log("=== POPUP: Sending setBadge message ===");
  try {
    const response = await browser.runtime.sendMessage({ action: "setBadge" });
    console.log("✅ Badge update response:", response);
  } catch (error) {
    console.error("❌ Failed to update badge:", error);
  }
};

const initPopup = () => {
  initChangelogUI();
  updateBadge();
  renderQuickActions();
};

// Start the initialization process
initPopup();
