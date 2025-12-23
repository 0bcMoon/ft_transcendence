import { PieChart, Pie, Cell, Label } from "recharts"

interface EloCircleChartProps {
    value: number
    max?: number
    size?: number
    color?: string
    bgColor?: string
}

export default function EloCircleChart({
    value,
    max = 2000,
    size = 80,
    color = "#34d399",
    bgColor = "#334155",
}: EloCircleChartProps) {
    const percent = Math.max(0, Math.min(value / max, 1))
    const data = [
        { name: "elo", value: percent },
        { name: "rest", value: 1 - percent },
    ]

    return (
        <PieChart width={size} height={size}>
            <Pie
                data={data}
                startAngle={90}
                endAngle={-270}
                innerRadius={size / 2.3}
                outerRadius={size / 2}
                dataKey="value"
                stroke="none"
            >
                <Cell key="elo" fill={color} />
                <Cell key="rest" fill={bgColor} />
                <Label value={value} position="center" style={{ fill: "#fff", fontWeight: 700, fontSize: size / 4 }} />
            </Pie>
        </PieChart>
    )
}

