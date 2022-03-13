const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-producer-showcase",
  brokers: ["127.0.0.1:9092"],
});

class Service {
  constructor() {
    this.producer = kafka.producer();
  }
  async connect() {
    await this.producer.connect();
  }
  async sendMessage(topic = "test-topic", messages = [{ value: "Hello" }]) {
    return await this.producer.send({
      topic,
      messages,
    });
  }
  async dispose() {
    await this.producer.disconnect();
  }
}

module.exports = Service;
