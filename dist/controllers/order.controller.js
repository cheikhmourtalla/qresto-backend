"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../prisma"));
/**
 * POST /orders
 * Créer une commande (public — appelé depuis le menu client)
 */
const createOrder = async (req, res) => {
    try {
        const { tableNumber, restaurantId, items } = req.body;
        // items: [{ productId: number, quantity: number, price: number }]
        if (!tableNumber || !restaurantId || !items || items.length === 0) {
            return res.status(400).json({ message: "Données de commande incomplètes" });
        }
        // 1. Extraire tous les IDs de produits uniques de la requête
        const productIds = items.map((item) => Number(item.productId));
        // 2. Aller chercher ces produits en base de données pour vérifier leur état réel
        const dbProducts = await prisma_1.default.product.findMany({
            where: {
                id: { in: productIds },
                restaurantId: Number(restaurantId), // Vérifie que les produits appartiennent bien à ce restaurant
            },
        });
        // 3. Vérifier la disponibilité et l'existence de chaque produit
        for (const item of items) {
            const productInDb = dbProducts.find((p) => p.id === Number(item.productId));
            if (!productInDb) {
                return res.status(404).json({
                    message: "Certains produits de votre panier n'existent plus ou ne correspondent pas à ce restaurant."
                });
            }
            // 🛑 BLOCAGE SI INDISPONIBLE
            if (!productInDb.available) {
                return res.status(400).json({
                    message: `Le produit "${productInDb.name}" n'est plus disponible actuellement. Veuillez le retirer de votre panier.`
                });
            }
        }
        // 4. Si tout est bon, on crée la commande en utilisant les vrais prix de la BDD (sécurité anti-fraude)
        const order = await prisma_1.default.order.create({
            data: {
                tableNumber: String(tableNumber),
                restaurantId: Number(restaurantId),
                items: {
                    create: items.map((item) => {
                        const productInDb = dbProducts.find((p) => p.id === Number(item.productId));
                        return {
                            productId: Number(item.productId),
                            quantity: Number(item.quantity),
                            price: productInDb.price, // Utilisation forcée du prix officiel de la base de données
                        };
                    }),
                },
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, image: true } },
                    },
                },
            },
        });
        res.status(201).json({
            message: "Commande passée avec succès",
            order,
        });
    }
    catch (error) {
        console.error("CREATE_ORDER_ERROR:", error);
        res.status(500).json({ message: "Erreur lors de la création de la commande" });
    }
};
exports.createOrder = createOrder;
/**
 * GET /orders
 * Lister les commandes du restaurant (dashboard gérant)
 */
const getOrders = async (req, res) => {
    try {
        const restaurantId = req.user?.role === "SUPER_ADMIN"
            ? Number(req.query.restaurantId)
            : req.user?.restaurantId;
        if (!restaurantId) {
            return res.status(400).json({ message: "ID restaurant manquant" });
        }
        const orders = await prisma_1.default.order.findMany({
            where: { restaurantId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, image: true, price: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        console.error("GET_ORDERS_ERROR:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
};
exports.getOrders = getOrders;
/**
 * PATCH /orders/:id/status
 * Changer le statut d'une commande (dashboard gérant)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;
        const validStatuses = ["PENDING", "IN_PROGRESS", "SERVED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Statut invalide" });
        }
        const order = await prisma_1.default.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true } },
                    },
                },
            },
        });
        res.json({ message: "Statut mis à jour", order });
    }
    catch (error) {
        console.error("UPDATE_ORDER_STATUS_ERROR:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * DELETE /orders/:id
 * Supprimer une commande (dashboard gérant)
 */
const deleteOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        await prisma_1.default.order.delete({ where: { id: orderId } });
        res.json({ message: "Commande supprimée" });
    }
    catch (error) {
        console.error("DELETE_ORDER_ERROR:", error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
exports.deleteOrder = deleteOrder;
