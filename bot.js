const WebSocket = require('ws');

const SERVER_URL = 'wss://fra-c.wormate.io:30055/wormy';
const hexPayload = '810af00000210b0057006f0072006d0020004b0069006c006c00650072';
const buffer = Buffer.from(hexPayload.replace(/[^a-fA-F0-9]/g, ''), 'hex');
const BOT_COUNT = 1500;

function createControlPacket(angle, boost = false) {
    let angleValue = Math.floor((angle / (2 * Math.PI)) * 128) % 128;
    if (boost) angleValue |= 128;
    return Buffer.from([angleValue]);
}

for (let i = 0; i < BOT_COUNT; i++) {
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
        console.log(`🤖 Bot ${i + 1} connected`);
        ws.send(buffer);

        let currentAngle = Math.random() * 2 * Math.PI;
        let lastAngleChange = Date.now();

        const moveInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                // Change direction more frequently (100ms instead of 200ms)
                if (Date.now() - lastAngleChange > 100) {
                    // Make angle changes more significant
                    const changeAngle = (Math.random() - 0.5) * Math.PI * 1.5;
                    currentAngle += changeAngle;
                    lastAngleChange = Date.now();
                }

                // Increase the random jitter in movement
                currentAngle += (Math.random() - 0.5) * 0.2;
                // Increase boost frequency
                const boost = Math.random() < 0.9;

                const controlPacket = createControlPacket(currentAngle, boost);
                ws.send(controlPacket);
            } else {
                clearInterval(moveInterval);
            }
        }, 30); // Reduced from 50ms to 30ms for more frequent updates
    });

    ws.on('close', () => {
        console.log(`❌ Bot ${i + 1} disconnected`);
    });

    ws.on('error', (err) => {
        console.error(`⚠️ Bot ${i + 1} error: ${err.message}`);
    });
}