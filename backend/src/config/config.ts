export const config = () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  api: {
    apiUrl: process.env.API_URL,
    httpTimeout: 1000,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DBNAME,
    password: process.env.MONGODB_PASSWORD,
    username: process.env.MONGODB_USERNAME,
  },
  jwt: {
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  },
});
