import { createClient } from 'redis'


const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
})

redisClient.on('connect', () => {
  console.log('Client connected to redis...')
})

redisClient.on('ready', () => {
  console.log('Client connected to redis and ready to use...')
})

redisClient.on('error', (err: Error) => {
  console.log(err.message)
})

redisClient.on('end', () => {
  console.log('Client disconnected from redis')
})

process.on('SIGINT', async () => {
  await redisClient.quit()
  console.log('Redis client connection closed due to app termination')
  process.exit(0)
})

await redisClient.connect()

export default redisClient