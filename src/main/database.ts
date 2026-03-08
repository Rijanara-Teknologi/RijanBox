import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';

let db: Database.Database | null = null;

export function initDatabase() {
    if (db) return;

    try {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'rijanbox-notifications.sqlite');
        db = new Database(dbPath);

        // Turn on WAL mode for better performance/concurrency
        db.pragma('journal_mode = WAL');

        // Automatic Table Creation Mechanism (Migration) for existing and new users
        db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                serviceId TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            )
        `);
    } catch (error) {
        console.error('Failed to initialize local sqlite database:', error);
    }
}

export function saveNotification(data: { serviceId: string; title: string; body: string; timestamp: number }) {
    if (!db) return;
    try {
        const stmt = db.prepare('INSERT INTO notifications (serviceId, title, body, timestamp) VALUES (?, ?, ?, ?)');
        stmt.run(data.serviceId, data.title, data.body, data.timestamp);
    } catch (error) {
        console.error('Failed to save notification:', error);
    }
}

export function getNotifications() {
    if (!db) return [];
    try {
        // Limit to 100 to prevent unbounded memory usage if user never clears
        const stmt = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 100');
        return stmt.all();
    } catch (error) {
        console.error('Failed to get notifications:', error);
        return [];
    }
}

export function clearNotifications() {
    if (!db) return;
    try {
        const stmt = db.prepare('DELETE FROM notifications');
        stmt.run();
    } catch (error) {
        console.error('Failed to clear notifications:', error);
    }
}
