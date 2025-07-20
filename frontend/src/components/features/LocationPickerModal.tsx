import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LocationPickerModal.css'

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <path d="M20 35C20 35 30 25 30 18C30 12.4772 25.5228 8 20 8C14.4772 8 10 12.4772 10 18C10 25 20 35 20 35Z" fill="#333333"/>
        <circle cx="20" cy="18" r="4" fill="white"/>
      </g>
      <defs>
        <filter id="filter0_d" x="6" y="6" width="28" height="33" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 35],
  popupAnchor: [0, -35],
  shadowUrl: '',
  shadowSize: [0, 0],
})

interface Location {
  lat: number
  lng: number
  city?: string
  state?: string
}

interface LocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentLocation: Location | null
  radius: number
  onLocationChange: (location: Location, radius: number) => void
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  city?: string
  state?: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

// Component to handle map clicks
function LocationMarker({ position, onLocationChange }: { 
  position: L.LatLng | null, 
  onLocationChange: (lat: number, lng: number) => void 
}) {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
      // Center map on clicked location
      map.setView(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : <Marker position={position} icon={customIcon} />
}


const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  radius,
  onLocationChange
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(currentLocation)
  const [selectedRadius, setSelectedRadius] = useState(radius)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [locationName, setLocationName] = useState('Select location')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastGeocodedRef = useRef<{lat: number, lng: number} | null>(null)

  // Auto-adjust zoom based on radius
  const getZoomForRadius = (radiusMiles: number): number => {
    // Approximate zoom levels for different radius values
    // Adjusted to ensure full radius is visible
    if (radiusMiles <= 1) return 13
    if (radiusMiles <= 3) return 12
    if (radiusMiles <= 5) return 11
    if (radiusMiles <= 10) return 10
    if (radiusMiles <= 20) return 9
    if (radiusMiles <= 30) return 8
    if (radiusMiles <= 50) return 7
    return 7
  }

  useEffect(() => {
    // Load search history
    const saved = localStorage.getItem('gild_location_search_history')
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (selectedLocation && !isGeocoding) {
      // Only geocode if the location has changed
      if (!lastGeocodedRef.current || 
          lastGeocodedRef.current.lat !== selectedLocation.lat || 
          lastGeocodedRef.current.lng !== selectedLocation.lng) {
        lastGeocodedRef.current = { lat: selectedLocation.lat, lng: selectedLocation.lng }
        reverseGeocode(selectedLocation.lat, selectedLocation.lng, false)
      }
    }
  }, [selectedLocation, isGeocoding])

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation)
    }
  }, [currentLocation])

  const reverseGeocode = async (lat: number, lng: number, updateSelectedLocation = true) => {
    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await response.json()
      
      const city = data.address?.city || data.address?.town || data.address?.village || ''
      const state = data.address?.state || ''
      
      const locationStr = city && state ? `${city}, ${state}` : (city || state || 'Selected location')
      setLocationName(locationStr)
      
      if (updateSelectedLocation) {
        setSelectedLocation({
          lat,
          lng,
          city,
          state
        })
      } else {
        // Still need to update city/state in the existing location
        setSelectedLocation(prev => prev ? {
          ...prev,
          city,
          state
        } : null)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      setLocationName('Selected location')
    } finally {
      setIsGeocoding(false)
    }
  }

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&countrycodes=us&featuretype=city,state,county`
      )
      const results = await response.json()
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (value: string) => {
    setSearchText(value)
    setShowSearchResults(true)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value)
    }, 300)
  }

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    setSelectedLocation({
      lat,
      lng,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state
    })
    
    // Center map on selected location with appropriate zoom
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], getZoomForRadius(selectedRadius))
    }
    
    // Add to search history
    const query = searchText.trim()
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 4)]
      setSearchHistory(newHistory)
      localStorage.setItem('gild_location_search_history', JSON.stringify(newHistory))
    }
    
    setSearchText('')
    setShowSearchResults(false)
  }

  const handleCurrentLocation = () => {
    setIsLoadingLocation(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          setSelectedLocation({ lat, lng })
          
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], getZoomForRadius(selectedRadius))
          }
          
          reverseGeocode(lat, lng)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoadingLocation(false)
          alert('Unable to get your location. Please enable location services.')
        }
      )
    } else {
      setIsLoadingLocation(false)
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleDone = () => {
    if (selectedLocation) {
      onLocationChange(selectedLocation, selectedRadius)
      localStorage.setItem('gild_location', JSON.stringify(selectedLocation))
      localStorage.setItem('gild_radius', String(selectedRadius))
    }
    onClose()
  }

  if (!isOpen) return null

  const center: L.LatLngExpression = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [37.7749, -122.4194] // Default to San Francisco

  return (
    <div className="location-picker-modal">
      <div className="location-picker-overlay" onClick={onClose} />
      <div className="location-picker-content">
        <div className="location-picker-header">
          <h2>Select Location</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="location-picker-map-container">
          <MapContainer
            center={center}
            zoom={getZoomForRadius(selectedRadius)}
            className="location-picker-map"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <LocationMarker 
              position={selectedLocation ? L.latLng(selectedLocation.lat, selectedLocation.lng) : null}
              onLocationChange={(lat, lng) => reverseGeocode(lat, lng)}
            />
            {selectedLocation && (
              <Circle
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={selectedRadius * 1609.34} // Convert miles to meters
                pathOptions={{
                  color: '#666666',
                  fillColor: '#666666',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '5, 5'
                }}
              />
            )}
          </MapContainer>

          {/* Search bar */}
          <div className="location-search-container">
            <div className="location-search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  setShowSearchResults(true)
                  if (!searchText) {
                    setSearchResults([])
                  }
                }}
                placeholder={locationName}
                className="location-search-input"
              />
              {searchText && (
                <button
                  onClick={() => {
                    setSearchText('')
                    setShowSearchResults(false)
                  }}
                  className="search-clear-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showSearchResults && (searchResults.length > 0 || searchHistory.length > 0) && (
              <div className="location-search-results">
                {!searchText && searchHistory.length > 0 && (
                  <>
                    <div className="search-section-header">Recent searches</div>
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        className="search-result-item"
                        onClick={() => {
                          setSearchText(query)
                          searchLocations(query)
                        }}
                      >
                        <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>{query}</span>
                      </button>
                    ))}
                  </>
                )}
                
                {searchText && isSearching && (
                  <div className="search-loading">Searching...</div>
                )}
                
                {searchText && !isSearching && searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="search-result-item"
                    onClick={() => selectSearchResult(result)}
                  >
                    <div className="search-result-text">
                      <div className="search-result-name">{result.display_name.split(',')[0]}</div>
                      <div className="search-result-address">
                        {result.display_name.split(',').slice(1).join(',')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current location button */}
          <button
            className="current-location-btn"
            onClick={handleCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <div className="mini-spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="currentColor" fill="none" strokeWidth="2"/>
              </svg>
            )}
          </button>

          {/* Bottom controls */}
          <div className="location-picker-bottom">
            {selectedLocation && (
              <div className="selected-location-info">
                <svg className="location-pin-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="selected-location-text">{locationName}</span>
              </div>
            )}
            
            <div className="location-picker-controls">
              <div className="radius-control">
                <span className="radius-label">{selectedRadius} mile{selectedRadius !== 1 ? 's' : ''}</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={selectedRadius}
                  onChange={(e) => {
                    const newRadius = parseInt(e.target.value)
                    setSelectedRadius(newRadius)
                    
                    // Adjust map zoom to show full radius
                    if (mapRef.current && selectedLocation) {
                      const newZoom = getZoomForRadius(newRadius)
                      mapRef.current.setZoom(newZoom)
                    }
                  }}
                  className="radius-slider"
                />
              </div>
              <button
                className="done-btn"
                onClick={handleDone}
                disabled={!selectedLocation}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPickerModal