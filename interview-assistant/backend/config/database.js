const { Sequelize } = require('sequelize');

// Database configuration using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'intervia', // Database name
  process.env.DB_USER || 'intervia', // Username
  process.env.DB_PASSWORD || 'jtjWwNDsAcAcKPBN', // Password
  {
    host: process.env.DB_HOST || '158.69.248.25',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Increased timeout to 60 seconds
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    retry: {
      max: 5 // Increased retry attempts
    },
    dialectOptions: {
      connectTimeout: 60000, // Connection timeout
      charset: 'utf8mb4'
    }
  }
);

// Test the connection without exiting the process
sequelize.authenticate()
  .then(() => {
    console.log('✅ Remote MySQL connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'intervia'} on ${process.env.DB_HOST || '158.69.248.25'}:${process.env.DB_PORT || 3306}`);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.log('💡 Check if the remote server is accessible');
    console.log('🔧 You can access phpMyAdmin at: https://158.69.248.25:887/phpmyadmin_a3cf3f94842be96d/');
    console.log('🌐 Try pinging the server: ping 158.69.248.25');
    console.log('⚠️ Application will continue but database features may not work');
    // Don't exit the process - let the application start and handle database issues gracefully
  });

module.exports = sequelize;
