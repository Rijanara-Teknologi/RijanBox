import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('rijanbox', {
    // PIN
    pin: {
        isEnabled: () => ipcRenderer.invoke('pin:is-enabled'),
        setup: (pin: string) => ipcRenderer.invoke('pin:setup', pin),
        verify: (pin: string) => ipcRenderer.invoke('pin:verify', pin),
        change: (oldPin: string, newPin: string) => ipcRenderer.invoke('pin:change', oldPin, newPin),
        disable: (pin: string) => ipcRenderer.invoke('pin:disable', pin),
    },

    // Services
    services: {
        getAll: () => ipcRenderer.invoke('services:get-all'),
        add: (data: { name: string; url: string; category: string; icon: string }) =>
            ipcRenderer.invoke('services:add', data),
        update: (id: string, updates: any) => ipcRenderer.invoke('services:update', id, updates),
        delete: (id: string) => ipcRenderer.invoke('services:delete', id),
        reorder: (ids: string[]) => ipcRenderer.invoke('services:reorder', ids),
        toggleMute: (id: string) => ipcRenderer.invoke('services:toggle-mute', id),
        toggleHibernate: (id: string) => ipcRenderer.invoke('services:toggle-hibernate', id),
    },

    // Settings
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
        setAll: (settings: any) => ipcRenderer.invoke('settings:set-all', settings),
    },

    // Theme
    theme: {
        set: (theme: string) => ipcRenderer.invoke('theme:set', theme),
    },

    // Active Service
    activeService: {
        get: () => ipcRenderer.invoke('active-service:get'),
        set: (id: string) => ipcRenderer.invoke('active-service:set', id),
    },

    // Notifications
    notification: {
        show: (data: { title: string; body: string; serviceId: string }) =>
            ipcRenderer.invoke('notification:show', data),
    },

    // Window Controls
    window: {
        minimize: () => ipcRenderer.send('window-control', 'minimize'),
        maximize: () => ipcRenderer.send('window-control', 'maximize'),
        close: () => ipcRenderer.send('window-control', 'close'),
    },

    // Utilities
    shell: {
        openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
    },
    app: {
        getVersion: () => ipcRenderer.invoke('app:get-version'),
        getPlatform: () => process.platform,
        checkUpdate: () => ipcRenderer.invoke('app:check-update'),
    },
    dialog: {
        openImage: () => ipcRenderer.invoke('dialog:open-image'),
    },

    // Events from main process
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = ['navigate', 'lock-app', 'switch-service', 'shortcut'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },

    // User activity signal
    signalActivity: () => ipcRenderer.send('user-activity'),
});
