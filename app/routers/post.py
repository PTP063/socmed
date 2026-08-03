
from typing import Optional, List
from sqlalchemy import func
from .. import models, schemas, utils, oauth2
from fastapi import Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter(prefix="/posts", tags=["Posts"])

def format_post(post: models.Post, votes_count: int, current_user_id: Optional[int] = None, db: Optional[Session] = None) -> schemas.PostOut:
    user_voted = False
    if current_user_id and db:
        v = db.query(models.Vote).filter(models.Vote.post_id == post.id, models.Vote.user_id == current_user_id).first()
        user_voted = v is not None
    return schemas.PostOut(
        id=post.id,
        title=post.title,
        content=post.content,
        published=post.published,
        created_at=post.created_at,
        owner_id=post.owner_id,
        owner=schemas.UserOut.model_validate(post.owner),
        votes_count=votes_count or 0,
        user_voted=user_voted
    )

@router.get("/", response_model=List[schemas.PostOut])
def get_posts(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(oauth2.get_optional_current_user),
    limit: int = 20,
    skip: int = 0,
    search: Optional[str] = ""
):
    query = db.query(models.Post, func.count(models.Vote.post_id).label("votes"))\
        .join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True)\
        .group_by(models.Post.id)
    
    if search:
        query = query.filter(models.Post.title.ilike(f"%{search}%"))
        
    results = query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    
    user_id = current_user.id if current_user else None
    posts = [format_post(post, votes, user_id, db) for post, votes in results]
    return posts

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.PostOut)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    post_dict = post.model_dump() if hasattr(post, 'model_dump') else post.dict()
    new_post = models.Post(owner_id=current_user.id, **post_dict)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return format_post(new_post, 0, current_user.id, db)

@router.get("/{id}", response_model=schemas.PostOut)
def get_post(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(oauth2.get_optional_current_user)
):
    result = db.query(models.Post, func.count(models.Vote.post_id).label("votes"))\
        .join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True)\
        .filter(models.Post.id == id)\
        .group_by(models.Post.id)\
        .first()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id: {id} does not exist")
    
    post, votes = result
    user_id = current_user.id if current_user else None
    return format_post(post, votes, user_id, db)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id: {id} does not exist")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")
    
    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put("/{id}", response_model=schemas.PostOut)
def update_post(
    id: int,
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    post_query = db.query(models.Post).filter(models.Post.id == id)
    existing_post = post_query.first()

    if not existing_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Post with id: {id} does not exist")

    if existing_post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform requested action")

    post_dict = post.model_dump() if hasattr(post, 'model_dump') else post.dict()
    post_query.update(post_dict, synchronize_session=False)
    db.commit()
    db.refresh(existing_post)

    votes = db.query(func.count(models.Vote.post_id)).filter(models.Vote.post_id == id).scalar()
    return format_post(existing_post, votes or 0, current_user.id, db)