import type { LibrarySession } from '../../types'

export function formatDuration(session: LibrarySession) {
  const minutes = session.durationMinutes ?? (session.exitTime
    ? Math.max(0, Math.floor((new Date(session.exitTime).getTime() - new Date(session.entryTime).getTime()) / 60000))
    : Math.max(0, Math.floor((Date.now() - new Date(session.entryTime).getTime()) / 60000)))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
