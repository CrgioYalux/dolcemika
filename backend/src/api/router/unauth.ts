import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.post(ROUTES.USERS.POST_CLIENT, Handlers.Users.PostClient);
router.post(ROUTES.USERS.POST_ADMIN, Handlers.Users.PostAdmin);
router.post(ROUTES.USERS.AUTH, Handlers.Users.Auth);
router.get(ROUTES.MENU.GET, Handlers.Menu.Get);

export default router;
