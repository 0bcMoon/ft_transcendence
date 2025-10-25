import React, { useEffect, useRef } from 'react';

interface PieChartProps {
    data: {
        labels: string[];
        values: number[];
        colors: string[];
    };
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set dimensions
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Calculate total for percentages
        const total = data.values.reduce((sum, value) => sum + value, 0);

        // Draw pie segments
        let startAngle = -0.5 * Math.PI; // Start from the top (12 o'clock position)

        data.values.forEach((value, index) => {
            const sliceAngle = (2 * Math.PI * value) / total;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = data.colors[index % data.colors.length];
            ctx.fill();

            // Draw label lines and text
            const midAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(midAngle) * (radius + 10);
            const labelY = centerY + Math.sin(midAngle) * (radius + 10);

            const percentage = Math.round((value / total) * 100);

            ctx.fillStyle = '#4B5563';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${data.labels[index]}: ${percentage}%`, labelX, labelY);

            // Start angle for next segment
            startAngle = endAngle;
        });

        // Draw a white circle in the middle for a donut chart effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Add total percentage text in the middle
        ctx.fillStyle = '#4B5563';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${data.values[0]}%`, centerX, centerY - 10);
        ctx.font = '12px Arial';
        ctx.fillText('Win Rate', centerX, centerY + 10);

    }, [data]);

    return (
        <canvas
            ref={canvasRef}
            width="400"
            height="250"
            className="w-full h-full"
        />
    );
};
