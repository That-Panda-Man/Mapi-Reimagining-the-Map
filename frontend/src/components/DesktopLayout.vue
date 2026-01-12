<template>
  <div class="desktop-layout">
    <!-- Input Bar and Settings Bar -->
    <div class="top-bar">
      <div class="input-section">
        <div class="upload-input">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Start typing..."
            class="input-field"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @keyup.enter="handleSearch"
          >
          <button class="upload-button" @click="handleFileUpload" title="Upload data">
            <svg class="icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="settings-section">
        <button class="icon-button" @click="showMapLegend = !showMapLegend" title="Map" aria-label="Map legend">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="icon-button" @click="showInfo = !showInfo" title="Info" aria-label="Information">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="icon-button" @click="showSettings = !showSettings" title="Settings" aria-label="Settings">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2v4m0 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4.22 4.22l2.83 2.83m0 8.9L4.22 19.78M19.78 19.78l-2.83-2.83m0-8.9l2.83-2.83" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
        <button class="icon-button" @click="toggleTheme" :title="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`" aria-label="Theme toggle">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.8"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Current Location Indicator -->
    <div v-if="userLocationActive" class="current-location" title="Your current location">
      <svg class="location-pin" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="4" fill="white" stroke="currentColor" stroke-width="1"/>
        <circle cx="8" cy="8" r="2" fill="currentColor"/>
      </svg>
    </div>

    <!-- Info Panel (shown/hidden on click) -->
    <Transition name="slide-in-right">
      <div v-if="showInfo" class="side-panel info-panel">
        <div class="panel-header">
          <h3>Information</h3>
          <button class="close-button" @click="showInfo = false">&times;</button>
        </div>
        <div class="panel-content">
          <p><strong>Memory Mapp</strong></p>
          <p class="small">A geofencing visualization app for mapping public locations and points of interest.</p>
          
          <div class="info-section">
            <h4>Features</h4>
            <ul>
              <li>📍 Real-time geolocation tracking</li>
              <li>🎯 Custom marker categories</li>
              <li>🗺️ Interactive map display</li>
              <li>💾 Upload/export data</li>
            </ul>
          </div>

          <div class="info-section">
            <h4>Markers</h4>
            <p class="small">Click any marker to see details. Use the search bar to filter locations.</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Settings Panel (shown/hidden on click) -->
    <Transition name="slide-in-right">
      <div v-if="showSettings" class="side-panel settings-panel">
        <div class="panel-header">
          <h3>Settings</h3>
          <button class="close-button" @click="showSettings = false">&times;</button>
        </div>
        <div class="panel-content">
          <div class="setting-group">
            <label class="setting-label">
              <input v-model="settings.showLabels" type="checkbox">
              Show marker labels
            </label>
          </div>

          <div class="setting-group">
            <label class="setting-label">
              <input v-model="settings.enablePopups" type="checkbox">
              Enable popups on click
            </label>
          </div>

          <div class="setting-group">
            <label class="setting-label">
              Map Style
            </label>
            <select v-model="settings.mapStyle" class="setting-select">
              <option value="streets">Streets</option>
              <option value="satellite">Satellite</option>
              <option value="outdoors">Outdoors</option>
            </select>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props - receive data from parent App.vue
interface Props {
  userLocation?: { latitude: number; longitude: number } | null
  isDarkMode?: boolean
}

withDefaults(defineProps<Props>(), {
  userLocation: null,
  isDarkMode: false
})

// Emits - pass events back to parent App.vue
const emit = defineEmits<{
  toggleTheme: []
  uploadData: []
  search: [query: string]
}>()

// Local state
const searchQuery = ref('')
const isInputActive = ref(false)
const showInfo = ref(false)
const showSettings = ref(false)
const showMapLegend = ref(false)
const isDarkMode = ref(false)

const userLocationActive = computed(() => !!props.userLocation)

const settings = ref({
  showLabels: true,
  enablePopups: true,
  mapStyle: 'streets'
})

// Methods
const onInputFocus = () => {
  isInputActive.value = true
}

const onInputBlur = () => {
  isInputActive.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
    console.log(`🔍 Searching for: ${searchQuery.value}`)
  }
}

const handleFileUpload = () => {
  console.log('📤 Opening file upload dialog')
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.json,.csv,.geojson'
  fileInput.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      console.log(`📁 File selected: ${file.name}`)
      emit('uploadData')
    }
  })
  fileInput.click()
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  emit('toggleTheme')
  console.log(`🌙 Theme toggled to ${isDarkMode.value ? 'dark' : 'light'}`)
}
</script>

