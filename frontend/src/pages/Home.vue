<!-- Home page (Map View) to see the map and interact with geofencing features -->
 <template>
  <div class="app-container">
    <!-- Main App (always visible) -->
    <div class="app-wrapper">
      <!-- Map Container Component (Full Screen) -->
      <MapContainer
        :userLocation="userLocation"
        :initialCenter="userLocation"
        :publicPoints="publicPoints"
        :manualLocationActive="manualLocationActive"
        :mapInitialized="mapInitialized"
        :isDarkMode="isDarkMode"
        @map-ready="onMapReady"
        @map-initialized="onMapInitialized"
        @nearby-gaps-updated="onNearbyGapsUpdated"
        @marker-click="handleMarkerClick"
        ref="mapContainerRef"
        class="map"
      />

      <!-- Floating Control Bar (Top Right) -->
      <div class="control-bar-floating">
        <ControlBar
          variant="desktop"
          :isDarkMode="isDarkMode"
          @submit="handleControlBarSubmit"
          @map-toggle="handleMapToggle"
          @info-click="handleInfoClick"
          @settings-click="handleSettingsClick"
          @theme-toggle="toggleTheme"
        />
      </div>

      <div class="nearest-gap-container">
        <NearestGap
          :nearestGap="nearestGap"
          :nearbyGapsCount="nearbyGapsCount"
          :isDarkMode="isDarkMode"
          @retry-geolocation="retryGeolocation"
        />
      </div>

      <!-- Submission Modal -->
      <SubmissionModal
        ref="submissionModalRef"
        :isOpen="showSubmissionModal"
        :initialText="submissionText"
        :isDarkMode="isDarkMode"
        :userLocation="userLocation"
        :publicPoints="publicPoints"
        :nearestGap="nearestGap"
        @cancel="handleSubmissionCancel"
        @submit="handleSubmissionFinish"
      />

      <!-- Marker Popup Modal -->
      <MarkerPopup
        :isOpen="showMarkerPopup"
        :markerData="selectedMarker"
        :isDarkMode="isDarkMode"
        @close="handleMarkerPopupClose"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import axios from 'axios'
import MapContainer from '../components/MapContainer.vue'
import ControlBar from '../components/ControlBar.vue'
import SubmissionModal from '../components/SubmissionModal.vue'
import MarkerPopup from '../components/MarkerPopup.vue'
import NearestGap from '../components/NearestGap.vue'
import '../styles/app-global.css'
import '../styles/markers.css'

