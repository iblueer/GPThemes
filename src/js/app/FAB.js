import { createSettings } from './settingsManager.js'
import { setupExtensionMessaging } from './messaging/index.js'

async function init() {
	setupExtensionMessaging()

	try {
		await createSettings()
	} catch (err) {
		console.error('[FAB:init] Failed:', err)
	}
}

export { init }
