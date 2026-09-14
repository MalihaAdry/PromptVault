export default function Logo({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="PromptKeeper">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      {!compact && <span className="brand-name">PromptKeeper</span>}
    </div>
  )
}
