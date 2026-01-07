from database import SessionLocal
from sqlalchemy import text

def reset_database():
    db = SessionLocal()
    try:
        print("🗑️  Wiping all data from ImpactGraph...")
        
        
        try:
            db.execute(text("DELETE FROM activities;"))
            print("   - Deleted Activities")
        except Exception as e:
            print(f"   ⚠️ Could not delete activities: {e}")

        try:
            db.execute(text("DELETE FROM users;"))
            print("   - Deleted Users")
        except Exception as e:
            print(f"   ⚠️ Could not delete users: {e}")

        db.commit()
        print("✨ Database is 100% CLEAN! You are ready for a fresh demo.")
        
    except Exception as e:
        print(f"❌ Error resetting DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    confirm = input("⚠️  WARNING: This will delete ALL team data. Are you sure? (y/n): ")
    if confirm.lower() == 'y':
        reset_database()
    else:
        print("Cancelled.")