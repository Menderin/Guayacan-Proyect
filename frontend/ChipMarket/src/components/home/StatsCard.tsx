// src/components/adminDashboard/StatsCard.tsx
import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import '../../styles/StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  loading = false,
  variant = 'default'
}) => {
  if (loading) {
    return (
      <div className={`stats-card stats-card--${variant}`}>
        <div className="stats-card__loading">
          <div className="skeleton skeleton--icon"></div>
          <div className="skeleton skeleton--text"></div>
          <div className="skeleton skeleton--value"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-card stats-card--${variant}`}>
      <div className="stats-card__content">
        <div className="stats-card__header">
          <div className="stats-card__icon-wrapper">
            <Icon className="stats-card__icon" size={24} />
          </div>
          {trend && (
            <div className={`stats-card__trend ${trendUp ? 'stats-card__trend--up' : 'stats-card__trend--down'}`}>
              {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div className="stats-card__body">
          <p className="stats-card__title">{title}</p>
          <p className="stats-card__value">{value}</p>
        </div>
      </div>
    </div>
  );
};