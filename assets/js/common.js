/**
 * H/W Work Project - Common Logic (common.js)
 * 경로: ./assets/js/common.js
 */

// 전역 변수
window.db = null;

/**
 * 1. IndexedDB 초기화
 */
window.initDB = function() {
    const request = indexedDB.open("SeariseSaverDB", 1);
    request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains("settings")) {
            database.createObjectStore("settings", { keyPath: "id" });
        }
    };
    request.onsuccess = (e) => {
        window.db = e.target.result;
        window.loadConfigFromDB();
    };
    request.onerror = (e) => console.error("DB Error:", e);
};

/**
 * 2. 공통 UI 주입 (initHeader)
 */
window.initHeader = function(pageTitle) {
    if (document.getElementById('settings-modal')) return;

    const commonStyles = `
        <style>
            :root {
                --bg: #1a1a1a; --card: #252525; --text: #eee; --border: #444;
                --accent: #00d8d6; --sub-text: #aaa; --input-bg: #111;
            }
            [data-theme="light"] {
                --bg: #f5f6fa; --card: #ffffff; --text: #2f3640; --border: #dcdde1;
                --accent: #0097e6; --sub-text: #7f8c8d; --input-bg: #fff;
            }
            body { margin: 0; padding: 0; transition: 0.3s; font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); }

            .header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 10px 30px; background: #1a1a1a; border-bottom: 1px solid var(--border);
                position: fixed; top: 0; left: 0; width: 100%; box-sizing: border-box; z-index: 2000;
            }
            .header-left { display: flex; align-items: center; gap: 40px; }
            .logo { font-size: 1.5rem; font-weight: bold; color: var(--accent); text-decoration: none; cursor: pointer; }
            
            .text-nav { display: flex; gap: 20px; }
            .text-nav a { 
                color: var(--text); text-decoration: none; font-weight: bold; font-size: 0.95rem; transition: 0.2s; 
            }
            .text-nav a:hover { color: var(--accent); }

            .nav-menu { display: flex; gap: 10px; align-items: center; }
            .btn-common {
                padding: 8px 16px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border);
                font-weight: bold; font-size: 0.9rem; background: #252525; color: #fff; text-decoration: none;
                display: inline-flex; align-items: center; gap: 5px; transition: 0.2s; border: none;
            }
            .btn-common:hover { background: #333; color: var(--accent); }
            .btn-highlight { border: 1px solid var(--accent); color: var(--accent); background: transparent; }
            #header-spacer { height: 75px; }

            #settings-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); display: none; justify-content: center; align-items: center;
                z-index: 3000; backdrop-filter: blur(5px);
            }
            .modal-content {
                background: var(--card); border: 2px solid var(--accent); border-radius: 16px;
                width: 480px; padding: 30px; color: var(--text); text-align: left;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
            .modal-header h2 { margin: 0; color: var(--accent); font-size: 1.8rem; }
            .modal-input-group { margin-bottom: 15px; }
            .modal-input-group label { display: block; font-size: 0.85rem; color: var(--accent); margin-bottom: 5px; font-weight: bold; }
            .modal-input-group input { 
                width: 100%; padding: 12px; border-radius: 6px; border: 1px solid var(--border); 
                background: var(--input-bg); color: var(--text); box-sizing: border-box; font-size: 1rem;
            }
            .btn-save-db { width: 100%; background: var(--accent); color: #000; border: none; padding: 15px; cursor: pointer; font-weight: bold; border-radius: 8px; margin-top: 10px; font-size: 1rem; }
            .btn-group-util { display: flex; gap: 8px; margin-top: 15px; }
            .btn-util { flex: 1; padding: 10px; font-size: 12px; cursor: pointer; background: #444; color: #fff; border: 1px solid var(--border); border-radius: 6px; }

            #screensaver {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: #000; color: #fff; display: none; flex-direction: column;
                justify-content: center; align-items: center; z-index: 9999; text-align: center; cursor: none;
            }
            .saver-title { font-size: 6rem; color: var(--accent); font-weight: 800; margin-bottom: 20px; }
            .saver-info { font-size: 2rem; color: #ddd; margin: 10px 0; }
            .saver-warn { margin-top: 50px; padding: 30px 60px; border: 4px solid #ff5e57; color: #ff5e57; font-size: 3rem; font-weight: bold; animation: blink 1.5s infinite; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        </style>
    `;

    const headerHTML = `
        <header class="header">
            <div class="header-left">
                <div class="logo" onclick="location.href='index.html'">${pageTitle}</div>
                <nav class="text-nav">
                    <a href="Calculation.html">Calculation</a>
                    <a href="TimeLine.html">TimeLine</a>
                    <a href="Sample.html">Product Sample</a>
                </nav>
            </div>

            <nav class="nav-menu">
                <a href="index.html" class="btn-common">🏠 홈</a>
                <button class="btn-common" onclick="window.activateSaver()">▶ 세이버</button>
                <button class="btn-common btn-highlight" onclick="window.openModal()">⚙️ 설정</button>
                <button onclick="document.getElementById('data-modal').style.display='block'" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:1.1rem; font-weight:bold; margin-right:15px; padding:5px 10px;">Data</button>
                <button class="btn-common" id="theme-btn" onclick="window.toggleTheme()">☀️ Mode</button>
            </nav>
        </header>
        <div id="header-spacer"></div>

        <div id="settings-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>SAVER SETUP</h2>
                    <span style="cursor:pointer; font-size:32px; color:var(--accent);" onclick="window.closeModal()">×</span>
                </div>
                <div class="modal-input-group"><label>시스템 메인 제목</label><input type="text" id="set-title"></div>
                <div class="modal-input-group"><label>소속 부서</label><input type="text" id="set-dept"></div>
                <div class="modal-input-group"><label>담당자 성함</label><input type="text" id="set-name"></div>
                <div class="modal-input-group"><label>비상 연락처</label><input type="text" id="set-contact"></div>
                <div class="modal-input-group"><label>강조 주의 문구</label><input type="text" id="set-warn"></div>
                <button onclick="window.saveToDB()" class="btn-save-db">기기 저장 (IndexedDB)</button>
                <div class="btn-group-util">
                    <button onclick="window.exportToJson()" class="btn-util">내보내기</button>
                    <button onclick="document.getElementById('file-input').click()" class="btn-util">불러오기</button>
                    <input type="file" id="file-input" style="display:none;" onchange="window.importFromJson(event)">
                </div>
            </div>
        </div>

        <div id="screensaver" onclick="window.deactivateSaver()">
            <h1 id="disp-title" class="saver-title">Monitoring...</h1>
            <div class="saver-info"><span id="disp-dept"></span> | <span id="disp-name"></span></div>
            <div id="disp-contact" class="saver-info" style="font-size: 1.5rem; color:#888;"></div>
            <div id="disp-warn" class="saver-warn">조작 금지</div>
        </div>

        <div id="data-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:var(--card); padding:30px; border:1px solid var(--border); border-radius:12px; z-index:10001; text-align:center; min-width:350px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="margin-top:0; color:var(--text);">Data Management</h2>
            <p style="color:var(--sub-text); font-size:0.9rem; margin-bottom:25px;">모든 프로젝트 현황과 설정 내역을 통합 백업합니다.</p>
            <div style="display:flex; gap:15px; justify-content:center; margin-bottom:20px;">
                <button onclick="exportAllData()" style="flex:1; padding:12px; background:var(--accent); color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem;">Export</button>
                <button onclick="triggerImport()" style="flex:1; padding:12px; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem;">Import</button>
            </div>
            <button onclick="document.getElementById('data-modal').style.display='none'" style="padding:10px 20px; background:transparent; color:var(--sub-text); border:none; cursor:pointer; text-decoration:underline;">닫기</button>
        </div>
    `;
    
    document.head.insertAdjacentHTML('beforeend', commonStyles);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    window.applyTheme(localStorage.getItem('theme') || 'dark');
    window.initDB();
};

