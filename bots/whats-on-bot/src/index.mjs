import pkg from '@slack/bolt';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import db, { initializeDB, readDB, writeDB } from './data/db.mjs';
import { getJiraClient } from './jira.mjs';
import { getSlackApiClient } from './slack.mjs';

dotenv.config();

const { App } = pkg;

const JIRA_SECRET = process.env.JIRA_SECRET || '';

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// TODO:
// 1. Add command to configure bot 
//as user will add email and bot will figure out jira id 
//we store in bot - slack id we match slack id with jira id in our database
//API to get profile: https://nhshackathon.atlassian.net/rest/api/3/user/search?query=damien.borek1@nhs.net 
app.command('/authenticate-to-jira', async ({ command, ack, respond }) => {
  await ack();
  console.log('it works');
  const userId = command.user_id;
  const jiraBaseUrl = `${process.env.JIRA_BASE_URL}/rest/api/3`;
  const jiraClient = getJiraClient(jiraBaseUrl, JIRA_SECRET);

  try {
    const jiraId = await jiraClient.getUserByEmail(command.text, JIRA_SECRET);

    if(!jiraId) {
      await respond('Failed to find user from Jira');
      return;
    }


    await readDB();
    db.users = db.users || {};
    db.users[userId] = jiraId;
    await writeDB();
    console.log(db.users);
    await respond('Successfully authenticated to Jira');
  } catch (error) {
    console.error(error);
    await respond('Failed to authenticate to Jira');
  }
});

app.command('/whats-on-v2', async ({ command, ack, respond }) => {
  await ack();

  const userSlackId = command.user_id;
  await readDB();

  const userJiraId = db.users[userSlackId];
  const jiraBaseUrl = `${process.env.JIRA_BASE_URL}/rest/api/2`;
  const jiraClient = getJiraClient(jiraBaseUrl, JIRA_SECRET);

  try {
//     const tickets = await jiraClient.search(`assignee IN (6332b05197148a8301fc51eb)`, JIRA_SECRET);
    const tickets = await jiraClient.search(`assignee = ${userJiraId} and sprint in openSprints()`, JIRA_SECRET);

    let response = '';
    const ticketRows = tickets.map(ticket =>
      `## 🎟️ [${ticket.id}](https://nhshackathon.atlassian.net/browse/${ticket.id}) - ${ticket.summary}\n* 📝: ${ticket.status}\n* 🔺: ${ticket.priority}\n* 🙋: ${ticket.assignee || 'Unassigned'}`
    ).join('\n');

    response = response + ticketRows;

    const slackBaseUrl = `${process.env.SLACK_BASE_URL}`;
    const slackClient = getSlackApiClient(slackBaseUrl, app, command.team_id, command.channel_id)
    await slackClient.createCanvas("What have I got on today?", response, userSlackId);

    await respond(response);
  } catch (error) {
    console.error(error);
    await respond('Failed to fetch Jira tickets');
  }
});

app.message("hey", async ({ message, say }) => {
  try {
    say("Hello Human!");
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.command('/setup-webhook-for-jira', async ({ command, ack, respond }) => {
  await ack();
  const channelId = command.channel_id;

  try {
    const dbData = await readDB();
    dbData.webhookConfig = { channelId };
    await writeDB();

    await respond(`Webhook notifications will be sent to <#${channelId}>`);
  } catch (error) {
    await respond('Failed to set up webhook channel');
  }
});

(async () => {
  await initializeDB({ posts: [], webhookConfig: {} });
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running on port 3000!');
})();

const expressApp = express();
expressApp.use(bodyParser.json());

expressApp.get('/webhook', async (req, res) => {
  const { body } = req;
  console.log('Webhook received:', body);

  try {
    const dbData = await readDB();
    const channelId = dbData.webhookConfig.channelId;

    if (body.issue && channelId) {
      const issue = body.issue;
      const message = `Issue ${issue.key} updated: ${issue.fields.summary}`;

      await app.client.chat.postMessage({
        channel: channelId,
        text: message,
      });
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error handling webhook');
  }
});

expressApp.listen(3001, () => {
  console.log('Express server is running on port 3001');
});
