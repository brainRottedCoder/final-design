interface MetricCardProps {
  title: string;
  value: string;
  isPrimary?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  isPrimary = false,
  isActive = false,
  onClick
}: MetricCardProps) {
  const showActiveStyle = isPrimary || isActive;

  // Active state: purple background with darker purple border
  // Inactive state: light blue background with darker blue border when hovered
  const backgroundColor = showActiveStyle ? 'rgba(37, 34, 227, 0.70)' : 'rgba(54, 159, 255, 0.10)';
  const borderColor = showActiveStyle ? 'rgba(25, 22, 180, 0.9)' : 'transparent';

  return (
    <div
      className={`rounded-[14px] 2xl:rounded-[20px] px-4 2xl:px-6 py-3 2xl:py-4 min-h-[95px] 2xl:min-h-[130px] transition-all flex flex-col ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}`}
      style={{
        backgroundColor,
        border: `3px solid ${borderColor}`,
      }}
      onClick={onClick}
    >
      {/* Title at top left */}
      <div
        className="text-sm 2xl:text-lg font-semibold leading-tight"
        style={{ color: showActiveStyle ? '#ffffff' : '#8ea3b7' }}
      >
        {title}
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Value row - positioned at bottom with bar on left and number on right */}
      <div className="flex items-end justify-between">
        <div
          className="h-[28px] 2xl:h-[38px] w-[4px] 2xl:w-[6px] rounded-sm 2xl:rounded"
          style={{ backgroundColor: showActiveStyle ? 'rgba(255,255,255,0.6)' : '#369fff' }}
        />
        <span
          className="text-[42px] 2xl:text-[58px] font-bold leading-none"
          style={{ color: showActiveStyle ? '#ffffff' : '#369fff' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}