/* ═══════════════════════════════════════════════
   RijanBox - Renderer Application
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── State ───
    let services = [];
    let activeServiceId = null;
    let currentPanel = 'welcome'; // welcome | webview | catalog | settings
    let i18n = {};
    let settings = {};
    let catalogData = [];
    let contextMenuServiceId = null;
    let isLocked = false;

    // Modern Chrome user-agent to prevent sites from blocking Electron's embedded browser
    const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

    // Color palette for service letters
    const COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6',
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4',
        '#84cc16', '#d946ef', '#0ea5e9', '#e11d48', '#7c3aed',
    ];

    function getColorForName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return COLORS[Math.abs(hash) % COLORS.length];
    }

    // ─── Initialize ───
    async function init() {
        settings = await window.rijanbox.settings.get();
        await loadLanguage(settings.language || 'id');
        applyTheme(settings.theme || 'auto');
        services = await window.rijanbox.services.getAll();
        activeServiceId = await window.rijanbox.activeService.get();
        await loadCatalog();

        renderSidebar();
        applySettings();
        setupEventListeners();
        setupMainProcessListeners();

        // Check PIN
        const pinEnabled = await window.rijanbox.pin.isEnabled();
        if (pinEnabled) {
            lockApp();
        } else if (services.length === 0) {
            // First time - offer PIN setup
            showPinSetup();
        }

        if (services.length > 0 && !pinEnabled) {
            if (activeServiceId) {
                activateService(activeServiceId);
            } else {
                activateService(services[0].id);
            }
        }
    }

    // ─── i18n ───
    async function loadLanguage(lang) {
        try {
            const res = await fetch(`../data/i18n/${lang}.json`);
            i18n = await res.json();
        } catch {
            const res = await fetch('../data/i18n/en.json');
            i18n = await res.json();
        }
        applyTranslations();
    }

    function t(path) {
        const keys = path.split('.');
        let val = i18n;
        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) val = val[k];
            else return path;
        }
        return val;
    }

    function applyTranslations() {
        // We set text content for all translatable elements
        const map = {
            'lock-title': 'pin.unlockTitle',
            'lock-desc': 'pin.unlockDesc',
            'btn-unlock': 'pin.unlock',
            'pin-setup-title': 'pin.setupTitle',
            'pin-setup-desc': 'pin.setupDesc',
            'btn-create-pin': 'pin.create',
            'btn-skip-pin': 'pin.skip',
            'welcome-tagline': 'app.tagline',
            'welcome-add-text': 'sidebar.addService',
            'catalog-title': 'catalog.title',
            'custom-url-title': 'catalog.customUrl',
            'btn-add-custom-text': 'catalog.add',
            'settings-title': 'settings.title',
            'settings-general-title': 'settings.general',
            'settings-appearance-title': 'settings.appearance',
            'settings-security-title': 'settings.security',
            'settings-shortcuts-title': 'settings.shortcuts',
            'settings-about-title': 'settings.about',
            'label-language': 'settings.language',
            'label-autostart': 'settings.autoStart',
            'label-minimized': 'settings.startMinimized',
            'label-tray': 'settings.closeToTray',
            'label-theme': 'settings.theme',
            'label-autolock': 'settings.autoLock',
            'label-pin-status': 'settings.security',
            'no-services-text': 'sidebar.noServices',
            'sc-lock': 'shortcuts.lock',
            'sc-settings': 'shortcuts.settings',
            'sc-new': 'shortcuts.newService',
            'sc-search': 'shortcuts.search',
            'sc-switch': 'shortcuts.switchService',
            'sc-mute': 'shortcuts.toggleMute',
            'sc-sidebar': 'shortcuts.toggleSidebar',
            'sc-fullscreen': 'shortcuts.fullscreen',
        };

        for (const [id, key] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (el) el.textContent = t(key);
        }

        // Placeholders
        const searchInput = document.getElementById('catalog-search-input');
        if (searchInput) searchInput.placeholder = t('catalog.search');

        const customName = document.getElementById('custom-url-name');
        if (customName) customName.placeholder = t('catalog.serviceNamePlaceholder');

        const customUrl = document.getElementById('custom-url-input');
        if (customUrl) customUrl.placeholder = t('catalog.customUrlPlaceholder');

        const pinInput = document.getElementById('pin-verify-input');
        if (pinInput) pinInput.placeholder = '••••';

        const pinNew = document.getElementById('pin-new-input');
        if (pinNew) pinNew.placeholder = t('pin.enterPin');

        const pinConfirm = document.getElementById('pin-confirm-input');
        if (pinConfirm) pinConfirm.placeholder = t('pin.confirmPin');

        // Theme buttons
        document.querySelector('#theme-light span').textContent = t('settings.themeLight');
        document.querySelector('#theme-dark span').textContent = t('settings.themeDark');
        document.querySelector('#theme-auto span').textContent = t('settings.themeAuto');

        // Category tabs
        const catTabs = document.querySelectorAll('.cat-tab');
        const catKeys = ['all', 'messaging', 'social', 'email', 'work', 'other'];
        catTabs.forEach((tab, i) => {
            if (catKeys[i]) tab.textContent = t(`catalog.categories.${catKeys[i]}`);
        });

        // Context menu
        document.querySelector('#ctx-rename span').textContent = t('contextMenu.rename');
        document.querySelector('#ctx-change-icon span').textContent = t('contextMenu.changeIcon');
        document.querySelector('#ctx-reload span').textContent = t('contextMenu.reload');
        document.querySelector('#ctx-delete span').textContent = t('contextMenu.delete');
        document.querySelector('#ctx-move-up span').textContent = t('contextMenu.moveUp');
        document.querySelector('#ctx-move-down span').textContent = t('contextMenu.moveDown');

        // Icon picker
        document.getElementById('icon-picker-title').textContent = t('contextMenu.changeIcon');
        document.getElementById('icon-tab-emoji').textContent = t('iconPicker.emoji');
        document.getElementById('icon-tab-upload').textContent = t('iconPicker.upload');
        document.getElementById('upload-text').textContent = t('iconPicker.uploadText');
    }

    // ─── Theme ───
    function applyTheme(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        window.rijanbox.theme.set(theme);

        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // ─── Catalog ───
    async function loadCatalog() {
        try {
            const res = await fetch('../data/services-catalog.json');
            catalogData = await res.json();
        } catch {
            catalogData = [];
        }
    }

    function renderCatalog(filter = 'all', search = '') {
        const grid = document.getElementById('catalog-grid');
        grid.innerHTML = '';

        let filtered = catalogData;
        if (filter !== 'all') {
            filtered = filtered.filter(s => s.category === filter);
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(s => s.name.toLowerCase().includes(q));
        }

        filtered.forEach(svc => {
            const item = document.createElement('div');
            item.className = 'catalog-item';
            item.dataset.name = svc.name;
            item.dataset.url = svc.url;
            item.dataset.category = svc.category;

            const color = getColorForName(svc.name);
            item.innerHTML = `
        <div class="catalog-item-icon" style="background:${color}">
          <img src="https://www.google.com/s2/favicons?domain=${new URL(svc.url).hostname}&sz=64" 
               onerror="this.style.display='none'; this.parentElement.textContent='${svc.name[0]}'"
               alt="${svc.name}">
        </div>
        <span class="catalog-item-name">${svc.name}</span>
      `;

            item.addEventListener('click', () => addServiceFromCatalog(svc));
            grid.appendChild(item);
        });
    }

    async function addServiceFromCatalog(svc) {
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(svc.url).hostname}&sz=64`;
        const newService = await window.rijanbox.services.add({
            name: svc.name,
            url: svc.url,
            category: svc.category,
            icon: faviconUrl,
        });
        services.push(newService);
        renderSidebar();
        activateService(newService.id);
        showPanel('webview');
    }

    async function addCustomService() {
        const nameInput = document.getElementById('custom-url-name');
        const urlInput = document.getElementById('custom-url-input');
        let name = nameInput.value.trim();
        let url = urlInput.value.trim();

        if (!url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        if (!name) {
            try { name = new URL(url).hostname; } catch { name = url; }
        }

        let faviconUrl = '';
        try {
            faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
        } catch { /* ignore */ }

        const newService = await window.rijanbox.services.add({
            name,
            url,
            category: 'other',
            icon: faviconUrl,
        });

        services.push(newService);
        renderSidebar();
        activateService(newService.id);
        showPanel('webview');

        nameInput.value = '';
        urlInput.value = '';
    }

    // ─── Sidebar ───
    function renderSidebar() {
        const list = document.getElementById('service-list');
        const noServices = document.getElementById('no-services');

        // Remove existing service items (keep noServices placeholder)
        list.querySelectorAll('.service-item').forEach(el => el.remove());

        if (services.length === 0) {
            noServices.classList.remove('hidden');
            return;
        }

        noServices.classList.add('hidden');

        services.forEach(svc => {
            const item = document.createElement('div');
            item.className = 'service-item' + (svc.id === activeServiceId ? ' active' : '') + (svc.muted ? ' muted' : '');
            item.dataset.id = svc.id;
            item.dataset.tooltip = svc.name;

            const color = getColorForName(svc.name);
            if (svc.icon && svc.icon.startsWith('emoji:')) {
                const emoji = svc.icon.replace('emoji:', '');
                item.innerHTML = `<span class="service-emoji">${emoji}</span>`;
            } else if (svc.icon) {
                item.innerHTML = `<img src="${svc.icon}" onerror="this.style.display='none'; const el=document.createElement('span'); el.className='service-letter'; el.textContent='${svc.name[0]}'; this.parentElement.appendChild(el);" alt="${svc.name}">`;
            } else {
                item.innerHTML = `<span class="service-letter" style="color:${color}">${svc.name[0]}</span>`;
            }

            if (svc.muted) {
                item.innerHTML += `<svg class="mute-icon" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2"/><path d="M23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
            }

            item.addEventListener('click', () => activateService(svc.id));
            item.addEventListener('contextmenu', (e) => showContextMenu(e, svc.id));

            list.appendChild(item);
        });
    }

    // ─── Service Activation ───
    function activateService(id) {
        const svc = services.find(s => s.id === id);
        if (!svc) return;

        activeServiceId = id;
        window.rijanbox.activeService.set(id);

        // Update sidebar highlights
        document.querySelectorAll('.service-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
        });

        showPanel('webview');
        loadWebview(svc);
        signalActivity();
    }

    function loadWebview(svc) {
        const container = document.getElementById('webview-container');

        // Hide all existing webviews
        container.querySelectorAll('webview').forEach(wv => {
            wv.style.display = 'none';
        });

        // Check if webview already exists
        let existing = container.querySelector(`webview[data-service-id="${svc.id}"]`);
        if (existing) {
            existing.style.display = 'flex';
            return;
        }

        // Create new webview
        const wv = document.createElement('webview');
        wv.setAttribute('src', svc.url);
        wv.setAttribute('partition', svc.partitionId);
        wv.setAttribute('data-service-id', svc.id);
        wv.setAttribute('autosize', 'on');
        wv.setAttribute('allowpopups', '');
        wv.setAttribute('useragent', CHROME_USER_AGENT);
        wv.style.flex = '1';
        wv.style.width = '100%';
        wv.style.height = '100%';

        // Notification detection
        wv.addEventListener('ipc-message', (e) => {
            if (e.channel === 'notification') {
                if (!svc.muted && svc.notificationEnabled) {
                    window.rijanbox.notification.show({
                        title: svc.name,
                        body: e.args[0] || 'New message',
                        serviceId: svc.id,
                    });
                }
            }
        });

        // Page title change as notification hint
        wv.addEventListener('page-title-updated', (e) => {
            const title = e.title || '';
            // Many services show unread count in title, e.g. "(3) WhatsApp"
            const match = title.match(/\((\d+)\)/);
            if (match) {
                updateBadge(svc.id, parseInt(match[1]));
                if (!svc.muted && svc.notificationEnabled) {
                    window.rijanbox.notification.show({
                        title: svc.name,
                        body: `${match[1]} new notification(s)`,
                        serviceId: svc.id,
                    });
                }
            } else {
                updateBadge(svc.id, 0);
            }
        });

        // Favicon update
        wv.addEventListener('page-favicon-updated', (e) => {
            if (e.favicons && e.favicons.length > 0 && !svc.icon) {
                window.rijanbox.services.update(svc.id, { favicon: e.favicons[0] });
            }
        });

        container.appendChild(wv);
    }

    function updateBadge(serviceId, count) {
        const item = document.querySelector(`.service-item[data-id="${serviceId}"]`);
        if (!item) return;

        let badge = item.querySelector('.badge-count');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge-count';
                item.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count;
        } else if (badge) {
            badge.remove();
        }
    }

    // ─── Panels ───
    function showPanel(panel) {
        currentPanel = panel;
        document.getElementById('welcome-screen').classList.toggle('hidden', panel !== 'welcome');
        document.getElementById('webview-container').classList.toggle('hidden', panel !== 'webview');
        document.getElementById('catalog-panel').classList.toggle('hidden', panel !== 'catalog');
        document.getElementById('settings-panel').classList.toggle('hidden', panel !== 'settings');

        if (panel === 'catalog') {
            renderCatalog();
            document.getElementById('catalog-search-input').focus();
        }
    }

    // ─── Context Menu ───
    function showContextMenu(e, serviceId) {
        e.preventDefault();
        contextMenuServiceId = serviceId;
        const menu = document.getElementById('context-menu');
        const svc = services.find(s => s.id === serviceId);
        const svcIdx = services.findIndex(s => s.id === serviceId);

        // Update mute label
        const muteBtn = document.getElementById('ctx-mute');
        muteBtn.querySelector('span').textContent = svc.muted ? t('contextMenu.unmute') : t('contextMenu.mute');

        // Enable/disable move buttons based on position
        document.getElementById('ctx-move-up').disabled = svcIdx === 0;
        document.getElementById('ctx-move-down').disabled = svcIdx === services.length - 1;
        document.getElementById('ctx-move-up').style.opacity = svcIdx === 0 ? '0.4' : '1';
        document.getElementById('ctx-move-down').style.opacity = svcIdx === services.length - 1 ? '0.4' : '1';

        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.classList.remove('hidden');

        // Close on next click
        const closeMenu = () => {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeMenu);
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 10);
    }

    // ─── Lock / PIN ───
    function lockApp() {
        isLocked = true;
        document.getElementById('lock-screen').classList.remove('hidden');
        document.getElementById('pin-verify-input').value = '';
        document.getElementById('pin-error').classList.add('hidden');
        document.getElementById('pin-verify-input').focus();
    }

    function unlockApp() {
        isLocked = false;
        document.getElementById('lock-screen').classList.add('hidden');

        if (services.length === 0) {
            showPanel('welcome');
        } else if (activeServiceId) {
            activateService(activeServiceId);
        }
    }

    function showPinSetup() {
        document.getElementById('pin-setup-screen').classList.remove('hidden');
        document.getElementById('pin-new-input').value = '';
        document.getElementById('pin-confirm-input').value = '';
        document.getElementById('pin-setup-error').classList.add('hidden');
        document.getElementById('pin-new-input').focus();
    }

    function hidePinSetup() {
        document.getElementById('pin-setup-screen').classList.add('hidden');
    }

    // ─── Settings ───
    function applySettings() {
        document.getElementById('setting-language').value = settings.language || 'id';
        document.getElementById('setting-autostart').checked = settings.autoStart || false;
        document.getElementById('setting-minimized').checked = settings.startMinimized || false;
        document.getElementById('setting-tray').checked = settings.closeToTray !== false;
        document.getElementById('setting-autolock').value = String(settings.autoLockMinutes ?? 5);

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === (settings.theme || 'auto'));
        });

        updatePinStatusUI();
    }

    async function updatePinStatusUI() {
        const enabled = await window.rijanbox.pin.isEnabled();
        const statusText = document.getElementById('pin-status-text');
        const btnEnable = document.getElementById('btn-enable-pin');
        const btnChange = document.getElementById('btn-change-pin');
        const btnDisable = document.getElementById('btn-disable-pin');

        if (enabled) {
            statusText.textContent = settings.language === 'en' ? 'Active' : 'Aktif';
            statusText.classList.add('active');
            btnEnable.classList.add('hidden');
            btnChange.classList.remove('hidden');
            btnDisable.classList.remove('hidden');
        } else {
            statusText.textContent = settings.language === 'en' ? 'Inactive' : 'Tidak Aktif';
            statusText.classList.remove('active');
            btnEnable.classList.remove('hidden');
            btnChange.classList.add('hidden');
            btnDisable.classList.add('hidden');
        }
    }

    // ─── Activity Signal ───
    function signalActivity() {
        window.rijanbox.signalActivity();
    }

    // ─── Event Listeners ───
    function setupEventListeners() {
        // Window controls
        document.getElementById('btn-minimize').addEventListener('click', () => window.rijanbox.window.minimize());
        document.getElementById('btn-maximize').addEventListener('click', () => window.rijanbox.window.maximize());
        document.getElementById('btn-close').addEventListener('click', () => window.rijanbox.window.close());

        // Sidebar actions
        document.getElementById('btn-add-service').addEventListener('click', () => showPanel('catalog'));
        document.getElementById('btn-settings').addEventListener('click', () => showPanel('settings'));
        document.getElementById('btn-lock').addEventListener('click', async () => {
            const pinEnabled = await window.rijanbox.pin.isEnabled();
            if (pinEnabled) {
                lockApp();
            } else {
                showPinSetup();
            }
        });
        document.getElementById('btn-welcome-add').addEventListener('click', () => showPanel('catalog'));

        // Catalog
        document.getElementById('btn-catalog-close').addEventListener('click', () => {
            showPanel(services.length > 0 ? 'webview' : 'welcome');
        });
        document.getElementById('catalog-search-input').addEventListener('input', (e) => {
            const activeTab = document.querySelector('.cat-tab.active');
            const category = activeTab ? activeTab.dataset.category : 'all';
            renderCatalog(category, e.target.value);
        });
        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const search = document.getElementById('catalog-search-input').value;
                renderCatalog(tab.dataset.category, search);
            });
        });
        document.getElementById('btn-add-custom').addEventListener('click', addCustomService);
        document.getElementById('custom-url-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addCustomService();
        });

        // Settings close
        document.getElementById('btn-settings-close').addEventListener('click', () => {
            showPanel(services.length > 0 ? 'webview' : 'welcome');
        });

        // Settings changes
        document.getElementById('setting-language').addEventListener('change', async (e) => {
            settings.language = e.target.value;
            await window.rijanbox.settings.set('language', settings.language);
            await loadLanguage(settings.language);
        });
        document.getElementById('setting-autostart').addEventListener('change', async (e) => {
            settings.autoStart = e.target.checked;
            await window.rijanbox.settings.set('autoStart', settings.autoStart);
        });
        document.getElementById('setting-minimized').addEventListener('change', async (e) => {
            settings.startMinimized = e.target.checked;
            await window.rijanbox.settings.set('startMinimized', settings.startMinimized);
        });
        document.getElementById('setting-tray').addEventListener('change', async (e) => {
            settings.closeToTray = e.target.checked;
            await window.rijanbox.settings.set('closeToTray', settings.closeToTray);
        });
        document.getElementById('setting-autolock').addEventListener('change', async (e) => {
            settings.autoLockMinutes = parseInt(e.target.value);
            await window.rijanbox.settings.set('autoLockMinutes', settings.autoLockMinutes);
        });

        // Theme
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const theme = btn.dataset.theme;
                settings.theme = theme;
                await window.rijanbox.settings.set('theme', theme);
                applyTheme(theme);
            });
        });

        // PIN - Unlock
        document.getElementById('btn-unlock').addEventListener('click', async () => {
            const pin = document.getElementById('pin-verify-input').value;
            if (!pin) return;
            const valid = await window.rijanbox.pin.verify(pin);
            if (valid) {
                unlockApp();
            } else {
                document.getElementById('pin-error').textContent = t('pin.incorrect');
                document.getElementById('pin-error').classList.remove('hidden');
                document.getElementById('pin-verify-input').value = '';
                document.getElementById('pin-verify-input').focus();
            }
        });
        document.getElementById('pin-verify-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('btn-unlock').click();
        });

        // PIN - Setup
        document.getElementById('btn-create-pin').addEventListener('click', async () => {
            const pin = document.getElementById('pin-new-input').value;
            const confirm = document.getElementById('pin-confirm-input').value;
            if (pin.length < 4) {
                document.getElementById('pin-setup-error').textContent = settings.language === 'en' ? 'PIN must be at least 4 digits' : 'PIN minimal 4 digit';
                document.getElementById('pin-setup-error').classList.remove('hidden');
                return;
            }
            if (pin !== confirm) {
                document.getElementById('pin-setup-error').textContent = t('pin.mismatch');
                document.getElementById('pin-setup-error').classList.remove('hidden');
                return;
            }
            await window.rijanbox.pin.setup(pin);
            hidePinSetup();
            await updatePinStatusUI();
        });
        document.getElementById('btn-skip-pin').addEventListener('click', hidePinSetup);

        // PIN - Settings actions
        document.getElementById('btn-enable-pin').addEventListener('click', showPinSetup);
        document.getElementById('btn-change-pin').addEventListener('click', () => {
            showPinSetup();
        });
        document.getElementById('btn-disable-pin').addEventListener('click', async () => {
            const pin = prompt(settings.language === 'en' ? 'Enter current PIN to disable:' : 'Masukkan PIN saat ini untuk menonaktifkan:');
            if (!pin) return;
            const result = await window.rijanbox.pin.disable(pin);
            if (result) {
                await updatePinStatusUI();
            } else {
                alert(t('pin.incorrect'));
            }
        });

        // Context menu actions
        document.getElementById('ctx-rename').addEventListener('click', async () => {
            if (!contextMenuServiceId) return;
            const svc = services.find(s => s.id === contextMenuServiceId);
            if (!svc) return;
            const promptText = settings.language === 'en' ? 'Enter new name:' : 'Masukkan nama baru:';
            const newName = prompt(promptText, svc.name);
            if (!newName || newName.trim() === '' || newName.trim() === svc.name) return;
            await window.rijanbox.services.update(contextMenuServiceId, { name: newName.trim() });
            const idx = services.findIndex(s => s.id === contextMenuServiceId);
            if (idx !== -1) services[idx].name = newName.trim();
            renderSidebar();
        });
        document.getElementById('ctx-change-icon').addEventListener('click', () => {
            if (!contextMenuServiceId) return;
            openIconPicker(contextMenuServiceId);
        });
        document.getElementById('ctx-mute').addEventListener('click', async () => {
            if (!contextMenuServiceId) return;
            const updated = await window.rijanbox.services.toggleMute(contextMenuServiceId);
            if (updated) {
                const idx = services.findIndex(s => s.id === contextMenuServiceId);
                if (idx !== -1) services[idx].muted = updated.muted;
                renderSidebar();
            }
        });
        document.getElementById('ctx-reload').addEventListener('click', () => {
            if (!contextMenuServiceId) return;
            const wv = document.querySelector(`webview[data-service-id="${contextMenuServiceId}"]`);
            if (wv) wv.reload();
        });
        document.getElementById('ctx-move-up').addEventListener('click', async () => {
            if (!contextMenuServiceId) return;
            const idx = services.findIndex(s => s.id === contextMenuServiceId);
            if (idx <= 0) return;
            [services[idx - 1], services[idx]] = [services[idx], services[idx - 1]];
            await window.rijanbox.services.reorder(services.map(s => s.id));
            renderSidebar();
        });
        document.getElementById('ctx-move-down').addEventListener('click', async () => {
            if (!contextMenuServiceId) return;
            const idx = services.findIndex(s => s.id === contextMenuServiceId);
            if (idx === -1 || idx >= services.length - 1) return;
            [services[idx], services[idx + 1]] = [services[idx + 1], services[idx]];
            await window.rijanbox.services.reorder(services.map(s => s.id));
            renderSidebar();
        });
        document.getElementById('ctx-delete').addEventListener('click', async () => {
            if (!contextMenuServiceId) return;
            const svc = services.find(s => s.id === contextMenuServiceId);
            if (!svc) return;
            if (!confirm(t('contextMenu.deleteConfirm'))) return;
            await window.rijanbox.services.delete(contextMenuServiceId);
            services = services.filter(s => s.id !== contextMenuServiceId);

            // Remove webview
            const wv = document.querySelector(`webview[data-service-id="${contextMenuServiceId}"]`);
            if (wv) wv.remove();

            if (activeServiceId === contextMenuServiceId) {
                activeServiceId = services.length > 0 ? services[0].id : null;
                if (activeServiceId) activateService(activeServiceId);
                else showPanel('welcome');
            }
            renderSidebar();
        });

        // Activity tracking
        document.addEventListener('mousemove', signalActivity);
        document.addEventListener('keydown', signalActivity);

        // System theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (settings.theme === 'auto') applyTheme('auto');
        });
    }

    // ─── Icon Picker ───
    const EMOJI_LIST = [
        '💬', '📱', '📧', '📨', '✉️', '💼', '🏢', '🎯', '🚀', '⭐',
        '❤️', '🔥', '💡', '🎨', '🎵', '🎮', '📷', '🎥', '📺', '🌐',
        '🔗', '📝', '📋', '📊', '📈', '💰', '🛒', '🔔', '🔑', '🔒',
        '👤', '👥', '🏠', '🏫', '🎓', '📚', '✏️', '🖊️', '📌', '📎',
        '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐸', '🐧', '🦋', '🌸',
        '🌺', '🌻', '🌹', '🍀', '🌈', '☀️', '🌙', '⚡', '💎', '🎪',
        '🏆', '🎖️', '🎁', '🎂', '🍕', '🍔', '☕', '🍵', '🎃', '🤖',
        '👾', '🛡️', '⚙️', '🔧', '🧪', '📡', '💻', '🖥️', '⌨️', '🖨️',
    ];

    let iconPickerTargetId = null;

    function openIconPicker(serviceId) {
        iconPickerTargetId = serviceId;
        const overlay = document.getElementById('icon-picker-overlay');
        const grid = document.getElementById('emoji-grid');

        // Populate emoji grid
        grid.innerHTML = '';
        EMOJI_LIST.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.addEventListener('click', () => selectEmoji(emoji));
            grid.appendChild(btn);
        });

        // Reset to emoji tab
        document.getElementById('icon-tab-emoji').classList.add('active');
        document.getElementById('icon-tab-upload').classList.remove('active');
        document.getElementById('icon-tab-emoji-content').classList.remove('hidden');
        document.getElementById('icon-tab-upload-content').classList.add('hidden');

        overlay.classList.remove('hidden');
    }

    function closeIconPicker() {
        document.getElementById('icon-picker-overlay').classList.add('hidden');
        iconPickerTargetId = null;
    }

    async function selectEmoji(emoji) {
        if (!iconPickerTargetId) return;
        const iconValue = 'emoji:' + emoji;
        await window.rijanbox.services.update(iconPickerTargetId, { icon: iconValue });
        const idx = services.findIndex(s => s.id === iconPickerTargetId);
        if (idx !== -1) services[idx].icon = iconValue;
        renderSidebar();
        closeIconPicker();
    }

    async function uploadIconFile() {
        if (!iconPickerTargetId) return;
        const dataUrl = await window.rijanbox.dialog.openImage();
        if (!dataUrl) return;
        await window.rijanbox.services.update(iconPickerTargetId, { icon: dataUrl });
        const idx = services.findIndex(s => s.id === iconPickerTargetId);
        if (idx !== -1) services[idx].icon = dataUrl;
        renderSidebar();
        closeIconPicker();
    }

    // Icon picker event listeners (called once during init)
    document.getElementById('icon-picker-close').addEventListener('click', closeIconPicker);
    document.getElementById('icon-picker-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeIconPicker();
    });

    document.querySelectorAll('.icon-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.icon-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            document.getElementById('icon-tab-emoji-content').classList.toggle('hidden', tabName !== 'emoji');
            document.getElementById('icon-tab-upload-content').classList.toggle('hidden', tabName !== 'upload');
        });
    });

    document.getElementById('upload-area').addEventListener('click', uploadIconFile);

    // ─── Main Process Events ───
    function setupMainProcessListeners() {
        window.rijanbox.on('lock-app', () => {
            window.rijanbox.pin.isEnabled().then(enabled => {
                if (enabled) lockApp();
                else showPinSetup();
            });
        });

        window.rijanbox.on('navigate', (target) => {
            if (target === 'settings') showPanel('settings');
            else if (target === 'add-service') showPanel('catalog');
            else if (target === 'search') {
                showPanel('catalog');
                setTimeout(() => document.getElementById('catalog-search-input').focus(), 100);
            }
        });

        window.rijanbox.on('switch-service', (serviceId) => {
            activateService(serviceId);
        });

        window.rijanbox.on('shortcut', (action) => {
            if (isLocked) return;

            if (action.startsWith('switch-service-')) {
                const idx = parseInt(action.split('-')[2]) - 1;
                if (services[idx]) activateService(services[idx].id);
            } else if (action === 'toggle-mute') {
                if (activeServiceId) {
                    document.getElementById('ctx-mute').click();
                    contextMenuServiceId = activeServiceId;
                    window.rijanbox.services.toggleMute(activeServiceId).then(updated => {
                        if (updated) {
                            const idx = services.findIndex(s => s.id === activeServiceId);
                            if (idx !== -1) services[idx].muted = updated.muted;
                            renderSidebar();
                        }
                    });
                }
            } else if (action === 'toggle-sidebar') {
                document.getElementById('sidebar').classList.toggle('collapsed');
            }
        });
    }

    // ─── Start ───
    document.addEventListener('DOMContentLoaded', init);
})();
