import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.ORDERS.GET, Handlers.Orders.Get);
router.get(ROUTES.ORDERS.GET_BY_ID, Handlers.Orders.GetById);
router.get(ROUTES.ORDERS.GET_STATES, Handlers.Orders.GetStates);
router.post(ROUTES.ORDERS.POST_STATE, Handlers.Orders.PostState);
// router.get(ROUTES.ORDERS.POST, Handlers.Orders.);

export default router;

// TODO
// router.post(ROUTES.ORDERS.GET_STATE_HISTORY, Handlers.Orders.GetStateHistory);
