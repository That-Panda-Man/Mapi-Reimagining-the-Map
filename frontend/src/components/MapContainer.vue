<template>
    <div class="map-wrapper">
        <!-- Map -->
        <div class="map-container">
        <div ref="mapElement" class="map"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import * as turf from '@turf/turf'

// Import marker SVGs (light and dark themes)
import Architecture_light from '../assets/markers/light/Architecture_light.svg'
import ArtsDesign_light from '../assets/markers/light/ArtsDesign_light.svg'
import Drink_light from '../assets/markers/light/Drink_light.svg'
import Food_light from '../assets/markers/light/Food_light.svg'
import GreenSpace_light from '../assets/markers/light/GreenSpace_light.svg'
import MuseumGallery_light from '../assets/markers/light/MuseumGallery_light.svg'
import People_light from '../assets/markers/light/People_light.svg'
import Play_light from '../assets/markers/light/Play_light.svg'
import Shopping_light from '../assets/markers/light/Shopping_light.svg'
import Transport_light from '../assets/markers/light/Transport_light.svg'

import Architecture_dark from '../assets/markers/dark/Architecture_dark.svg'
import ArtsDesign_dark from '../assets/markers/dark/ArtsDesign_dark.svg'
import Drink_dark from '../assets/markers/dark/Drink_dark.svg'
import Food_dark from '../assets/markers/dark/Food_dark.svg'
import GreenSpace_dark from '../assets/markers/dark/GreenSpace_dark.svg'
import MuseumGallery_dark from '../assets/markers/dark/MuseumGallery_dark.svg'
import People_dark from '../assets/markers/dark/People_dark.svg'
import Play_dark from '../assets/markers/dark/Play_dark.svg'
import Shopping_dark from '../assets/markers/dark/Shopping_dark.svg'
import Transport_dark from '../assets/markers/dark/Transport_dark.svg'

// Props
const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  },
  initialCenter: {
    type: Object,
    default: null  // { longitude, latitude }
  },
  publicPoints: {
    type: Array,
    default: () => []
  },
  threshold: {
    type: Number,
    default: 10
  },
  showBuffers: {
    type: Boolean,
    default: true
  },
  showGaps: {
    type: Boolean,
    default: true
  },
  manualLocationActive: {
    type: Boolean,
    default: false
  },
  mapInitialized: {
    type: Boolean,
    default: false
  },
  isDarkMode: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'map-initialized',
  'user-location-updated',
  'nearby-gaps-updated',
  'map-ready',
  'marker-click'
])

// Refs
const mapElement = ref(null)
const mapReady = ref(false)  // Track map readiness internally
let map = null
let markers = {
  points: [],
  gaps: [],
  nearbyGaps: [],
  nearbyGapsPolygon: null,
  userLocation: null,
  userPoints: [],
  buffers: []
}
let geolocationWatchId = null

// Marker SVG mapping by icon_name and theme
const markerSVGs = {
  'Architecture': {
    light: Architecture_light,
    dark: Architecture_dark
  },
  'ArtsDesign': {
    light: ArtsDesign_light,
    dark: ArtsDesign_dark
  },
  'Drink': {
    light: Drink_light,
    dark: Drink_dark
  },
  'Food': {
    light: Food_light,
    dark: Food_dark
  },
  'GreenSpace': {
    light: GreenSpace_light,
    dark: GreenSpace_dark
  },
  'MuseumGallery': {
    light: MuseumGallery_light,
    dark: MuseumGallery_dark
  },
  'People': {
    light: People_light,
    dark: People_dark
  },
  'Play': {
    light: Play_light,
    dark: Play_dark
  },
  'Shopping': {
    light: Shopping_light,
    dark: Shopping_dark
  },
  'Transport': {
    light: Transport_light,
    dark: Transport_dark
  }
}

const mapboxStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11'
}

// Helper function to calculate distance between two points (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000 // Earth's radius in meters
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // distance in meters
}

