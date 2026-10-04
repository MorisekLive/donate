exports.handler = async (event, context) => {
  // Povolíme volání z tvého webu (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const amount = parseFloat(data.amount) || 0;
    const name = data.name || "Anonym";

    // Načtení skrytého tokenu z nastavení Netlify
    const SE_JWT_TOKEN = process.env.SE_JWT_TOKEN;

    if (!SE_JWT_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Chybí konfigurovaný JWT token na serveru." })
      };
    }

    // Volání StreamElements API přímo ze serveru
    const response = await fetch("https://api.streamelements.com/kappa/v2/tips/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SE_JWT_TOKEN}`
      },
      body: JSON.stringify({
        user: { username: name },
        provider: "manual",
        message: "QR Platba ze streamu",
        amount: amount,
        currency: "CZK"
      })
    });

    if (response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } else {
      const errText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errText })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
