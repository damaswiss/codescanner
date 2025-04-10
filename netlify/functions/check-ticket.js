
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { issueKey, scannedCode } = JSON.parse(event.body);


  const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
  const JIRA_EMAIL = process.env.JIRA_EMAIL;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  const CUSTOM_FIELD_ID = process.env.CUSTOM_FIELD_ID;
  
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
