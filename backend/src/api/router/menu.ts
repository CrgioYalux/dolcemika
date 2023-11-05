import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

// router.get(ROUTES.MENU.GET, Handlers.Menu.Get); // being handled in unauth routes
router.post(ROUTES.MENU.POST_ITEM, Handlers.Menu.PostMenuItem);
router.put(ROUTES.MENU.PUT_ITEM_AVAILABILITY, Handlers.Menu.PutMenuItemAvailability);
router.put(ROUTES.MENU.PUT_ITEM_DESCRIPTION, Handlers.Menu.PutMenuItemDescription);
router.delete(ROUTES.MENU.DELETE_ITEM, Handlers.Menu.DeleteMenuItem);

export default router;
