from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.user_service import list_users

router = APIRouter()


@router.get("/users", response_model=list[UserResponse], status_code=status.HTTP_200_OK)
def read_all_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[UserResponse]:
    # Explicit admin-only route to demonstrate role protection.
    users = list_users(db)
    return [UserResponse.model_validate(user) for user in users]
