<template>
  <div class="marker-container" :id="`marker-${id}`">
    <!-- SVG Marker Pin -->
    <div 
      class="marker-pin"
      :title="label"
      @click="$emit('click')"
    >
      <svg 
        width="41" 
        height="54" 
        viewBox="0 0 41 54" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="marker-pin-svg"
      >
        <!-- Pin background with shadow -->
        <g filter="url(#filter0_d_marker)">
          <path 
            d="M20.25 0.625C29.4317 0.625 36.875 8.06827 36.875 17.25C36.875 19.5791 36.1528 22.1481 35.0264 24.7422C33.8972 27.3426 32.3444 30.007 30.6436 32.5371C27.2427 37.5961 23.2163 42.1685 20.6924 44.6924L20.25 45.1338L19.8076 44.6924C17.2837 42.1685 13.2573 37.5961 9.85645 32.5371C8.15559 30.007 6.60282 27.3426 5.47363 24.7422C4.34724 22.1481 3.625 19.5791 3.625 17.25C3.625 8.06827 11.0683 0.625 20.25 0.625Z" 
            :fill="markerColors.pinFill"
            :stroke="markerColors.pinStroke"
            stroke-width="1.25"
          />
        </g>

        <!-- Icon slot (will be replaced with actual icon SVG) -->
        <g class="marker-icon">
          <slot name="icon" :icon-name="iconName">
            <!-- Default icon if none provided -->
            <circle cx="20.25" cy="20" r="6" :fill="markerColors.iconColor" opacity="0.5"/>
          </slot>
        </g>

        <!-- Shadow filter definition -->
        <defs>
          <filter id="filter0_d_marker" x="0" y="0" width="40.5" height="53.25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="1.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.0431373 0 0 0 0 0.0431373 0 0 0 0 0.0509804 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_150_1109"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_150_1109" result="shape"/>
          </filter>
        </defs>
      </svg>
    </div>

    <!-- Popup on click (optional) -->
    <div v-if="showPopup" class="marker-popup">
      <div class="popup-content">
        <h3>{{ label }}</h3>
        <p v-if="description" class="popup-description">{{ description }}</p>
        <div class="popup-meta">
          <span v-if="submittedBy" class="popup-by">By: {{ submittedBy }}</span>
          <span v-if="createdAt" class="popup-date">{{ formatDate(createdAt) }}</span>
        </div>
        <button class="popup-close" @click="showPopup = false">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'MapMarker',
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      default: 'Pin'
    },
    description: {
      type: String,
      default: ''
    },
    submittedBy: {
      type: String,
      default: ''
    },
    createdAt: {
      type: String,
      default: ''
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const showPopup = ref(false)

    // Determine colors based on dark mode state
    const markerColors = computed(() => {
      return {
        pinFill: props.isDarkMode ? '#0B0B0D' : '#F6F8FA',
        pinStroke: props.isDarkMode ? '#484A55' : '#D0D0D0',
        iconColor: props.isDarkMode ? '#F6F8FA' : '#0B0B0D',
        labelBg: props.isDarkMode ? 'rgba(11, 11, 13, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        labelText: props.isDarkMode ? '#F6F8FA' : '#0B0B0D'
      }
    })

    // Format date for display
    const formatDate = (isoDateString) => {
      if (!isoDateString) return 'N/A'
      const date = new Date(isoDateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Handle marker click
    const handleMarkerClick = () => {
      showPopup.value = !showPopup.value
      emit('click', {
        id: props.id,
        label: props.label,
        iconName: props.iconName
      })
    }

    return {
      showPopup,
      markerColors,
      formatDate,
      handleMarkerClick
    }
  }
}
</script>

<style scoped>
.marker-container {
  position: relative;
  cursor: pointer;
}

.marker-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.marker-pin:hover {
  transform: scale(1.1);
}

.marker-pin-svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: filter 0.2s ease;
}

.marker-pin:hover .marker-pin-svg {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.marker-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: v-bind('markerColors.labelText');
  background: v-bind('markerColors.labelBg');
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.marker-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 200px;
  max-width: 250px;
}

.popup-content {
  position: relative;
}

.popup-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0B0B0D;
}

.popup-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #484A55;
  line-height: 1.4;
}

.popup-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
  font-size: 11px;
  color: #7F8C8D;
}

.popup-by,
.popup-date {
  line-height: 1.3;
}

.popup-close {
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  font-size: 18px;
  color: #484A55;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.popup-close:hover {
  background-color: #F0F0F0;
}

/* Arrow pointer for popup */
.marker-popup::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}
</style>
