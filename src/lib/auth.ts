export const SESSION_COOKIE = 'nw_session'

/** Een jaar — je logt op je telefoon één keer in. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Afgeleide sessiewaarde. De pincode zelf komt nooit in een cookie
 * terecht; de cookie bevat alleen een hash die serverzijdig te
 * herberekenen is. Web Crypto omdat dit ook in de middleware draait.
 */
export async function sessionToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`nextwave-schema:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function configuredPin(): string | null {
  const pin = process.env.APP_PIN
  return pin && pin.length > 0 ? pin : null
}

/** Vergelijking zonder vroege uitstap, zodat de duur niets verraadt. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
