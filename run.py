import os
import sys
import uvicorn

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"[*] Starting Explorely (Project 2 - Experience Finder)...")
    print(f"[*] Local Web UI:      http://{host}:{port}")
    print(f"[*] FastAPI Swagger:   http://{host}:{port}/docs")
    print(f"[*] Project 1 Bridge:  http://{host}:{port}/api/sync/export")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