/**
 * 3. 기능 함수
 */
window.toggleTheme = function() {
    const next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    window.applyTheme(next);
};

window.applyTheme = function(theme) {
    const btn = document.getElementById('theme-btn');
    if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if(btn) btn.innerText = "🌙 Dark";
    } else {
        document.body.removeAttribute('data-theme');
        if(btn) btn.innerText = "☀️ Light";
    }
    localStorage.setItem('theme', theme);
};

window.openModal = function() { document.getElementById('settings-modal').style.display = 'flex'; };
window.closeModal = function() { document.getElementById('settings-modal').style.display = 'none'; };

window.activateSaver = function() {
    document.getElementById('screensaver').style.display = 'flex';
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
};

window.deactivateSaver = function() {
    document.getElementById('screensaver').style.display = 'none';
    if(document.fullscreenElement) document.exitFullscreen();
};

window.saveToDB = function() {
    if (!window.db) return;
    const config = {
        id: "saver_config",
        title: document.getElementById('set-title').value,
        dept: document.getElementById('set-dept').value,
        name: document.getElementById('set-name').value,
        contact: document.getElementById('set-contact').value,
        warn: document.getElementById('set-warn').value
    };
    const tx = window.db.transaction("settings", "readwrite");
    tx.objectStore("settings").put(config);
    tx.oncomplete = () => {
        window.updateSaverDisplay(config);
        alert("기기(IndexedDB)에 저장되었습니다.");
        window.closeModal();
    };
};

