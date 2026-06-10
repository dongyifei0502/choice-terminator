"""系统配置 API"""
from flask import Blueprint, jsonify

config_bp = Blueprint('config', __name__)


@config_bp.route('', methods=['GET'])
def get_config():
    return jsonify({
        'maxHistoryRecords': 10,
        'maxOptions': 10,
        'maxQuestionsPerQuiz': 5,
        'language': 'zh-CN',
        'aiProvider': {
            'enabled': False,
            'apiKey': '',
            'endpoint': 'https://api.openai.com/v1/chat/completions',
            'model': 'gpt-4o-mini'
        }
    })
