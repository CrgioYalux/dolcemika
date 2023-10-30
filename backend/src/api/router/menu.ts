import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.MENU.GET, Handlers.Menu.Get);

export default router;
