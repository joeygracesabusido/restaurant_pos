from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        self.client = AsyncIOMotorClient(settings.DATABASE_URL)
        self.db = self.client[settings.DATABASE_NAME]
        print("Database connected...")

    async def disconnect(self):
        if self.client:
            self.client.close()
            print("Database disconnected...")

db = Database()

def get_database():
    return db.db
