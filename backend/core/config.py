from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mongodb://root:Genesis11@192.46.225.247:27017/pos_restaurant?authSource=admin")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "pos_restaurant")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_super_secret_key_that_should_be_changed")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
