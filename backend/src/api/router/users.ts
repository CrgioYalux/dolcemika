import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.USERS.GET, Handlers.Users.Get);

export default router;
