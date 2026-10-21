require("dotenv").config();

const axios = require("axios");
const { App } = require("@slack/bolt");
const cron = require("node-cron");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/goofy-goober-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms`});
});

app.command("/goofy-goober-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/goofy-goober-help - Show this menu,
/goofy-goober-ping - Check bot latency,
/goofy-goober-catfact - Get a cat fact,
/goofy-goober-joke - Get a joke,
/goofy-goober-ranfact - Get a random fact,
/goofy-goober-quote - Get a random quote,
/goofy-goober-wotd - Get the word of the day and it's definition,
/goofy-goober-riddle - Get a random riddle,`
  });
});

app.command("/goofy-goober-riddle", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://riddles-api.vercel.app/random");
    const riddle = response.data.riddle;
    const ans = response.data.answer;
    await respond({ text: `${riddle}\n\nAnswer: ${ans}` });
  } catch (err) {
    console.error("Error fetching riddle:", err);
    await respond({ text: "Failed to fetch a riddle." });
  }
});

app.command("/goofy-goober-quote", async ({ ack, respond }) => {
  await ack();
  
  try {
    const response = await axios.get("https://dummyjson.com/quotes/random")
    const quote = response.data.quote;
    const author = response.data.author;
    await respond({ text: `${quote}\nBy: ${author}` });
  } catch (err) {
    console.error("Error fetching quote:", err);
    await respond({ text: "Failed to fetch a quote.", err });
  }
});

app.command("/goofy-goober-wotd", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://api.wotd.site/query");
    const word = response.data.word;
    const def = response.data.definition;
    await respond({ text: `Word of the Day:\n${word}\nWhich means:\n${def}` });
  } catch (err) {
    console.error("Error fetching word of the day:", err);
    await respond({ text: "Failed to fetch the word of the day." });
  }
});

app.command("/goofy-goober-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/goofy-goober-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/goofy-goober-ranfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://uselessfacts.jsph.pl//api/v2/facts/random");
    const text = response.data.text
    const sourceurl = response.data.source_url
    const source = response.data.source
    await respond({ text: `${text}\nSource: <${sourceurl}|${source}>` });
  } catch (err) {
      await respond({ text: "Failed to fetch a random fact." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");

  cron.schedule("26 20 * * *", async () => {
    try {
      await app.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: "Good morning!"
      });
    } catch (err) {
      console.error("Scheduled post failed:", err);
    }
  }, {timezone: "Europe/London"
  });
})();