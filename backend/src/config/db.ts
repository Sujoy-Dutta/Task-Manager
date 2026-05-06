import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  console.log("URL", uri)
  if (!uri) {
    throw new Error(
      'MongoDB connection string missing. Set MONGO_URI (preferred) or MONGODB_URI in your environment variables.'
    );
  }

  // Avoid stacking multiple listeners in dev/hot-reload scenarios.
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    const name = mongoose.connection.name || '(unknown-db)';
    console.log(`✅  MongoDB connected → ${mongoose.connection.host}/${name}`);
  });
  mongoose.connection.on('error', (err) =>
    console.error('❌  MongoDB connection error:', err)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️   MongoDB disconnected.')
  );
  console.log("Checkkkkkkk")
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