window.loadConfigFromDB = function() {
    if (!window.db) return;
    const req = window.db.transaction("settings", "readonly").objectStore("settings").get("saver_config");
    req.onsuccess = () => {
        if (req.result) {
            const config = req.result;
            ['title', 'dept', 'name', 'contact', 'warn'].forEach(f => {
                const el = document.getElementById(`set-${f}`);
                if(el) el.value = config[f] || "";
            });
            window.updateSaverDisplay(config);
        }
    };
};

window.updateSaverDisplay = function(config) {
    const titleEl = document.getElementById('disp-title');
    if(!titleEl) return;
    titleEl.innerText = config.title || "Monitoring System";
    document.getElementById('disp-dept').innerText = config.dept || "-";
    document.getElementById('disp-name').innerText = config.name || "-";
    document.getElementById('disp-contact').innerText = config.contact || "-";
    document.getElementById('disp-warn').innerText = config.warn || "조작 금지";
};

window.exportToJson = function() {
    const config = {
        title: document.getElementById('set-title').value,
        dept: document.getElementById('set-dept').value,
        name: document.getElementById('set-name').value,
        contact: document.getElementById('set-contact').value,
        warn: document.getElementById('set-warn').value
    };
    const blob = new Blob([JSON.stringify(config, null, 4)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "SaverConfig.json";
    a.click();
};

window.importFromJson = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const config = JSON.parse(e.target.result);
        ['title', 'dept', 'name', 'contact', 'warn'].forEach(f => {
            const el = document.getElementById('set-' + f);
            if(el) el.value = config[f] || "";
        });
        alert("데이터를 불러왔습니다. '기기 저장'을 눌러주세요.");
    };
    reader.readAsText(file);
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.deactivateSaver();
});

/**
 * 4. 통합 데이터 관리 (Data Management) - 강력 백업 및 복구
 */
window.exportAllData = async function() {
    try {
        const backup = { localStorage: {}, indexedDB: {} };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup.localStorage[key] = localStorage.getItem(key);
        }
        if (indexedDB.databases) {
            const databases = await indexedDB.databases();
            for (const dbInfo of databases) {
                const dbName = dbInfo.name;
                backup.indexedDB[dbName] = {};
                const db = await new Promise((resolve, reject) => {
                    const req = indexedDB.open(dbName);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
                const storeNames = Array.from(db.objectStoreNames);
                for (const storeName of storeNames) {
                    backup.indexedDB[dbName][storeName] = await new Promise((resolve) => {
                        const tx = db.transaction(storeName, "readonly");
                        const store = tx.objectStore(storeName);
                        store.getAll().onsuccess = (e) => resolve(e.target.result);
                    });
                }
                db.close();
            }
        }
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        a.download = `HW_FullBackup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("모든 데이터가 백업되었습니다.");
    } catch (error) {
        console.error("Export Error:", error);
        alert("데이터 백업 중 오류가 발생했습니다.");
    }
};

window.triggerImport = function() {
    let fileInput = document.getElementById('global-import-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'global-import-input';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.onchange = window.importAllData;
        document.body.appendChild(fileInput);
    }
    fileInput.click();
};

window.importAllData = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            if (backup.localStorage) {
                localStorage.clear(); 
                for (const key in backup.localStorage) {
                    localStorage.setItem(key, backup.localStorage[key]);
                }
            }
            if (backup.indexedDB) {
                for (const dbName in backup.indexedDB) {
                    const stores = backup.indexedDB[dbName];
                    const db = await new Promise((resolve, reject) => {
                        const req = indexedDB.open(dbName);
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    for (const storeName in stores) {
                        if (db.objectStoreNames.contains(storeName)) {
                            const tx = db.transaction(storeName, "readwrite");
                            const store = tx.objectStore(storeName);
                            store.clear(); 
                            stores[storeName].forEach(item => store.put(item));
                        }
                    }
                    db.close();
                }
            }
            alert("모든 데이터가 성공적으로 복구되었습니다. 적용을 위해 페이지를 새로고침합니다.");
            location.reload();
        } catch (error) {
            console.error("Import Error:", error);
            alert("복원 중 오류가 발생했습니다. 백업 파일 형식을 확인해주세요.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};
