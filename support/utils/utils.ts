export function generateRandomString(length = 10): string {
    return Math.random().toString(36).slice(2).padEnd(length, '0').slice(0, length);
}

export function generateRandomLetters(length = 8): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function generateUniqueEmail(prefix = 'qa.auto'): string {
    return `${prefix}.${Date.now()}.${generateRandomString(6)}@example.com`;
}
