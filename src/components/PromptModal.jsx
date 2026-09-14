import { useEffect, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'

const emptyForm = { title: '', content: '', category: '', tags: '', is_favorite: false }

export default function PromptModal({ prompt, onClose, onSave, saving }) {
  const [form, setForm] = useState(prompt ? { ...prompt, tags: (prompt.tags || []).join(', ') } : emptyForm)
  useEffect(() => {
    function onKeyDown(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })) }
  function submit(event) { event.preventDefault(); onSave({ ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) }) }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-topline"><div><div className="eyebrow">{prompt ? 'Refine a prompt' : 'Add to your vault'}</div><h2 id="modal-title">{prompt ? 'Edit prompt' : 'New prompt'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <form onSubmit={submit}>
        <label>Title<input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Weekly planning partner" required autoFocus /></label>
        <label>Prompt content<textarea value={form.content} onChange={(event) => update('content', event.target.value)} placeholder="Write the prompt exactly as you want to reuse it…" rows={9} required /></label>
        <div className="form-grid"><label>Category<input value={form.category || ''} onChange={(event) => update('category', event.target.value)} placeholder="Work, Writing…" /></label><label>Tags<input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="planning, weekly, focus" /><span className="field-hint">Separate tags with commas</span></label></div>
        <label className="checkbox-row"><input type="checkbox" checked={form.is_favorite} onChange={(event) => update('is_favorite', event.target.checked)} /><span className="check-ui"><Check size={13} /></span><span>Keep this prompt in Favorites</span></label>
        <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : prompt ? 'Save changes' : <><Plus size={17} /> Add prompt</>}</button></div>
      </form>
    </section>
  </div>
}
