import axios from 'axios';

interface JiraTicket {
  id: string;
  summary: string;
  status: string;
  assignee: string | null;
  priority: string;
}

interface JiraClient {
  search: (jql: string) => Promise<JiraTicket[]>;
  getUserByEmail: (email: string) => Promise<string>;
}

export const getJiraClient = (
  baseUrl: string,
  authToken: string,
): JiraClient => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    getUserByEmail: async (email: string): Promise<string> => {
      try {
        const response = await instance.get(`/user/search?query=${email}`);

        return response.data[0].accountId;
      } catch (error) {
        console.error('Error fetching Jira user:', error);
        throw new Error('Failed to fetch Jira user');
      }
    },
    search: async (jql: string): Promise<JiraTicket[]> => {
      try {
        const response = await instance.get('/search', {
          params: { jql },
        });

        return response.data.issues.map((issue: any) => ({
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
