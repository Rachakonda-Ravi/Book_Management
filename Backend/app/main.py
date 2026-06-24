from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .database import engine, Base
from .routers import books, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Book Management API",
    description="FastAPI CRUD & Auth backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = exc.errors()
    
    if errors:
        err = errors[0]
        field = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "invalid format")
        error_detail = f"Invalid format for field '{field}': {msg}"
    else:
        error_detail = "Invalid input data"
        
    return JSONResponse(
        status_code=400,
        content={"error": error_detail}
    )

app.include_router(books.router)
app.include_router(auth.router)
