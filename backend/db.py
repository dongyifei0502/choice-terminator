"""数据库连接模块（避免循环导入）"""
import sqlite3
import os
import hashlib
from flask import g

ROOT = os.path.dirname(os.path.dirname(__file__))
DATABASE = os.path.join(ROOT, 'db', 'data.db')
SCHEMA_PATH = os.path.join(ROOT, 'sql', 'schema.sql')
SEED_PATH = os.path.join(ROOT, 'sql', 'seed.sql')


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
    db = sqlite3.connect(DATABASE)
    for sql_file in (SCHEMA_PATH, SEED_PATH):
        with open(sql_file, 'r', encoding='utf-8') as f:
            db.executescript(f.read())
    # 管理员 admin / admin123 (SHA-256)
    existing = db.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
    if not existing:
        hashed = hashlib.sha256('ct2026:admin123:salt'.encode()).hexdigest()
        db.execute("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", (hashed,))
    db.commit()
    db.close()