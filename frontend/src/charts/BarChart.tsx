import { useEffect, useRef } from 'react';

interface BarChartProps {
    data: { [key: string]: any }[];
    xKey: string;
    yKeys: string[];
    colors?: string[];
}

export default function BarChart({
    data,
    xKey,
    yKeys,
    colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']
}: BarChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data || data.length === 0 || yKeys.length === 0) return;

        const svg = svgRef.current;
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Calculate max Y value
        let maxY = 0;
        data.forEach(item => {
            let sum = 0;
            yKeys.forEach(key => {
                sum += item[key];
            });
            maxY = Math.max(maxY, sum);
        });
        maxY = maxY * 1.1; // Add some padding

        // Background
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("x", "0");
        background.setAttribute("y", "0");
        background.setAttribute("width", width.toString());
        background.setAttribute("height", height.toString());
        background.setAttribute("fill", "#ffffff");
        svg.appendChild(background);

        // Draw axes
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding.left.toString());
        xAxis.setAttribute("y1", (padding.top + chartHeight).toString());
        xAxis.setAttribute("x2", (padding.left + chartWidth).toString());
        xAxis.setAttribute("y2", (padding.top + chartHeight).toString());
        xAxis.setAttribute("stroke", "#d1d5db");
        xAxis.setAttribute("stroke-width", "2");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding.left.toString());
        yAxis.setAttribute("y1", padding.top.toString());
        yAxis.setAttribute("x2", padding.left.toString());
        yAxis.setAttribute("y2", (padding.top + chartHeight).toString());
        yAxis.setAttribute("stroke", "#d1d5db");
        yAxis.setAttribute("stroke-width", "2");
        svg.appendChild(yAxis);

        // Draw grid lines (horizontal)
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
            const yPos = padding.top + (chartHeight / yTicks) * i;
            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", padding.left.toString());
            gridLine.setAttribute("y1", yPos.toString());
            gridLine.setAttribute("x2", (padding.left + chartWidth).toString());
            gridLine.setAttribute("y2", yPos.toString());
            gridLine.setAttribute("stroke", "#e5e7eb");
            gridLine.setAttribute("stroke-width", "1");
            svg.appendChild(gridLine);

            // Y-axis labels
            const yValue = maxY - (i / yTicks) * maxY;
            const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            yLabel.setAttribute("x", (padding.left - 10).toString());
            yLabel.setAttribute("y", yPos.toString());
            yLabel.setAttribute("text-anchor", "end");
            yLabel.setAttribute("dominant-baseline", "middle");
            yLabel.setAttribute("fill", "#4b5563");
            yLabel.setAttribute("font-size", "12");
            yLabel.textContent = Math.round(yValue).toString();
            svg.appendChild(yLabel);
        }

        // Draw bars
        const barWidth = chartWidth / data.length / 1.5;
        const groupWidth = barWidth * yKeys.length;
        const barPadding = barWidth * 0.1;

        data.forEach((item, i) => {
            const groupX = padding.left + (i * chartWidth / data.length) + (chartWidth / data.length - groupWidth) / 2;

            // X-axis labels
            const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            xLabel.setAttribute("x", (groupX + groupWidth / 2).toString());
            xLabel.setAttribute("y", (padding.top + chartHeight + 20).toString());
            xLabel.setAttribute("text-anchor", "middle");
            xLabel.setAttribute("fill", "#4b5563");
            xLabel.setAttribute("font-size", "12");
            xLabel.textContent = item[xKey];
            svg.appendChild(xLabel);

            yKeys.forEach((key, j) => {
                const value = item[key] || 0;
                const barHeight = (value / maxY) * chartHeight;
                const x = groupX + j * (barWidth);
                const y = padding.top + chartHeight - barHeight;

                const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bar.setAttribute("x", (x + barPadding / 2).toString());
                bar.setAttribute("y", y.toString());
                bar.setAttribute("width", (barWidth - barPadding).toString());
                bar.setAttribute("height", barHeight.toString());
                bar.setAttribute("fill", colors[j % colors.length]);
                bar.setAttribute("rx", "2");
                bar.setAttribute("ry", "2");
                svg.appendChild(bar);

                // Value on top of the bar
                if (barHeight > 15) {
                    const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    valueText.setAttribute("x", (x + barWidth / 2).toString());
                    valueText.setAttribute("y", (y + 15).toString());
                    valueText.setAttribute("text-anchor", "middle");
                    valueText.setAttribute("fill", "#ffffff");
                    valueText.setAttribute("font-size", "10");
                    valueText.textContent = value.toString();
                    svg.appendChild(valueText);
                }
            });
        });

        // Add legend
        const legendY = padding.top / 2;

        yKeys.forEach((key, i) => {
            const legendX = padding.left + i * 80;

            const legendRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            legendRect.setAttribute("x", legendX.toString());
            legendRect.setAttribute("y", legendY.toString());
            legendRect.setAttribute("width", "12");
            legendRect.setAttribute("height", "12");
            legendRect.setAttribute("fill", colors[i % colors.length]);
            svg.appendChild(legendRect);

            const legendText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            legendText.setAttribute("x", (legendX + 16).toString());
            legendText.setAttribute("y", (legendY + 10).toString());
            legendText.setAttribute("fill", "#4b5563");
            legendText.setAttribute("font-size", "12");
            legendText.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            svg.appendChild(legendText);
        });

    }, [data, xKey, yKeys, colors]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 500 300"
            preserveAspectRatio="xMidYMid meet"
            className="rounded-lg"
        />
    );
}
