import { Router } from "express";

import {
  createWaiterCall,getWaiterCalls,completeWaiterCall
} from "../controllers/waiterCall.controller";

const router = Router();

router.post(
  "/waiter-call",
  createWaiterCall
);
router.get(
  "/waiter-call/:restaurantId",
  getWaiterCalls
  
);

router.patch(
  "/waiter-call/:id/complete",
  completeWaiterCall
);

export default router;