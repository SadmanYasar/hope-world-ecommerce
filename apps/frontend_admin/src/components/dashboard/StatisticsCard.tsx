import React from 'react';
import { Card, Statistic } from 'antd';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  prefix: React.ReactNode;
  color: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  prefix,
  color,
}) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        valueStyle={{ color }}
      />
    </Card>
  );
};

export default StatisticsCard;
