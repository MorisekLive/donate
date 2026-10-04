exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: 'OK'
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const username = data.username || 'Anonymní dárce';
    const amount = parseFloat(data.amount) || 0;
    const message = data.message || '';

    const token = process.env.SE_JWT_TOKEN;

    if (!token) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ error: 'Chybí SE_JWT_TOKEN v nastavení Netlify.' })
      };
    }

    const response = await fetch('https://api.streamelements.com/kappa/v2/tips/upload', {
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
      headers: headers,
      body: JSON.stringify(resData)
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
