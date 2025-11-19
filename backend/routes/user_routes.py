from fastapi import APIRouter, Depends
from models.user_models import User
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the current logged-in user's details.
    """
    return current_user
