import { useEffect, useRef } from 'react';

interface DonutChartProps {
    data: { [key: string]: any }[];
    labelKey: string;
    valueKey: string;
    colors?: string[];
}

export default function DonutChart({
    data,
    labelKey,
    valueKey,
    colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
}: DonutChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data || data.length === 0) return;

        const svg = svgRef.current;
        const width = svg.clientWidth;
        const height = svg.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2.5;
        const innerRadius = radius * 0.6;

        // Clear SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // Calculate total value
        const total = data.reduce((sum, item) => sum + item[valueKey], 0);

        // Draw donut segments
        let startAngle = 0;
        data.forEach((item, index) => {
            const value = item[valueKey];
            const percentage = value / total;
            const endAngle = startAngle + (percentage * 2 * Math.PI);

            // Calculate arc path
            const x1 = centerX + radius * Math.sin(startAngle);
            const y1 = centerY - radius * Math.cos(startAngle);
            const x2 = centerX + radius * Math.sin(endAngle);
            const y2 = centerY - radius * Math.cos(endAngle);

            const largeArcFlag = percentage > 0.5 ? 1 : 0;

            // Outer arc
            const outerArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
            outerArc.setAttribute("d", `
        M ${centerX + innerRadius * Math.sin(startAngle)},${centerY - innerRadius * Math.cos(startAngle)}
        L ${x1},${y1}
        A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}
        L ${centerX + innerRadius * Math.sin(endAngle)},${centerY - innerRadius * Math.cos(endAngle)}
        A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${centerX + innerRadius * Math.sin(startAngle)},${centerY - innerRadius * Math.cos(startAngle)}
      `);
            outerArc.setAttribute("fill", colors[index % colors.length]);
            svg.appendChild(outerArc);

            // Add label and percentage
            if (percentage > 0.05) { // Only add labels if segment is large enough
                const labelAngle = startAngle + (endAngle - startAngle) / 2;
                const labelRadius = (radius + innerRadius) / 2;

                const labelX = centerX + labelRadius * Math.sin(labelAngle);
                const labelY = centerY - labelRadius * Math.cos(labelAngle);

                const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                label.setAttribute("x", labelX.toString());
                label.setAttribute("y", labelY.toString());
                label.setAttribute("text-anchor", "middle");
                label.setAttribute("dominant-baseline", "middle");
                label.setAttribute("fill", "#ffffff");
                label.setAttribute("font-size", "12");
                label.setAttribute("font-weight", "bold");
                label.textContent = `${Math.round(percentage * 100)}%`;
                svg.appendChild(label);
            }

            startAngle = endAngle;
        });

        // Add center circle for donut effect
        const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        centerCircle.setAttribute("cx", centerX.toString());
        centerCircle.setAttribute("cy", centerY.toString());
        centerCircle.setAttribute("r", innerRadius.toString());
        centerCircle.setAttribute("fill", "#ffffff");
        svg.appendChild(centerCircle);

        // Add legend
        const legendWidth = 120;
        const legendY = height * 0.5 - (data.length * 20) / 2;
        const legendX = width * 0.5 + radius * 0.5;

        data.forEach((item, index) => {
            const itemY = legendY + index * 25;

            const legendRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            legendRect.setAttribute("x", legendX.toString());
            legendRect.setAttribute("y", itemY.toString());
            legendRect.setAttribute("width", "12");
            legendRect.setAttribute("height", "12");
            legendRect.setAttribute("fill", colors[index % colors.length]);
            svg.appendChild(legendRect);

            const legendText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            legendText.setAttribute("x", (legendX + 20).toString());
            legendText.setAttribute("y", (itemY + 10).toString());
            legendText.setAttribute("fill", "#4b5563");
            legendText.setAttribute("font-size", "14");
            legendText.textContent = `${item[labelKey]} (${item[valueKey]})`;
            svg.appendChild(legendText);
        });

    }, [data, labelKey, valueKey, colors]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid meet"
            className="rounded-lg"
        />
    );
}
