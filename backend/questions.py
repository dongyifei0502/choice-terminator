"""问题库 API"""
from flask import Blueprint, request, jsonify
from backend.db import get_db
from backend.auth import admin_required

questions_bp = Blueprint('questions', __name__)


@questions_bp.route('', methods=['GET'])
def get_questions():
    db = get_db()
    rows = db.execute('SELECT * FROM questions ORDER BY id').fetchall()
    questions = [dict(r) for r in rows]
    return jsonify({'questions': questions})


@questions_bp.route('', methods=['PUT'])
@admin_required
def save_questions():
    """批量保存问题库（管理员）"""
    data = request.get_json()
    new_questions = data.get('questions', [])

    if not isinstance(new_questions, list):
        return jsonify({'error': '数据格式错误'}), 400

    db = get_db()
    db.execute('DELETE FROM questions')
    for q in new_questions:
        db.execute(
            'INSERT INTO questions (id, category, text, weight, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            (q.get('id'), q.get('category', 'general'), q.get('text', ''),
             q.get('weight', 2), 1 if q.get('enabled') else 0,
             q.get('createdAt', q.get('created_at', '')))
        )
    db.commit()
    return jsonify({'ok': True, 'count': len(new_questions)})


@questions_bp.route('', methods=['POST'])
@admin_required
def add_question():
    data = request.get_json()
    db = get_db()

    # 生成新 ID
    last = db.execute('SELECT id FROM questions ORDER BY id DESC LIMIT 1').fetchone()
    if last:
        num = int(last['id'][1:]) + 1
    else:
        num = 1
    qid = 'q' + str(num).zfill(3)

    db.execute(
        'INSERT INTO questions (id, category, text, weight, enabled) VALUES (?, ?, ?, ?, 1)',
        (qid, data.get('category', 'general'), data.get('text', ''), data.get('weight', 2))
    )
    db.commit()
    return jsonify({'ok': True, 'id': qid}), 201


@questions_bp.route('/<qid>', methods=['DELETE'])
@admin_required
def delete_question(qid):
    db = get_db()
    db.execute('DELETE FROM questions WHERE id = ?', (qid,))
    db.commit()
    return jsonify({'ok': True})
