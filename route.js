'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [rawText, setRawText] = useState('')
  const [polishedText, setPolishedText] = useState('')
  const [isPolishing, setIsPolishing] = useState(false)
  const [status, setStatus] = useState('')
  const [copyLabel, setCopyLabel] = useState('複製')
  const [lang, setLang] = useState('zh-TW')
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('你的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge')
      return
    }
    finalTranscriptRef.current = rawText
    const r = new SpeechRecognition()
    r.lang = lang === 'zh-TW-en' ? 'zh-TW' : lang
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }
      setRawText(finalTranscriptRef.current + interim)
    }
    r.onerror = (e) => {
      setStatus('辨識錯誤：' + e.error)
      stopRecording()
    }
    r.onend = () => {
      if (recognitionRef.current) r.start()
    }
    recognitionRef.current = r
    r.start()
    setIsRecording(true)
    setStatus('')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  const toggleRecord = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const polishText = async () => {
    if (!rawText.trim()) { setStatus('請先錄入文字再潤稿'); return }
    setIsPolishing(true)
    setPolishedText('')
    setStatus('')
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      })
      const data = await res.json()
      if (data.result) {
        setPolishedText(data.result)
        setStatus('✓ 潤稿完成')
      } else {
        setStatus('錯誤：' + (data.error || '未知錯誤'))
      }
    } catch {
      setStatus('連線錯誤，請稍後再試')
    }
    setIsPolishing(false)
  }

  const copyResult = async () => {
    if (!polishedText) { setStatus('還沒有潤稿結果可複製'); return }
    try {
      await navigator.clipboard.writeText(polishedText)
      setCopyLabel('✓ 已複製')
      setTimeout(() => setCopyLabel('複製'), 2000)
    } catch {
      setStatus('複製失敗，請手動選取')
    }
  }

  const s = {
    page: { maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' },
    card: { background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    title: { fontSize: 20, fontWeight: 600, margin: 0, color: '#111' },
    subtitle: { fontSize: 13, color: '#888', margin: '4px 0 0' },
    select: { fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#333' },
    micWrap: { textAlign: 'center', padding: '1rem 0' },
    micBtn: {
      width: 72, height: 72, borderRadius: '50%', border: isRecording ? '2px solid #e24b4a' : '2px solid #ddd',
      background: isRecording ? '#fff0f0' : '#fff', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, transition: 'all 0.2s', marginBottom: 12,
    },
    micStatus: { fontSize: 14, color: isRecording ? '#e24b4a' : '#888', margin: 0 },
    wave: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 10, height: 32 },
    label: { fontSize: 13, color: '#888', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    textarea: { width: '100%', minHeight: 100, fontSize: 14, lineHeight: 1.7, padding: 12, borderRadius: 8, border: '1px solid #eee', background: '#fafafa', color: '#222', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
    polishBtn: { width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, borderRadius: 10, border: '1px solid #ddd', background: isPolishing ? '#f5f5f5' : '#fff', color: '#333', cursor: isPolishing ? 'default' : 'pointer', marginBottom: '1rem' },
    resultBox: { minHeight: 100, fontSize: 14, lineHeight: 1.7, padding: 12, borderRadius: 8, border: '1px solid #eee', background: '#fafafa', color: polishedText ? '#222' : '#aaa', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
    copyBtn: { fontSize: 12, color: '#888', background: 'none', border: '1px solid #eee', borderRadius: 6, cursor: 'pointer', padding: '3px 10px' },
    status: { textAlign: 'center', fontSize: 13, color: status.startsWith('✓') ? '#3b7a57' : '#e24b4a', marginTop: 8, minHeight: 20 },
    clearBtn: { fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div>
            <p style={s.title}>語音輸入工具</p>
            <p style={s.subtitle}>Voice to Text · AI 潤稿</p>
          </div>
          <select value={lang} onChange={e => setLang(e.target.value)} style={s.select}>
            <option value="zh-TW">中文</option>
            <option value="en-US">English</option>
            <option value="zh-TW-en">中英混合</option>
          </select>
        </div>

        <div style={s.micWrap}>
          <button onClick={toggleRecord} style={s.micBtn} aria-label={isRecording ? '停止錄音' : '開始錄音'}>
            {isRecording ? '⏹' : '🎙️'}
          </button>
          <p style={s.micStatus}>{isRecording ? '錄音中，點擊停止...' : '按下麥克風開始錄音'}</p>
          {isRecording && (
            <div style={s.wave}>
              {[12, 20, 28, 20, 12].map((h, i) => (
                <div key={i} style={{
                  width: 4, height: h, background: '#e24b4a', borderRadius: 2,
                  animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`
                }} />
              ))}
            </div>
          )}
        </div>

        <div style={s.label}>
          <span>逐字稿</span>
          <button onClick={() => { setRawText(''); finalTranscriptRef.current = '' }} style={s.clearBtn}>清除</button>
        </div>
        <textarea
          value={rawText}
          onChange={e => { setRawText(e.target.value); finalTranscriptRef.current = e.target.value }}
          placeholder="語音辨識結果會出現在這裡..."
          style={s.textarea}
        />
      </div>

      <button onClick={polishText} disabled={isPolishing} style={s.polishBtn}>
        {isPolishing ? '⏳ 潤稿中...' : '✨ AI 自動潤稿'}
      </button>

      <div style={s.card}>
        <div style={{ ...s.label, marginBottom: 10 }}>
          <span>潤稿結果</span>
          <button onClick={copyResult} style={s.copyBtn}>{copyLabel}</button>
        </div>
        <div style={s.resultBox}>
          {polishedText || '潤稿後的文字會出現在這裡...'}
        </div>
      </div>

      <p style={s.status}>{status}</p>

      <style>{`
        @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        * { box-sizing: border-box; }
        select:focus, textarea:focus { outline: none; border-color: #bbb; }
      `}</style>
    </div>
  )
}
