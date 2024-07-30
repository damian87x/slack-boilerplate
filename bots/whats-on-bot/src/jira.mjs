import axios from 'axios';

export const getJiraClient = (
  baseUrl,
  authToken,
) => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: 'Basic dGhvbWFzLnBlZGxleTFAbmhzLm5ldDpBVEFUVDN4RmZHRjA2Y2J5TGl6d1BlaDF0WThPWjRudklycjZSODhGNjFoRnlNb1NPd19WNERqdTBGNTNCSXM5TG95U2lDODVmVzUtQ0IyOUhDVDZRelN2UEdOa0M0QWlNU0dieV91N0xWdDE4MnN4VGRPNnZjOVdRR0QzeVA2QWJCN1FJSnhDZk4xbWNSMjE0cURDcUc4bW43M3VncXhHcnlvQ2VCampsd3FkLVo3MG1pS3R4Mzg9NUEyMzVGREI=',
      'Content-Type': 'application/json',
    },
  });

  return {
    search: async (jql) => {
      try {
        const response = await instance.get('/search', {
          params: { jql },
        });

        return response.data.issues.map((issue) => ({
          id: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          assignee: issue.fields.assignee
            ? issue.fields.assignee.displayName
            : null,
          priority: issue.fields.priority.name,
        }));
      } catch (error) {
        console.error('Error fetching Jira tickets:', error);
        throw new Error('Failed to fetch Jira tickets');
      }
    },
  };
};
