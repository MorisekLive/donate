const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS hlavičky pro povolené volání z GitHub Pages
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Zpracování předběžného dotazu prohlížeče (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { username, amount, message } = JSON.parse(event.body || '{}');
    const token = process.env.SE_JWT_TOKEN;

    if (!token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Chybí SE_JWT_TOKEN v Netlify settings.' })
      };
    }

    // Volání StreamElements API
    const response = await fetch('https://api.streamelements.com/kappa/v2/tips/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: { username: username || 'Anonymní dárce' },
        provider: 'custom',
        currency: 'CZK',
        amount: parseFloat(amount) || 0,
        message: message || ''
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
