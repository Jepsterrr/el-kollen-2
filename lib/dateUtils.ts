/**
 * Konverterar ett Date-objekt till en YYYY-MM-DD-sträng
 * baserat på den lokala tidszonen.
 */
export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    // getMonth() är 0-indexerad (0=januari), så vi lägger till 1.
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}