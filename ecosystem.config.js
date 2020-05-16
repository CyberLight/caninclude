module.exports = {
  apps: [{
    name: "webapp",
    script: "./server.js",
    instances: 3,
    exec_mode: "cluster",
    max_memory_restart: '300M',
    time: true,
    env_production: {
      "NODE_ENV": "production",
    }
  }]
};