<style scoped lang="css">
.desktop-layout {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  pointer-events: none;
}

/* Top Bar Container */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  gap: 24px;
  pointer-events: auto;
}

/* Input Section */
.input-section {
  flex: 1;
  max-width: 398px;
}

.upload-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #484a55;
  border-radius: 18px;
  padding: 8px;
  height: 64px;
  box-shadow: 
    -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
    0.5px 1px 2px 0px rgba(0, 0, 0, 0.38);
}

.upload-input::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  box-shadow: inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.61);
  pointer-events: none;
  z-index: 1;
}

.input-field {
  position: relative;
  z-index: 2;
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f6f8fa;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 0 14px;
  height: 100%;
  caret-color: #f6f8fa;
}

.input-field::placeholder {
  color: #f6f8fa;
  opacity: 0.7;
}

.upload-button {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #0b0b0d;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  color: #f6f8fa;
  flex-shrink: 0;
  box-shadow: 
    -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
    0.5px 1px 2px 0px rgba(0, 0, 0, 0.38);
  transition: all 0.2s ease;
}

.upload-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 15px;
  box-shadow: inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.61);
  pointer-events: none;
}

.upload-button:hover {
  transform: scale(1.05);
}

.upload-button:active {
  transform: scale(0.95);
}

.upload-button .icon {
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 1;
}

/* Settings Section */
.settings-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #484a55;
  border-radius: 18px;
  padding: 8px;
  height: 48px;
  box-shadow: 
    -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
    0.5px 1px 2px 0px rgba(0, 0, 0, 0.25);
}

.settings-section::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  box-shadow: inset 0.5px 1px 2.25px 0px rgba(0, 0, 0, 0.29);
  pointer-events: none;
}

/* Icon Buttons */
.icon-button {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #0b0b0d;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  color: #f6f8fa;
  transition: all 0.2s ease;
  box-shadow: 
    -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
    0.5px 1px 2px 0px rgba(0, 0, 0, 0.38);
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 15px;
  box-shadow: inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.61);
  pointer-events: none;
}

.icon-button:hover {
  transform: scale(1.1);
}

.icon-button:active {
  transform: scale(0.95);
}

.icon-button .icon {
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 1;
}

/* Current Location Indicator */
.current-location {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 16px;
  height: 16px;
  pointer-events: auto;
  animation: pulse 2s infinite;
  z-index: 101;
}

.location-pin {
  width: 100%;
  height: 100%;
  color: #2563eb;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.4));
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Side Panels */
.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  background: #f6f8fa;
  border-left: 1px solid #e1e3e6;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 99;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e1e3e6;
  background: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0b0b0d;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  color: #0b0b0d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.close-button:hover {
  background: #e1e3e6;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0b0b0d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #484a55;
  line-height: 1.5;
}

.info-section p.small {
  font-size: 13px;
  color: #7f8c8d;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.info-section ul li {
  font-size: 13px;
  color: #484a55;
  margin-bottom: 6px;
  line-height: 1.4;
}

/* Settings Panel */
.setting-group {
  margin-bottom: 16px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #0b0b0d;
  cursor: pointer;
  user-select: none;
}

.setting-label input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e3e6;
  border-radius: 8px;
  font-size: 14px;
  color: #0b0b0d;
  background: white;
  cursor: pointer;
  margin-top: 6px;
}

.setting-select:hover {
  border-color: #d0d0d0;
}

.setting-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* Transitions */
.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-in-right-enter-from {
  transform: translateX(100%);
}

.slide-in-right-leave-to {
  transform: translateX(100%);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .side-panel {
    background: #1a1a1c;
    border-left-color: #333333;
  }

  .panel-header {
    background: #242426;
    border-bottom-color: #333333;
  }

  .panel-header h3 {
    color: #f6f8fa;
  }

  .close-button {
    color: #f6f8fa;
  }

  .close-button:hover {
    background: #333333;
  }

  .info-section h4,
  .setting-label {
    color: #f6f8fa;
  }

  .info-section p,
  .info-section ul li {
    color: #d0d0d0;
  }

  .info-section p.small {
    color: #95a5a6;
  }

  .setting-select {
    background: #242426;
    color: #f6f8fa;
    border-color: #333333;
  }

  .setting-select:hover {
    border-color: #484a55;
  }

  .setting-select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
}

/* Responsive - Hide on smaller screens */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
}
</style>
