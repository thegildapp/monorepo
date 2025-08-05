import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Modal from '../common/Modal'
import { useGooglePlacesAutocomplete } from '../../hooks/useGooglePlacesAutocomplete'
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
  hideRadius?: boolean
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
  onLocationChange,
  hideRadius = false
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(currentLocation)
  const [selectedRadius, setSelectedRadius] = useState(Math.max(10, radius))
  const [searchText, setSearchText] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [recentLocations, setRecentLocations] = useState<Array<{
    id: string;
    lat: number;
    lng: number;
    city?: string;
    state?: string;
    displayName: string;
  }>>([])
  const [locationName, setLocationName] = useState('Select location')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastGeocodedRef = useRef<{lat: number, lng: number} | null>(null)
  
  // Google Places Autocomplete
  const { 
    isLoaded: isGoogleLoaded, 
    predictions, 
    isSearching, 
    searchPlaces, 
    getPlaceDetails,
    clearPredictions 
  } = useGooglePlacesAutocomplete()

  // Auto-adjust zoom based on radius
  const getZoomForRadius = (radiusMiles: number): number => {
    if (hideRadius) {
      // Point selection mode - more zoomed in
      return 15
    } else {
      // Radius selection mode - zoom out to show full radius
      if (radiusMiles <= 10) return 10
      if (radiusMiles <= 20) return 9
      if (radiusMiles <= 30) return 8
      if (radiusMiles <= 50) return 7
      return 7
    }
  }

  useEffect(() => {
    // Load recent locations
    const saved = localStorage.getItem('gild_recent_locations')
    if (saved) {
      try {
        const locations = JSON.parse(saved)
        setRecentLocations(locations.slice(0, 5)) // Keep only 5 most recent
      } catch (e) {
        console.error('Error loading recent locations:', e)
      }
    }
  }, [])


  useEffect(() => {
    if (selectedLocation && !isGeocoding && isGoogleLoaded) {
      // Only geocode if the location has changed
      if (!lastGeocodedRef.current || 
          lastGeocodedRef.current.lat !== selectedLocation.lat || 
          lastGeocodedRef.current.lng !== selectedLocation.lng) {
        lastGeocodedRef.current = { lat: selectedLocation.lat, lng: selectedLocation.lng }
        reverseGeocode(selectedLocation.lat, selectedLocation.lng, false)
      }
    }
  }, [selectedLocation, isGeocoding, isGoogleLoaded])

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation)
    }
  }, [currentLocation])

  useEffect(() => {
    // Update selectedRadius when radius prop changes
    setSelectedRadius(Math.max(10, radius))
  }, [radius])

  const reverseGeocode = async (lat: number, lng: number, updateSelectedLocation = true) => {
    setIsGeocoding(true)
    try {
      // Check if Google Maps is loaded
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not loaded')
      }

      // Use Google's Geocoder for reverse geocoding
      const geocoder = new window.google.maps.Geocoder()
      
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0])
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          }
        )
      })

      // Extract city and state from address components
      let city = ''
      let state = ''
      
      if (result.address_components) {
        for (const component of result.address_components) {
          const types = component.types
          if (types.includes('locality')) {
            city = component.long_name
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name
          }
          // Also check for neighborhood/sublocality if no city found
          if (!city && (types.includes('neighborhood') || types.includes('sublocality'))) {
            city = component.long_name
          }
        }
      }
      
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


  const handleSearchInput = (value: string) => {
    setSearchText(value)
    setShowSearchResults(true)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (!value.trim()) {
      clearPredictions()
      return
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value)
    }, 300)
  }

  const selectSearchResult = async (placeId: string, description: string) => {
    // Get detailed place information
    const placeDetails = await getPlaceDetails(placeId)
    
    if (!placeDetails) {
      console.error('Failed to get place details')
      return
    }
    
    setSelectedLocation({
      lat: placeDetails.lat,
      lng: placeDetails.lng,
      city: placeDetails.city,
      state: placeDetails.state
    })
    
    // Update location name
    const displayName = placeDetails.city && placeDetails.state 
      ? `${placeDetails.city}, ${placeDetails.state}`
      : description
    setLocationName(displayName)
    
    // Center map on selected location with appropriate zoom
    if (mapRef.current) {
      mapRef.current.setView([placeDetails.lat, placeDetails.lng], getZoomForRadius(selectedRadius))
    }
    
    // Add to recent locations
    const newLocation = {
      id: placeId,
      lat: placeDetails.lat,
      lng: placeDetails.lng,
      city: placeDetails.city,
      state: placeDetails.state,
      displayName
    }
    
    // Remove duplicate if exists and add to front
    const filtered = recentLocations.filter(loc => loc.id !== placeId)
    const updated = [newLocation, ...filtered].slice(0, 5)
    setRecentLocations(updated)
    localStorage.setItem('gild_recent_locations', JSON.stringify(updated))
    
    setSearchText('')
    setShowSearchResults(false)
    clearPredictions()
  }

  const selectRecentLocation = (location: typeof recentLocations[0]) => {
    setSelectedLocation({
      lat: location.lat,
      lng: location.lng,
      city: location.city,
      state: location.state
    })
    
    setLocationName(location.displayName)
    
    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], getZoomForRadius(selectedRadius))
    }
    
    setSearchText('')
    setShowSearchResults(false)
  }
  
  const deleteRecentLocation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the select action
    const filtered = recentLocations.filter(loc => loc.id !== id)
    setRecentLocations(filtered)
    localStorage.setItem('gild_recent_locations', JSON.stringify(filtered))
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

  const center: L.LatLngExpression = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [37.7749, -122.4194] // Default to San Francisco

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Location"
      size="large"
      className="location-picker-modal-content"
    >
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
            {selectedLocation && !hideRadius && (
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
                    clearPredictions()
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
            {showSearchResults && (predictions.length > 0 || recentLocations.length > 0) && (
              <div className="location-search-results">
                {!searchText && recentLocations.length > 0 && (
                  <>
                    <div className="search-section-header">Recent</div>
                    {recentLocations.map((location) => (
                      <div
                        key={location.id}
                        className="search-result-item"
                        onClick={() => selectRecentLocation(location)}
                        role="button"
                        tabIndex={0}
                      >
                        <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                        </svg>
                        <span className="search-result-text">{location.displayName}</span>
                        <div
                          className="delete-recent-btn"
                          onClick={(e) => deleteRecentLocation(location.id, e)}
                          role="button"
                          tabIndex={0}
                          aria-label="Delete recent location"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {searchText && isSearching && (
                  <div className="search-loading">Searching...</div>
                )}
                
                {searchText && !isSearching && predictions.map((prediction) => {
                  // Google Places provides structured formatting
                  const placeData = prediction.placePrediction;
                  
                  // Safely access nested properties
                  const mainText = placeData?.structuredFormat?.mainText?.text || 
                                  placeData?.text?.text || 
                                  'Unknown location';
                  
                  const secondaryText = placeData?.structuredFormat?.secondaryText?.text || '';
                  const placeId = placeData?.placeId || '';
                  const fullText = placeData?.text?.text || mainText;
                  
                  if (!placeId) return null; // Skip if no placeId
                  
                  return (
                    <button
                      key={placeId}
                      className="search-result-item"
                      onClick={() => selectSearchResult(placeId, fullText)}
                    >
                      <div className="search-result-text">
                        <div className="search-result-name">{mainText}</div>
                        <div className="search-result-address">{secondaryText}</div>
                      </div>
                    </button>
                  )
                })}
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

          {/* Bottom info bar */}
          <div className="location-picker-bottom">
            {selectedLocation ? (
              <div className="selected-location-info-with-done">
                <div className="selected-location-info">
                  <svg className="location-pin-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="selected-location-text">{locationName}</span>
                </div>
                <button
                  className="done-btn-inline"
                  onClick={handleDone}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="no-location-message">Click on the map to select a location</div>
            )}
            
            {!hideRadius && selectedLocation && (
              <div className="radius-control-standalone">
                <span className="radius-label">{selectedRadius} mile{selectedRadius !== 1 ? 's' : ''}</span>
                <input
                  type="range"
                  min="10"
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
            )}
          </div>
        </div>
    </Modal>
  )
}

export default LocationPickerModal