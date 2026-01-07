import os
from sqlalchemy import create_engine, text
from github import Github
from slack_sdk import WebClient
from dotenv import load_dotenv


load_dotenv()

def system_check():
    print("🚀 STARTING SYSTEM CHECK...\n")
    
    
    try:
        db_url = os.getenv("DATABASE_URL")
        engine = create_engine(db_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 'Database Connected!'"))
            print(f"✅ DATABASE: {result.scalar()}")
    except Exception as e:
        print(f"❌ DATABASE FAILED: {e}")

    
    try:
        g = Github(os.getenv("GITHUB_TOKEN"))
        user = g.get_user().login
        print(f"✅ GITHUB: Connected as {user}")
    except Exception as e:
        print(f"❌ GITHUB FAILED: {e}")

    
    if os.getenv("SLACK_BOT_TOKEN"):
        try:
            client = WebClient(token=os.getenv("SLACK_BOT_TOKEN"))
            auth_test = client.auth_test()
            print(f"✅ SLACK: Connected to {auth_test['team']}")
        except Exception as e:
            print(f"❌ SLACK FAILED: {e}")
    else:
        print("⚠️ SLACK: Skipped (No token found)")

if __name__ == "__main__":
    system_check()