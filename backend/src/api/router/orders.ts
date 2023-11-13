import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.post(ROUTES.ORDERS.POST, Handlers.Orders.Post);
router.get(ROUTES.ORDERS.GET, Handlers.Orders.Get);
router.get(ROUTES.ORDERS.GET_BY_ID, Handlers.Orders.GetById);
router.get(ROUTES.ORDERS.GET_STATES, Handlers.Orders.GetStates);
router.get(ROUTES.ORDERS.GET_STATE_HISTORY, Handlers.Orders.GetStateHistory);
router.get(ROUTES.ORDERS.GET_AMOUNT_BY_CLIENTS, Handlers.Orders.GetAmountByClients);
router.get(ROUTES.ORDERS.GET_BY_CLIENT_ID, Handlers.Orders.GetByClientId);
router.post(ROUTES.ORDERS.POST_CUSTOM_STATE, Handlers.Orders.PostCustomState);
router.post(ROUTES.ORDERS.POST_PAUSED_STATE, Handlers.Orders.PostPausedState);
router.post(ROUTES.ORDERS.POST_REVISING_STATE, Handlers.Orders.PostRevisingState);
router.post(ROUTES.ORDERS.POST_CANCELED_STATE, Handlers.Orders.PostCanceledState);
router.post(ROUTES.ORDERS.POST_FINISHED_STATE, Handlers.Orders.PostFinishedState);
router.post(ROUTES.ORDERS.POST_NEXT_STATE, Handlers.Orders.PostNextState);

export default router;
