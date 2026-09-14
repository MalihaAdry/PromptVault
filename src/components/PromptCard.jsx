import { Copy, Edit3, MoreHorizontal, Star, Trash2 } from 'lucide-react'

export default function PromptCard({ prompt, onCopy, onEdit, onDelete, onToggleFavorite }) {
  return <article className="prompt-card">
    <div className="card-head"><div className="card-heading"><h3>{prompt.title}</h3>{prompt.category && <span className="category-pill">{prompt.category}</span>}</div><button className={`star-button ${prompt.is_favorite ? 'active' : ''}`} onClick={() => onToggleFavorite(prompt)} aria-label={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}><Star size={18} fill={prompt.is_favorite ? 'currentColor' : 'none'} /></button></div>
    <p className="prompt-preview">{prompt.content}</p>
    <div className="card-foot"><div className="tag-list">{(prompt.tags || []).slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}{(prompt.tags || []).length > 3 && <span>+{prompt.tags.length - 3}</span>}</div><span className="card-date">{formatDate(prompt.updated_at)}</span></div>
    <div className="card-actions"><button className="button button-copy" onClick={() => onCopy(prompt)}><Copy size={15} /> Copy prompt</button><button className="button button-small" onClick={() => onEdit(prompt)} aria-label="Edit prompt"><Edit3 size={16} /></button><button className="button button-small danger" onClick={() => onDelete(prompt)} aria-label="Delete prompt"><Trash2 size={16} /></button><button className="button button-small menu-button" aria-label="More actions"><MoreHorizontal size={16} /></button></div>
  </article>
}

function formatDate(date) {
  if (!date) return ''
  const updated = new Date(date)
  const days = Math.floor((new Date() - updated) / 86400000)
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  return `Updated ${updated.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}
