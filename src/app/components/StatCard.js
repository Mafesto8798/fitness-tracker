"use client";

export default function StatCard({ icon, title, value, subtitle, color = "primary" }) {
  const colorClasses = {
    primary: "stat-card-primary",
    success: "stat-card-success",
    info: "stat-card-info"
  };

  return (
    <div className={`stat-card ${colorClasses[color] || colorClasses.primary}`}>
      {icon && (
        <div className="stat-card-icon">
          {icon}
        </div>
      )}
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
        {subtitle && (
          <p className="stat-card-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
