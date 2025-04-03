from fastapi import FastAPI
from routes import suggest, details

app = FastAPI()

# Include API routes
app.include_router(suggest.router)
app.include_router(details.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Project-Based Learning API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
