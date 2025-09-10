import { useEffect, useRef } from 'react';

interface LineChartProps {
    data: { [key: string]: any }[];
    xKey: string;
    yKey: string;
    title?: string;
    lineColor?: string;
}

export default function LineChart({
    data,
    xKey,
    yKey,
    title = 'Line Chart',
    lineColor = '#10b981'
}: LineChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data || data.length === 0) return;

        const svg = svgRef.current;
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const padding = { top: 40, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Get min and max values
        const yValues = data.map(d => d[yKey]);
        const minY = Math.min(...yValues) * 0.9;
        const maxY = Math.max(...yValues) * 1.1;

        // Scale functions
        const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
        const yScale = (value: number) => padding.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

        // Background
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("x", "0");
        background.setAttribute("y", "0");
        background.setAttribute("width", width.toString());
        background.setAttribute("height", height.toString());
        background.setAttribute("fill", "#1e293b");
        svg.appendChild(background);

        // Draw axes
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding.left.toString());
        xAxis.setAttribute("y1", (padding.top + chartHeight).toString());
        xAxis.setAttribute("x2", (padding.left + chartWidth).toString());
        xAxis.setAttribute("y2", (padding.top + chartHeight).toString());
        xAxis.setAttribute("stroke", "#6b7280");
        xAxis.setAttribute("stroke-width", "1");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding.left.toString());
        yAxis.setAttribute("y1", padding.top.toString());
        yAxis.setAttribute("x2", padding.left.toString());
        yAxis.setAttribute("y2", (padding.top + chartHeight).toString());
        yAxis.setAttribute("stroke", "#6b7280");
        yAxis.setAttribute("stroke-width", "1");
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
            gridLine.setAttribute("stroke", "#374151");
            gridLine.setAttribute("stroke-width", "1");
            gridLine.setAttribute("stroke-dasharray", "4");
            svg.appendChild(gridLine);

            // Y-axis labels
            const yValue = maxY - (i / yTicks) * (maxY - minY);
            const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            yLabel.setAttribute("x", (padding.left - 10).toString());
            yLabel.setAttribute("y", yPos.toString());
            yLabel.setAttribute("text-anchor", "end");
            yLabel.setAttribute("dominant-baseline", "middle");
            yLabel.setAttribute("fill", "#e5e7eb");
            yLabel.setAttribute("font-size", "12");
            yLabel.textContent = Math.round(yValue).toString();
            svg.appendChild(yLabel);
        }

        // Draw data points and line
        let pathData = "";
        data.forEach((d, i) => {
            const x = xScale(i);
            const y = yScale(d[yKey]);

            // Add point to path
            if (i === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }

            // Draw point
            const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            point.setAttribute("cx", x.toString());
            point.setAttribute("cy", y.toString());
            point.setAttribute("r", "4");
            point.setAttribute("fill", lineColor);
            point.setAttribute("stroke", "#fff");
            point.setAttribute("stroke-width", "2");
            svg.appendChild(point);

            // X-axis labels
            if (i % Math.ceil(data.length / 14) === 0 || i === data.length - 1) {
                const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                xLabel.setAttribute("x", x.toString());
                xLabel.setAttribute("y", (padding.top + chartHeight + 20).toString());
                xLabel.setAttribute("text-anchor", "middle");
                xLabel.setAttribute("fill", "#e5e7eb");
                xLabel.setAttribute("font-size", "12");
                xLabel.textContent = d[xKey];
                svg.appendChild(xLabel);
            }
        });

        // Draw the line path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", lineColor);
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);

        // Add title
        const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleText.setAttribute("x", (width / 2).toString());
        titleText.setAttribute("y", (padding.top / 2).toString());
        titleText.setAttribute("text-anchor", "middle");
        titleText.setAttribute("dominant-baseline", "middle");
        titleText.setAttribute("fill", "#f9fafb");
        titleText.setAttribute("font-size", "16");
        titleText.setAttribute("font-weight", "bold");
        titleText.textContent = title;
        svg.appendChild(titleText);

        // Add y-axis title
        const yAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yAxisTitle.setAttribute("x", "20");
        yAxisTitle.setAttribute("y", (padding.top + chartHeight / 2).toString());
        yAxisTitle.setAttribute("text-anchor", "middle");
        yAxisTitle.setAttribute("transform", `rotate(-90, 20, ${padding.top + chartHeight / 2})`);
        yAxisTitle.setAttribute("fill", "#e5e7eb");
        yAxisTitle.setAttribute("font-size", "12");
        yAxisTitle.textContent = "Sec";
        svg.appendChild(yAxisTitle);

        // Add x-axis title
        const currentDate = new Date();
        const xAxisTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xAxisTitle.setAttribute("x", (padding.left + chartWidth / 2).toString());
        xAxisTitle.setAttribute("y", (height - 10).toString());
        xAxisTitle.setAttribute("text-anchor", "middle");
        xAxisTitle.setAttribute("fill", "#e5e7eb");
        xAxisTitle.setAttribute("font-size", "12");
        xAxisTitle.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
        svg.appendChild(xAxisTitle);

    }, [data, xKey, yKey, title, lineColor]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
            className="rounded-lg"
        />
    );
}
