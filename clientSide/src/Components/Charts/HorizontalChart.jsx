/* eslint-disable react/prop-types */
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const HorizontalChart = ({data}) => {
    const chartData = Object.entries(data).map(([name, value]) => ({name, value: Number(value)}));
    
    return (
        <BarChart width={500} height={600} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
    );
};

export default HorizontalChart;