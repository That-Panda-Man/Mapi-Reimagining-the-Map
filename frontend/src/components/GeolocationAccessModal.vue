<template>
  <div class="geolocation-modal-overlay">
    <div class="geolocation-modal">
      <div class="modal-header">
        <h2>📍 Location Services</h2>
      </div>

      <div class="modal-body">
        <div class="info-section">
          <h3>Why We Need Your Location</h3>
          <ul>
            <li>
              <span class="icon">🗺️</span>
              <span>Display your location on the map in real-time</span>
            </li>
            <li>
              <span class="icon">📌</span>
              <span>Find available gaps and areas near you</span>
            </li>
            <li>
              <span class="icon">✓</span>
              <span>Validate your geofencing submissions</span>
            </li>
          </ul>
        </div>

        <div class="privacy-notice">
          <p>
            <strong>🔒 Your Privacy:</strong> Your location data is used only for visualization. 
            It is <strong>not stored</strong> on our servers. You can disable location access at any time.
          </p>
        </div>

        <div class="browser-permissions">
          <p><strong>Browser Permissions:</strong></p>
          <p class="permission-text">
            Your browser will request location permission. 
            Choose "Allow" to share your location with this app.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="decline" class="btn-decline">
          ❌ Not Now
        </button>
        <button @click="accept" class="btn-accept">
          ✓ Enable Location
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'GeolocationAccessModal',
  emits: ['geolocation-accepted', 'geolocation-declined'],
  setup(props, { emit }) {
    const errorMessage = ref(null)

    const checkGeolocationSupport = () => {
      if (!navigator.geolocation) {
        errorMessage.value = 'Geolocation is not supported by your browser'
        return false
      }
      return true
    }

    const accept = () => {
      if (!checkGeolocationSupport()) {
        return
      }

      errorMessage.value = null
      console.log('📍 Requesting geolocation permission...')

      // Request geolocation permission
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - user granted permission and location was obtained
          const { latitude, longitude, accuracy } = position.coords
          console.log('✅ Geolocation accepted:', { latitude, longitude, accuracy })
          
          emit('geolocation-accepted', {
            latitude,
            longitude,
            accuracy
          })
        },
        (error) => {
          // Error - user denied or error occurred
          let message = 'Unable to get your location'
          
          if (error.code === 1) {
            message = 'Location permission denied. Please enable location access in your browser settings and try again.'
            console.log('❌ User denied geolocation permission')
            // Emit declined event so app can initialize without geolocation
            emit('geolocation-declined')
            return
          } else if (error.code === 2) {
            message = 'Location unavailable. Ensure GPS/location services are enabled. If indoors, try near a window or enable WiFi location.'
          } else if (error.code === 3) {
            message = 'Location request timed out. Please try again or use manual location entry.'
          } else if (error.message && error.message.includes('kCLErrorLocationUnknown')) {
            message = 'Location is being determined. Please try again in a moment, or use manual location entry.'
            console.log('⏳ CoreLocation acquiring signal...')
          }
          
          console.error('❌ Geolocation error:', { code: error.code, message: error.message })
          errorMessage.value = message
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,      // Increased from 30s to 60s for CoreLocation to acquire signal
          maximumAge: 0        // Always get fresh location
        }
      )
    }

    const decline = () => {
      console.log('📍 User declined geolocation access')
      emit('geolocation-declined')
    }

    return {
      accept,
      decline,
      errorMessage
    }
  }
}
</script>

<style scoped>
.geolocation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.geolocation-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-section li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: #555;
}

.info-section .icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1.4;
}

.privacy-notice {
  background: #f0f8ff;
  border-left: 4px solid #667eea;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #333;
  line-height: 1.6;
}

.privacy-notice p {
  margin: 0;
}

.privacy-notice strong {
  color: #667eea;
}

.browser-permissions {
  background: #fff3cd;
  border-left: 4px solid #ff9800;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}

.browser-permissions p {
  margin: 0 0 8px 0;
  font-weight: 600;
}

.browser-permissions p:last-child {
  margin-bottom: 0;
}

.permission-text {
  font-weight: 400 !important;
  margin-top: 4px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-decline,
.btn-accept {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-decline {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-decline:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

.btn-decline:active {
  transform: scale(0.98);
}

.btn-accept {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-accept:active {
  transform: translateY(0);
}

.error-message {
  padding: 12px 24px 16px 24px;
  background: #f8d7da;
  color: #721c24;
  border-top: 1px solid #e0e0e0;
  border-bottom: 12px solid #f8d7da;
  border-radius: 0 0 12px 12px;
  font-size: 13px;
  line-height: 1.5;
}

/* Scrollbar styling */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
