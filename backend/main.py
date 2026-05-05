from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from urllib.request import urlopen
from urllib.error import URLError
import json

# load env
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60

# app
app = FastAPI()

# CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# database connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
users = db["users"]

# model
class User(BaseModel):
    email: EmailStr
    password: str

class GoogleToken(BaseModel):
    id_token: str


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRES_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_google_id_token(id_token: str):
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        with urlopen(url) as response:
            payload = json.load(response)
    except URLError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if payload.get("aud") != client_id:
        raise HTTPException(status_code=401, detail="Invalid Google client ID")
    if payload.get("email_verified") != "true":
        raise HTTPException(status_code=401, detail="Google email not verified")

    return payload


# test route
@app.get("/")
def root():
    return {"message": "API running"}

# signup
@app.post("/auth/signup")
def signup(user: User):
    if users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    users.insert_one({
        "email": user.email,
        "password": hashed
    })

    return {"message": "Signup successful"}

# login
@app.post("/auth/login")
def login(user: User):
    db_user = users.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not bcrypt.checkpw(user.password.encode(), db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = create_access_token({"email": user.email})

    return {"message": "Login successful", "token": token}


@app.post("/auth/google")
def login_with_google(token_data: GoogleToken):
    payload = verify_google_id_token(token_data.id_token)
    email = payload.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Google token does not contain email")

    db_user = users.find_one({"email": email})
    if not db_user:
        users.insert_one({
            "email": email,
            "google": True,
        })

    token = create_access_token({"email": email})

    return {"message": "Login successful", "token": token}