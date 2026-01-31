import amqp from "amqplib"
import {clients} from "../../app.js"
export async function startWorker() {
    const RABBIT_URL = process.env.RABBIT_URL
    console.log(RABBIT_URL)
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        const queue = 'notifications_queue';

        await channel.assertQueue(queue, { durable: false });
        console.log(`Connected to RabbitMQ at ${RABBIT_URL}`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const targetUserId = content.userId;

                if (clients[targetUserId]) {
                    clients[targetUserId].write(`data: ${JSON.stringify(content)}\n\n`);
                }
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("RabbitMQ Connection Failed:", error.message);
        console.log("Make sure RabbitMQ is running or check your URL!");
    }
}
