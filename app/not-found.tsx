'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ backgroundColor: '#eef2ff' }}
        >
            <div className="text-center px-6">
                {/* 404 Illustration */}
                <div className="mb-8 relative">
                    <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
                        <svg
                            className="w-24 h-24"
                            fill="none"
                            stroke="#7C3AED"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    {/* Floating water droplet decorations */}
                    <div className="absolute -top-2 -left-4 w-8 h-8 rounded-full animate-pulse"
                        style={{ backgroundColor: '#369fff', opacity: 0.3 }}>
                    </div>
                    <div className="absolute top-4 -right-2 w-6 h-6 rounded-full animate-pulse"
                        style={{ backgroundColor: '#8ac53e', opacity: 0.3 }}>
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl font-bold mb-4" style={{ color: '#7C3AED', fontFamily: 'var(--font-marcellus)' }}>
                    404
                </h1>

                {/* Error Message */}
                <h2 className="text-2xl font-semibold mb-3" style={{ color: '#303030' }}>
                    Page Not Found
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Oops! The page you're looking for seems to have drifted away like a drop of water.
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
                        style={{ backgroundColor: '#7C3AED' }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to Dashboard
                    </Link>

                    <Link
                        href="/map"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105 border-2"
                        style={{
                            borderColor: '#369fff',
                            color: '#369fff',
                            backgroundColor: 'rgba(54, 159, 255, 0.05)'
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View Map
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-400 mb-4">Other pages you might want to visit:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { href: '/overview', label: 'Overview' },
                            { href: '/map', label: 'Map' },
                            { href: '/automatic-weather', label: 'Weather Stations' },
                            { href: '/rain-gauge-reports', label: 'Rain Gauge' },
                            { href: '/vyasi-dam', label: 'Dam Data' },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-100"
                                style={{ color: '#64748b' }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}>
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #369fff 0%, transparent 70%)' }}>
                </div>
            </div>
        </div>
    );
}
