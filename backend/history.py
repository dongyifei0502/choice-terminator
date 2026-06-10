"""历史记录 API — 按用户隔离"""
import json
import csv
import io
from flask import Blueprint, request, jsonify, Response
from backend.db import get_db
from backend.auth import login_required

history_bp = Blueprint('history', __name__)


def _row_to_dict(r):
    d = dict(r)
    for key in ('options', 'questions', 'scores', 'final_scores'):
        if d.get(key):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                pass
    return d


@history_bp.route('', methods=['GET'])
@login_required
def get_history():
    user_id = request.user['user_id']
    limit = request.args.get('limit', 10, type=int)
    db = get_db()
    rows = db.execute(
        'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        (user_id, limit)
    ).fetchall()
    records = [_row_to_dict(r) for r in rows]
    return jsonify({'records': records})


@history_bp.route('', methods=['POST'])
@login_required
def save_history():
    user_id = request.user['user_id']
    data = request.get_json()

    record = {
        'id': data.get('id', ''),
        'category': data.get('category', 'general'),
        'options': json.dumps(data.get('options', []), ensure_ascii=False),
        'questions': json.dumps(data.get('questions', []), ensure_ascii=False),
        'scores': json.dumps(data.get('scores', {}), ensure_ascii=False),
        'final_scores': json.dumps(data.get('finalScores', data.get('final_scores', {})), ensure_ascii=False),
        'recommendation': data.get('recommendation', ''),
        'reason': data.get('reason', '')
    }

    db = get_db()
    db.execute(
        '''INSERT OR REPLACE INTO history
           (id, user_id, category, options, questions, scores, final_scores, recommendation, reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (record['id'], user_id, record['category'], record['options'], record['questions'],
         record['scores'], record['final_scores'], record['recommendation'], record['reason'])
    )

    # 最多保留 MAX_HISTORY 条
    max_records = 10
    db.execute(
        '''DELETE FROM history WHERE user_id = ? AND id NOT IN
           (SELECT id FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?)''',
        (user_id, user_id, max_records)
    )
    db.commit()
    return jsonify({'ok': True}), 201


@history_bp.route('/<record_id>', methods=['DELETE'])
@login_required
def delete_history(record_id):
    user_id = request.user['user_id']
    db = get_db()
    db.execute('DELETE FROM history WHERE id = ? AND user_id = ?', (record_id, user_id))
    db.commit()
    return jsonify({'ok': True})


@history_bp.route('/clear', methods=['DELETE'])
@login_required
def clear_history():
    user_id = request.user['user_id']
    db = get_db()
    db.execute('DELETE FROM history WHERE user_id = ?', (user_id,))
    db.commit()
    return jsonify({'ok': True})


@history_bp.route('/export', methods=['GET'])
@login_required
def export_history():
    user_id = request.user['user_id']
    fmt = request.args.get('fmt', 'json')

    db = get_db()
    rows = db.execute(
        'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC', (user_id,)
    ).fetchall()
    records = [_row_to_dict(r) for r in rows]

    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['时间', '场景', '选项数', '选项列表', '推荐结果', '推荐得分', '推荐理由'])
        for r in records:
            opts = r.get('options', [])
            final_scores = r.get('final_scores', {})
            rec = r.get('recommendation', '')
            writer.writerow([
                r.get('created_at', ''),
                r.get('category', ''),
                len(opts) if isinstance(opts, list) else 0,
                '、'.join(opts) if isinstance(opts, list) else '',
                rec,
                final_scores.get(rec, '') if isinstance(final_scores, dict) else '',
                (r.get('reason') or '').replace('"', '""')
            ])
        return Response(
            '﻿' + output.getvalue(),
            mimetype='text/csv;charset=utf-8',
            headers={'Content-Disposition': 'attachment;filename=history.csv'}
        )

    return jsonify({'records': records})
