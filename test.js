const test = require("tape");
const Service = require("./index");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-consumer-showcase",
  brokers: ["127.0.0.1:9092"],
});

test("When the service is initialised it can connect to Kafka successfully", async (t) => {
  t.plan(2);
  const service = new Service();
  service.producer.on("producer.connect", (e) => {
    t.equal(e.id, 0);
  });
  service.producer.on("producer.disconnect", (e) => {
    t.equal(e.id, 1);
  });
  await service.connect();
  await service.dispose();
});

test("Service can publish messages to Kafka successfully ", async (t) => {
  t.plan(2);
  const admin = kafka.admin();
  await admin.connect().then(() =>
    admin.createTopics({
      topics: [{ topic: "test-topic" }],
    })
  );

  const service = new Service();
  await service.connect();
  await service.sendMessage("test-topic", [{ value: "foo_bar" }]);

  const consumer = kafka.consumer({ groupId: "consumer-1" });
  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  let messageRead;
  let read = new Promise(res => messageRead = res);
  consumer.run({
    eachMessage: async ({ topic, _, message }) => {
      t.equal(topic, "test-topic");
      t.equal(message.value.toString(), "foo_bar");
      messageRead();
    },
  });
  await read;

  await service.dispose();
  await admin.disconnect();
  await consumer.disconnect();
});
