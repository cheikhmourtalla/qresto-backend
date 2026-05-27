import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * POST /orders
 * Créer une commande (public — appelé depuis le menu client)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableNumber, restaurantId, items } = req.body;
    // items: [{ productId: number, quantity: number, price: number }]

    if (!tableNumber || !restaurantId || !items || items.length === 0) {
      return res.status(400).json({ message: "Données de commande incomplètes" });
    }

    // 1. Extraire tous les IDs de produits uniques de la requête
    const productIds = items.map((item: any) => Number(item.productId));

    // 2. Aller chercher ces produits en base de données pour vérifier leur état réel
    const dbProducts = await prisma.product.findMany({
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
    const order = await prisma.order.create({
      data: {
        tableNumber: String(tableNumber),
        restaurantId: Number(restaurantId),
        items: {
          create: items.map((item: any) => {
            const productInDb = dbProducts.find((p) => p.id === Number(item.productId))!;
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
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
  }
};

/**
 * GET /orders
 * Lister les commandes du restaurant (dashboard gérant)
 */
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const restaurantId = req.user?.role === "SUPER_ADMIN"
      ? Number(req.query.restaurantId)
      : req.user?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ message: "ID restaurant manquant" });
    }

    const orders = await prisma.order.findMany({
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
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
};

/**
 * PATCH /orders/:id/status
 * Changer le statut d'une commande (dashboard gérant)
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ["PENDING", "IN_PROGRESS", "SERVED", "BILL_REQUESTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const order = await prisma.order.update({
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
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
};

/**
 * PATCH /orders/:id/bill
 * Demander l'addition (public — appelé depuis le menu client)
 */
export const requestBill = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        billRequested: true,
        status: "BILL_REQUESTED",
      },
    });

    res.json({ message: "Addition demandée", order: updated });
  } catch (error) {
    console.error("REQUEST_BILL_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la demande d'addition" });
  }
};

/**
 * DELETE /orders/:id
 * Supprimer une commande (dashboard gérant)
 */
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);

    await prisma.order.delete({ where: { id: orderId } });

    res.json({ message: "Commande supprimée" });
  } catch (error) {
    console.error("DELETE_ORDER_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};