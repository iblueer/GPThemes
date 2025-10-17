import browser from 'webextension-polyfill'
import { openSettings } from '../settingsManager.js'
import { applyTheme } from '../themeManager.js'

/* Handles extension messages for the floating button and other features */
function setupExtensionMessaging() {
	if (!browser?.runtime?.onMessage) return

	browser.runtime.onMessage.addListener((msg) => {
		console.log(msg)

		if (msg?.action === 'openSettingsPanel') {
			openSettings()
			return { ok: true }
		}

		if (msg?.action === 'applyTheme' && msg.theme) {
			applyTheme(msg.theme)
			return { ok: true }
		}

		return { ok: false }
	})
}

export { setupExtensionMessaging }
