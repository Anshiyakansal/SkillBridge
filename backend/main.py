from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt
import os
from dotenv import load_dotenv

# load env
load_dotenv()

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

    token = jwt.encode(
        {"email": user.email},
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return {"message": "Login successful", "token": token}