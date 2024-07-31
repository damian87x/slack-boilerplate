import axios from 'axios';

export const getJiraClient = (
  baseUrl,
  authToken,
) => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    getUserByEmail: async (email) => {
      try {
        const response = await instance.get(`/user/search?query=${email}`);

        return response.data[0].accountId;
      } catch (error) {
        console.error('Error fetching Jira user:', error);
        throw new Error('Failed to fetch Jira user');
      }
    },
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
          gravatar: issue.fields.reporter.avatarUrls['48x48']
        })).sort((a, b) => {
            let aPriority = 0;
            let bPriority = 0;
            if(a.priority == b.priority) return 0;
            switch(a.priority) {
                case 'Highest':
                    aPriority = 5;
                    break;
                case 'High':
                    aPriority = 4;
                    break;
                case 'Medium':
                    aPriority = 3;
                    break;
                case 'Low':
                    aPriority = 2;
                    break;
                case 'Lowest':
                    aPriority = 1;
                    break;
                default:
                    aPriority = 0;
                    break;
            }

            switch(b.priority) {
                case 'Highest':
                    bPriority = 5;
                    break;
                case 'High':
                    bPriority = 4;
                    break;
                case 'Medium':
                    bPriority = 3;
                    break;
                case 'Low':
                    bPriority = 2;
                    break;
                case 'Lowest':
                    bPriority = 1;
                    break;
                default:
                    bPriority = 0;
                    break;
            }

            return aPriority > bPriority ? -1 : 1;
        });
      } catch (error) {
        console.error('Error fetching Jira tickets:', error);
        throw new Error('Failed to fetch Jira tickets');
      }
    },
  };
};
