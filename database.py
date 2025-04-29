from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends

# MongoDB connection URL (local MongoDB instance)
MONGODB_URL = "mongodb+srv://vipuljat708:LexZeTwplXiha0nw@clustercoe.lfosaut.mongodb.net/"

# Client instance to be reused across the app
client = AsyncIOMotorClient(MONGODB_URL)
database = client["projectBasedLearningCOE"]

# Dependency to get the database
async def get_db():
    db = database
    try:
        yield db
    finally:
        pass  # No need to close with motor, as it's handled by the client