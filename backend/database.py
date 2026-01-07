import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. FORCE LOAD THE .ENV FILE
load_dotenv()

# 2. GET THE URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. DEBUG CHECK (This prints what it found)
if not SQLALCHEMY_DATABASE_URL:
    print("❌ ERROR: Could not find 'DATABASE_URL' in your .env file.")
    print("👉 Make sure you have a file named '.env' in the backend folder.")
    print("👉 Make sure it has a line starting with DATABASE_URL=")
    exit(1)
else:
    print(f"✅ Database URL Found: {SQLALCHEMY_DATABASE_URL[:20]}...")

# 4. CONNECT
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()