import uvicorn
from main import app

if __name__ == "__main__":
    # Standard entry point mapping directly to our high-performance FastAPI server
    print("Launching FastAPI application via uvicorn from api.py runner...")
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=False)
