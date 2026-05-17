import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: '請提供文字內容' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `你是一個專業的文字編輯助手。用戶會提供語音辨識的逐字稿，請幫忙潤稿：
1. 去除語氣詞（嗯、啊、那個、就是說等）
2. 修正語句不通順之處
3. 加上適當標點符號
4. 保持原意，不要增加或刪減內容
5. 支援中英文混合，不要強制翻譯
只輸出潤稿後的文字，不需要解釋或說明。`,
        messages: [
          { role: 'user', content: `請幫我潤稿以下逐字稿：\n\n${text}` }
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'API 呼叫失敗' }, { status: 500 })
    }

    const result = data.content?.[0]?.text
    if (!result) {
      return NextResponse.json({ error: '無法取得潤稿結果' }, { status: 500 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 })
  }
}
