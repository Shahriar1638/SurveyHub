/* eslint-disable react/prop-types */
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const VerticalChart = ({data}) => {
    const chartData = Object.entries(data).map(([name, value]) => ({name, value: Number(value)}));

    return (
        <ComposedChart
            layout="vertical"
            width={500}
            height={400}
            data={chartData}
            margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            }}
        >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" barSize={20} fill="#413ea0" />
        </ComposedChart>
    );
};

export default VerticalChart;