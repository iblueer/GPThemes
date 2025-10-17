import { createSettings } from './settingsManager.js'
import { setupExtensionMessaging } from './messaging/index.js'

function init() {
	setupExtensionMessaging()

	createSettings().catch((err) => {
		console.error('[FAB:init] Failed:', err)
	})
}

export { init }
