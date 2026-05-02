photokukps1@gmail.com

photokukps001

เลขจะเพิ่มขึ้นทีละ 1

### 🛠️ ขั้นตอนการติดตั้งสคริปต์ใน "อีเมลใหม่"

1. **ล็อกอินเข้าบัญชี Google** (อีเมลใหม่) ที่ต้องการใช้เก็บรูป
2. เปิดเบราว์เซอร์ไปที่ลิงก์นี้เพื่อสร้างสคริปต์ใหม่: [script.google.com](https://script.google.com/)
3. คลิกปุ่ม **"โครงการใหม่" (New Project)** ที่มุมซ้ายบน
4. ลบโค้ดเก่าที่มีอยู่ออกทั้งหมด แล้ว **คัดลอกโค้ดด้านล่างนี้ไปวางทับ**
5. เมื่อวางโค้ดเสร็จแล้ว ให้คลิกปุ่ม **"การทำให้ใช้งานได้" (Deploy)** ที่มุมขวาบน
6. เลือก **"การทำให้ใช้งานได้รายการใหม่" (New deployment)**
7. กดที่ไอคอนรูปเฟือง ⚙️ ข้างคำว่า "เลือกประเภท" แล้วเลือก **"เว็บแอป" (Web app)**
8. ตั้งค่าตรงนี้ *(สำคัญมาก ห้ามตั้งผิด)*:
   - **เรียกใช้ในฐานะ (Execute as):** เลือก `ฉัน (Me)` (อีเมลของคุณ)
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** เลือก `ทุกคน (Anyone)`
9. กดปุ่ม **"การทำให้ใช้งานได้" (Deploy)**
10. ระบบจะบังคับให้เราให้สิทธิ์ (Authorize access) ให้กดปุ่ม **ให้สิทธิ์เข้าถึง (Authorize access)**
    > **หมายเหตุ:** หากเจอหน้าต่างคำเตือนความปลอดภัย (Google hasn't verified this app) ให้คลิก `"ขั้นสูง" (Advanced)` (จะอยู่ด้านล่างๆ เล็กๆ) แล้วคลิก `"ไปที่ โปรเจกต์ที่ไม่มีชื่อ (ไม่ปลอดภัย)"` แล้วกด `อนุญาต (Allow)`
11. เมื่อเสร็จแล้ว คุณจะได้ **"URL ของเว็บแอป" (Web app URL)** (ที่ลงท้ายด้วย `/exec`) ให้คัดลอกลิงก์นั้นเก็บไว้ไปใส่ในเว็บครับ

---

### 💻 โค้ด Google Apps Script
คัดลอกโค้ดนี้ไปวางทับในไฟล์ `Code.gs` ได้เลยครับ:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 1. ตรวจสอบพื้นที่ว่างของไดรฟ์
    if (data.action === "checkStatus") {
      var used = DriveApp.getStorageUsed();
      var limit = DriveApp.getStorageLimit();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        used: used,
        limit: limit
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. สร้างโฟลเดอร์ใหม่
    if (data.folderName) {
      // สร้างโฟลเดอร์ใน My Drive ของอีเมลนี้
      var folder = DriveApp.createFolder(data.folderName);
      
      // ตั้งค่าให้ใครก็ได้ที่มีลิงก์สามารถดู/แก้ไขได้ (เพื่อให้เพื่อนอัปโหลดรูปได้)
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        url: folder.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "No valid action found"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่ม doGet กันคนเข้าลิงก์ตรงๆ
function doGet(e) {
  return ContentService.createTextOutput("Gallery Backend API is running.");
}




