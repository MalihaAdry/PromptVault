import { useEffect, useMemo, useRef, useState } from 'react'
import { Archive, ChevronDown, Command, LogOut, Plus, Search, Sparkles, Star, X } from 'lucide-react'
import AuthScreen from './components/AuthScreen'
import Logo from './components/Logo'
import PromptCard from './components/PromptCard'
import PromptModal from './components/PromptModal'
import Toast from './components/Toast'
import { isSupabaseConfigured, supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('updated')
  const [modalPrompt, setModalPrompt] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); setLoading(false); return undefined }
    let mounted = true
    supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setLoading(false) } })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])
  useEffect(() => { if (session?.user) loadPrompts() }, [session])
  useEffect(() => { const onKeyDown = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus() } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(null), 2800); return () => clearTimeout(timer) }, [toast])

  async function loadPrompts() {
    setLoading(true)
    const { data, error } = await supabase.from('prompts').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false })
    if (error) showToast(error.message, 'error'); else setPrompts(data || [])
    setLoading(false)
  }
  function showToast(message, type = 'success') { setToast({ message, type }) }
  function openNew() { setModalPrompt(null); setModalOpen(true) }
  function openEdit(prompt) { setModalPrompt(prompt); setModalOpen(true) }
  async function savePrompt(form) {
    setSaving(true)
    const payload = { title: form.title.trim(), content: form.content.trim(), category: form.category.trim() || null, tags: form.tags, is_favorite: form.is_favorite }
    const result = modalPrompt ? await supabase.from('prompts').update(payload).eq('id', modalPrompt.id).select().single() : await supabase.from('prompts').insert({ ...payload, user_id: session.user.id }).select().single()
    setSaving(false)
    if (result.error) { showToast(result.error.message, 'error'); return }
    setPrompts((current) => modalPrompt ? current.map((item) => item.id === result.data.id ? result.data : item) : [result.data, ...current])
    setModalOpen(false); showToast(modalPrompt ? 'Prompt updated' : 'Prompt saved')
  }
  async function deletePrompt(prompt) {
    if (!window.confirm('Delete this prompt? This action cannot be undone.')) return
    const { error } = await supabase.from('prompts').delete().eq('id', prompt.id)
    if (error) { showToast(error.message, 'error'); return }
    setPrompts((current) => current.filter((item) => item.id !== prompt.id)); showToast('Prompt deleted')
  }
  async function toggleFavorite(prompt) {
    const next = !prompt.is_favorite
    const { data, error } = await supabase.from('prompts').update({ is_favorite: next }).eq('id', prompt.id).select().single()
    if (error) { showToast(error.message, 'error'); return }
    setPrompts((current) => current.map((item) => item.id === prompt.id ? data : item))
  }
  async function copyPrompt(prompt) {
    try { await navigator.clipboard.writeText(prompt.content); showToast('Copied to clipboard') } catch { showToast('Could not copy. Check your browser permissions.', 'error') }
  }

  const categories = useMemo(() => [...new Set(prompts.map((prompt) => prompt.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [prompts])
  const visiblePrompts = useMemo(() => prompts.filter((prompt) => {
    const searchText = [prompt.title, prompt.content, prompt.category, ...(prompt.tags || [])].filter(Boolean).join(' ').toLowerCase()
    return (!query || searchText.includes(query.toLowerCase())) && (filter === 'all' || filter === 'favorites' && prompt.is_favorite || prompt.category === filter)
  }).sort((a, b) => sort === 'alpha' ? a.title.localeCompare(b.title) : new Date(b.updated_at) - new Date(a.updated_at)), [prompts, query, filter, sort])

  if (loading && session === undefined) return <div className="loading-screen"><Logo /><div className="loading-pulse" /></div>
  if (!session) return <><AuthScreen /><Toast toast={toast} /></>
  return <div className="app-shell">
    <header className="topbar"><Logo /><div className="topbar-right"><span className="saved-count"><Archive size={15} /> {prompts.length} saved</span><div className="avatar" title={session.user.email}>{(session.user.email?.[0] || 'U').toUpperCase()}</div><button className="logout-button" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> <span>Log out</span></button></div></header>
    <main className="workspace">
      <div className="workspace-heading"><div><div className="eyebrow"><Sparkles size={14} /> Your private prompt library</div><h1>Good to see you again.</h1><p>What are you working on today?</p></div><button className="button button-primary" onClick={openNew}><Plus size={17} /> New prompt</button></div>
      <div className="search-row"><div className="search-box"><Search size={19} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your prompts…" aria-label="Search prompts" />{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}<span className="shortcut"><Command size={12} /> K</span></div></div>
      <div className="toolbar"><div className="filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All prompts <span>{prompts.length}</span></button><button className={filter === 'favorites' ? 'active' : ''} onClick={() => setFilter('favorites')}><Star size={15} /> Favorites <span>{prompts.filter((prompt) => prompt.is_favorite).length}</span></button>{categories.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="sort-select">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Recently updated</option><option value="alpha">Alphabetical</option></select><ChevronDown size={14} /></label></div>
      {loading ? <div className="card-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item}><div /><div /><div /><div /></div>)}</div> : visiblePrompts.length ? <div className="card-grid">{visiblePrompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} onCopy={copyPrompt} onEdit={openEdit} onDelete={deletePrompt} onToggleFavorite={toggleFavorite} />)}</div> : <EmptyState hasPrompts={prompts.length > 0} filter={filter} query={query} onNew={openNew} />}
    </main>
    {modalOpen && <PromptModal prompt={modalPrompt} onClose={() => setModalOpen(false)} onSave={savePrompt} saving={saving} />}
    <Toast toast={toast} />
  </div>
}

function EmptyState({ hasPrompts, filter, query, onNew }) {
  const message = query ? 'No prompts found.' : filter === 'favorites' ? 'No favorite prompts yet.' : "You haven't saved any prompts yet."
  return <div className="empty-state"><div className="empty-icon">{query ? <Search size={22} /> : filter === 'favorites' ? <Star size={22} /> : <Archive size={22} />}</div><h2>{message}</h2><p>{query ? 'Try a different keyword or clear your search.' : hasPrompts ? 'Try another filter to find what you need.' : 'Start with the prompt you use most often.'}</p>{!hasPrompts && !query && <button className="button button-primary" onClick={onNew}><Plus size={17} /> Add your first prompt</button>}</div>
}
