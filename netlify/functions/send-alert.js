exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    let data = {};
    try {
      data = JSON.parse(event.body || '{}');
    } catch (e) {
      data = {};
    }

    const username = data.username || 'Anonymní dárce';
    const amount = parseFloat(data.amount) || 0;
    const message = data.message || '';

    const token = process.env.SE_JWT_TOKEN;
    const channelId = process.env.SE_CHANNEL_ID;

    if (!token || !channelId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: `Chybí proměnné v Netlify! Token: ${!!token}, ChannelID: ${!!channelId}` 
        })
      };
    }

    const response = await fetch(`https://api.streamelements.com/kappa/v2/tips/${channelId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: { username: username },
        provider: 'custom',
        currency: 'CZK',
        amount: amount,
        message: message
      })
    });

    const resData = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: response.ok,
        status: response.status,
        apiResponse: resData
      })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
