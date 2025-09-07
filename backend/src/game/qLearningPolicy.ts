export const qTable: number[][] = [
    [0, 0.5, 0.5], // state 0: aligned
    [0, 1, 0],     // state 1: paddle above ball
    [0, 0, 1],     // state 2: paddle below ball
];

export function getStateIndex(ballY: number, paddleCenterY: number): number {
    const diff = paddleCenterY - ballY;
    if (Math.abs(diff) < 5) return 0;
    return diff > 0 ? 1 : 2;
}

