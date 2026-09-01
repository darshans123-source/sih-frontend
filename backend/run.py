"""
Backend Launcher Script.
"""

import uvicorn
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=BACKEND_DIR)
