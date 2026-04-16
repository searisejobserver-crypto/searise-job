/**
 * H/W Work Project - Common Logic (common.js)
 * 경로: ./assets/js/common.js
 */

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

            .modal-overlay { 
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
            
            #screensaver {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: #000; color: #fff; display: none; flex-direction: column;
                justify-content: center; align-items: center; z-index: 9999; text-align: center; cursor: none;
            }
            .saver-title { font-size: 6rem; color: var(--accent); font-weight: 800; margin-bottom: 20px; }
            .saver-info { font-size: 2rem; color: #ddd; margin: 10px 0; }
            .saver-warn { margin-top: 50px; padding: 30px 60px; border: 4px solid #ff5e57; color: #ff5e57; font-size: 3rem; font-weight: bold; animation: blink 1.5s infinite; }
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
                <button class="btn-common btn-highlight" onclick="window.openModal('settings-modal')">⚙️ 설정</button>
                <button class="btn-common" onclick="window.openModal('data-modal')">📊 Data</button>
                <button class="btn-common" id="theme-btn" onclick="window.toggleTheme()">☀️ Mode</button>
            </nav>
        </header>
        <div id="header-spacer"></div>

        <div id="settings-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>SAVER SETUP</h2>
                    <span style="cursor:pointer; font-size:32px; color:var(--accent);" onclick="window.closeModal('settings-modal')">×</span>
                </div>
                <div class="modal-input-group"><label>시스템 메인 제목</label><input type="text" id="set-title"></div>
                <div class="modal-input-group"><label>소속 부서</label><input type="text" id="set-dept"></div>
                <div class="modal-input-group"><label>담당자 성함</label><input type="text" id="set-name"></div>
                <div class="modal-input-group"><label>비상 연락처</label><input type="text" id="set-contact"></div>
                <div class="modal-input-group"><label>강조 주의 문구</label><input type="text" id="set-warn"></div>
                <button onclick="window.saveToDB()" class="btn-save-db">기기 저장 (IndexedDB)</button>
            </div>
        </div>

        <div id="data-modal" class="modal-overlay">
            <div class="modal-content" style="text-align:center;">
                <div class="modal-header">
                    <h2>DATA BACKUP</h2>
                    <span style="cursor:pointer; font-size:32px; color:var(--accent);" onclick="window.closeModal('data-modal')">×</span>
                </div>
                <p style="color:var(--sub-text); margin-bottom:25px;">프로젝트 전체 데이터를 파일로 내보내거나<br>./data 폴더의 백업 파일을 불러옵니다.</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="exportAllData()" style="flex:1; padding:15px; background:var(--accent); color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Export (전체 백업)</button>
                    <button onclick="triggerImport()" style="flex:1; padding:15px; background:#444; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Import (복구)</button>
                </div>
            </div>
        </div>

        <div id="screensaver" onclick="window.deactivateSaver()">
            <h1 id="disp-title" class="saver-title">Monitoring...</h1>
            <div class="saver-info"><span id="disp-dept"></span> | <span id="disp-name"></span></div>
            <div id="disp-contact" class="saver-info" style="font-size: 1.5rem; color:#888;"></div>
            <div id="disp-warn" class="saver-warn">조작 금지</div>
        </div>
    `;
    
    document.head.insertAdjacentHTML('beforeend', commonStyles);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    window.applyTheme(localStorage.getItem('theme') || 'dark');
    window.initDB();
};

/**
 * 3. 기능 제어 함수
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

window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };

window.activateSaver = function() {
    document.getElementById('screensaver').style.display = 'flex';
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
};

window.deactivateSaver = function() {
    document.getElementById('screensaver').style.display = 'none';
    if(document.fullscreenElement) document.exitFullscreen();
};

/**
 * 4. 설정 데이터 관리
 */
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
        alert("기기 저장 완료.");
        window.closeModal('settings-modal');
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

/**
 * 5. [핵심] 통합 데이터 Export / Import (모든 LocalStorage + IndexedDB)
 */
window.exportAllData = async function() {
    try {
        const backup = { localStorage: {}, indexedDB: {} };

        // A. LocalStorage 수집
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup.localStorage[key] = localStorage.getItem(key);
        }

        // B. 브라우저 내 모든 IndexedDB 수집
        if (indexedDB.databases) {
            const databases = await indexedDB.databases();
            for (const dbInfo of databases) {
                const dbName = dbInfo.name;
                backup.indexedDB[dbName] = {};
                const db = await new Promise((res) => {
                    const req = indexedDB.open(dbName);
                    req.onsuccess = () => res(req.result);
                });
                for (const storeName of Array.from(db.objectStoreNames)) {
                    backup.indexedDB[dbName][storeName] = await new Promise((res) => {
                        const tx = db.transaction(storeName, "readonly");
                        tx.objectStore(storeName).getAll().onsuccess = (e) => res(e.target.result);
                    });
                }
                db.close();
            }
        }

        // C. 파일 저장 (./data 폴더에 보관 권장)
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        a.href = URL.createObjectURL(blob);
        a.download = `project_backup_${dateStr}.json`; // 다운로드 후 ./data 폴더로 이동하세요.
        a.click();
        
        alert("데이터가 추출되었습니다. 다운로드된 파일을 프로젝트의 ./data 폴더에 보관하세요.");
    } catch (e) { console.error(e); alert("백업 중 오류가 발생했습니다."); }
};

window.triggerImport = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                // 1. LocalStorage 복원
                if (backup.localStorage) {
                    localStorage.clear();
                    Object.entries(backup.localStorage).forEach(([k, v]) => localStorage.setItem(k, v));
                }
                // 2. IndexedDB 복원
                if (backup.indexedDB) {
                    for (const dbName in backup.indexedDB) {
                        const db = await new Promise(res => {
                            const req = indexedDB.open(dbName);
                            req.onsuccess = () => res(req.result);
                        });
                        for (const sName in backup.indexedDB[dbName]) {
                            if (db.objectStoreNames.contains(sName)) {
                                const tx = db.transaction(sName, "readwrite");
                                tx.objectStore(sName).clear().onsuccess = () => {
                                    backup.indexedDB[dbName][sName].forEach(item => tx.objectStore(sName).put(item));
                                };
                            }
                        }
                        db.close();
                    }
                }
                alert("데이터 복구가 완료되었습니다. 페이지를 새로고침합니다.");
                location.reload();
            } catch (err) { alert("파일 형식이 잘못되었습니다."); }
        };
        reader.readAsText(file);
    };
    input.click();
};

window.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.deactivateSaver(); });
