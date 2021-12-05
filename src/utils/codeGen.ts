const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const getRandomLetter = (): string =>
    alphabet[Math.floor(Math.random() * alphabet.length)];

export const getRandomNumber = (): number =>
    numbers[Math.floor(Math.random() * numbers.length)];
