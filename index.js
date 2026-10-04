const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-alert', async (req, res) => {
  try {
    const { username, amount, message } = req.body;

    const JWT_TOKEN = process.env.SE_JWT_TOKEN;
    const CHANNEL_ID = process.env.SE_CHANNEL_ID;

    if (!JWT_TOKEN || !CHANNEL_ID) {
      return res.status(500).json({ success: false, error: 'Chybí SE_JWT_TOKEN nebo SE_CHANNEL_ID v nastavení serveru.' });
    }

    const response = await fetch(`https://api.streamelements.com/kappa/v2/tips/${CHANNEL_ID}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify({
        user: { username: username || 'Anonymní dárce' },
        provider: 'custom',
        currency: 'CZK',
        amount: parseFloat(amount) || 100,
        message: message || 'Děkujeme za podporu!'
      })
    });

    const resData = await response.json();
    return res.status(response.status).json({ success: response.ok, apiResponse: resData });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
