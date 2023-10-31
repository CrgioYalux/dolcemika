import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.ORDERS.GET_BY_ID, Handlers.Orders.GetById);
router.get(ROUTES.ORDERS.GET, Handlers.Orders.Get);

export default router;

