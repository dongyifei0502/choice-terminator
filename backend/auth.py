"""认证模块：注册 / 登录 / JWT"""
import bcrypt
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from backend.db import get_db

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = 'choice-terminator-jwt-2026'
JWT_EXPIRY_HOURS = 72


def make_token(user_id, username, role):
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def login_required(f):
    """装饰器：要求登录"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': '请先登录'}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': '登录已过期，请重新登录'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效的登录凭证'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """装饰器：要求管理员"""
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if request.user.get('role') != 'admin':
            return jsonify({'error': '需要管理员权限'}), 403
        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400
    if len(username) < 2 or len(username) > 20:
        return jsonify({'error': '用户名需 2-20 个字符'}), 400
    if len(password) < 6:
        return jsonify({'error': '密码至少 6 位'}), 400

    db = get_db()
    existing = db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
    if existing:
        return jsonify({'error': '用户名已被注册'}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    # 首个注册用户或 admin 用户自动赋予 admin 角色
    total_users = db.execute('SELECT COUNT(*) as cnt FROM users').fetchone()['cnt']
    role = 'admin' if username == 'admin' or total_users == 0 else 'user'

    cursor = db.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        (username, hashed, role)
    )
    db.commit()
    user_id = cursor.lastrowid

    token = make_token(user_id, username, role)
    return jsonify({'token': token, 'user': {'id': user_id, 'username': username, 'role': role}}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    db = get_db()
    user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    if not user:
        return jsonify({'error': '用户名或密码错误'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': '用户名或密码错误'}), 401

    token = make_token(user['id'], user['username'], user['role'])
    return jsonify({
        'token': token,
        'user': {'id': user['id'], 'username': user['username'], 'role': user['role']}
    })


@auth_bp.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({'user': request.user})
