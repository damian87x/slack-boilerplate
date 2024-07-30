# whats-on-bot

## setup env
SIGNING_SECRET: Navigate to Basic Information → App Credentials → Signing Secret.
BOT_TOKEN: Navigate to Oauth && permissions → Bot User oAuth Token.

JIRA_BASE_URL: url of your workspace for example https://yourworksapace.atlassian.net/rest/api/2
JIRA WEBHOOKS: Go to Jira Settings > System > Webhooks.

## TODO
1. Add command to configure bot 
as user will add email and bot will figure out jira id 
we store in bot - slack id we match slack id with jira id in our database
API to get profile: https://nhshackathon.atlassian.net/rest/api/3/user/search?query=damien.borek1@nhs.net 

2. Submit query for tickets
Resolve active "sprint in openSprints()"
API for tickets in open sprints https://nhshackathon.atlassian.net/rest/api/2/search?jql=%20sprint%20in%20openSprints%28%29
KEY / SUMMARY / PRIORITY /  STATUS / FIX VERSION 

3. Create canva template 
https://api.slack.com/methods/canvases.create
Use markdown https://markdownlivepreview.com/

4. Share canvas with user 
https://api.slack.com/methods/canvases.access.set

5. MVP response
we just share meesage go to more and sahred with you.

6. Record demo

7. Go for drinks

## Post MVP
Optain email from slack profile
Put in canvas avatars