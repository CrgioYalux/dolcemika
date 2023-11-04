import express from 'express';

import { ROUTES } from '../routes';
import Handlers from '../handlers';

const router = express.Router();

router.get(ROUTES.INVENTORY.GET, Handlers.Inventory.Get);
router.post(ROUTES.INVENTORY.POST_INGREDIENT, Handlers.Inventory.PostIngredient);
router.put(ROUTES.INVENTORY.PUT_INGREDIENT_STOCK, Handlers.Inventory.PutIngredientStock);
router.put(ROUTES.INVENTORY.PUT_INGREDIENT_DESCRIPTION, Handlers.Inventory.PutIngredientDescription);
router.delete(ROUTES.INVENTORY.DELETE_INGREDIENT, Handlers.Inventory.DeleteIngredient);

export default router;
