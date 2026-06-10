"""
选择困难终结 — Flask 后端
启动: python app.py
"""
from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.db import init_db, close_db

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = 'choice-terminator-secret-2026'
CORS(app, supports_credentials=True)

app.teardown_appcontext(close_db)


# ── 蓝图 ──
from backend.auth import auth_bp
from backend.questions import questions_bp
from backend.history import history_bp
from backend.config_api import config_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questions_bp, url_prefix='/api/questions')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(config_bp, url_prefix='/api/config')


@app.route('/')
def index():
    import os
    return send_from_directory(os.path.dirname(__file__), 'index.html')


if __name__ == '__main__':
    init_db()
    print('Choice Terminator — Server running: http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