// Get marker SVG by icon_name and theme
const getMarkerSVG = (iconName, isDarkMode) => {
  const theme = isDarkMode.value ? 'dark' : 'light'
  
  if (markerSVGs[iconName] && markerSVGs[iconName][theme]) {
    return markerSVGs[iconName][theme]
  }
  
  // Return Architecture (default) if icon_name not found
//   console.warn(`⚠️ Icon "${iconName}" not found, using default marker`)
  return markerSVGs['Architecture'][theme]
}

// Format date helper
const formatDate = (isoDateString) => {
  if (!isoDateString) return 'N/A'
  const date = new Date(isoDateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Initialize map
const initMap = async () => {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (!accessToken) {
    console.error('❌ Mapbox API token not found in environment variables')
    return
  }
  
  // Default center (London)
  const defaultCenter = [-0.0858, 51.5052]
  
  // Use initial center from props if available and valid, otherwise default
  let center = defaultCenter
  if (props.initialCenter && 
      typeof props.initialCenter.longitude === 'number' && 
      typeof props.initialCenter.latitude === 'number' &&
      !isNaN(props.initialCenter.longitude) &&
      !isNaN(props.initialCenter.latitude)) {
    center = [props.initialCenter.longitude, props.initialCenter.latitude]
  }
  
  console.log('🗺️ Initializing map at center:', center)
  
  try {
    mapboxgl.accessToken = accessToken

    const currentStyle = props.isDarkMode ? mapboxStyles.dark : mapboxStyles.light
    
    map = new mapboxgl.Map({
      container: mapElement.value,
      style: currentStyle,
      center: center,
      zoom: 15
    })
    
    // Mapbox v3 compatible: Use once() for one-time event or addInteraction() for continuous
    return new Promise((resolve, reject) => {
      map.once('load', () => {
        console.log('✅ Mapbox map loaded successfully')
        // Initialize layers after map loads
        initializeLayers()
        // Set internal flag that map is ready BEFORE emitting
        mapReady.value = true
        emit('map-ready')
        resolve()
      })
      
      map.once('error', (e) => {
        console.error('❌ Mapbox map error:', e)
        reject(e)
      })
    })
  } catch (error) {
    console.error('❌ Failed to initialize Mapbox map:', error)
    throw error
  }
}

// Initialize map layers
const initializeLayers = () => {
  // Add sources and layers for polygons, markers, etc.
  if (!map.getSource('gap-polygon-source')) {
    map.addSource('gap-polygon-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] }
      }
    })

    map.addLayer({
      id: 'gap-polygon-fill',
      type: 'fill',
      source: 'gap-polygon-source',
      paint: {
        'fill-color': '#8C94A6',
        'fill-opacity': 0.25
      }
    })

    map.addLayer({
      id: 'gap-polygon-outline',
      type: 'line',
      source: 'gap-polygon-source',
      paint: {
        'line-color': '#E7E7E7',
        'line-opacity': 0.8,
        'line-width': 3,
        'line-dasharray': [5, 3]
      }
    })
  }

  if (!map.getSource('buffer-zones-source')) {
    map.addSource('buffer-zones-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    map.addLayer({
      id: 'buffer-zones-fill',
      type: 'fill',
      source: 'buffer-zones-source',
      paint: {
        'fill-color': '#9966ff',
        'fill-opacity': 0.1
      }
    })

    map.addLayer({
      id: 'buffer-zones-outline',
      type: 'line',
      source: 'buffer-zones-source',
      paint: {
        'line-color': '#9966ff',
        'line-width': 2,
        'line-dasharray': [3, 2]
      }
    })
  }
}