export default {
  name: 'Home',
  components: {
    MapContainer,
    ControlBar,
    SubmissionModal,
    MarkerPopup,
    NearestGap
  },
  setup() {
    // ===== STATE =====

    // Map initialization state
    const mapInitialized = ref(false)

    // User location state
    const userLocation = ref(null)
    const manualLocationActive = ref(false)

    // Map display options
    const isDarkMode = ref(true)

    // Data state
    const publicPoints = ref([])
    const nearestGap = ref(null)
    const nearbyGapsCount = ref(0)

    // Submission modal state
    const showSubmissionModal = ref(false)
    const submissionText = ref('')

    // Marker popup state
    const showMarkerPopup = ref(false)
    const selectedMarker = ref(null)

    // Component refs
    const mapContainerRef = ref(null)
    const submissionModalRef = ref(null)

    // ===== MAP CALLBACKS =====

    /**
     * Called when map DOM is fully loaded and ready
     */
    const onMapReady = () => {
      console.log('✅ Map is ready from MapContainer')
    }

    /**
     * Called when MapContainer has initialized all map resources
     */
    const onMapInitialized = () => {
      console.log('✅ MapContainer initialized successfully')
      mapInitialized.value = true
    }

    /**
     * Called when nearby gaps are updated from MapContainer
     */
    const onNearbyGapsUpdated = (data) => {
      console.log('📍 Nearby gaps updated:', data)
      nearestGap.value = data.nearest
      nearbyGapsCount.value = data.nearbyCount
    }

    // ===== CONTROL BAR HANDLERS =====

    /**
     * Handle submit from ControlBar - opens the submission modal
     */
    const handleControlBarSubmit = (text) => {
      console.log('� Opening submission modal with text:', text)
      submissionText.value = text
      showSubmissionModal.value = true
    }

    /**
     * Handle cancel from SubmissionModal
     */
    const handleSubmissionCancel = () => {
      console.log('❌ Submission cancelled')
      showSubmissionModal.value = false
      submissionText.value = ''
    }

    /**
     * Handle finish from SubmissionModal
     */
    const handleSubmissionFinish = async (data) => {
      console.log('✅ Submission finished:', data)
      
      // Modal now sends coordinates (either user location or nearest gap)
      const submissionData = {
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        icon_name: data.icon_name,
        submitted_by: data.submitted_by,
        expiry_date: data.expiry_date
      }

      // Validate we have coordinates
      if (!submissionData.latitude || !submissionData.longitude) {
        console.error('❌ Cannot submit: No coordinates available')
        return
      }

      if (data.usedNearestGap) {
        console.log('📍 Uploading to nearest gap location')
      }

      try {
        const response = await axios.post('/api/public-points', submissionData)
        console.log('✅ Submission sent successfully:', response.data)
        
        // Refresh public points to show the new one
        await fetchPublicPoints()
        
        // Refresh nearby gaps calculation (so the gap polygon updates)
        if (mapContainerRef.value) {
          await mapContainerRef.value.loadNearbyGaps()
        }
      } catch (error) {
        console.error('❌ Submission error:', error)
      }
      
      showSubmissionModal.value = false
      submissionText.value = ''
    }

    // ===== MARKER POPUP HANDLERS =====

    /**
     * Handle marker click from MapContainer - opens the marker popup
     */
    const handleMarkerClick = (markerData) => {
      console.log('📍 Marker clicked, opening popup:', markerData.description)
      selectedMarker.value = markerData
      showMarkerPopup.value = true
    }

    /**
     * Handle close from MarkerPopup
     */
    const handleMarkerPopupClose = () => {
      console.log('❌ Marker popup closed')
      showMarkerPopup.value = false
      selectedMarker.value = null
    }

    /**
     * Handle map layer toggle from ControlBar
     */
    const handleMapToggle = () => {
      console.log('🗺️ Map toggle clicked')
      // Could open a panel to toggle buffers, gaps, etc.
    }

    /**
     * Handle info button click from ControlBar
     */
    const handleInfoClick = () => {
      console.log('ℹ️ Info clicked')
      // Could show information modal or panel
    }

    /**
     * Handle settings button click from ControlBar
     */
    const handleSettingsClick = () => {
      console.log('⚙️ Settings clicked')
      // Could open settings panel/modal
    }

    /**
     * Toggle theme between dark and light mode
     */
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      console.log('🎨 Theme toggled to:', isDarkMode.value ? 'dark' : 'light')
      // Apply theme changes to app
    }

    // ===== GEOLOCATION =====

    /**
     * Request geolocation from browser (native prompt)
     */
    const requestGeolocation = () => {
      if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not supported by this browser')
        return
      }

      console.log('📍 Requesting geolocation...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation received:', position.coords)
          userLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          // Update map marker if map is ready
          if (mapContainerRef.value && mapInitialized.value) {
            mapContainerRef.value.updateUserLocationMarker()
          }
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 5000
        }
      )
    }

    const retryGeolocation = () => {
      console.log('🔄 Retrying geolocation request...')
      requestGeolocation()
    }

    // ===== DATA FETCHING =====

    /**
     * Fetch public points from the backend
     */
    const fetchPublicPoints = async () => {
      try {
        console.log('📡 Fetching public points...')
        const response = await axios.get('/api/public-points')
        // API returns { success, count, data } - extract the data array
        publicPoints.value = response.data.data || []
        console.log('✅ Public points loaded:', publicPoints.value.length)
      } catch (error) {
        console.error('❌ Failed to fetch public points:', error)
      }
    }

    // ===== LIFECYCLE =====

    // Update CSS vars for viewport handling on mobile (safe area and vh)
    const updateSafeAreaBottom = () => {
      try {
        const windowHeight = window.innerHeight
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight

        const safeAreaBottom = Math.max(0, windowHeight - viewportHeight)
        document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaBottom}px`)

        const vh = viewportHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      } catch (e) {
        // ignore in non-browser environments
      }
    }

    onMounted(async () => {
      console.log('⏳ App mounted, requesting geolocation...')
      // Request geolocation automatically - browser will show native prompt
      requestGeolocation()
      console.log('Request geolocation fired. Waiting for user response...')

      // Fetch public points from backend
      await fetchPublicPoints()

      // Initial call and listeners for viewport changes (handles iOS show/hide UI)
      updateSafeAreaBottom()
      if (window.visualViewport) window.visualViewport.addEventListener('resize', updateSafeAreaBottom)
      window.addEventListener('resize', updateSafeAreaBottom)
      window.addEventListener('orientationchange', updateSafeAreaBottom)
    })

    onUnmounted(() => {
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', updateSafeAreaBottom)
      window.removeEventListener('resize', updateSafeAreaBottom)
      window.removeEventListener('orientationchange', updateSafeAreaBottom)
    })

    // ===== WATCHERS =====

    // watch for update from navigator and retry after delay
    watch(userLocation, async (newLocation) => {
      if (newLocation) {
        console.log('📍 User location updated:', newLocation)
        // Notify MapContainer of new location
        if (mapContainerRef.value && mapInitialized.value) {
          await nextTick()
          mapContainerRef.value.updateUserLocationMarker()
        }
      }
    })

    // ===== EXPOSE =====

    return {
      // State
      mapInitialized,
      userLocation,
      manualLocationActive,
      publicPoints,
      nearestGap,
      nearbyGapsCount,
      isDarkMode,
      showSubmissionModal,
      submissionText,
      showMarkerPopup,
      selectedMarker,

      // Methods
      requestGeolocation,
      retryGeolocation,
      onMapReady,
      onMapInitialized,
      onNearbyGapsUpdated,
      handleControlBarSubmit,
      handleSubmissionCancel,
      handleSubmissionFinish,
      handleMarkerClick,
      handleMarkerPopupClose,
      handleMapToggle,
      handleInfoClick,
      handleSettingsClick,
      toggleTheme,

      // Refs
      mapContainerRef,
      submissionModalRef
    }
  }
}
</script>