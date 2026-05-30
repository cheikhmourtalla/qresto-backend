"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeWaiterCall = exports.getWaiterCalls = exports.createWaiterCall = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const createWaiterCall = async (req, res) => {
    try {
        const { tableNumber, restaurantId, type, } = req.body;
        if (!tableNumber ||
            !restaurantId ||
            !type) {
            return res.status(400).json({
                message: "Données manquantes",
            });
        }
        const waiterCall = await prisma_1.default.waiterCall.create({
            data: {
                tableNumber: String(tableNumber),
                restaurantId: Number(restaurantId),
                type,
            },
        });
        return res.status(201).json(waiterCall);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
        });
    }
};
exports.createWaiterCall = createWaiterCall;
const getWaiterCalls = async (req, res) => {
    try {
        const restaurantId = Number(req.params.restaurantId);
        const calls = await prisma_1.default.waiterCall.findMany({
            where: {
                restaurantId,
                status: "PENDING",
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.json(calls);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
        });
    }
};
exports.getWaiterCalls = getWaiterCalls;
const completeWaiterCall = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.default.waiterCall.update({
            where: { id },
            data: {
                status: "DONE",
                handledAt: new Date(),
            },
        });
        return res.json({
            message: "Demande traitée",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
        });
    }
};
exports.completeWaiterCall = completeWaiterCall;