// Load and display user points using custom pins
const loadUserPoints = async () => {
  console.log('🔄 Loading public points...')
  console.log('Map status:', { mapExists: !!map, mapReady: mapReady.value })
  
  if (!map) {
    console.log('❌ Map object is null')
    return
  }
  
  // Use internal mapReady flag that gets set when map finishes loading
  if (!mapReady.value) {
    console.log('⏳ Map not initialized yet')
    return
  }
  
  console.log('✅ Map is ready')

  try {
    console.log('📡 Fetching from /api/public-points...')
    const response = await axios.get('/api/public-points')
    console.log('📦 Response received:', response.data)
    
    const publicPointsData = response.data.data || []
    console.log(`✅ Loaded ${publicPointsData.length} public points`)

    // Remove old markers if they exist
    markers.userPoints.forEach(marker => marker.remove && marker.remove())
    markers.userPoints = []

    console.log(`📍 Creating ${publicPointsData.length} custom marker pins`)

    // Create custom markers for each public point
    publicPointsData.forEach((point, index) => {
      // Create a container div for the marker
      const markerContainer = document.createElement('div')
      markerContainer.id = `marker-${point.id}`
      markerContainer.className = 'custom-marker-container'
      markerContainer.setAttribute('data-icon', point.icon_name || 'Architecture')

      // Get the appropriate SVG for this marker's icon_name
      const markerSVGPath = getMarkerSVG(point.icon_name || 'Architecture', false)

      // Create the marker HTML with popup content using the imported SVG
      const markerWrapper = document.createElement('div')
      markerWrapper.className = 'marker-pin-wrapper'
      markerWrapper.setAttribute('title', point.description || 'Location')
      markerWrapper.innerHTML = `
        <img src="${markerSVGPath}" alt="${point.icon_name}" class="marker-pin-svg" />
      `
      markerContainer.appendChild(markerWrapper)

      // Add click event to emit marker data to parent
      markerContainer.addEventListener('click', () => {
        console.log('📍 Marker clicked:', point.description)
        emit('marker-click', point)
      })

      // Create Mapbox marker
      const marker = new mapboxgl.Marker(markerContainer, {
        anchor: 'bottom'
        })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map)

      // Store marker reference for cleanup
      markers.userPoints.push(marker)

    //   console.log(`✅ Created marker ${index + 1}/${publicPointsData.length}: ${point.description}`)
    })

    console.log(`✅ All ${publicPointsData.length} custom marker pins created and added to map`)

  } catch (error) {
    console.error('❌ Failed to load public points:', error)
  }
}

