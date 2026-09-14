import { CheckCircle2, XCircle } from 'lucide-react'

export default function Toast({ toast }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  return <div className={`toast ${isError ? 'toast-error' : ''}`} role="status">
    {isError ? <XCircle size={17} /> : <CheckCircle2 size={17} />}<span>{toast.message}</span>
  </div>
}
