'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function OnboardingTour() {
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('protocol-tour-seen')

        if (!hasSeenTour) {
            const driverObj = driver({
                showProgress: true,
                steps: [
                    {
                        element: '#dashboard-header',
                        popover: {
                            title: 'Welcome to Protocol',
                            description: 'Your daily training hub. See today\'s workout here.'
                        }
                    },
                    {
                        element: '#nav-workouts',
                        popover: {
                            title: 'Track Your Progress',
                            description: 'View your workout history and personal records.'
                        }
                    },
                    {
                        element: '#nav-coach',
                        popover: {
                            title: 'AI Coach',
                            description: 'Chat with your personal AI coach for advice and tips.'
                        }
                    },
                ],
                onDestroyStarted: () => {
                    localStorage.setItem('protocol-tour-seen', 'true')
                    driverObj.destroy()
                },
            })

            // Small delay to ensure elements are mounted
            setTimeout(() => {
                driverObj.drive()
            }, 1000)
        }
    }, [])

    return null
}
