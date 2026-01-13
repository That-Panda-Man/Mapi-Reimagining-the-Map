<template>
  <div class="control-bar-wrapper" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode, 'expanded': isExpanded }">
    <!-- Desktop Full Variant: Search input + Settings buttons -->
    <template v-if="variant === 'desktop'">
      <!-- Minimized state: Only icon buttons -->
      <template v-if="!isExpanded">
        <div class="control-bar-minimized">
          <button
            class="icon-btn search-btn"
            @click="handleUploadClick"
            :title="'Open search input'"
          >
            <img :src="uploadIconRegular" alt="Upload" class="icon" />
          </button>
          <button
            class="icon-btn map-btn"
            @click="goToMap"
            :title="'Toggle map layers'"
          >
            <img :src="mapIcon" alt="Map" class="icon" />
          </button>
          <button
            class="icon-btn info-btn"
            @click="goToAbout"
            :title="'Show information'"
          >
            <img :src="infoIcon" alt="Info" class="icon" />
          </button>
          <button
            class="icon-btn settings-btn"
            @click="$emit('settings-click')"
            :title="'Open settings'"
          >
            <img :src="settingsIcon" alt="Settings" class="icon" />
          </button>
          <button
            class="icon-btn color-mode-btn"
            @click="$emit('theme-toggle')"
            :title="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`"
          >
            <img :src="colorModeIcon" alt="Theme" class="icon" />
          </button>
        </div>
      </template>

      <!-- Expanded state: Icon buttons + Search input -->
      <template v-else>
        <div class="control-bar-desktop">
          <!-- Search Input Section -->
          <div class="search-input-container">
            <input
              type="text"
              class="search-input"
              placeholder="Start typing..."
              v-model="inputText"
              @keydown.enter="handleSubmit"
              autofocus
            />
            <button class="upload-btn" @click="handleSubmit" :title="'Submit'">
              <img :src="uploadIconExpanded" alt="Upload" class="icon" />
            </button>
            <button class="close-btn" @click="handleClose" :title="'Close'" @keydown.esc="handleClose">
              <img :src="closeIcon" alt="Close" class="icon" />
            </button>
          </div>

          <!-- Settings Buttons Section -->
          <div class="settings-buttons-container">
            <button
              class="icon-btn map-btn"
              @click="$emit('map-toggle')"
              :title="'Toggle map layers'"
            >
              <img :src="mapIcon" alt="Map" class="icon" />
            </button>
            <button
              class="icon-btn info-btn"
              @click="goToAbout"
              :title="'Show information'"
            >
              <img :src="infoIcon" alt="Info" class="icon" />
            </button>
            <button
              class="icon-btn settings-btn"
              @click="$emit('settings-click')"
              :title="'Open settings'"
            >
              <img :src="settingsIcon" alt="Settings" class="icon" />
            </button>
            <button
              class="icon-btn color-mode-btn"
              @click="$emit('theme-toggle')"
              :title="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`"
            >
              <img :src="colorModeIcon" alt="Theme" class="icon" />
            </button>
          </div>
        </div>
      </template>
    </template>

    <!-- Compact Variant: Icon buttons only -->
    <template v-else>
      <div class="control-bar-compact">
        <button
          class="icon-btn search-btn"
          @click="toggleSearchMode"
          :title="'Search locations'"
        >
          <img :src="searchIcon" alt="Search" class="icon" />
        </button>
        <button
          class="icon-btn map-btn"
          @click="$emit('map-toggle')"
          :title="'Toggle map layers'"
        >
          <img :src="mapIcon" alt="Map" class="icon" />
        </button>
        <button
          class="icon-btn info-btn"
          @click="goToAbout"
          :title="'Show information'"
        >
          <img :src="infoIcon" alt="Info" class="icon" />
        </button>
        <button
          class="icon-btn settings-btn"
          @click="$emit('settings-click')"
          :title="'Open settings'"
        >
          <img :src="settingsIcon" alt="Settings" class="icon" />
        </button>
        <button
          class="icon-btn color-mode-btn"
          @click="$emit('theme-toggle')"
          :title="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`"
        >
          <img :src="colorModeIcon" alt="Theme" class="icon" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Import utility icons
