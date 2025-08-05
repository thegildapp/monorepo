import React, { useState, useEffect, useRef } from 'react'
import LocationPickerModal from './LocationPickerModal'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LocationSelector.css'

interface Location {
  lat: number
  lng: number
  city?: string
  state?: string
}

interface LocationSelectorProps {
  onLocationChange: (location: Location | null, radius: number) => void
  hideRadius?: boolean
}

const DEFAULT_RADIUS = 20

// Simple marker icon for the mini map
const miniMapIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#333333"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, hideRadius = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const miniMapRef = useRef<L.Map | null>(null)

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

  useEffect(() => {
    // Update mini map view when location changes
    if (miniMapRef.current && location) {
      // Use zoom 14 for point selection, 11 for radius selection to show wider area
      const zoom = hideRadius ? 14 : 11
      miniMapRef.current.setView([location.lat, location.lng], zoom)
    }
  }, [location, hideRadius])

  const handleLocationChange = (newLocation: Location, newRadius: number) => {
    setLocation(newLocation)
    setRadius(newRadius)
    onLocationChange(newLocation, newRadius)
  }

  const getLocationText = () => {
    if (!location) return 'Click to set location'
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`
    } else if (location.city) {
      return location.city
    }
    return 'Location selected'
  }

  return (
    <>
      <div 
        className="location-selector-container"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsModalOpen(true)
          }
        }}
        aria-label="Set location"
      >
        {location ? (
          <>
            <div className="location-map-preview">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={hideRadius ? 14 : 11}
                zoomControl={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                boxZoom={false}
                keyboard={false}
                ref={miniMapRef}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution=""
                />
              </MapContainer>
            </div>
            <div className="location-info-bar">
              <svg className="location-bar-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div className="location-info-text">
                <div className="location-name">{getLocationText()}</div>
                {!hideRadius && <div className="location-radius">{radius} mile radius</div>}
              </div>
            </div>
          </>
        ) : (
          <div className="location-empty-state">
            <svg className="location-empty-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="location-empty-text">{getLocationText()}</span>
          </div>
        )}
      </div>

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

export default LocationSelector