// Load nearby gaps with Turf polygon styling
const loadNearbyGaps = async () => {
  if (!props.userLocation) return

  console.log('📍 Loading nearby gaps for location:', props.userLocation, 'threshold:', props.threshold)

  try {
    const response = await axios.post('/api/nearby-gaps', {
      latitude: props.userLocation.latitude,
      longitude: props.userLocation.longitude,
      radius: 50,
      threshold: props.threshold,
      gridResolution: 10
    })

    const nearby = response.data.nearby || []

    console.log('📊 API response:', { totalNearby: nearby.length, nearest: response.data.nearest })

    // Clear old nearby gap markers and polygon
    markers.nearbyGaps.forEach(marker => marker.remove && marker.remove())
    markers.nearbyGaps = []

    if (markers.nearbyGapsPolygon) {
      markers.nearbyGapsPolygon = null
      // Update Mapbox source with empty data
      if (map.getSource('gap-polygon-source')) {
        map.getSource('gap-polygon-source').setData({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [] }
        })
      }
    }

    if (nearby.length >= 3) {
      // Create GeoJSON points for Turf
      const geoJsonPoints = turf.featureCollection(
        nearby.map(gap => turf.point([gap.longitude, gap.latitude]))
      )

      console.log('Creating organic gap polygons using buffer+union approach from', nearby.length, 'points')

      try {
        // Step 1: Create individual buffer circles around each gap point
        const buffers = nearby.map(gap => {
          const point = turf.point([gap.longitude, gap.latitude])
          return turf.buffer(point, 0.01, { units: 'kilometers' })
        })

        console.log(`📍 Created ${buffers.length} buffer circles`)

        // Step 2: Union all buffers together to create organic blob shapes
        let gapPolygon = buffers[0]
        for (let i = 1; i < buffers.length; i++) {
          try {
            gapPolygon = turf.union(gapPolygon, buffers[i])
          } catch (unionError) {
            console.warn(`⚠️ Error unioning buffer ${i}:`, unionError.message)
          }
        }

        if (gapPolygon && gapPolygon.geometry) {
          console.log('✓ Unioned gap polygon created - respects natural clusters')

          // Step 3: Collect all public points to subtract from gaps
          const otherUserPoints = []
          let userPointsCount = 0
          
          for (const point of props.publicPoints) {
            otherUserPoints.push(turf.point([point.longitude, point.latitude]))
            userPointsCount++
          }

          console.log(`🔍 Found ${userPointsCount} public points to subtract`)

          let finalPolygon = gapPolygon
          let subtractionCount = 0

          // Step 4: Cut out each user point location from the gap polygon
          for (const userPoint of otherUserPoints) {
            try {
              // Create buffer circle around user point (100m = 0.1 km)
              const pointBuffer = turf.buffer(userPoint, 0.01, { units: 'kilometers' })

              if (pointBuffer && pointBuffer.geometry && finalPolygon && finalPolygon.geometry) {
                finalPolygon = turf.difference(finalPolygon, pointBuffer)
                subtractionCount++
                
                if (!finalPolygon) {
                  console.warn('⚠️ Polygon removed by user point - using original')
                  finalPolygon = gapPolygon
                  break
                }
              }
            } catch (diffError) {
              console.warn('⚠️ Error differencing user point:', diffError.message)
              // Continue with other points even if one fails
            }
          }

          console.log(`✓ Subtracted ${subtractionCount} user points from gap polygon`)

          if (finalPolygon && finalPolygon.geometry) {
            console.log('✓ Final polygon after subtracting user points:', finalPolygon.geometry.type)
            markers.nearbyGapsPolygon = finalPolygon
            // Update Mapbox source with final polygon
            if (map.getSource('gap-polygon-source')) {
              map.getSource('gap-polygon-source').setData(finalPolygon)
            }
            console.log('✓ Organic gap polygon with user point cutouts added to map')
          } else {
            console.warn('Final polygon is null, showing original gap polygon')
            // Fallback to original unioned polygon
            markers.nearbyGapsPolygon = gapPolygon
            if (map.getSource('gap-polygon-source')) {
              map.getSource('gap-polygon-source').setData(gapPolygon)
            }
          }
        } else {
          console.error('❌ Failed to create gap polygon from buffers')
        }
      } catch (turfError) {
        console.error('Error creating gap polygon:', turfError)
      }
    }

    console.log('✓ Loaded', nearby.length, 'gap markers + polygon (if applicable)')
    
    emit('nearby-gaps-updated', {
      nearby: nearby,
      nearest: response.data.nearest,
      nearbyCount: response.data.nearbyCount
    })
  } catch (error) {
    console.error('❌ Failed to load nearby gaps:', error)
  }
}

// Update user location marker on map
const updateUserLocationMarker = async () => {
  if (!map || !props.userLocation) return

  // Remove old marker if exists
  if (markers.userLocation) {
    markers.userLocation.remove()
  }

  // Create styled user location marker
  const el = document.createElement('div')
  el.className = 'user-location-marker'
  el.innerHTML = `
    <div class="user-location-pulse"></div>
    <div class="user-location-dot"></div>
  `

  markers.userLocation = new mapboxgl.Marker(el)
    .setLngLat([props.userLocation.longitude, props.userLocation.latitude])
    .addTo(map)

  // Center map on user
  map.flyTo({ center: [props.userLocation.longitude, props.userLocation.latitude], zoom: 17 })

  // Load nearby gaps
  try {
    await loadNearbyGaps()
  } catch (gapError) {
    console.error('❌ Error loading nearby gaps:', gapError)
  }
}

// Update manual location marker on map
const updateManualLocationMarker = async () => {
  if (!map || !props.userLocation) return

  // Remove old marker if exists
  if (markers.userLocation) {
    markers.userLocation.remove()
  }

  const el = document.createElement('div')
  el.innerHTML = '📌'
  el.style.fontSize = '28px'
  el.style.cursor = 'pointer'
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'
  el.style.width = '40px'
  el.style.height = '40px'
  el.style.zIndex = '1000'
  el.className = 'manual-location-marker'

  markers.userLocation = new mapboxgl.Marker(el, { scale: 1.5 })
    .setLngLat([props.userLocation.longitude, props.userLocation.latitude])
    .setPopup(new mapboxgl.Popup().setText('Manual Location'))
    .addTo(map)

  console.log('✅ Manual location marker added:', { lon: props.userLocation.longitude, lat: props.userLocation.latitude })

  // Center map on manual location
  map.flyTo({ center: [props.userLocation.longitude, props.userLocation.latitude], zoom: 17 })

  // Load nearby gaps for manual location
  try {
    await loadNearbyGaps()
    console.log('✓ Manual location loaded and polygon created')
  } catch (error) {
    console.error('❌ Error loading gaps for manual location:', error)
  }
}

