import React, { useState, useEffect } from 'react'
import LocationPickerModal from './LocationPickerModal'
import LocationPin from '../common/LocationPin'
import './LocationSelectorInline.css'

interface Location {
  lat: number
  lng: number
  city?: string
  state?: string
}

interface LocationSelectorInlineProps {
  onLocationChange: (location: Location | null, radius: number) => void
  hideRadius?: boolean
}

const DEFAULT_RADIUS = 20

const LocationSelectorInline: React.FC<LocationSelectorInlineProps> = ({ onLocationChange, hideRadius = false }) => {
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
        const rad = savedRadius ? Math.max(10, parseInt(savedRadius)) : DEFAULT_RADIUS
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
      locationText = 'Select Location'
    }
    return locationText
  }

  return (
    <>
      <button 
        type="button"
        className="location-selector-inline"
        onClick={() => setIsModalOpen(true)}
        aria-label="Set search location"
      >
        <LocationPin className="location-icon" />
        <span className="location-text">
          {getLocationText()}{!hideRadius && location && ` • ${radius} mile radius`}
        </span>
      </button>

      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocation={location}
        radius={radius}
        onLocationChange={handleLocationChange}
        hideRadius={hideRadius}
      />
    </>
  )
}

export default LocationSelectorInline