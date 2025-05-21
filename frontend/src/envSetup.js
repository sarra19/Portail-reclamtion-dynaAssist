// src/envSetup.js

if (!window.process) {
    window.process = {
      env: {
        NODE_ENV: 'development', // or 'production' if you're building for deployment
      },
      nextTick: require('next-tick'),
    };
  }