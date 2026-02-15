interface RainGaugeStationCardProps {
    title: string;
    rainfallHR: string;
    rainfallTotal: string;
    color?: 'blue' | 'green' | 'orange' | 'yellow';
    isSelected?: boolean;
    onClick?: () => void;
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

export default function RainGaugeStationCard({
    title,
    rainfallHR = '00',
    rainfallTotal = '00',
    color = 'blue',
    isSelected = false,
    onClick,
}: RainGaugeStationCardProps) {
    const config = colorConfig[color];

    return (
        <div
            className={`rounded-2xl 2xl:rounded-3xl px-3 2xl:px-4 py-2 2xl:py-3 text-white h-full flex flex-col overflow-hidden transition-all cursor-pointer ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
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
            <div className="flex items-center justify-center mb-2 border-2 border-white bg-white 2xl:mb-3">
                <h3
                    className="text-base 2xl:text-xl px-4 2xl:px-5 py-1 2xl:py-1.5 rounded-lg 2xl:rounded-xl font-bold text-gray-800 "
                >
                    {title}
                </h3>
            </div>

            {/* Rainfall Sub-heading */}
            <div className="text-center mb-1">
                <span className="text-lg 2xl:text-2xl font-semibold opacity-95">Rainfall</span>
                <span className="text-sm 2xl:text-lg font-medium opacity-80 ml-1">(mm)</span>
            </div>

            {/* Sub-sub headings Row */}
            <div className="grid grid-cols-2 gap-1 2xl:gap-2 text-center">
                <div className="flex flex-col justify-center">
                    <span className="text-md 2xl:text-xl font-semibold opacity-90">HR</span>
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-md 2xl:text-xl font-semibold opacity-90">Total</span>
                </div>
            </div>

            {/* Values Row */}
            <div className="grid grid-cols-2 gap-1 2xl:gap-2 text-center mt-auto flex-1 items-center">
                <div className="text-2xl 2xl:text-4xl font-bold leading-none">{rainfallHR}</div>
                <div className="text-2xl 2xl:text-4xl font-bold leading-none">{rainfallTotal}</div>
            </div>
        </div>
    );
}
