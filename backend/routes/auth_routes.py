from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import get_database
from models.user_models import User, UserCreate
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user.
    """
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    hashed_password = get_password_hash(user_in.password)
    
    # Prepare user data without the id (MongoDB will generate it)
    user_data = {
        "email": user_in.email,
        "full_name": user_in.full_name,
        "role": user_in.role,
        "hashed_password": hashed_password
    }

    new_user = await db.users.insert_one(user_data)
    
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    # Remove the ObjectId field and replace with string id
    created_user_dict = dict(created_user)
    created_user_dict["id"] = str(created_user_dict.pop("_id"))
    # Remove hashed_password as User model doesn't include it
    created_user_dict.pop("hashed_password", None)

    return User(**created_user_dict)


@router.post("/token")
async def login_for_access_token(
    db: AsyncIOMotorDatabase = Depends(get_database),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
