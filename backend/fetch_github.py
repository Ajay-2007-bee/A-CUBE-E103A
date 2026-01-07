import os
from github import Github
from dotenv import load_dotenv
from database import SessionLocal
from models import Activity, User
import datetime

load_dotenv()


g = Github(os.getenv("GITHUB_TOKEN"))


CRITICAL_FILES = ["models.py", "database.py", "api", "auth", "config", "algorithm", "App.jsx"]

CODE_EXTENSIONS = [".py", ".js", ".jsx", ".ts", ".tsx", ".css", ".html"]

REFACTOR_KEYWORDS = ["refactor", "cleanup", "optimize", "simplify", "reduce", "remove dead code"]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def analyze_github_repo(repo_name):
    db = next(get_db())
    print(f"🐙 Analyzing GitHub Repo: {repo_name}...")

    try:
        repo = g.get_repo(repo_name)
        commits = repo.get_commits()

       
        for commit in commits[:20]:
            author = commit.commit.author.name
            message = commit.commit.message.lower() 
            date_str = commit.commit.author.date.strftime("%Y-%m-%d %H:%M:%S")
            sha = commit.sha

            
            impact_score = 0
            stats = commit.stats
            files_changed = commit.files
            
           
            impact_score += 1.0

           
            for file in files_changed:
                filename = file.filename
                
                
                if any(crit in filename for crit in CRITICAL_FILES):
                    impact_score += 5.0
                    print(f"  ⭐ Critical File Touched: {filename} (+5 pts)")
                
              
                is_code_file = any(filename.endswith(ext) for ext in CODE_EXTENSIONS)

                if (stats.deletions > stats.additions) and (stats.deletions > 20) and is_code_file:
                   
                    has_intent = any(word in message for word in REFACTOR_KEYWORDS)
                    
                    if has_intent:
                        impact_score += 3.0
                        print(f"  🧹 Verified Refactor: '{message}' (+3 pts)")
                    else:
                        print(f"  ⚠️ Large deletion detected but no 'Refactor' keyword found. Bonus denied.")

            impact_score = min(impact_score, 20.0)

            db_user = db.query(User).filter(User.name == author).first()
            if not db_user:
                db_user = User(name=author, role="Developer", github_handle=author)
                db.add(db_user)
                db.commit()
                db.refresh(db_user)

           
            exists = db.query(Activity).filter(Activity.metadata_blob.op("->>")("sha") == sha).first()
            if not exists:
                new_activity = Activity(
                    user_id=db_user.id,
                    platform="GITHUB",
                    activity_type="COMMIT",
                    impact_score=impact_score,
                    metadata_blob={"message": message, "sha": sha, "files": [f.filename for f in files_changed]},
                    created_at=commit.commit.author.date
                )
                db.add(new_activity)
                print(f"  💾 Saved Commit {sha[:7]} for {author} (Score: {impact_score})")

        db.commit()
        print("✅ GitHub Analysis Complete!")

    except Exception as e:
        print(f"❌ Error fetching GitHub: {e}")

if __name__ == "__main__":
   
    REPO_NAME = "Ajay-2007-bee/A-CUBE-E103A" 
    analyze_github_repo(REPO_NAME)