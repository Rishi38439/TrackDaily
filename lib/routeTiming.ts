import { NextResponse } from 'next/server'

type Handler<T> = () => Promise<T>

export async function withRouteTiming<T extends NextResponse>(
  routeName: string,
  handler: Handler<T>,
  metadata?: Record<string, string | null | undefined>,
): Promise<T> {
  const start = performance.now()
  const response = await handler()
  const durationMs = performance.now() - start
  const durationValue = durationMs.toFixed(2)

  const description = Object.entries(metadata ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
    .join(';')

  const existingServerTiming = response.headers.get('Server-Timing')
  const metric = `app;desc="${routeName}${description ? `;${description}` : ''}";dur=${durationValue}`
  response.headers.set(
    'Server-Timing',
    existingServerTiming ? `${existingServerTiming}, ${metric}` : metric,
  )
  response.headers.set('X-Route-Duration-Ms', durationValue)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[route-timing] ${routeName} ${durationValue}ms`, metadata ?? {})
  }

  return response
}