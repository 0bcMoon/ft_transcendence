import { COLORS } from "./constants";

export const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
};

export const drawCenterLine = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.beginPath();
    ctx.setLineDash([15, 15]);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.strokeStyle = COLORS.centerLine;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);
};

export const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
};

export const drawBall = (ctx: CanvasRenderingContext2D, ball: any) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball;
    ctx.fill();
};

export const drawScores = (
    ctx: CanvasRenderingContext2D,
    score: { left: number; right: number },
    side: string | null,
    width: number
) => {
    ctx.font = "32px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle = side === "left" ? COLORS.score.highlight : COLORS.score.default;
    ctx.fillText(score.left.toString(), width / 4, 40);

    ctx.fillStyle = side === "right" ? COLORS.score.highlight : COLORS.score.default;
    ctx.fillText(score.right.toString(), (3 * width) / 4, 40);
};
