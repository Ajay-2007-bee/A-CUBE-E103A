from database import engine, Base
from models import User, Activity

print("🏗️ Creating tables in Supabase...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")