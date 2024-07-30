import axios from 'axios';

export const getSlackApiClient = (
  baseUrl,
  app,
  teamId,
  channelId
) => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return {
    createCanvas: async (title, contents, userid) => {
      try {
        const response = await instance.post('/api/canvases.create', {
            token: process.env.SLACK_BOT_TOKEN,
            title: title,
            document_content: `{"type": "markdown", "markdown": "${contents}"}`
        });

        const getCanvas = await instance.get('/api/canvases.')

        console.log(response.data);

        const canvasId = response.data.canvas_id;

        console.log(canvasId);
        console.log("My user" + userid)

        app.client.chat.postMessage({
            channel: channelId,
            text: `https://slackhackathonnhs.enterprise.slack.com/docs/E07EGULLF8S/${canvasId}`,
          });


        
      } catch (error) {
        console.error('Error creating canvas', error);
        throw new Error('Failed to create canvas');
      }
    },
  };
};
