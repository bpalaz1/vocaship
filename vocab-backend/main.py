"""
Vocaship Backend Entrypoint.
Allows running with `python main.py` or `uvicorn main:app`.
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