// Clear user location marker
const clearUserLocationMarker = () => {
  if (markers.userLocation) {
    markers.userLocation.remove()
    markers.userLocation = null
  }

  // Remove nearby gap markers
  markers.nearbyGaps.forEach(marker => marker.remove && marker.remove())
  markers.nearbyGaps = []

  // Clear polygon from map
  if (markers.nearbyGapsPolygon) {
    markers.nearbyGapsPolygon = null
    if (map && map.getSource('gap-polygon-source')) {
      map.getSource('gap-polygon-source').setData({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] }
      })
    }
  }
}

// Watch threshold changes
watch(() => props.threshold, () => {
  if (props.userLocation) {
    loadNearbyGaps()
  }
})

// Watch buffer zone display toggle
watch(() => props.showBuffers, (value) => {
  if (map && map.getLayer('gap-polygon-fill')) {
    map.setLayoutProperty('gap-polygon-fill', 'visibility', value ? 'visible' : 'none')
    map.setLayoutProperty('gap-polygon-outline', 'visibility', value ? 'visible' : 'none')
  }
})

// Watch user location changes
watch(() => props.userLocation, (newLocation) => {
  if (newLocation) {
    if (props.manualLocationActive) {
      updateManualLocationMarker()
    } else {
      updateUserLocationMarker()
    }
  } else {
    clearUserLocationMarker()
  }
}, { deep: true })

// Watch public points changes and reload markers
watch(() => props.publicPoints, () => {
  if (map && props.mapInitialized) {
    loadUserPoints()
    // Also refresh nearby gaps since points have changed
    if (props.userLocation) {
      loadNearbyGaps()
    }
  }
}, { deep: true })

// Watch dark mode changes and update map style
watch(() => props.isDarkMode, (isDark) => {
  console.log('🎨 isDarkMode changed to:', isDark)
  if (map) {
    const newStyle = isDark ? mapboxStyles.dark : mapboxStyles.light
    console.log('🗺️ Changing map style to:', newStyle)
    map.setStyle(newStyle)
    
    // Re-initialize layers after style change (style.load event)
    map.once('style.load', () => {
      console.log('✅ New map style loaded, re-initializing layers...')
      initializeLayers()
      if (props.publicPoints.length > 0) {
        loadUserPoints()
      }
      if (props.userLocation) {
        updateUserLocationMarker()
      }
    })
  } else {
    console.warn('⚠️ Map not available for style change')
  }
})

// Initialize on mount
onMounted(async () => {
  console.log('⏳ MapContainer mounted, initializing map...')
  
  // Wait for mapElement to be ready
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Check if mapElement is available
  if (!mapElement.value) {
    console.error('❌ Map element not found in DOM')
    return
  }
  
  console.log('✅ Map element found:', mapElement.value)
  
  try {
    // Initialize map and WAIT for it to fully load
    await initMap()
    
    // Map is now ready (mapReady.value is true after map.once('load'))
    // Emit the initialization event
    emit('map-initialized')
    
    // Small delay before loading data
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Load initial data
    await loadUserPoints()
    
    // If user location is already available, show the marker
    if (props.userLocation) {
      console.log('📍 Initial user location available, creating marker...')
      await updateUserLocationMarker()
    }
  } catch (error) {
    console.error('❌ Error during map initialization:', error)
  }
})

// Expose methods to parent
defineExpose({
  map: () => map,
  loadUserPoints,
  loadNearbyGaps,
  clearUserLocationMarker,
  updateUserLocationMarker,
  updateManualLocationMarker
})
</script>

<style scoped>
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>
