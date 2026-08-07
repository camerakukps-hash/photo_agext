const BIN_URL = "https://api.jsonbin.io/v3/b/69d64d85aaba882197d7b2d3";
const API_KEY = "$2a$10$/7rPjhs9VC0KmAsekZPVYeQhIkDfHoLsbB8bCWbDptzre/cXev1JK";

const form = document.getElementById('addLinkForm');
const successMsg = document.getElementById('successMessage');
const adminList = document.getElementById('adminList');

let collectionsTemp = [];
let isDirty = false;

async function fetchCollections() {
    const cachedData = localStorage.getItem('adminDocsCache');
    if (cachedData) {
        try {
            collectionsTemp = JSON.parse(cachedData);
            renderAdminList(collectionsTemp);
        } catch(e) {}
    }

    try {
        const response = await fetch(BIN_URL, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await response.json();
        if (isDirty) return; // ป้องกันการเซฟทับ
        
        collectionsTemp = Array.isArray(data.record) ? data.record : (Array.isArray(data) ? data : []);
        localStorage.setItem('adminDocsCache', JSON.stringify(collectionsTemp));
    } catch(e) {
        if (!cachedData) collectionsTemp = [];
    }
    renderAdminList(collectionsTemp);
}

async function saveCollections(newData) {
    isDirty = true;
    try {
        await fetch(BIN_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(newData)
        });
        localStorage.setItem('adminDocsCache', JSON.stringify(newData));
        collectionsTemp = newData;
    } catch(e) {
        alert("เซฟรูปลงฐานข้อมูลล้มเหลว กรุณาลองใหม่");
    }
}

function formatForPrompt(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function renderAdminList(collections) {
    if (collections.length === 0) {
        adminList.innerHTML = '<p style="color: var(--text-secondary);">No collections yet.</p>';
        return;
    }
    
    // Sort cloned array
    const sorted = [...collections].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    adminList.innerHTML = '';
    
    sorted.forEach(item => {
        const escapeHTML = str => String(str || '').replace(/[&<>'"]/g, tag => ({'&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;'}[tag] || tag));
        const row = document.createElement('div');
        row.className = 'admin-list-item';
        if (item.hidden) {
            row.style.opacity = '0.65';
        }
        
        const hiddenBadge = item.hidden ? `<span style="background: rgba(244,67,54,0.15); color: #f44336; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px; font-weight: bold;"><i class="fas fa-eye-slash"></i> ซ่อนอยู่</span>` : '';
        const hideBtnBg = item.hidden ? 'rgba(76,175,80,0.15)' : 'rgba(244, 67, 54, 0.15)';
        const hideBtnColor = item.hidden ? '#4CAF50' : '#f44336';
        const hideTitle = item.hidden ? 'เลิกซ่อน (แสดงในหน้าหลัก)' : 'ซ่อนเอกสารนี้จากคนทั่วไป';
        const hideIcon = item.hidden ? 'fa-eye' : 'fa-eye-slash';

        const displayDateStr = item.dateAdded ? new Date(item.dateAdded).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุวัน';

        row.innerHTML = `
            <div class="admin-item-info" style="overflow: hidden; flex: 1; padding-right: 10px;">
            <span>
                <strong>${escapeHTML(item.name)}</strong> ${hiddenBadge}
                <br><small style="color: var(--text-secondary);"><i class="far fa-clock"></i> ${displayDateStr}</small>
                <br><a href="${escapeHTML(item.url)}" target="_blank" style="font-size: 0.8rem; color: var(--accent-color); word-break: break-all; text-decoration: underline;"><i class="fab fa-google-drive"></i> ${escapeHTML(item.url)}</a>
            </span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-shrink: 0; align-items: center;">
                <button class="hide-btn" onclick="toggleHideCollection('${item.id}')" title="${hideTitle}" style="background: ${hideBtnBg}; color: ${hideBtnColor}; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${hideIcon}"></i>
                </button>
                <button class="edit-btn" onclick="editCollection('${item.id}')" title="แก้ไขชื่อ, ลิ้งก์ และวันเวลา">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteCollection('${item.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        adminList.appendChild(row);
    });
}

window.toggleHideCollection = async function(id) {
    const item = collectionsTemp.find(c => c.id === id);
    if (!item) return;
    
    item.hidden = !item.hidden;
    
    const adminBtn = document.querySelector(`button[onclick="toggleHideCollection('${id}')"]`);
    if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    
    await saveCollections(collectionsTemp);
    renderAdminList(collectionsTemp);
};

window.deleteCollection = async function(id) {
    if(confirm('Are you sure you want to delete this collection?')) {
        const adminBtn = document.querySelector(`button[onclick="deleteCollection('${id}')"]`);
        if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 

        let updatedData = collectionsTemp.filter(c => c.id !== id);
        await saveCollections(updatedData);
        renderAdminList(updatedData);
    }
};

window.editCollection = async function(id) {
    const item = collectionsTemp.find(c => c.id === id);
    if (!item) return;
    
    const newName = prompt('1/3 แก้ไขชื่อเอกสาร:', item.name);
    if (newName === null) return;

    const newUrl = prompt('2/3 แก้ไขลิ้งก์ Google Drive:', item.url || '');
    if (newUrl === null) return;

    const currentFormattedDate = formatForPrompt(item.dateAdded);
    const newDateStr = prompt('3/3 แก้ไขวันเวลาที่แสดง (รูปแบบ YYYY-MM-DD HH:mm):', currentFormattedDate);
    if (newDateStr === null) return;

    if (newName.trim() === '' || newUrl.trim() === '') {
        alert('ชื่อและลิ้งก์ต้องไม่เป็นค่าว่างครับ');
        return;
    }

    let parsedDate = item.dateAdded;
    if (newDateStr.trim() !== '') {
        const d = new Date(newDateStr.trim().replace(' ', 'T'));
        if (isNaN(d.getTime())) {
            alert('รูปแบบวันเวลาไม่ถูกต้อง ตัวอย่างที่ถูกต้อง: 2026-08-07 22:00');
            return;
        }
        parsedDate = d.toISOString();
    }
    
    const adminBtn = document.querySelector(`button[onclick="editCollection('${id}')"]`);
    if (adminBtn) adminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    
    item.name = newName.trim();
    item.url = newUrl.trim();
    item.dateAdded = parsedDate;
    await saveCollections(collectionsTemp);
    renderAdminList(collectionsTemp);
};

// Initial Render
adminList.innerHTML = '<p style="color:var(--text-secondary);">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</p>';
fetchCollections();

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('collectionName').value.trim();
    const url = document.getElementById('driveUrl').value.trim();
    const customDateInput = document.getElementById('customDate');
    let dateAdded = new Date().toISOString();

    if (customDateInput && customDateInput.value) {
        const d = new Date(customDateInput.value);
        if (!isNaN(d.getTime())) {
            dateAdded = d.toISOString();
        }
    }

    if (name && url) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังอัปโหลด...';
        submitBtn.disabled = true;

        const newLink = {
            id: Date.now().toString(),
            name: name,
            url: url,
            dateAdded: dateAdded
        };

        const updatedData = [...collectionsTemp, newLink];
        await saveCollections(updatedData);

        // Show success msg
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        successMsg.style.display = 'block';
        form.reset();
        
        // Render updated list
        renderAdminList(updatedData);

        // Hide success message after 3 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 3000);
    }
});
