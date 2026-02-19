export interface StationColumn {
  label: string;
  unit: string;
  value: string;
}

interface StationCardProps {
  title: string;
  riverName?: string;
  discharge: string;
  velocity: string;
  waterLevel: string;
  color: 'blue' | 'orange' | 'green' | 'yellow';
  isSelected?: boolean;
  onClick?: () => void;
  columns?: StationColumn[];
  size?: 'default' | 'large';
  layout?: 'row' | 'grid';
  onColumnClick?: (label: string) => void; // Callback for column click
  selectedColumns?: string[]; // List of selected column labels
}

const colorConfig = {
  blue: {
    bg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    solid: '#3B82F6',
    border: '#1D4ED8',
  },
  green: {
    bg: 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)',
    solid: '#84CC16',
    border: '#4D7C0F',
  },
  orange: {
    bg: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
    solid: '#F97316',
    border: '#C2410C',
  },
  yellow: {
    bg: 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
    solid: '#FACC15',
    border: '#A16207',
  },
};

export default function StationCard({
  title,
  riverName,
  discharge,
  velocity,
  waterLevel,
  color,
  isSelected = false,
  onClick,
  columns,
  size = 'default',
  layout = 'row',
  onColumnClick,
  selectedColumns = [],
}: StationCardProps) {
  const config = colorConfig[color];

  // Use provided columns or fallback to default Discharge/Velocity/Water Level
  const displayColumns = columns || [
    { label: 'Discharge', unit: '(m³/s)', value: discharge },
    { label: 'Velocity', unit: '(m/s)', value: velocity },
    { label: 'Water Level', unit: '(m)', value: waterLevel },
  ];

  const isLarge = size === 'large';
  const isGrid = layout === 'grid';

  const handleColumnClick = (e: React.MouseEvent, label: string) => {
    if (onColumnClick) {
      e.stopPropagation(); // Prevent card click if column clicked
      onColumnClick(label);
    }
  };

  return (
    <div
      className={`rounded-2xl 2xl:rounded-3xl ${isLarge ? 'px-4 2xl:px-6 py-3 2xl:py-5' : 'px-2 2xl:px-4 py-1.5 2xl:py-2'} text-white h-full flex flex-col overflow-hidden transition-all cursor-pointer ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
      style={{
        background: config.bg,
        boxShadow: isSelected
          ? `0 8px 20px ${config.solid}50`
          : `0 4px 12px ${config.solid}30`,
        minHeight: 0,
        border: isSelected ? `3px solid ${config.border}` : '3px solid transparent',
      }}
      onClick={onClick}
    >
      {/* Title */}
      <div className={`flex items-center justify-center ${isLarge ? (isGrid ? 'mb-3 2xl:mb-4' : 'mb-2 2xl:mb-3') : 'mb-1 2xl:mb-2'} border-2 border-white bg-white rounded-lg flex-shrink-0`}>
        <h3
          className={`${isLarge ? 'text-lg 2xl:text-2xl px-4 2xl:px-6 py-1 2xl:py-1.5' : 'text-sm 2xl:text-lg px-2 2xl:px-5 py-0.5 2xl:py-1.5'} rounded-lg 2xl:rounded-xl font-bold text-gray-800 truncate`}
        >
          {title}
        </h3>
      </div>

      {isGrid ? (
        // Grid Layout (Label + Value in one cell)
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 2xl:gap-x-8 2xl:gap-y-6 flex-1 content-center">
          {displayColumns.map((col, idx) => {
            const isColSelected = selectedColumns.includes(col.label);
            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center rounded-xl p-2 transition-all duration-200 ${onColumnClick ? 'cursor-pointer hover:bg-white/20' : ''}`}
                style={{
                  backgroundColor: isColSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  border: isColSelected ? '2px solid rgba(255, 255, 255, 0.6)' : '2px solid transparent',
                  transform: isColSelected ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={(e) => handleColumnClick(e, col.label)}
              >
                <span className={`${isLarge ? 'text-base 2xl:text-lg' : 'text-sm 2xl:text-base'} font-semibold opacity-95 truncate`}>
                  {col.label}
                </span>
                <span className={`${isLarge ? 'text-xs 2xl:text-sm' : 'text-[10px] 2xl:text-xs'} font-medium opacity-80`}>
                  {col.unit}
                </span>
                <div className={`${isLarge ? 'text-2xl xl:text-3xl 2xl:text-4xl' : 'text-lg xl:text-xl 2xl:text-2xl'} font-bold leading-tight truncate mt-1`}>
                  {col.value}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Row Layout (Separate Header and Value rows)
        <>
          {/* Dynamic Columns Grid */}
          <div
            className={`grid ${isLarge ? 'gap-2 2xl:gap-4' : 'gap-1 2xl:gap-2'} text-center flex-1 min-h-0 items-center`}
            style={{ gridTemplateColumns: `repeat(${displayColumns.length}, minmax(0, 1fr))` }}
          >
            {displayColumns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-0 justify-center items-center min-w-0">
                <span className={`${isLarge ? 'text-base 2xl:text-lg' : 'text-xs 2xl:text-base'} font-semibold opacity-95 truncate`}>{col.label}</span>
                <span className={`${isLarge ? 'text-xs 2xl:text-sm' : 'text-[9px] 2xl:text-xs'} font-medium opacity-80`}>{col.unit}</span>
              </div>
            ))}
          </div>

          {/* Values Row */}
          <div
            className={`grid ${isLarge ? 'gap-2 2xl:gap-4 pt-1 2xl:pt-2' : 'gap-1 2xl:gap-2 pb-0.5 2xl:pb-2'} text-center mt-auto`}
            style={{ gridTemplateColumns: `repeat(${displayColumns.length}, minmax(0, 1fr))` }}
          >
            {displayColumns.map((col, idx) => (
              <div key={idx} className={`${isLarge ? 'text-2xl xl:text-3xl 2xl:text-4xl' : 'text-base xl:text-lg 2xl:text-2xl'} font-bold leading-tight truncate`}>
                {col.value}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
