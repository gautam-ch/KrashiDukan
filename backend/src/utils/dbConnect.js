import mongoose from 'mongoose';

const cache = globalThis.mongooseCache || { conn: null, promise: null };
globalThis.mongooseCache = cache;

export const dbConnect = async () => {
      if (cache.conn) return cache.conn;

      if (!process.env.MONGO) {
            throw new Error('MONGO environment variable is not set.');
      }

      if (!cache.promise) {
            console.log('Connecting to database...');
            cache.promise = mongoose.connect(process.env.MONGO).then((mongooseInstance) => {
                  console.log('Database is connected');
                  return mongooseInstance;
            });
      }

      cache.conn = await cache.promise;
      return cache.conn;
};