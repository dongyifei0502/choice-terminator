"""认证模块：注册 / 登录 / 简易令牌 / 用户管理
零外部依赖：hashlib + hmac 替代 bcrypt + PyJWT
"""
import hashlib
import hmac
import json
import time
import base64
from functools import wraps
from flask import Blueprint, request, jsonify
from backend.db import get_db

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = 'choice-terminator-jwt-2026'


def hash_pwd(password):
    """SHA-256 + 固定盐"""
    salted = 'ct2026:' + password + ':salt'
    return hashlib.sha256(salted.encode()).hexdigest()


def make_token(user_id, username, role):
    """简易 HMAC 令牌"""
    header = base64.urlsafe_b64encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode()).decode().rstrip('=')
    payload = base64.urlsafe_b64encode(json.dumps({
        'user_id': user_id, 'username': username, 'role': role,
        'exp': int(time.time()) + 72 * 3600
    }).encode()).decode().rstrip('=')
    sig = hmac.new(JWT_SECRET.encode(), (header + '.' + payload).encode(), hashlib.sha256).hexdigest()[:32]
    return header + '.' + payload + '.' + sig


def decode_token(token):
    """验证令牌，返回 payload 或 None"""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header, payload, sig = parts
        expected = hmac.new(JWT_SECRET.encode(), (header + '.' + payload).encode(), hashlib.sha256).hexdigest()[:32]
        if sig != expected:
            return None
        # 补全 padding
        payload += '=' * (4 - len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload))
        if data.get('exp', 0) < time.time():
            return None
        return data
    except Exception:
        return None


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': '请先登录'}), 401
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': '登录已过期，请重新登录'}), 401
        db = get_db()
        user = db.execute('SELECT id, banned FROM users WHERE id = ?', (payload['user_id'],)).fetchone()
        if not user:
            return jsonify({'error': '用户不存在'}), 401
        if user['banned']:
            return jsonify({'error': '账号已被封禁'}), 403
        request.user = payload
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
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

    hashed = hash_pwd(password)
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

    if user['banned']:
        return jsonify({'error': '账号已被封禁，请联系管理员'}), 403

    if hash_pwd(password) != user['password']:
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


@auth_bp.route('/admin/users', methods=['GET'])
@admin_required
def list_users():
    db = get_db()
    rows = db.execute('SELECT id, username, role, banned, created_at FROM users ORDER BY id').fetchall()
    users = [dict(r) for r in rows]
    return jsonify({'users': users})


@auth_bp.route('/admin/users/<int:user_id>/ban', methods=['PUT'])
@admin_required
def ban_user(user_id):
    db = get_db()
    user = db.execute('SELECT id, role FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    if user['role'] == 'admin':
        return jsonify({'error': '不能封禁管理员'}), 403
    db.execute('UPDATE users SET banned = 1 WHERE id = ?', (user_id,))
    db.commit()
    return jsonify({'ok': True})


@auth_bp.route('/admin/users/<int:user_id>/unban', methods=['PUT'])
@admin_required
def unban_user(user_id):
    db = get_db()
    db.execute('UPDATE users SET banned = 0 WHERE id = ?', (user_id,))
    db.commit()
    return jsonify({'ok': True})