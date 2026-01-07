import os
import time
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv
from database import SessionLocal
from models import Activity, User
from keywords import TECHNICAL_KEYWORDS, GRATITUDE_KEYWORDS

load_dotenv()


client = WebClient(token=os.getenv("SLACK_BOT_TOKEN"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def fetch_slack_history(channel_id):
    db = next(get_db())
    print(f"📡 Connecting to Slack Channel: {channel_id}...")

    try:
      
        result = client.conversations_history(channel=channel_id, limit=50)
        messages = result["messages"]

        for msg in messages:
            user_id = msg.get("user")
            text = msg.get("text", "").lower()
            ts = msg.get("ts") 
            
            if "bot_id" in msg or not user_id:
                continue

          
            impact_score = 0
            activity_type = "MESSAGE"
            
           
            tech_word_count = sum(1 for word in TECHNICAL_KEYWORDS if word in text)
            
           
            is_gratitude = any(word in text for word in GRATITUDE_KEYWORDS)

            if is_gratitude and tech_word_count > 0:
                impact_score = 20 
                activity_type = "UNBLOCKING_EVENT"
                print(f"🔥 UNBLOCK DETECTED! User {user_id} got 20 pts.")
            elif tech_word_count > 0:
                impact_score = 1 + (tech_word_count * 0.5) 
                print(f" Tech Chat: User {user_id} (Score: {impact_score})")
            else:
                impact_score = 0.1 
                print(f"💤 Noise detected.")

            
            db_user = db.query(User).filter(User.slack_id == user_id).first()
            if not db_user:
                try:
                    user_info = client.users_info(user=user_id)
                    real_name = user_info["user"]["real_name"]
                    db_user = User(name=real_name, slack_id=user_id, role="Developer")
                    db.add(db_user)
                    db.commit()
                    db.refresh(db_user)
                except Exception as e:
                    print(f"⚠️ Could not fetch user info: {e}")
                    continue

            exists = db.query(Activity).filter(Activity.metadata_blob.op("->>")("ts") == ts).first()
            
            if not exists:
                new_activity = Activity(
                    user_id=db_user.id,
                    platform="SLACK",
                    activity_type=activity_type,
                    impact_score=impact_score,
                    metadata_blob={"text": text, "ts": ts},
                    created_at=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(float(ts)))
                )
                db.add(new_activity)
                print(f"💾 Saved Activity for {db_user.name}")

        db.commit()
        print("✅ Sync Complete!")

    except SlackApiError as e:
        print(f"❌ Error fetching Slack: {e}")

if __name__ == "__main__":
    
    CHANNEL_ID = "C0A8580Q44Q" 
    fetch_slack_history(CHANNEL_ID)