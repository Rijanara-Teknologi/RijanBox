import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow): Tray {
    const iconPath = path.join(__dirname, '../../assets/icon.png');
    let trayImage: Electron.NativeImage;

    try {
        trayImage = nativeImage.createFromPath(iconPath);
        if (trayImage.isEmpty()) {
            trayImage = nativeImage.createEmpty();
        } else {
            // Resize for tray: macOS needs 16x16, Windows/Linux 16x16 or 32x32
            const size = process.platform === 'darwin' ? 16 : 32;
            trayImage = trayImage.resize({ width: size, height: size });
            if (process.platform === 'darwin') {
                trayImage.setTemplateImage(true); // Makes it adapt to dark/light menu bar
            }
        }
    } catch {
        trayImage = nativeImage.createEmpty();
    }

    tray = new Tray(trayImage);
    tray.setToolTip('RijanBox');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open RijanBox',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            },
        },
        {
            label: 'Settings',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send('navigate', 'settings');
            },
        },
        {
            label: 'Lock Now',
            click: () => {
                mainWindow.webContents.send('lock-app');
            },
        },
        { type: 'separator' },
        {
            label: 'Exit RijanBox',
            click: () => {
                (app as any)._forceQuit = true;
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    // On macOS, clicking the tray icon shows the context menu (no double-click).
    // On Windows/Linux, double-click opens the window.
    if (process.platform !== 'darwin') {
        tray.on('double-click', () => {
            mainWindow.show();
            mainWindow.focus();
        });
    } else {
        tray.on('click', () => {
            mainWindow.show();
            mainWindow.focus();
        });
    }

    return tray;
}

export function destroyTray(): void {
    if (tray) {
        tray.destroy();
        tray = null;
    }
}
