import express from 'express';

const router = express.Router();

router.get('/', (request, response) => {
  response.send({ message: 'Actions list' });
});

router.post('/', (request, response) => {
  response.send({ message: 'Action created' });
});

export default router;
