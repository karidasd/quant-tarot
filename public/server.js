import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.static(__dirname));

app.get('/api/tarot', (req, res) => {
    res.json({ oracle: 'DarkAIs Quant Tarot', cardsCount: 22, status: 'online' });
});

app.listen(PORT, () => {
    console.log(`🔮 DarkAIs Quant Tarot running at http://localhost:${PORT}`);
});
