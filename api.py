import sys
import subprocess

try:
    import uvicorn
    import fastapi
except ImportError:
    print("uvicorn or fastapi not found in Python path. Attempting automatic installation...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "--break-system-packages"], check=True)
    except Exception as e1:
        print(f"Standard install failed: {e1}. Trying with --user...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "--user", "-r", "requirements.txt", "--break-system-packages"], check=True)
        except Exception as e2:
            print(f"User install failed: {e2}. Attempting direct installation of uvicorn and fastapi...")
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn", "fastapi", "--break-system-packages"], check=True)
            except Exception as e3:
                print(f"Failed to install uvicorn and fastapi: {e3}")
                sys.exit(1)

import uvicorn
from main import app

if __name__ == "__main__":
    # Standard entry point mapping directly to our high-performance FastAPI server
    print("Launching FastAPI application via uvicorn from api.py runner...")
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=False)
