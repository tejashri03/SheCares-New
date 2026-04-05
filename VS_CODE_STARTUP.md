# 🚀 SheCares VS Code Startup Guide

## 📋 QUICK START (What to Run in VS Code)

### **🔧 BACKEND - Choose ONE:**

#### **Option 1: SQLite Backend (Recommended - Easiest)**
```bash
# Open VS Code Terminal
cd backend
python new_backend.py
```
✅ **URL:** http://127.0.0.1:5000  
✅ **Database:** shecares_new.db (auto-created)  
✅ **Features:** Registration, Login, PCOS Prediction, Nutrition Plans

#### **Option 2: MySQL Backend (If you have MySQL installed)**
```bash
# Open VS Code Terminal
cd backend
python mysql_backend.py
```
✅ **URL:** http://127.0.0.1:5000  
✅ **Database:** MySQL (shecares_db)  
✅ **Requirements:** MySQL Workbench installed

---

### **🎨 FRONTEND:**
```bash
# Open NEW VS Code Terminal
cd frontend
npm run dev
```
✅ **URL:** http://localhost:5173  
✅ **Features:** Enhanced UI, Step-by-step PCOS test, Beautiful design

---

## 🎯 **STEP-BY-STEP INSTRUCTIONS:**

### **1. Open VS Code**
- Open folder: `c:\Users\DELL\Desktop\SheCares`
- Open **2 terminals** (Terminal → New Terminal)

### **2. Terminal 1 - Backend:**
```bash
cd backend
python new_backend.py
```
**Expected Output:**
```
🚀 Starting Fresh SheCares Backend...
✅ Database: Fresh SQLite (shecares_new.db)
✅ Features: Registration, Login, PCOS Prediction, Nutrition Plans
✅ Reports: Downloadable CSV reports
============================================================
 * Running on http://127.0.0.1:5000
```

### **3. Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
**Expected Output:**
```
VITE v8.0.0-beta.18  ready in 308 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 **ACCESS YOUR APPLICATION:**

### **🎨 Frontend (Beautiful UI):**
**http://localhost:5173**

### **🔧 Backend (API):**
**http://127.0.0.1:5000**

### **📊 Database:**
- **SQLite:** `shecares_new.db` (auto-created)
- **MySQL:** `shecares_db` (if using MySQL backend)

---

## 🎯 **WHAT YOU CAN DO:**

### **✅ Test Registration:**
1. Go to: http://localhost:5173
2. Click "Get Started Free"
3. Fill form → Register
4. Check database for new user

### **✅ Test Login:**
1. Go to: http://localhost:5173/login
2. Enter credentials
3. Should redirect to dashboard

### **✅ Test PCOS Prediction:**
1. Login first
2. Go to PCOS Prediction
3. Complete 4-step assessment
4. Get personalized results with nutrition plans

### **✅ Download Reports:**
1. Complete PCOS assessment
2. Click "Download Report"
3. Get CSV file with your health data

---

## 🔧 **TROUBLESHOOTING:**

### **❌ Backend Not Working:**
```bash
# Check if port 5000 is free
netstat -ano | findstr :5000

# Kill any Python processes
taskkill /F /IM python.exe

# Restart backend
python backend/new_backend.py
```

### **❌ Frontend Not Working:**
```bash
# Check if port 5173 is free
netstat -ano | findstr :5173

# Kill any Node processes
taskkill /F /IM node.exe

# Restart frontend
cd frontend
npm run dev
```

### **❌ Database Issues:**
- **SQLite:** Auto-created, no setup needed
- **MySQL:** Follow `mysql_setup_guide.txt`

---

## 🎉 **SUCCESS INDICATORS:**

### **✅ Backend Working:**
- Visit http://127.0.0.1:5000
- Should see: `{"message": "SheCares Backend - Fresh & Working!"}`

### **✅ Frontend Working:**
- Visit http://localhost:5173
- Should see beautiful SheCares homepage

### **✅ Database Working:**
- Register a new user
- Check `shecares_new.db` in VS Code
- Should see new user data

---

## 🎯 **FINAL CHECKLIST:**

Before your viva, ensure:
- [ ] Backend running at http://127.0.0.1:5000
- [ ] Frontend running at http://localhost:5173
- [ ] Can register new users
- [ ] Can login successfully
- [ ] PCOS prediction works
- [ ] Nutrition plans generated
- [ ] Reports downloadable
- [ ] Database updating dynamically

**🚀 Your SheCares is ready for viva presentation!**
