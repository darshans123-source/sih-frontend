"""
Root entry point to launch the VAYU-DRISHTI backend server.
Usage:
    python app.py
    or
    python backend/run.py
"""

import os
import sys
import uvicorn

# Set python path to find backend & ml modules
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Set python path to find backend & ml modules
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, ROOT_DIR)

# Set environment variable so reloader child processes inherit the search path
current_pp = os.environ.get("PYTHONPATH", "")
os.environ["PYTHONPATH"] = f"{BACKEND_DIR}{os.pathsep}{ROOT_DIR}" + (f"{os.pathsep}{current_pp}" if current_pp else "")

if __name__ == "__main__":
    print("Starting VAYU-DRISHTI Nowcast Backend on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
