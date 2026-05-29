import { Request, Response } from "express";
import prisma from "../prisma";

export const createWaiterCall = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      tableNumber,
      restaurantId,
      type,
    } = req.body;

    if (
      !tableNumber ||
      !restaurantId ||
      !type
    ) {
      return res.status(400).json({
        message: "Données manquantes",
      });
    }

    const waiterCall =
      await prisma.waiterCall.create({
        data: {
          tableNumber: String(
            tableNumber
          ),
          restaurantId: Number(
            restaurantId
          ),
          type,
        },
      });

    return res.status(201).json(
      waiterCall
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Erreur serveur",
    });
  }
};

export const getWaiterCalls =
  async (req, res) => {
    try {
      const restaurantId =
        Number(
          req.params.restaurantId
        );

      const calls =
  await prisma.waiterCall.findMany({
    where: {
      restaurantId,
      status: "PENDING",
    },

    orderBy: {
      createdAt: "desc",
    },
  });

      return res.json(calls);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Erreur serveur",
      });
    }
  };

  export const completeWaiterCall =
  async (req, res) => {
    try {
      const id = Number(
        req.params.id
      );

      await prisma.waiterCall.update({
        where: { id },

        data: {
          status: "DONE",
          handledAt: new Date(),
        },
      });

      return res.json({
        message:
          "Demande traitée",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Erreur serveur",
      });
    }
  };