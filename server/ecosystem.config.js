module.exports = {
    apps: [{
        name: "zelzec-server",
        script: "./src/index.js",
        instances: 1, // Start with 1 instance. Change to 'max' for cluster mode in production if needed.
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        cwd: "/home/abhayvijayan/Documents/ZELZEC/Deployment/chat-implementation/server",
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }]
};
