const jwt = require('jsonwebtoken');

function generateZegoToken(params) {
    const { userId, roomId, secret, effectiveTimeInSeconds } = params;
    
    const payload = {
        app_id: process.env.ZEGO_APP_ID,
        user_id: userId,
        room_id: roomId,
        privilege: {
            1: 1, // Login room
            2: 1  // Publish stream
        },
        exp: Math.floor(Date.now() / 1000) + (effectiveTimeInSeconds || 3600)
    };

    return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        header: {
            typ: 'JWT',
            alg: 'HS256'
        }
    });
}

module.exports = {
    generateZegoToken
};