/** PM2 配置：在 VPS 项目根目录执行 pm2 start deploy/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'todolist-api',
      cwd: './server',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
