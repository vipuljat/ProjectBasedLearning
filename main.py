from fastapi import FastAPI
from routes import suggest, details, overview , modules, moduleDetails , resources , projects , diagrams 


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes with proper prefixes
app.include_router(suggest.router)
app.include_router(details.router)
app.include_router(overview.router)
app.include_router(modules.router)
app.include_router(moduleDetails.router)
app.include_router(resources.router)
app.include_router(projects.router)
app.include_router(diagrams.router)



@app.get("/")
async def root():
    return {"message": "Welcome to the Project-Based Learning API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
