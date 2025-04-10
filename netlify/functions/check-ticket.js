
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { issueKey, scannedCode } = JSON.parse(event.body);

  const JIRA_DOMAIN = "damaswiss.atlassian.net"; // <-- Your Jira domain
  const JIRA_EMAIL = "info@damaswiss.org";     // <-- Your Jira email
  const JIRA_API_TOKEN = "ATATT3xFfGF0MBfRzYfSWGmazTWNWybwEHW4Z7rivOdvI8N476m9dLiFEptVkQDu_xzJkeD3HXfh5cYvf0dtk0qDs1QEECdCWPw6mEQueBwbShZR7iEiF7G1gywfX4gCZaOpL76x94AaDRYizH3BBM6ciCKQNsq4vUlcJ97k-MrGXgjkr5pb6Ok=DB022894";          // <-- Your Jira API token
  const CUSTOM_FIELD_ID = "customfield_10061";      // <-- Your custom field ID in Jira

  try {
    const response = await fetch(`https://${JIRA_DOMAIN}/rest/api/3/issue/${issueKey}`, {
      method: "GET",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ found: false })
      };
    }

    const data = await response.json();
    const ticketCode = data.fields[CUSTOM_FIELD_ID];
    const match = ticketCode && scannedCode && (ticketCode.trim() === scannedCode.trim());

    return {
      statusCode: 200,
      body: JSON.stringify({ found: match })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ found: false })
    };
  }
};
