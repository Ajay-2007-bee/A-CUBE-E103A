from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models import User, Activity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ImpactGraph API is running 🚀"}

@app.get("/team-stats")
def get_team_stats(db: Session = Depends(get_db)):
    """
    Returns the Leaderboard: Users ranked by Impact Score.
    """
    users = db.query(User).all()
    data = []
    
    for user in users:
       
        total_impact = db.query(func.sum(Activity.impact_score))\
            .filter(Activity.user_id == user.id).scalar() or 0.0
            
        
        activity_count = db.query(func.count(Activity.id))\
            .filter(Activity.user_id == user.id).scalar() or 0
            
        data.append({
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "impact_score": round(total_impact, 1),
            "activity_count": activity_count,
            "ratio": round(total_impact / activity_count, 2) if activity_count > 0 else 0
        })
    
    
    return sorted(data, key=lambda x: x["impact_score"], reverse=True)

@app.get("/activities")
def get_recent_activities(db: Session = Depends(get_db)):
    """
    Returns the latest 20 actions (Commits, Messages, etc.)
    """
    logs = db.query(Activity).order_by(Activity.created_at.desc()).limit(20).all()
    return logs