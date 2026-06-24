from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, TokenResponse
from ..auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth")

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="username already exists"
        )
    
    # Check email if provided
    if user_in.email:
        email_exists = db.query(User).filter(User.email == user_in.email).first()
        if email_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="email already exists"
            )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(user_id=new_user.id)
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600,
        expires=3600,
        samesite="lax",
        secure=False 
    )
    
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "token": token
    }

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_in.username).first()
    if not db_user or not verify_password(user_in.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid credentials"
        )
    
    token = create_access_token(user_id=db_user.id)
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=3600,
        expires=3600,
        samesite="lax",
        secure=False 
    )
    
    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "token": token
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="lax", httponly=True)
    return {"message": "Successfully logged out"}
