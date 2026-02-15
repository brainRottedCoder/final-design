import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoLoopOptions {
    inactivityTimeout?: number; // Time before loop starts (ms)
    tabDuration?: number; // Duration for each tab (ms)
    minScreenWidth?: number; // Minimum screen width to enable auto-loop (px)
    tabs: string[];
    onTabChange: (tab: string) => void;
    currentTab: string;
}

interface UseAutoLoopReturn {
    isLooping: boolean;
    isLargeScreen: boolean;
    currentLoopIndex: number;
    timeUntilLoop: number;
    resetInactivityTimer: () => void;
}

export function useAutoLoop({
    inactivityTimeout = 30000, // 30 seconds
    tabDuration = 30000, // 30 seconds per tab
    minScreenWidth = 2500, // ~55" screen typically has width > 2500px
    tabs,
    onTabChange,
    currentTab,
}: UseAutoLoopOptions): UseAutoLoopReturn {
    const [isLooping, setIsLooping] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
    const [timeUntilLoop, setTimeUntilLoop] = useState(inactivityTimeout);

    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Check screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= minScreenWidth);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, [minScreenWidth]);

    // Reset inactivity timer
    const resetInactivityTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setTimeUntilLoop(inactivityTimeout);

        // Stop looping if currently looping
        if (isLooping) {
            setIsLooping(false);
            if (loopTimerRef.current) {
                clearInterval(loopTimerRef.current);
                loopTimerRef.current = null;
            }
        }

        // Clear existing inactivity timer
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Only start inactivity timer on large screens
        if (isLargeScreen) {
            inactivityTimerRef.current = setTimeout(() => {
                setIsLooping(true);
                setCurrentLoopIndex(0);
                // Start with discharge tab when entering loop
                onTabChange(tabs[0]);
            }, inactivityTimeout);
        }
    }, [isLargeScreen, isLooping, inactivityTimeout, tabs, onTabChange]);

    // Track user activity
    useEffect(() => {
        if (!isLargeScreen) return;

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

        const handleActivity = () => {
            resetInactivityTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Start initial inactivity timer
        resetInactivityTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [isLargeScreen, resetInactivityTimer]);

    // Handle loop cycling
    useEffect(() => {
        if (!isLooping) return;

        // Cycle to next tab
        const cycleToNextTab = () => {
            setCurrentLoopIndex(prev => {
                const nextIndex = (prev + 1) % tabs.length;
                onTabChange(tabs[nextIndex]);
                return nextIndex;
            });
        };

        // Set up interval for tab cycling
        loopTimerRef.current = setInterval(cycleToNextTab, tabDuration);

        return () => {
            if (loopTimerRef.current) {
                clearInterval(loopTimerRef.current);
            }
        };
    }, [isLooping, tabs, tabDuration, onTabChange]);

    // Countdown timer display
    useEffect(() => {
        if (!isLargeScreen || isLooping) {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
            return;
        }

        countdownRef.current = setInterval(() => {
            const elapsed = Date.now() - lastActivityRef.current;
            const remaining = Math.max(0, inactivityTimeout - elapsed);
            setTimeUntilLoop(remaining);
        }, 1000);

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [isLargeScreen, isLooping, inactivityTimeout]);

    return {
        isLooping,
        isLargeScreen,
        currentLoopIndex,
        timeUntilLoop,
        resetInactivityTimer,
    };
}
