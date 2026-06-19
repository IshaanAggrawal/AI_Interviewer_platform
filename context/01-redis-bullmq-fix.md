# Redis & BullMQ Crash Fixes

## Issue
The backend was crashing due to `ECONNRESET` and Redis `noeviction` policy warnings when trying to initialize BullMQ and connect to Upstash Redis. Also, the app would crash instantly if Redis disconnected because there was no error listener.

## Solution
1. **Error Handlers**: Added `.on("error", (err) => console.error(...))` listeners to the Redis clients in `queue.service.ts` and `cache.ts`. This prevents the entire Express application from crashing when a Redis connection drops.
2. **BullMQ Config**: Explicitly set `maxRetriesPerRequest: null` inside the `IORedis` connection options for BullMQ, which is a strict requirement for BullMQ to operate correctly.
