export default () => ({
  db: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:2701',
    user: process.env.DATABASE_USER || 'admin',
    pass: process.env.DATABASE_PASS || 'secret',
    name: process.env.DATABASE_NAME || 'web_crawler',
  },
});
