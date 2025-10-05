import browser from 'webextension-polyfill'

// Storage areas
const STORAGE_AREAS = {
	LOCAL: 'local',
	SYNC: 'sync',
	MANAGED: 'managed',
}

let DEFAULT_AREA = STORAGE_AREAS.SYNC

// Helper to validate storage area
function validateArea(area) {
	if (!browser.storage[area]) {
		throw new Error(`Storage area '${area}' is not available`)
	}
}

/* Get one key value from storage */
export async function getItem(key, defaultValue = null, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		const result = await browser.storage[area].get(key)
		return result[key] ?? defaultValue
	} catch (err) {
		console.error('[storage:getItem]', err)
		return defaultValue
	}
}

/* Get multiple items by keys */
export async function getItems(keys = [], area = DEFAULT_AREA) {
	try {
		validateArea(area)
		const result = await browser.storage[area].get(keys)
		return result
	} catch (err) {
		console.error('[storage:getItems]', err)
		return {}
	}
}

/* Set one key/value pair */
export async function setItem(key, value, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		await browser.storage[area].set({ [key]: value })
	} catch (err) {
		console.error('[storage:setItem]', err)
	}
}

/* Set multiple key/value pairs */
export async function setItems(data = {}, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		await browser.storage[area].set(data)
	} catch (err) {
		console.error('[storage:setItems]', err)
	}
}

/* Remove specific key(s) */
export async function removeItems(keys, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		await browser.storage[area].remove(keys)
	} catch (err) {
		console.error('[storage:removeItem]', err)
	}
}

/* Clear entire storage area */
export async function clearStorage(area = DEFAULT_AREA) {
	try {
		validateArea(area)
		await browser.storage[area].clear()
	} catch (err) {
		console.error('[storage:clearStorage]', err)
	}
}

/* Get storage usage in bytes */
export async function getBytesInUse(keys = null, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		return await browser.storage[area].getBytesInUse(keys)
	} catch (err) {
		console.error('[storage:getBytesInUse]', err)
		return 0
	}
}

/* Check if storage area is available */
export function isAreaAvailable(area) {
	return !!browser.storage[area]
}

/* Get all keys in storage area */
export async function getAllKeys(area = DEFAULT_AREA) {
	try {
		validateArea(area)
		const allData = await browser.storage[area].get()
		return Object.keys(allData)
	} catch (err) {
		console.error('[storage:getAllKeys]', err)
		return []
	}
}

/* Check if key exists in storage */
export async function hasKey(key, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		const result = await browser.storage[area].get(key)
		return result[key] !== undefined
	} catch (err) {
		console.error('[storage:hasKey]', err)
		return false
	}
}

/* Update specific properties of an object in storage (shallow merge) */
export async function updateObject(key, updates, area = DEFAULT_AREA) {
	try {
		validateArea(area)
		const existing = await getItem(key, {}, area)
		const updated = { ...existing, ...updates }
		await setItem(key, updated, area)
	} catch (err) {
		console.error('[storage:updateObject]', err)
	}
}

/* Watch storage changes globally */
export function watchStorageChanges(callback) {
	const listener = (changes, areaName) => {
		callback(changes, areaName)
	}

	browser.storage.onChanged.addListener(listener)

	return () => {
		browser.storage.onChanged.removeListener(listener)
	}
}

// Pre-configured area-specific functions
export const storageLocal = {
	getItem: (key, defaultValue = null) => getItem(key, defaultValue, 'local'),
	getItems: (keys = []) => getItems(keys, 'local'),
	setItem: (key, value) => setItem(key, value, 'local'),
	setItems: (data = {}) => setItems(data, 'local'),
	removeItems: (keys) => removeItems(keys, 'local'),
	clearStorage: () => clearStorage('local'),
	getBytesInUse: (keys = null) => getBytesInUse(keys, 'local'),
	getAllKeys: () => getAllKeys('local'),
	hasKey: (key) => hasKey(key, 'local'),
	updateObject: (key, updates) => updateObject(key, updates, 'local'),
}

export const storageSync = {
	getItem: (key, defaultValue = null) => getItem(key, defaultValue, 'sync'),
	getItems: (keys = []) => getItems(keys, 'sync'),
	setItem: (key, value) => setItem(key, value, 'sync'),
	setItems: (data = {}) => setItems(data, 'sync'),
	removeItems: (keys) => removeItems(keys, 'sync'),
	clearStorage: () => clearStorage('sync'),
	getBytesInUse: (keys = null) => getBytesInUse(keys, 'sync'),
	getAllKeys: () => getAllKeys('sync'),
	hasKey: (key) => hasKey(key, 'sync'),
	updateObject: (key, updates) => updateObject(key, updates, 'sync'),
}
// Default export with all functions
export default {
	STORAGE_AREAS,
	getItem,
	getItems,
	setItem,
	setItems,
	removeItems: removeItems,
	clearStorage,
	getBytesInUse,
	isAreaAvailable,
	getAllKeys,
	hasKey,
	updateObject,
	watchStorageChanges,
	storageLocal,
	storageSync,
}
