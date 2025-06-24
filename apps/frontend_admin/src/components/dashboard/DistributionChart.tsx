import React from 'react';
import { Card, Space, Tag } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  fullName?: string;
  [key: string]: any;
}

interface DistributionChartProps {
  title: string;
  data: ChartDataItem[];
  colors?: string[];
  showTags?: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const DistributionChart: React.FC<DistributionChartProps> = ({
  title,
  data,
  colors = COLORS,
  showTags = false,
}) => {
  return (
    <Card title={title}>
      <div style={{ height: 300, display: "flex", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={65}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                value,
                props.payload.fullName || name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showTags && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Space>
            {data.map((item, index) => (
              <Tag color={colors[index % colors.length]} key={item.name}>
                {item.name}: {item.value}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default DistributionChart;
