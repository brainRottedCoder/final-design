interface SkeletonCardProps {
    type?: 'discharge' | 'weather' | 'rain-gauge';
}

export default function SkeletonCard({ type = 'discharge' }: SkeletonCardProps) {
    const baseClasses = "rounded-2xl 2xl:rounded-3xl px-3 2xl:px-4 py-2 2xl:py-3 h-full flex flex-col overflow-hidden animate-pulse";

    return (
        <div
            className={baseClasses}
            style={{ background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)' }}
        >
            {/* Title skeleton */}
            <div className="h-5 2xl:h-6 w-2/3 bg-gray-300 rounded mb-2 2xl:mb-3" />

            {type === 'discharge' && (
                <>
                    {/* Labels row */}
                    <div className="grid grid-cols-3 gap-1 2xl:gap-2 mb-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-3 2xl:h-4 bg-gray-300 rounded" />
                        ))}
                    </div>
                    {/* Values row */}
                    <div className="grid grid-cols-3 gap-1 2xl:gap-2 mt-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 2xl:h-10 bg-gray-300 rounded" />
                        ))}
                    </div>
                </>
            )}

            {type === 'weather' && (
                <>
                    {/* 3x3 grid of weather metrics */}
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="h-2 2xl:h-3 bg-gray-300 rounded w-2/3" />
                                <div className="h-4 2xl:h-5 bg-gray-300 rounded" />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {type === 'rain-gauge' && (
                <>
                    {/* Labels row */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="h-3 2xl:h-4 w-16 bg-gray-300 rounded" />
                                <div className="h-2 w-8 bg-gray-300 rounded" />
                            </div>
                        ))}
                    </div>
                    {/* Values row */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-8 2xl:h-10 bg-gray-300 rounded" />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
