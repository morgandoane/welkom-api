export const randomNumber = (max: number, min: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;
