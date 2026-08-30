const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>GAAJU-MD ULTRA ONLINE</h1>
           <p>RAM: 12.4TB / 32TB TBS CLOUD</p>
  <p>Uptime: ${process.uptime()}s</p>');
});
