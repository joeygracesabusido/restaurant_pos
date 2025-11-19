from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from core.database import db
from routes import auth_routes, user_routes, menu_routes, order_routes

app = FastAPI(
    title="POS Restaurant API",
    description="API for a Point of Sale system for a restaurant.",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory for image uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/api/uploads/images", StaticFiles(directory="uploads/images"), name="images")

@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.disconnect()

@app.get("/")
def read_root():
    return {"message": "Welcome to the POS Restaurant API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(menu_routes.router)
app.include_router(order_routes.router)
