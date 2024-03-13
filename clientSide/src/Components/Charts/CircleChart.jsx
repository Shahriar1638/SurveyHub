/* eslint-disable react/prop-types */
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CircleChart = ({data}) => {
    const chartData = Object.entries(data).map(([name, value]) => ({name, value}));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <PieChart width={500} height={500}>
            <Pie
                data={chartData}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={160}
                fill="#8884d8"
                dataKey="value"
            >
                {
                    chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    );
};

export default CircleChart;