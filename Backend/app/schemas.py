from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class BookBase(BaseModel):
    publisher: str
    name: str
    author: str
    date: str
    Cost: float
    cover_url: Optional[str] = None
    stock_status: str = "available"

class BookCreate(BookBase):
    pass

class BookUpdate(BookBase):
    pass

class BookResponse(BookBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookListResponse(BaseModel):
    books: List[BookResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    token: str

    model_config = ConfigDict(from_attributes=True)

class UserStats(BaseModel):
    total_books: int
    total_cost: float
    most_expensive: Optional[BookResponse]
    average_rating: float
    username: str
