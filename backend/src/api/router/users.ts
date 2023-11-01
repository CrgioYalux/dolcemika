import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.USERS.GET, Handlers.Users.Get);
router.post(ROUTES.USERS.POST_CLIENT, Handlers.Users.PostClient);
router.post(ROUTES.USERS.AUTH, Handlers.Users.Auth);

export default router;
