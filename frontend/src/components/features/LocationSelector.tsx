import React, { useState, useEffect } from 'react'
import LocationPickerModal from './LocationPickerModal'
import './LocationSelector.css'

interface Location {
  lat: number
  lng: number
  city?: string
  state?: string
}

interface LocationSelectorProps {
  onLocationChange: (location: Location | null, radius: number) => void
}

const DEFAULT_RADIUS = 20

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [radius, setRadius] = useState(DEFAULT_RADIUS)


  useEffect(() => {
    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('gild_location')
    const savedRadius = localStorage.getItem('gild_radius')
    
    if (savedLocation) {
      try {
        const loc = JSON.parse(savedLocation)
        setLocation(loc)
        const rad = savedRadius ? parseInt(savedRadius) : DEFAULT_RADIUS
        setRadius(rad)
        onLocationChange(loc, rad)
      } catch (e) {
        console.error('Error parsing saved location:', e)
      }
    }
  }, [])

  const handleLocationChange = (newLocation: Location, newRadius: number) => {
    setLocation(newLocation)
    setRadius(newRadius)
    onLocationChange(newLocation, newRadius)
  }

  const getLocationText = () => {
    if (!location) return 'Set Location'
    let locationText = ''
    if (location.city) {
      locationText = location.city
    } else {
      locationText = 'Current Location'
    }
    return `${locationText} • ${radius}`
  }

  return (
    <>
      <div className="location-selector-inline">
        <button 
          type="button"
          className="location-icon-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Set search location"
        >
          <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </button>
        <button 
          type="button"
          className="location-text-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Set search location"
        >
          {getLocationText()} mile radius
        </button>
      </div>

      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocation={location}
        radius={radius}
        onLocationChange={handleLocationChange}
      />
    </>
  )
}

export default LocationSelector