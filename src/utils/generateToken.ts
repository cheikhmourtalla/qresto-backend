import jwt from "jsonwebtoken";

/**
 * Génère un token JWT harmonisé pour QResto Sénégal
 */
export const generateToken = (
  id: number, // On utilise 'id' pour correspondre au middleware et au contrôleur
  role: string,
  restaurantId?: number | null
) => {
  // On s'assure que le secret existe, sinon on utilise la valeur par défaut du projet
  const secret = process.env.JWT_SECRET || "qresto_secret";

  return jwt.sign(
    {
      id, // Doit être 'id' et non 'userId' pour être reconnu par ton middleware protect
      role,
      restaurantId,
    },
    secret,
    {
      expiresIn: "30d", // Augmenté à 30 jours pour ton confort de développement
    }
  );
};