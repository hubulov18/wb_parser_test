module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PGHOST,
      user: 'postgres',
      password: 'postgres',
      database: process.env.PGDATABASE,
      port: process.env.PGPORT || 5432
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/knex/migrations',
    },
  },


};
