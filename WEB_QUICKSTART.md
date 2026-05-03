# MetaBox Web Prototype

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Mock Mode (Optional - for instant testing without API cost)
```bash
# PowerShell
(Get-Content .env) -replace 'FALLBACK_MODEL=.*', 'FALLBACK_MODEL=mock' | Set-Content .env
```

### 3. Run the Web App
```bash
python web_app.py
```

### 4. Open in Browser
Navigate to: **http://127.0.0.1:5000**

---

## Features

✅ **Step-by-Step Wizard** - Guide non-technical users through the input process  
✅ **Real-time Feedback** - Show validation and examples as users type  
✅ **Beautiful UI** - Modern, responsive design optimized for desktop and mobile  
✅ **Results Dashboard** - Tabbed interface for viewing all 6 deliverables  
✅ **Export to Markdown** - Download complete spec for sharing  
✅ **Mock Mode** - Test without using API quota  

---

## How It Works

1. **User enters idea** → 3-step form with validation
2. **Backend processes** → Calls the pipeline agents in sequence
3. **Results displayed** → Interactive tabs showing:
   - 📋 Overview
   - ⭐ Features
   - 🏗️ Architecture
   - 🖼️ Pages
   - 🗄️ Data Model
   - 🔌 API Endpoints

---

## CLI Alternative

If you prefer command-line (no UI):
```bash
python orchestrator.py --idea "Your business idea here"
```

Results will be saved to `state/` folder as JSON and SQL files.

---

## Tech Stack

- **Backend**: Flask + Python
- **Frontend**: Vanilla HTML/CSS/JavaScript (no build step needed)
- **AI Pipeline**: Google Gemini API
- **Database**: JSON files (state/)

---

## Support

- **Mock mode stuck?** Check `.env` has `FALLBACK_MODEL=mock`
- **API key issues?** Verify `GEMINI_API_KEY` in `.env`
- **Port 5000 in use?** Edit `web_app.py` line 106 to change port
