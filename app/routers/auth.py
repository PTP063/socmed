from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from .. import models, utils,schemas,oauth2
from ..database import get_db

from sqlalchemy.orm import Session
from ..database import get_db


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(user_login: OAuth2PasswordRequestForm = Depends(), user_db: Session = Depends(get_db)):
    db_user = user_db.query(models.User).filter(models.User.email == user_login.username).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not utils.verify(user_login.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")

    access_token = oauth2.create_access_token(data={"user_id": db_user.id})
    return schemas.Token(access_token=access_token, token_type="bearer")