// Upload
import uploadDarkRoundLarge from '../assets/utility_icons/upload/dark_round_large.svg'
import uploadLightRoundLarge from '../assets/utility_icons/upload/light_round_large.svg'
import uploadDarkRoundRegular from '../assets/utility_icons/upload/dark_round_regular.svg'
import uploadLightRoundRegular from '../assets/utility_icons/upload/light_round_regular.svg'

// Search
import searchDarkRound from '../assets/utility_icons/search/dark_round_large.svg'
import searchLightRound from '../assets/utility_icons/search/light_round_large.svg'
// Map
import mapDarkRound from '../assets/utility_icons/map/dark_round_regular.svg'
import mapLightRound from '../assets/utility_icons/map/light_round_regular.svg'

// Info
import infoDarkRound from '../assets/utility_icons/info/dark_round_regular.svg'
import infoLightRound from '../assets/utility_icons/info/light_round_regular.svg'
// Settings
import settingsDarkRound from '../assets/utility_icons/settings/dark_round_regular.svg'
import settingsLightRound from '../assets/utility_icons/settings/light_round_regular.svg'

// Color Mode
import colorModeDarkRound from '../assets/utility_icons/colourMode/dark_round_regular.svg'
import colorModeLightRound from '../assets/utility_icons/colourMode/light_round_regular.svg'

// Close Icon
import closeDarkRound from '../assets/utility_icons/close/dark_round_large.svg'
import closeLightRound from '../assets/utility_icons/close/light_round_large.svg'

// Props
const props = defineProps({
  variant: {
    type: String,
    default: 'desktop',
    validator: (value) => ['desktop', 'compact'].includes(value)
  },
  isDarkMode: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'submit',
  'map-toggle',
  'info-click',
  'settings-click',
  'theme-toggle',
  'close-click'
])

// Refs
const inputText = ref('')
const searchModeActive = ref(false)
const isExpanded = ref(false)
const isMobile = ref(false)

// Router
const router = useRouter()

// Navigate to about page
const goToAbout = () => {
  router.push('/about')
}

const goToMap = () => {
  router.push('/')
}

const goToSettings = () => {
  router.push('/settings')
}

// Check if mobile screen
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Computed icons based on theme
const uploadIconRegular = computed(() => props.isDarkMode ? uploadDarkRoundRegular : uploadLightRoundRegular)
const uploadIconLarge = computed(() => props.isDarkMode ? uploadDarkRoundLarge : uploadLightRoundLarge)
// Use regular icon on mobile, large on desktop
const uploadIconExpanded = computed(() => isMobile.value ? uploadIconRegular.value : uploadIconLarge.value)
const searchIcon = computed(() => props.isDarkMode ? searchDarkRound : searchLightRound)
const mapIcon = computed(() => props.isDarkMode ? mapDarkRound : mapLightRound)
const infoIcon = computed(() => props.isDarkMode ? infoDarkRound : infoLightRound)
const settingsIcon = computed(() => props.isDarkMode ? settingsDarkRound : settingsLightRound)
const colorModeIcon = computed(() => props.isDarkMode ? colorModeDarkRound : colorModeLightRound)
const closeIcon = computed(() => props.isDarkMode ? closeDarkRound : closeLightRound)

// Methods
const handleSubmit = () => {
  if (inputText.value.trim()) {
    emit('submit', inputText.value)
    inputText.value = ''
    isExpanded.value = false
  }
}

const handleClose = () => {
  isExpanded.value = false
}

const handleUploadClick = () => {
  isExpanded.value = !isExpanded.value
}

const toggleSearchMode = () => {
  searchModeActive.value = !searchModeActive.value
}
</script>
