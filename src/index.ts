require("dotenv").config();
import { App } from "@slack/bolt";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

app.event("app_mention", async ({ context, event }: any) => {
  try {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: `Hey <@${event.user}>, you mentioned me.`,
    });
  } catch (e) {
    console.log(`error responding ${e}`);
  }
});
app.command("/gamebot", async ({ ack, body, context, say, command }: any) => {
  let out;
  // console.log("*** 🔥 params", body);
  await ack();
  switch (command.text) {
    case "help":
      out = `\`\`\`/game create - create a new game
/game cancel <id> - cancel the creation of game
/game help  - list out the commands
/game start <id> - start the game
/game assign <id> <name> @<channel>
/game result <id> <name> - find the result of person \`\`\``;
      break;
    default:
      out = `<@${command.user_id}> ${command.text}`;
      break;
  }
  await say(`${out}`);
});
