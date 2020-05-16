module.exports = {
  apps: [{
    name: "webapp",
    script: "./server.js",
    instances: 3,
    exec_mode: "cluster",
    env_production: {
      "NODE_ENV": "production",
    }
  }]
};
