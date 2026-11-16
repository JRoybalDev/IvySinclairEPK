// Shared helper: portable between projects. See ./README.md for the rules.
// Requires: react

import { useSyncExternalStore } from 'react'

const subscribers = new Map<number, Set<() => void>>()
const timers = new Map<number, ReturnType<typeof setInterval>>()

const createSubscribe = (intervalMs: number) => (onTick: () => void) => {
  let group = subscribers.get(intervalMs)
  if (!group) {
    group = new Set()
    subscribers.set(intervalMs, group)
    const tickGroup = group
    timers.set(intervalMs, setInterval(() => tickGroup.forEach((tick) => tick()), intervalMs))
  }
  group.add(onTick)
  return () => {
    group.delete(onTick)
    if (group.size === 0) {
      clearInterval(timers.get(intervalMs))
      timers.delete(intervalMs)
      subscribers.delete(intervalMs)
    }
  }
}

// One stable subscribe function per interval, so React doesn't resubscribe on every render.
const subscribeFns = new Map<number, (onTick: () => void) => () => void>()
const subscribeTo = (intervalMs: number) => {
  let subscribe = subscribeFns.get(intervalMs)
  if (!subscribe) {
    subscribe = createSubscribe(intervalMs)
    subscribeFns.set(intervalMs, subscribe)
  }
  return subscribe
}

/**
 * The current time in ms, refreshed every `intervalMs` and rounded down to it so the
 * value stays stable between ticks. Returns null during server rendering.
 */
export function useNow(intervalMs = 1000): number | null {
  return useSyncExternalStore(
    subscribeTo(intervalMs),
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  )
}
