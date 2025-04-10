
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
    const ticketRawValue = data.fields[CUSTOM_FIELD_ID];
    
    if (!ticketRawValue) {
      return ContentService.createTextOutput(JSON.stringify({ found: "No ticket found" }))
                            .setMimeType(ContentService.MimeType.JSON);
    }

    // Hash the raw ticket field value using SHA256
    const ticketRawValueTrimmed = ticketRawValue.trim();
    const ticketHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, ticketRawValueTrimmed, Utilities.Charset.UTF_8);
    const ticketHashHex = ticketHash.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join(''); // Convert to hex string

    const match = (ticketHashHex === scannedCode);
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
