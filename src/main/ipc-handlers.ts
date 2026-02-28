import { ipcMain, shell, Notification, app, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { store, ServiceData } from './store';
import { hashPin, verifyPin, generateSalt, generateServiceId, generatePartitionId } from './security';

export function registerIpcHandlers(): void {
    // ─── PIN Management ───
    ipcMain.handle('pin:is-enabled', () => {
        return store.get('pinEnabled');
    });

    ipcMain.handle('pin:setup', async (_event, pin: string) => {
        const salt = generateSalt();
        const hash = await hashPin(pin, salt);
        store.set('pinHash', hash);
        store.set('pinSalt', salt);
        store.set('pinEnabled', true);
        return true;
    });

    ipcMain.handle('pin:verify', async (_event, pin: string) => {
        const salt = store.get('pinSalt');
        const storedHash = store.get('pinHash');
        if (!salt || !storedHash) return false;
        return verifyPin(pin, salt, storedHash);
    });

    ipcMain.handle('pin:change', async (_event, oldPin: string, newPin: string) => {
        const salt = store.get('pinSalt');
        const storedHash = store.get('pinHash');
        if (!salt || !storedHash) return false;
        const valid = await verifyPin(oldPin, salt, storedHash);
        if (!valid) return false;
        const newSalt = generateSalt();
        const newHash = await hashPin(newPin, newSalt);
        store.set('pinHash', newHash);
        store.set('pinSalt', newSalt);
        return true;
    });

    ipcMain.handle('pin:disable', async (_event, pin: string) => {
        const salt = store.get('pinSalt');
        const storedHash = store.get('pinHash');
        if (!salt || !storedHash) return false;
        const valid = await verifyPin(pin, salt, storedHash);
        if (!valid) return false;
        store.set('pinEnabled', false);
        store.set('pinHash', '');
        store.set('pinSalt', '');
        return true;
    });

    // ─── Services Management ───
    ipcMain.handle('services:get-all', () => {
        return store.get('services');
    });

    ipcMain.handle('services:add', (_event, data: { name: string; url: string; category: string; icon: string }) => {
        const services = store.get('services');
        const newService: ServiceData = {
            id: generateServiceId(),
            name: data.name,
            url: data.url,
            category: data.category,
            icon: data.icon || '',
            favicon: '',
            notificationEnabled: true,
            muted: false,
            partitionId: generatePartitionId(data.name),
            hibernated: false,
            createdAt: new Date().toISOString(),
        };
        services.push(newService);
        store.set('services', services);
        return newService;
    });

    ipcMain.handle('services:update', (_event, id: string, updates: Partial<ServiceData>) => {
        const services = store.get('services');
        const idx = services.findIndex((s: ServiceData) => s.id === id);
        if (idx === -1) return null;
        const allowed: (keyof ServiceData)[] = ['name', 'url', 'icon', 'notificationEnabled', 'muted', 'favicon', 'hibernated'];
        for (const key of allowed) {
            if (key in updates) {
                (services[idx] as any)[key] = (updates as any)[key];
            }
        }
        store.set('services', services);
        return services[idx];
    });

    ipcMain.handle('services:delete', (_event, id: string) => {
        const services = store.get('services');
        const filtered = services.filter((s: ServiceData) => s.id !== id);
        store.set('services', filtered);
        return true;
    });

    ipcMain.handle('services:reorder', (_event, orderedIds: string[]) => {
        const services = store.get('services');
        const reordered: ServiceData[] = [];
        for (const id of orderedIds) {
            const svc = services.find((s: ServiceData) => s.id === id);
            if (svc) reordered.push(svc);
        }
        store.set('services', reordered);
        return reordered;
    });

    ipcMain.handle('services:toggle-mute', (_event, id: string) => {
        const services = store.get('services');
        const idx = services.findIndex((s: ServiceData) => s.id === id);
        if (idx === -1) return null;
        services[idx].muted = !services[idx].muted;
        store.set('services', services);
        return services[idx];
    });

    ipcMain.handle('services:toggle-hibernate', (_event, id: string) => {
        const services = store.get('services');
        const idx = services.findIndex((s: ServiceData) => s.id === id);
        if (idx === -1) return null;
        services[idx].hibernated = !services[idx].hibernated;
        store.set('services', services);
        return services[idx];
    });

    // ─── Settings ───
    ipcMain.handle('settings:get', () => {
        return store.get('settings');
    });

    ipcMain.handle('settings:set', (_event, key: string, value: any) => {
        const settings = store.get('settings');
        (settings as any)[key] = value;
        store.set('settings', settings);

        if (key === 'autoStart') {
            app.setLoginItemSettings({ openAtLogin: value as boolean });
        }

        return settings;
    });

    ipcMain.handle('settings:set-all', (_event, newSettings: any) => {
        store.set('settings', newSettings);
        if ('autoStart' in newSettings) {
            app.setLoginItemSettings({ openAtLogin: newSettings.autoStart });
        }
        return newSettings;
    });

    // ─── Active Service ───
    ipcMain.handle('active-service:get', () => {
        return store.get('activeServiceId');
    });

    ipcMain.handle('active-service:set', (_event, id: string) => {
        store.set('activeServiceId', id);
        return id;
    });

    // ─── Notifications ───
    ipcMain.handle('notification:show', (_event, data: { title: string; body: string; serviceId: string }) => {
        const services = store.get('services');
        const service = services.find((s: ServiceData) => s.id === data.serviceId);
        if (service && service.muted) return false;

        const notification = new Notification({
            title: data.title,
            body: data.body,
            silent: false,
        });

        notification.on('click', () => {
            const { BrowserWindow } = require('electron');
            const wins = BrowserWindow.getAllWindows();
            if (wins.length > 0) {
                wins[0].show();
                wins[0].focus();
                wins[0].webContents.send('switch-service', data.serviceId);
            }
        });

        notification.show();
        return true;
    });

    // ─── Utilities ───
    ipcMain.handle('shell:open-external', (_event, url: string) => {
        shell.openExternal(url);
        return true;
    });

    ipcMain.handle('app:get-version', () => {
        return app.getVersion();
    });

    ipcMain.handle('app:check-update', async () => {
        try {
            const fetchConfig = {
                headers: {
                    'User-Agent': `RijanBox/${app.getVersion()}`
                }
            };
            // Web Fetch API is available in modern Node.js
            const res = await fetch('https://api.github.com/repos/Rijanara-Teknologi/RijanBox/releases/latest', fetchConfig);
            if (!res.ok) {
                if (res.status === 403) throw new Error('API Rate Limit (403). Coba lagi nanti.');
                throw new Error(`HTTP Error ${res.status}`);
            }
            const data: any = await res.json();
            return {
                success: true,
                tag_name: data.tag_name,
                html_url: data.html_url
            };
        } catch (err: any) {
            console.error('Update Check Error:', err);
            return {
                success: false,
                error: err.message || 'Network error'
            };
        }
    });

    // ─── File Dialog for Icon Upload ───
    ipcMain.handle('dialog:open-image', async () => {
        const wins = BrowserWindow.getAllWindows();
        const win = wins.length > 0 ? wins[0] : null;
        const result = await dialog.showOpenDialog(win!, {
            title: 'Select Icon Image',
            filters: [
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'] },
            ],
            properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) return null;

        const filePath = result.filePaths[0];
        const ext = path.extname(filePath).toLowerCase().replace('.', '');
        const mimeMap: Record<string, string> = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
            gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon',
        };
        const mime = mimeMap[ext] || 'image/png';
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString('base64');
        return `data:${mime};base64,${base64}`;
    });
}
