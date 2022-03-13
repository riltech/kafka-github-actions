const test = require("tape");
const Service = require("./index");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-consumer-showcase",
  brokers: ["127.0.0.1:9092"],
});

test("When the service is initialised it can connect to Kafka successfully", async (t) => {
  t.plan(1);
  const service = new Service();
  service.producer.on("producer.connect", (e) => {
    t.ok(e.id);
  });
  await service.connect();
});

test("Service can publish messages to Kafka successfully ", async (t) => {
  t.plan(2);
  const service = new Service();
  await service.connect();
  await service.sendMessage("test-topic", [{ value: "foo_bar" }]);

  const consumer = kafka.consumer();
  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, _, message }) => {
      t.equal(topic, "test-topic");
      t.equal(message, "foo_bar");
    },
  });
});
