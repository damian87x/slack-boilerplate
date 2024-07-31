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
    createCanvas: async (title, contents) => {
      try {



        const response = await instance.post('/api/canvases.create', {
            token: process.env.SLACK_BOT_TOKEN,
            title: title,
            document_content: `{"type": "markdown", "markdown": "${contents}"}`
        });



        const canvasId = response.data.canvas_id;

        app.client.chat.postMessage({
            channel: channelId,
            text: `Look at how busy you are! Best get cracking... https://slackhackathonnhs.enterprise.slack.com/docs/${teamId}/${canvasId}`,
          });
        
      } catch (error) {
        console.error('Error creating canvas', error);
        throw new Error('Failed to create canvas');
      }
    },
  };
};
