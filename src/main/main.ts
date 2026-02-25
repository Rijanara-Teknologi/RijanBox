import { app, BrowserWindow, globalShortcut, powerMonitor, session } from 'electron';
import * as path from 'path';
import { createTray, destroyTray } from './tray';
import { registerIpcHandlers } from './ipc-handlers';
import { store } from './store';

let mainWindow: BrowserWindow | null = null;
let autoLockTimer: NodeJS.Timeout | null = null;

// Set app name for notifications & taskbar on Windows
app.name = 'RijanBox';
if (process.platform === 'win32') {
    app.setAppUserModelId('RijanBox');
}

function createMainWindow(): BrowserWindow {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'RijanBox',
        icon: path.join(__dirname, '../../assets/icon.png'),
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webviewTag: true,
        },
        show: false,
    });

    win.loadFile(path.join(__dirname, '../../src/renderer/index.html'));

    win.once('ready-to-show', () => {
        const settings = store.get('settings');
        if (!settings.startMinimized) {
            win.show();
        }
    });

    win.on('close', (e) => {
        const settings = store.get('settings');
        if (settings.closeToTray && !(app as any)._forceQuit) {
            e.preventDefault();
            win.hide();
            // On macOS, also hide from dock when minimized to tray
            if (process.platform === 'darwin') {
                app.dock?.hide();
            }
        }
    });

    return win;
}

function registerShortcuts(win: BrowserWindow): void {
    // Service switching: Ctrl+1 through Ctrl+9
    for (let i = 1; i <= 9; i++) {
        globalShortcut.register(`CommandOrControl+${i}`, () => {
            win.webContents.send('shortcut', `switch-service-${i}`);
        });
    }

    globalShortcut.register('CommandOrControl+L', () => {
        win.webContents.send('lock-app');
    });

    globalShortcut.register('CommandOrControl+,', () => {
        win.show();
        win.focus();
        win.webContents.send('navigate', 'settings');
    });

    globalShortcut.register('CommandOrControl+N', () => {
        win.show();
        win.focus();
        win.webContents.send('navigate', 'add-service');
    });

    globalShortcut.register('CommandOrControl+K', () => {
        win.show();
        win.focus();
        win.webContents.send('navigate', 'search');
    });

    globalShortcut.register('CommandOrControl+M', () => {
        win.webContents.send('shortcut', 'toggle-mute');
    });

    globalShortcut.register('CommandOrControl+T', () => {
        win.webContents.send('shortcut', 'toggle-sidebar');
    });

    globalShortcut.register('F11', () => {
        win.setFullScreen(!win.isFullScreen());
    });
}

function setupAutoLock(win: BrowserWindow): void {
    resetAutoLockTimer(win);

    powerMonitor.on('lock-screen', () => {
        win.webContents.send('lock-app');
    });

    powerMonitor.on('suspend', () => {
        win.webContents.send('lock-app');
    });
}

function resetAutoLockTimer(win: BrowserWindow): void {
    if (autoLockTimer) {
        clearTimeout(autoLockTimer);
        autoLockTimer = null;
    }

    const settings = store.get('settings');
    if (settings.autoLockMinutes > 0 && store.get('pinEnabled')) {
        autoLockTimer = setTimeout(() => {
            win.webContents.send('lock-app');
        }, settings.autoLockMinutes * 60 * 1000);
    }
}

// ─── DNS Ad Blocker Config ───
const DNS_PROVIDERS: Record<string, string> = {
    bebasid: 'https://dns.bebasid.com/dns-query',
    openbld: 'https://ada.openbld.net/dns-query',
};

function applyDnsConfig(): void {
    const settings = store.get('settings');
    const dns = settings.adblockDns || 'bebasid';

    if (dns === 'off') {
        // Reset to system default
        app.configureHostResolver({
            enableBuiltInResolver: true,
            secureDnsMode: 'off',
            secureDnsServers: [],
        });
        return;
    }

    let dohUrl: string = '';
    if (dns === 'nextdns' || dns === 'adguard') {
        dohUrl = settings.adblockCustomDoh || '';
    } else {
        dohUrl = DNS_PROVIDERS[dns] || DNS_PROVIDERS['bebasid'];
    }

    if (dohUrl) {
        app.configureHostResolver({
            enableBuiltInResolver: true,
            secureDnsMode: 'secure',
            secureDnsServers: [dohUrl],
        });
    }
}

app.on('ready', () => {
    registerIpcHandlers();
    mainWindow = createMainWindow();
    createTray(mainWindow);
    registerShortcuts(mainWindow);
    setupAutoLock(mainWindow);

    // Apply stored auto-start setting for all platforms
    const settings = store.get('settings');
    app.setLoginItemSettings({ openAtLogin: settings.autoStart || false });

    // Apply DNS config
    applyDnsConfig();

    // Apply theme to native elements
    if (settings.theme === 'dark') {
        require('electron').nativeTheme.themeSource = 'dark';
    } else if (settings.theme === 'light') {
        require('electron').nativeTheme.themeSource = 'light';
    } else {
        require('electron').nativeTheme.themeSource = 'system';
    }

    // Listen for user activity to reset auto-lock timer
    const { ipcMain } = require('electron');
    ipcMain.on('user-activity', () => {
        if (mainWindow) resetAutoLockTimer(mainWindow);
    });

    ipcMain.on('window-control', (_event: any, action: string) => {
        if (!mainWindow) return;
        switch (action) {
            case 'minimize':
                mainWindow.minimize();
                break;
            case 'maximize':
                if (mainWindow.isMaximized()) {
                    mainWindow.unmaximize();
                } else {
                    mainWindow.maximize();
                }
                break;
            case 'close':
                mainWindow.close();
                break;
        }
    });

    ipcMain.handle('theme:set', (_event: any, theme: string) => {
        const { nativeTheme } = require('electron');
        if (theme === 'dark') nativeTheme.themeSource = 'dark';
        else if (theme === 'light') nativeTheme.themeSource = 'light';
        else nativeTheme.themeSource = 'system';
        return theme;
    });
});

// macOS: use before-quit to mark force quit so close-to-tray works
app.on('before-quit', () => {
    (app as any)._forceQuit = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // macOS: show window when clicking dock icon
    if (mainWindow) {
        mainWindow.show();
        app.dock?.show();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    destroyTray();
    if (autoLockTimer) clearTimeout(autoLockTimer);
});
