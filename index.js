const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/send-alert', async (req, res) => {
  try {
    const { username, amount, message } = req.body;

    const jwtToken = process.env.SE_JWT_TOKEN ? process.env.SE_JWT_TOKEN.trim() : '';
    const channelId = process.env.SE_CHANNEL_ID ? process.env.SE_CHANNEL_ID.trim() : '';

    if (!jwtToken || !channelId) {
      console.error("Chybí SE_JWT_TOKEN nebo SE_CHANNEL_ID v proměnných prostředí!");
      return res.status(500).json({ success: false, error: 'Chybí konfigurace serveru (token nebo ID kanálu).' });
    }

    const response = await fetch(`https://api.streamelements.com/kappa/v2/tips/${channelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        user: {
          username: username || 'Anonymní dárce'
        },
        provider: 'custom',
        amount: parseFloat(amount) || 100,
        currency: 'CZK',
        message: message || 'Podpora streamu'
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

    console.log("StreamElements status:", response.status);
    console.log("StreamElements odpoved:", data);

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: data.message || JSON.stringify(data) 
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Chyba backendu:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
