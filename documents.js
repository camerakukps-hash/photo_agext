const BIN_URL = "https://api.jsonbin.io/v3/b/69d64d85aaba882197d7b2d3";
const API_KEY = "$2a$10$/7rPjhs9VC0KmAsekZPVYeQhIkDfHoLsbB8bCWbDptzre/cXev1JK";

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('galleryGrid');
    
    // ระบบ Caching เพื่อให้โหลดหน้าเว็บได้ทันที
    const cacheKey = 'docs_collections_cache';
    const cachedData = localStorage.getItem(cacheKey);
    let isInitialRender = true;

    function renderItems(collections) {
        if (!collections || collections.length === 0) {
            grid.innerHTML = '';
            return;
        }

        collections.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        grid.innerHTML = ''; // เคลียร์ของเก่าก่อนวาดใหม่

        collections.forEach((item, index) => {
            const dateOpt = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = new Date(item.dateAdded).toLocaleDateString('en-US', dateOpt);
            
            const isLatest = index === 0;
            const badgeHTML = isLatest ? '<span class="badge">LATEST</span>' : '';

            const card = document.createElement('div');
            card.className = `card ${isLatest ? 'card-featured' : ''}`;
            card.style.padding = '1.5rem';
            card.innerHTML = `
                ${badgeHTML}
                <div class="card-content" style="padding: 0;">
                <h2 class="card-title">${escapeHTML(item.name)}</h2>
                <div class="card-date">
                    <i class="far fa-clock"></i> ${formattedDate}
                </div>
                <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer" class="card-btn">
                    <i class="fas fa-file-download"></i> ดาวน์โหลด / เปิดดูเอกสาร
                </a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // 1. ดึงข้อมูลจาก Cache มาแสดงทันทีที่เข้าเว็บ (ไม่ต้องรอโหลด)
    if (cachedData) {
        try {
            renderItems(JSON.parse(cachedData));
            isInitialRender = false;
        } catch(e) {}
    }

    // ถ้าไม่มี Cache ให้แสดงสถานะกำลังโหลด
    if (isInitialRender) {
        grid.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-item skeleton-title" style="width: 80%;"></div>
                <div class="skeleton-item skeleton-text" style="width: 50%;"></div>
                <div class="skeleton-item skeleton-btn"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-item skeleton-title" style="width: 60%;"></div>
                <div class="skeleton-item skeleton-text" style="width: 40%;"></div>
                <div class="skeleton-item skeleton-btn"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-item skeleton-title" style="width: 75%;"></div>
                <div class="skeleton-item skeleton-text" style="width: 45%;"></div>
                <div class="skeleton-item skeleton-btn"></div>
            </div>
        `;
    }
    
    // 2. ดึงข้อมูลล่าสุดจาก JSONBin เป็นเบื้องหลัง
    try {
        const response = await fetch(BIN_URL, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await response.json();
        
        const collections = data.record || [];
        const newCacheData = JSON.stringify(collections);
        
        // ถ้าข้อมูลบนเซิร์ฟเวอร์มีการเปลี่ยนแปลง (ไม่เหมือนใน Cache) ค่อยวาดหน้าจอใหม่
        if (newCacheData !== cachedData) {
            localStorage.setItem(cacheKey, newCacheData);
            renderItems(collections);
        }
    } catch (e) {
        // ถ้าดึงข้อมูลพัง และไม่มีข้อมูลเก่าเลย
        if (isInitialRender) {
            grid.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">ไม่สามารถโหลดข้อมูลได้ หรือตู้คลังสินค้า (Bin) เพิ่งถูกสร้างใหม่ โปรดเพิ่มรูปลงคลังก่อนครับ</p>';
        }
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({'&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;'}[tag] || tag));
}

// Admin Login Logic
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if(modal) {
    modal.classList.add('show');
    document.getElementById('adminPasscode').focus();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if(modal) {
    modal.classList.remove('show');
    document.getElementById('adminPasscode').value = '';
  }
}

async function sendDiscordAlert(isSuccess, passcode, pageName) {
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1500123184333328495/6GAmZ5bpgAv2kqI5ymCDEqs29PmTFGlZz3FoBgU7matXjsKiRwvLvqF-_nGvB9k36Vsu";
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const ip = ipData.ip;
    
    const userAgent = navigator.userAgent;
    const time = new Date().toLocaleString('th-TH');
    
    const embedColor = isSuccess ? 3066993 : 15158332; // Green : Red
    const title = isSuccess ? "✅ Admin Login Successful" : "🚨 Failed Admin Login Attempt";
    
    const payload = {
        username: "Security Bot",
        embeds: [{
            title: title,
            color: embedColor,
            fields: [
                { name: "IP Address", value: ip, inline: true },
                { name: "Time", value: time, inline: true },
                { name: "Page Origin", value: pageName, inline: true },
                { name: "Device/Browser", value: userAgent, inline: false }
            ]
        }]
    };
    
    if (!isSuccess) {
        payload.embeds[0].fields.push({ name: "Attempted Passcode", value: `\`${passcode}\``, inline: false });
    }
    
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
  } catch(e) {
    console.error("Failed to send discord alert", e);
  }
}

async function verifyAdmin() {
  const passcode = document.getElementById('adminPasscode').value;
  const inputEl = document.getElementById('adminPasscode');
  const pageName = window.location.pathname.split('/').pop() || 'documents.html';
  const btn = document.querySelector('#adminModal .submit-btn');
  
  // Show loading state
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
  btn.disabled = true;
  
  if (passcode === 'admin123') {
    await sendDiscordAlert(true, passcode, pageName);
    sessionStorage.setItem('isAdmin', 'true');
    window.location.href = 'admin/documents.html';
  } else {
    await sendDiscordAlert(false, passcode, pageName);
    btn.innerHTML = originalBtnText;
    btn.disabled = false;
    
    inputEl.classList.add('shake');
    inputEl.style.borderColor = '#f44336';
    setTimeout(() => {
      inputEl.classList.remove('shake');
      inputEl.style.borderColor = '';
    }, 500);
  }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('adminModal');
  if (e.target === modal) {
    closeAdminModal();
  }
});
