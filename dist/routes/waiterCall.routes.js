"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waiterCall_controller_1 = require("../controllers/waiterCall.controller");
const router = (0, express_1.Router)();
router.post("/waiter-call", waiterCall_controller_1.createWaiterCall);
router.get("/waiter-call/:restaurantId", waiterCall_controller_1.getWaiterCalls);
router.patch("/waiter-call/:id/complete", waiterCall_controller_1.completeWaiterCall);
exports.default = router;
