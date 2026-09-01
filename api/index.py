import os
import sys

# Set up paths so serverless function finds backend, ml, and database modules
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for path in [ROOT_DIR, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Set PYTHONPATH environment variable for any sub-processes
current_pp = os.environ.get("PYTHONPATH", "")
os.environ["PYTHONPATH"] = f"{ROOT_DIR}{os.pathsep}{BACKEND_DIR}" + (f"{os.pathsep}{current_pp}" if current_pp else "")

# Import the FastAPI application
from backend.app.main import app
