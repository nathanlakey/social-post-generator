'use client'

import { useState } from 'react'

type Post = { label: string; caption: string }

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  padding: '11px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '6px',
  display: 'block',
}

export default function PostGenerator() {
  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    topic: '',
    tone: 'friendly and approachable',
  })
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setPosts(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong')
        setStatus('error')
        return
      }

      setPosts(data.posts)
      setStatus('idle')
    } catch {
      setErrorMsg('Network error — try again')
      setStatus('error')
    }
  }

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ width: '24px', height: '1px', background: 'var(--gold)', display: 'block' }} />
          AI Tool Demo
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
          fontWeight: 300, lineHeight: 1.1, color: 'var(--ink)', marginBottom: '1rem',
        }}>
          Social posts,<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>written for you.</em>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, maxWidth: '480px' }}>
          Tell us a little about your business and what you&apos;re promoting.
          Get 3 ready-to-post captions back in seconds.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '2rem',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Business name</label>
            <input
              name="businessName" type="text" placeholder="Sunrise Coffee Co."
              value={form.businessName} onChange={handleChange} required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={labelStyle}>Industry</label>
            <input
              name="industry" type="text" placeholder="Coffee shop"
              value={form.industry} onChange={handleChange}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>What are you promoting?</label>
          <textarea
            name="topic" placeholder="New seasonal pumpkin spice latte, available this weekend only"
            value={form.topic} onChange={handleChange} required rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label style={labelStyle}>Tone</label>
          <select
            name="tone" value={form.tone} onChange={handleChange}
            style={{ ...inputStyle, appearance: 'none' }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="friendly and approachable">Friendly & approachable</option>
            <option value="professional and polished">Professional & polished</option>
            <option value="fun and playful">Fun & playful</option>
            <option value="bold and confident">Bold & confident</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            alignSelf: 'flex-start', padding: '13px 28px',
            background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', borderRadius: 'var(--r)',
            fontFamily: 'var(--font-mono)', fontSize: '12px',
            fontWeight: 500, cursor: status === 'loading' ? 'default' : 'pointer',
            letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '10px',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {status === 'loading' && <span className="spinner" />}
          {status === 'loading' ? 'Generating...' : 'Generate posts'}
        </button>

        {status === 'error' && (
          <p style={{ fontSize: '13px', color: '#b8362e' }}>{errorMsg}</p>
        )}
      </form>

      {/* Results */}
      {posts && (
        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Generated captions
          </div>
          {posts.map((post, idx) => (
            <div key={idx} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '1rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {post.label}
                </span>
                <button
                  onClick={() => copyToClipboard(post.caption, idx)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    padding: '4px 12px', background: copiedIdx === idx ? 'var(--gold)' : 'transparent',
                    color: copiedIdx === idx ? '#fff' : 'var(--ink)',
                    border: `1px solid ${copiedIdx === idx ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedIdx === idx ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{
                fontSize: '14px', color: 'var(--ink2)', lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {post.caption}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
