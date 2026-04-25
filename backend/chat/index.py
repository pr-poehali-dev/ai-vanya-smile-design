import json
import os
import urllib.request

def handler(event: dict, context) -> dict:
    """Отправляет сообщение в Gemini и возвращает ответ Вани."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    messages = body.get('messages', [])
    user_message = body.get('message', '')

    if not user_message:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Сообщение не указано'})
        }

    api_key = os.environ.get('GEMINI_API_KEY', '')

    system_prompt = "Ты Ваня — дружелюбный и эмоциональный ИИ-ассистент. Общаешься по-русски, тепло и живо, используешь эмодзи. Отвечаешь кратко и по делу, но с характером."

    contents = []
    for msg in messages[-10:]:
        contents.append({
            "role": "user" if msg.get("role") == "user" else "model",
            "parts": [{"text": msg.get("text", "")}]
        })
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = json.dumps({
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 500, "temperature": 0.8}
    }).encode('utf-8')

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    reply = result['candidates'][0]['content']['parts'][0]['text']

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'reply': reply})
    }
