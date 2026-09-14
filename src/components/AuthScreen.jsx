import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import Logo from './Logo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)
    if (!isSupabaseConfigured) return
    setBusy(true)
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (result.error) {
      setMessage({ type: 'error', text: humanizeAuthError(result.error.message) })
      return
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage({ type: 'success', text: 'Account created. Check your email to confirm your address.' })
    }
  }

  return <main className="auth-shell">
    <section className="auth-intro">
      <Logo />
      <div className="intro-copy">
        <div className="eyebrow"><Sparkles size={14} /> Your reusable thinking, in one place</div>
        <h1>Keep the prompts<br /><em>worth repeating.</em></h1>
        <p>Save the words that make your work easier. Find them in a few keystrokes, then get back to the work.</p>
      </div>
      <div className="intro-note"><span className="note-dot" /> Private by design · Yours alone</div>
    </section>
    <section className="auth-card-wrap">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-icon"><LockKeyhole size={20} /></div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your vault'}</h2>
          <p>{mode === 'login' ? 'Sign in to reach your prompt library.' : 'Start saving your best prompts today.'}</p>
        </div>
        {!isSupabaseConfigured ? <div className="config-alert"><strong>Connect Supabase to continue.</strong><span>Add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the app.</span></div> : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Email address<div className="input-with-icon"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label>
            <label>Password<div className="input-with-icon"><LockKeyhole size={17} /><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></div></label>
            {message && <div className={`form-message ${message.type}`}>{message.text}</div>}
            <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} {!busy && <ArrowRight size={17} />}</button>
          </form>
        )}
        <div className="auth-switch">{mode === 'login' ? 'New to PromptKeeper?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null) }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div>
      </div>
      <p className="auth-footer">Your prompts are protected by your account and database-level access rules.</p>
    </section>
  </main>
}

function humanizeAuthError(message) {
  if (message.toLowerCase().includes('invalid login')) return 'That email or password is not correct.'
  if (message.toLowerCase().includes('already registered')) return 'An account with this email already exists.'
  return message
}
