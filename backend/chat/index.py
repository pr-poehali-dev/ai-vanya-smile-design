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

    api_key = os.environ.get('OPENROUTER_API_KEY', '')

    chat_messages = [
        {
            "role": "system",
            "content": "Ты Ваня — дружелюбный и эмоциональный ИИ-ассистент. Общаешься по-русски, тепло и живо, используешь эмодзи. Отвечаешь кратко и по делу, но с характером."
        }
    ]

    for msg in messages[-10:]:
        chat_messages.append({
            "role": "user" if msg.get("role") == "user" else "assistant",
            "content": msg.get("text", "")
        })

    chat_messages.append({"role": "user", "content": user_message})

    payload = json.dumps({
        "model": "inclusionai/ling-2.6-flash:free",
        "messages": chat_messages,
        "max_tokens": 500,
        "temperature": 0.8
    }).encode('utf-8')

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-Title": "Vanya AI"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    reply = result['choices'][0]['message']['content']

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'reply': reply})
    }