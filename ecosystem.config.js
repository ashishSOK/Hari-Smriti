module.exports = {
    apps: [
        {
            name: 'sadhna-backend',
            cwd: './backend',
            script: 'server.js',
            interpreter: 'node',
            watch: false,
            env: {
                NODE_ENV: 'development',
                PORT: 5002,
                TZ: 'Asia/Kolkata'
            },
            restart_delay: 2000,
            max_restarts: 10,
        },
        {
            name: 'sadhna-frontend',
            cwd: './frontend',
            script: 'npm',
            args: 'run dev',
            watch: false,
            env: {
                NODE_ENV: 'development',
            },
            restart_delay: 2000,
            max_restarts: 10,
        },
    ],
};
