"""
Deploy to Surge.sh using Python subprocess (no npm needed - uses direct HTTP).
Alternative: Deploy via GitHub Pages.
Since surge needs npm, we'll use Cloudflare Pages API or a simpler service.
"""
import os, json, base64, hashlib

# Let's try using the Netlify API with file digest method instead
try:
    import requests
except ImportError:
    os.system("pip install requests")
    import requests

DEPLOY_DIR = r"d:\saas\meta-saas--main\meta-saas--main\deploy"
index_path = os.path.join(DEPLOY_DIR, "index.html")

# Read the file
with open(index_path, "rb") as f:
    content = f.read()

# Calculate SHA1
sha1 = hashlib.sha1(content).hexdigest()

print(f"File size: {len(content)} bytes")
print(f"SHA1: {sha1}")

# --- Method: Use Netlify's deploy with file digest ---
# Step 1: Create site + deploy request
deploy_payload = {
    "files": {
        "/index.html": sha1
    }
}

# Create site first (anonymous)
try:
    # Try creating with deploy
    resp = requests.post(
        "https://api.netlify.com/api/v1/sites",
        json={}
    )
    print(f"Create site response: {resp.status_code}")
    
    if resp.status_code in (200, 201):
        site = resp.json()
        site_id = site.get("id")
        print(f"Site ID: {site_id}")
        print(f"URL: {site.get('ssl_url') or site.get('url')}")
    else:
        print(f"Response: {resp.text[:300]}")
except Exception as e:
    print(f"Error: {e}")

# Since Netlify needs auth, let's try tiiny.host API or just use
# a free static hosting service
print("\n--- Trying alternative: neocities.org ---")

# Actually, let's just use a GitHub gist + htmlpreview
# or jsdelivr CDN approach

# Best simple approach: Deploy to Vercel via their API
print("\n--- Trying Vercel ---")

try:
    # Vercel allows deployment via API with a token
    # But we need a token too...
    
    # Let's try the simplest approach: push to GitHub and use Pages
    print("Recommendation: Deploy via GitHub Pages")
    print("Run these commands:")
    print()
    print("1. Create a new GitHub repo")
    print("2. git init && git add . && git commit -m 'deploy'")
    print("3. git push")
    print("4. Enable GitHub Pages in repo settings")
except Exception as e:
    print(f"Error: {e}")
