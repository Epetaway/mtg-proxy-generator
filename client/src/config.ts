// App config for DEMO vs PERSONAL mode
export const APP_MODE = import.meta.env.VITE_APP_MODE || 'DEMO';
export const COLLECTION_STORAGE_KEY = APP_MODE === 'PERSONAL' ? 'local_collection' : 'demo_collection';

export const USE_SERVER = (import.meta.env.VITE_USE_SERVER || 'false').toLowerCase() === 'true';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
