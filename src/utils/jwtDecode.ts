export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '=='.slice((payload.length % 4) || 0)
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}