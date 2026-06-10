"""
选择困难终结 — Flask 后端
启动: python app.py
"""
from flask import Flask, send_from_directory, request
from backend.db import init_db, close_db

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = 'choice-terminator-secret-2026'

# ── 手动 CORS ──
@app.after_request
def add_cors(response):
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        from flask import make_response
        resp = make_response('', 200)
        return add_cors(resp)

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


# WSGI 启动时自动初始化数据库
init_db()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('RENDER') is None
    print('Choice Terminator — Server running on port ' + str(port))
    app.run(host='0.0.0.0', port=port, debug=debug)
