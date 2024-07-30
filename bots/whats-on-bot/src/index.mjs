import pkg from '@slack/bolt';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { getJiraClient } from '@nhs/common';

dotenv.config();

const { App } = pkg;

const JIRA_SECRET = process.env.JIRA_SECRET || '';

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode:true, 
  appToken: process.env.SLACK_APP_TOKEN
});

app.command('/whats-on', async ({ command, ack, respond }) => {
  await ack();
  const userId = command.user_id;
  const jiraBaseUrl = `${process.env.JIRA_BASE_URL}/rest/api/2`;
  const jiraClient = getJiraClient(jiraBaseUrl);

  console.log('command', command);

  try {
    const tickets = await jiraClient.search(`assignee=${encodeURIComponent(userId)}`, JIRA_SECRET);
    const response = tickets.map(ticket => 
      `*${ticket.id}* - ${ticket.summary}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}\nAssignee: ${ticket.assignee || 'Unassigned'}`
    ).join('\n\n');
    await respond(response);
  } catch (error) {
    await respond('Failed to fetch Jira tickets');
  }
});

app.message("hey", async ({ command, say }) => {
  try {
    say("Hello Human!");
  } catch (error) {
      console.log("err")
    console.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running on port 3000!');
})();

const expressApp = express();
expressApp.use(bodyParser.json());

expressApp.post('/webhook', async (req, res) => {
  const { body } = req;
  console.log('Webhook received:', body);

  if (body.issue) {
    const issue = body.issue;
    const message = `Issue ${issue.key} updated: ${issue.fields.summary}`;

    try {
      await app.client.chat.postMessage({
        // TOOD: Update channel to be handled from the config.
        channel: '#jira_notifications',
        text: message,
      });
    } catch (error) {
      console.error('Error posting message to Slack:', error);
    }
  }

  res.status(200).send('Webhook received');
});

expressApp.listen(3001, () => {
  console.log('Express server is running on port 3001');
});