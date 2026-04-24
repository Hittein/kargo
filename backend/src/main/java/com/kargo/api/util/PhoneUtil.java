package com.kargo.api.util;

/**
 * Normalisation des numéros mauritaniens. MR utilise 8 chiffres locaux (mobile
 * commence par 2-4, opérateurs Mauritel/Chinguitel/Mattel). On stocke toujours
 * la forme locale 8-chiffres — le préfixe +222 est ajouté uniquement pour l'envoi SMS.
 *
 * Règles :
 * - Strip espaces, tirets, parenthèses, points.
 * - Un "+" initial est retiré.
 * - Si la chaîne commence par "222" après strip et qu'elle fait ≥ 11 chiffres, on retire "222".
 * - On garde les 8 derniers chiffres.
 * - Le résultat doit faire exactement 8 chiffres, sinon on retourne null (invalide).
 */
public final class PhoneUtil {
    private PhoneUtil() {}

    public static String normalize(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) digits = digits.substring(1);
        if (digits.startsWith("222") && digits.length() >= 11) {
            digits = digits.substring(3);
        }
        if (digits.length() > 8) {
            digits = digits.substring(digits.length() - 8);
        }
        if (digits.length() != 8) return null;
        if (!digits.chars().allMatch(Character::isDigit)) return null;
        return digits;
    }

    /** Retourne true si raw se normalise en un numéro MR valide. */
    public static boolean isValid(String raw) {
        return normalize(raw) != null;
    }
}
