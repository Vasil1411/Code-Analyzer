import sqlite3
import uuid
import json
from datetime import datetime


DB_NAME = "code_analyzer.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Таблица за Потребители с добавено поле role ('developer' или 'admin')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'developer',
            created_at TEXT NOT NULL
        )
    """)
    
    # Таблица за Проекти
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Таблица за Анализи
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            code TEXT NOT NULL,
            issues TEXT NOT NULL,
            issues_count INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()

init_db()

# --- ПОТРЕБИТЕЛИ ---
def create_user_in_db(email: str, password_hash: str, role: str = "developer"):
    conn = get_connection()
    cursor = conn.cursor()
    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    try:
        cursor.execute(
            "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, email, password_hash, role, created_at)
        )
        conn.commit()
        return {"id": user_id, "email": email, "role": role}
    except sqlite3.IntegrityError:
        return None  # Имейлът вече съществува
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# --- ПРОЕКТИ ---
def create_project_in_db(user_id: str, name: str, category: str, description: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    project_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    try:
        cursor.execute(
            "INSERT INTO projects (id, user_id, name, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (project_id, user_id, name, category, description, created_at)
        )
        conn.commit()
        return project_id
    except Exception as e:
        print(f"❌ Грешка при проект: {e}")
        return None
    finally:
        conn.close()

def get_user_projects(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_project_with_cascade(project_id: str, user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM projects WHERE id = ?", (project_id,))
        row = cursor.fetchone()
        if not row:
            return False, "Project not found."
        if row["user_id"] != user_id:
            return False, "Unauthorized."
            
        cursor.execute("DELETE FROM analyses WHERE project_id = ?", (project_id,))
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        return True, "Project deleted successfully."
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


def update_project_in_db(project_id: str, user_id: str, name: str, category: str, description: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM projects WHERE id = ?", (project_id,))
        row = cursor.fetchone()
        if not row:
            return False, "Project not found."
        if row["user_id"] != user_id:
            return False, "Unauthorized."
            
        cursor.execute(
            "UPDATE projects SET name = ?, category = ?, description = ? WHERE id = ? AND user_id = ?",
            (name, category, description, project_id, user_id)
        )
        conn.commit()
        return True, "Project updated successfully."
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()
        
    
# --- АНАЛИЗИ ---
def save_analysis_to_db(code: str, issues: list, project_id: str, user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    analysis_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    try:
        cursor.execute(
            "INSERT INTO analyses (id, project_id, user_id, code, issues, issues_count, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (analysis_id, project_id, user_id, code, json.dumps(issues), len(issues), timestamp)
        )
        conn.commit()
        return analysis_id
    except Exception as e:
        print(f"❌ Грешка при анализ: {e}")
        return None
    finally:
        conn.close()

def get_project_analyses(project_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE project_id = ?", (project_id,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        item = dict(row)
        try:
            item["issues"] = json.loads(item["issues"])
        except:
            pass
        result.append(item)
    return result

def get_single_analysis_from_db(project_id: str, analysis_id: str, user_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Проверяваме каква роля има потребителят в момента
    cursor.execute("SELECT role FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    is_admin = user_row and dict(user_row).get("role") == "admin"
    
    if is_admin:
        # Ако е админ, взимаме анализа директно по ID и project_id (без да гледаме чий е проектът)
        cursor.execute(
            """
            SELECT * FROM analyses 
            WHERE id = ? AND project_id = ?
            """,
            (analysis_id, project_id)
        )
    else:
        # Ако е обикновен разработчик, проверяваме и дали проектът е негов
        cursor.execute(
            """
            SELECT a.* FROM analyses a
            JOIN projects p ON a.project_id = p.id
            WHERE a.id = ? AND a.project_id = ? AND p.user_id = ?
            """,
            (analysis_id, project_id, user_id)
        )
        
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    item = dict(row)
    try:
        item["issues"] = json.loads(item["issues"])
    except Exception:
        pass
    return item