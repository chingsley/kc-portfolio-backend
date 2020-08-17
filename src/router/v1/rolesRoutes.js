import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.send('roles routes'));

export default router;
