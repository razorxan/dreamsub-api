import express from 'express';
import cors from 'cors';
import DreamSub from './DreamSub';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.set('json spaces', 2);

app.get('/search', async (req, res) => {
    if (typeof req.query.q === 'string') {
        res.json(await DreamSub.search(req.query.q));
    } else {
        res.json(null);
    }
});

app.get('/:slug/:episode', async (req: express.Request, res: express.Response) => {
    const result = await DreamSub.getEpisode(req.params.slug, +req.params.episode);
    res.json(result);
});

app.get('/:slug', async (req: express.Request, res: express.Response) => {
    const result = await DreamSub.get(req.params.slug);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`up and running on port ${PORT}`);
});