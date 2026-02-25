import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceData {
    id: string;
    name: string;
    url: string;
    category: string;
    icon: string;
    favicon: string;
    notificationEnabled: boolean;
    muted: boolean;
    partitionId: string;
    createdAt: string;
}

interface SettingsData {
    language: 'id' | 'en';
    theme: 'light' | 'dark' | 'auto';
    colorTheme: string;
    autoStart: boolean;
    startMinimized: boolean;
    autoLockMinutes: number;
    closeToTray: boolean;
    linkOpenBehavior: 'inapp' | 'external';
    adblockDns: 'bebasid' | 'openbld' | 'nextdns' | 'adguard' | 'off';
    adblockCustomDoh: string;
}

interface StoreSchema {
    pinHash: string;
    pinSalt: string;
    pinEnabled: boolean;
    services: ServiceData[];
    settings: SettingsData;
    activeServiceId: string;
}

const DEFAULTS: StoreSchema = {
    pinHash: '',
    pinSalt: '',
    pinEnabled: false,
    services: [],
    settings: {
        language: 'id',
        theme: 'auto',
        colorTheme: 'blue',
        autoStart: false,
        startMinimized: false,
        autoLockMinutes: 5,
        closeToTray: true,
        linkOpenBehavior: 'inapp',
        adblockDns: 'bebasid',
        adblockCustomDoh: '',
    },
    activeServiceId: '',
};

class JsonStore {
    private data: StoreSchema;
    private filePath: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.filePath = path.join(userDataPath, 'rijanbox-config.json');
        this.data = this.load();
    }

    private load(): StoreSchema {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                return { ...DEFAULTS, ...parsed };
            }
        } catch {
            // Corrupted file, use defaults
        }
        return { ...DEFAULTS };
    }

    private save(): void {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
            console.error('Failed to save store:', err);
        }
    }

    get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
        return this.data[key] ?? DEFAULTS[key];
    }

    set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
        this.data[key] = value;
        this.save();
    }
}

const store = new JsonStore();

export { store, ServiceData, SettingsData, StoreSchema };
