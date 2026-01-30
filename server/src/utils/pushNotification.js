import amqp from "amqplib";

export async function pushNotificationToUser(userId, notificationData) {
    const RABBIT_URL = process.env.RABBIT_URL;
    
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        const queue = 'notifications_queue';
        
        await channel.assertQueue(queue, { durable: false });
        
    
        const payload = JSON.stringify(notificationData);
        
        channel.sendToQueue(queue, Buffer.from(payload));
        console.log(`[Producer] Notification pushed for User ${userId}`);
        
        setTimeout(() => connection.close(), 500);
    } catch (err) {
        console.error("RabbitMQ Push Error:", err);
    }
}