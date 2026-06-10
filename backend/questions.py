"""问题库 API — 系统题 + 用户自有题"""
from flask import Blueprint, request, jsonify
from backend.db import get_db
from backend.auth import login_required, admin_required

questions_bp = Blueprint('questions', __name__)


@questions_bp.route('', methods=['GET'])
@login_required
def get_questions():
    """返回系统题 + 当前用户的自有题"""
    user_id = request.user['user_id']
    db = get_db()
    rows = db.execute(
        'SELECT * FROM questions WHERE user_id IS NULL OR user_id = ? ORDER BY id',
        (user_id,)
    ).fetchall()
    questions = [dict(r) for r in rows]
    return jsonify({'questions': questions})


@questions_bp.route('', methods=['POST'])
@login_required
def add_question():
    """新增自有题目（任何登录用户）"""
    data = request.get_json()
    user_id = request.user['user_id']
    db = get_db()

    last = db.execute('SELECT id FROM questions ORDER BY id DESC LIMIT 1').fetchone()
    if last:
        try:
            num = int(last['id'][1:]) + 1
        except (ValueError, IndexError):
            num = 1
    else:
        num = 1
    qid = 'q' + str(num).zfill(3)

    db.execute(
        'INSERT INTO questions (id, user_id, category, text, weight, enabled) VALUES (?, ?, ?, ?, ?, 1)',
        (qid, user_id, data.get('category', 'general'), data.get('text', ''), data.get('weight', 2))
    )
    db.commit()
    return jsonify({'ok': True, 'id': qid}), 201


@questions_bp.route('/<qid>', methods=['PUT'])
@login_required
def update_question(qid):
    """编辑题目：用户可改自己的，管理员可改所有"""
    data = request.get_json()
    user_id = request.user['user_id']
    is_admin = request.user.get('role') == 'admin'
    db = get_db()

    q = db.execute('SELECT * FROM questions WHERE id = ?', (qid,)).fetchone()
    if not q:
        return jsonify({'error': '题目不存在'}), 404
    if not is_admin and q['user_id'] != user_id:
        return jsonify({'error': '只能修改自己的题目'}), 403

    db.execute(
        'UPDATE questions SET text=?, weight=?, category=?, enabled=? WHERE id=?',
        (data.get('text', q['text']), data.get('weight', q['weight']),
         data.get('category', q['category']), 1 if data.get('enabled', True) else 0, qid)
    )
    db.commit()
    return jsonify({'ok': True})


@questions_bp.route('/<qid>', methods=['DELETE'])
@login_required
def delete_question(qid):
    """删除题目：用户可删自己的，管理员可删所有；系统题仅管理员可删"""
    user_id = request.user['user_id']
    is_admin = request.user.get('role') == 'admin'
    db = get_db()

    q = db.execute('SELECT * FROM questions WHERE id = ?', (qid,)).fetchone()
    if not q:
        return jsonify({'error': '题目不存在'}), 404
    if q['user_id'] is None and not is_admin:
        return jsonify({'error': '系统题目仅管理员可删除'}), 403
    if q['user_id'] is not None and q['user_id'] != user_id and not is_admin:
        return jsonify({'error': '只能删除自己的题目'}), 403

    db.execute('DELETE FROM questions WHERE id = ?', (qid,))
    db.commit()
    return jsonify({'ok': True})


@questions_bp.route('/batch', methods=['PUT'])
@admin_required
def batch_save():
    """管理员批量保存系统问题库（user_id = NULL 的题目）"""
    data = request.get_json()
    new_questions = data.get('questions', [])
    if not isinstance(new_questions, list):
        return jsonify({'error': '数据格式错误'}), 400

    db = get_db()
    db.execute('DELETE FROM questions WHERE user_id IS NULL')
    for q in new_questions:
        db.execute(
            'INSERT INTO questions (id, user_id, category, text, weight, enabled, created_at) VALUES (?, NULL, ?, ?, ?, ?, ?)',
            (q.get('id'), q.get('category', 'general'), q.get('text', ''),
             q.get('weight', 2), 1 if q.get('enabled') else 0,
             q.get('createdAt', q.get('created_at', '')))
        )
    db.commit()
    return jsonify({'ok': True, 'count': len(new_questions)})
