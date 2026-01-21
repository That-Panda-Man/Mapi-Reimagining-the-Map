<template>
    <div class="modal-overlay" v-if="isOpen" @click.self="handleCancel">
        <div class="modal-container" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }">
            <h2 class="modal-title">Submit Location</h2>

            <!-- Editable Text Input -->
            <div class="form-group">
                <label for="submission-text">Your Message</label>
                <textarea id="submission-text" v-model="editableText" class="text-input"
                    placeholder="Enter your message..." rows="4"></textarea>
            </div>

            <!-- Icon Selection Scroll Wheel -->
            <div class="form-group">
                <label>Choose an Icon</label>
                <div class="icon-scroll-wrapper">
                    <div class="icon-scroll-container">
                        <div class="icon-scroll-wheel" ref="scrollWheel" @scroll="handleScroll">
                            <!-- Spacer for centering first item -->
                            <div class="scroll-spacer"></div>
                            <div v-for="(icon, index) in icons" :key="icon.id" class="icon-option"
                                :class="{ 'selected': selectedIcon === icon.id }" :data-index="index">
                                <img :src="getIconSrc(icon.id)" :alt="icon.name" class="icon-image" />
                            </div>
                            <!-- Spacer for centering last item -->
                            <div class="scroll-spacer"></div>
                        </div>
                    </div>
                    <!-- Gradient fade overlays -->
                    <div class="fade-left" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"></div>
                    <div class="fade-right" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"></div>
                </div>
                <!-- Selected icon label -->
                <div class="selected-icon-label">{{ getSelectedIconName() }}</div>
            </div>

            <!-- Optional name -->
            <div class="form-group">
                <label for="submitter-name">Your Name (optional)</label>
                <input id="submitter-name" v-model="submitterName" type="text" class="text-input"
                    placeholder="Enter your name..." />
            </div>

            <!-- Location Warning Message -->
            <div v-if="showLocationWarning" class="location-warning">
                <div class="warning-icon">⚠️</div>
                <p class="warning-text">
                    You are too close to an existing point. If you would like to proceed with your upload, 
                    it will be placed at the nearest available location 
                    <span v-if="nearestGap">({{ Math.round(nearestGap.distance) }}m away)</span>.
                    To continue, press submit again below.
                </p>
            </div>

            <!-- Loading Spinner -->
            <div v-if="isLoading" class="loading-container">
                <div class="spinner"></div>
                <p class="loading-text">Uploading to database...</p>
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions" v-if="!isLoading">
                <button class="btn btn-cancel" @click="handleCancel">Cancel</button>
                <button class="btn btn-submit" :class="{ 'btn-confirm': showLocationWarning }" @click="handleFinish">
                    {{ showLocationWarning ? 'Confirm & Upload to Nearest Gap' : 'Finish Upload' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, onMounted, nextTick } from 'vue'

// // Import dark icons
// import ArchitectureDark from '../assets/icons/dark/Architecture_Dark.svg'
// import ArtsDesignDark from '../assets/icons/dark/ArtsDesign_Dark.svg'
// import DrinkDark from '../assets/icons/dark/Drink_Dark.svg'
// import FoodDark from '../assets/icons/dark/Food_Dark.svg'
// import GreenSpaceDark from '../assets/icons/dark/GreenSpace_Dark.svg'
// import MuseumGalleryDark from '../assets/icons/dark/MuseumGallery_Dark.svg'
// import PeopleDark from '../assets/icons/dark/People_Dark.svg'
// import PlayDark from '../assets/icons/dark/Play_Dark.svg'
// import ShoppingDark from '../assets/icons/dark/Shopping_Dark.svg'
// import TransportDark from '../assets/icons/dark/Transport_Dark.svg'

// // Import light icons
// import ArchitectureLight from '../assets/icons/light/Architecture_Light.svg'
// import ArtsDesignLight from '../assets/icons/light/ArtsDesign_Light.svg'
// import DrinkLight from '../assets/icons/light/Drink_Light.svg'
// import FoodLight from '../assets/icons/light/Food_Light.svg'
// import GreenSpaceLight from '../assets/icons/light/GreenSpace_Light.svg'
// import MuseumGalleryLight from '../assets/icons/light/MuseumGallery_Light.svg'
// import PeopleLight from '../assets/icons/light/People_Light.svg'
// import PlayLight from '../assets/icons/light/Play_Light.svg'
// import ShoppingLight from '../assets/icons/light/Shopping_Light.svg'
// import TransportLight from '../assets/icons/light/Transport_Light.svg'

import Architecture_light from '../assets/icons/light/light_architecture.svg'
import ArtsDesign_light from '../assets/icons/light/light_arts-design.svg'
import Drink_light from '../assets/icons/light/light_drink.svg'
import Food_light from '../assets/icons/light/light_food.svg'
import GreenSpace_light from '../assets/icons/light/light_green-space.svg'
import MuseumGallery_light from '../assets/icons/light/light_gallery.svg'
import People_light from '../assets/icons/light/light_people.svg'
import Play_light from '../assets/icons/light/light_play.svg'
import Shopping_light from '../assets/icons/light/light_shop.svg'
import Transport_light from '../assets/icons/light/light_transport.svg'

import Architecture_dark from '../assets/icons/dark/dark_architecture.svg'
import ArtsDesign_dark from '../assets/icons/dark/dark_arts-design.svg'
import Drink_dark from '../assets/icons/dark/dark_drink.svg'
import Food_dark from '../assets/icons/dark/dark_food.svg'
import GreenSpace_dark from '../assets/icons/dark/dark_green-space.svg'
import MuseumGallery_dark from '../assets/icons/dark/dark_gallery.svg'
import People_dark from '../assets/icons/dark/dark_people.svg'
import Play_dark from '../assets/icons/dark/dark_play.svg'
import Shopping_dark from '../assets/icons/dark/dark_shop.svg'
import Transport_dark from '../assets/icons/dark/dark_transport.svg'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    initialText: {
        type: String,
        default: ''
    },
    isDarkMode: {
        type: Boolean,
        default: true
    },
    userLocation: {
        type: Object,
        default: null
    },
    publicPoints: {
        type: Array,
        default: () => []
    },
    nearestGap: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['cancel', 'submit'])

// Icon definitions with id, name, and dark/light sources
const icons = [
    { id: 'architecture', name: 'Architecture', dark: Architecture_dark, light: Architecture_light },
    { id: 'arts_design', name: 'Arts & Design', dark: ArtsDesign_dark, light: ArtsDesign_light },
    { id: 'drink', name: 'Drink', dark: Drink_dark, light: Drink_light },
    { id: 'food', name: 'Food', dark: Food_dark, light: Food_light },
    { id: 'green_space', name: 'Green Space', dark: GreenSpace_dark, light: GreenSpace_light },
    { id: 'museum_gallery', name: 'Museum & Gallery', dark: MuseumGallery_dark, light: MuseumGallery_light },
    { id: 'people', name: 'People', dark: People_dark, light: People_light },
    { id: 'play', name: 'Play', dark: Play_dark, light: Play_light },
    { id: 'shopping', name: 'Shopping', dark: Shopping_dark, light: Shopping_light },
    { id: 'transport', name: 'Transport', dark: Transport_dark, light: Transport_light }
]

// Local state
const editableText = ref('')
const selectedIcon = ref('food')
const submitterName = ref('')
const expiryDate = ref('')
const scrollWheel = ref(null)
const isScrolling = ref(false)
const showLocationWarning = ref(false)  // Track if we're in "confirm" mode
const isLoading = ref(false)  // Track submission loading state
let scrollTimeout = null

// Validation threshold in meters
const PROXIMITY_THRESHOLD = 10

// Icon item width (icon size + gap)
const ICON_SIZE = 64
const ICON_GAP = 8
const ITEM_WIDTH = ICON_SIZE + ICON_GAP

// Haversine distance calculation (meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Check if user is within 10m of any existing public point
const isLocationBlocked = () => {
    if (!props.userLocation || !props.publicPoints || !props.publicPoints.length) return false

    // userLocation uses latitude/longitude, publicPoints uses latitude/longitude from DB
    const userLat = props.userLocation.latitude
    const userLon = props.userLocation.longitude

    if (!userLat || !userLon) return false

    for (const point of props.publicPoints) {
        const distance = calculateDistance(userLat, userLon, point.latitude, point.longitude)
        if (distance <= PROXIMITY_THRESHOLD) {
            return true
        }
    }
    return false
}

// Get icon source based on theme
const getIconSrc = (iconId) => {
    const icon = icons.find(i => i.id === iconId)
    if (!icon) return ''
    return props.isDarkMode ? icon.dark : icon.light
}

// Handle scroll event - detect which icon is centered
const handleScroll = () => {
    if (!scrollWheel.value) return

    // Clear existing timeout
    if (scrollTimeout) clearTimeout(scrollTimeout)
    isScrolling.value = true

    // Wait for scroll to stop, then snap to nearest icon
    scrollTimeout = setTimeout(() => {
        isScrolling.value = false
        snapToNearestIcon()
    }, 100)
}

// Snap to the nearest icon after scrolling stops
const snapToNearestIcon = () => {
    if (!scrollWheel.value) return

    const container = scrollWheel.value
    const scrollLeft = container.scrollLeft

    // Calculate which icon is closest to center
    const index = Math.round(scrollLeft / ITEM_WIDTH)
    const clampedIndex = Math.max(0, Math.min(index, icons.length - 1))

    // Update selected icon
    selectedIcon.value = icons[clampedIndex].id

    // Smooth scroll to snap position
    container.scrollTo({
        left: clampedIndex * ITEM_WIDTH,
        behavior: 'smooth'
    })
}

// Scroll to a specific icon index
const scrollToIcon = (index) => {
    if (!scrollWheel.value) return

    scrollWheel.value.scrollTo({
        left: index * ITEM_WIDTH,
        behavior: 'smooth'
    })
    selectedIcon.value = icons[index].id
}

// Initialize scroll position when modal opens
const initializeScrollPosition = () => {
    nextTick(() => {
        if (!scrollWheel.value) return

        // Find the index of the selected icon
        const index = icons.findIndex(i => i.id === selectedIcon.value)
        if (index !== -1) {
            scrollWheel.value.scrollTo({
                left: index * ITEM_WIDTH,
                behavior: 'auto'
            })
        }
    })
}

// Get the selected icon data for submission
const getSelectedIconData = () => {
    const icon = icons.find(i => i.id === selectedIcon.value)
    return {
        id: icon.id,
        name: icon.name
    }
}

// Get the selected icon name for display
const getSelectedIconName = () => {
    const icon = icons.find(i => i.id === selectedIcon.value)
    return icon ? icon.name : ''
}

// Watch for initialText changes to update editable text
watch(() => props.initialText, (newText) => {
    editableText.value = newText
}, { immediate: true })

// Watch for modal opening to reset state
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        editableText.value = props.initialText
        selectedIcon.value = 'food' // Default selection
        showLocationWarning.value = false // Reset warning state
        isLoading.value = false // Reset loading state
        initializeScrollPosition()
    } else {
        // Reset loading state when modal closes
        isLoading.value = false
    }
})

const handleCancel = () => {
    showLocationWarning.value = false
    emit('cancel')
}

const handleFinish = () => {
    // Step 1: Check if location is blocked
    if (!showLocationWarning.value && isLocationBlocked()) {
        // Show warning and wait for second click
        showLocationWarning.value = true
        console.log('⚠️ Location blocked, showing warning')
        return
    }

    // Determine which coordinates to use
    let latitude = null
    let longitude = null

    if (showLocationWarning.value && props.nearestGap) {
        // Use nearest gap coordinates (second click after warning)
        latitude = props.nearestGap.latitude
        longitude = props.nearestGap.longitude
        console.log('📍 Using nearest gap coordinates:', { latitude, longitude })
    } else if (props.userLocation) {
        // Use user's current location (location not blocked)
        latitude = props.userLocation.latitude
        longitude = props.userLocation.longitude
        console.log('📍 Using user location coordinates:', { latitude, longitude })
    }

    // Validate we have coordinates
    if (latitude === null || longitude === null) {
        console.error('❌ No valid coordinates available')
        console.log('userLocation:', props.userLocation)
        console.log('nearestGap:', props.nearestGap)
        return
    }

    const submitData = {
        latitude,
        longitude,
        description: editableText.value,
        icon_name: getSelectedIconName(),
        submitted_by: submitterName.value || 'Anonymous',
        usedNearestGap: showLocationWarning.value
    }

    // Only include expiry_date if it has a value 
    if (expiryDate.value) {
        submitData.expiry_date = new Date(expiryDate.value).toISOString()
    }

    console.log('📤 Emitting submit data:', submitData)
    
    // Set loading state before emitting
    isLoading.value = true
    
    emit('submit', submitData)

    // Reset state
    showLocationWarning.value = false
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-container {
    width: 90%;
    max-width: 520px;
    border-radius: 18px;
    padding: 24px;
    box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.3),
        inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.2);
}

/* Dark Mode */
.modal-container.dark-mode {
    background-color: #484a55;
    color: #f6f8fa;
}

/* Light Mode */
.modal-container.light-mode {
    background-color: #e7e7e7;
    color: #333333;
}

.modal-title {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
}

.text-input {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
    transition: all 0.2s ease;
    resize: vertical;
    min-height: 80px;
}

/* Dark Mode Inputs */
.dark-mode .text-input {
    background-color: #3a3c45;
    color: #f6f8fa;
    box-shadow: inset 0.5px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.dark-mode .text-input:focus {
    outline: none;
    box-shadow:
        inset 0.5px 1px 2px 0px rgba(0, 0, 0, 0.3),
        0 0 0 2px rgba(255, 255, 255, 0.2);
}

.dark-mode .text-input::placeholder {
    color: #8c94a6;
}

/* Light Mode Inputs */
.light-mode .text-input {
    background-color: #ffffff;
    color: #333333;
    box-shadow: inset 0.5px 1px 2px 0px rgba(0, 0, 0, 0.1);
}

.light-mode .text-input:focus {
    outline: none;
    box-shadow:
        inset 0.5px 1px 2px 0px rgba(0, 0, 0, 0.1),
        0 0 0 2px rgba(0, 0, 0, 0.1);
}

.light-mode .text-input::placeholder {
    color: #8c94a6;
}

/* Icon Scroll Wrapper - relative container for fade overlays */
.icon-scroll-wrapper {
    position: relative;
    width: 100%;
}

/* Icon Scroll Container */
.icon-scroll-container {
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    height: fit-content;
}

.dark-mode .icon-scroll-container {
    background-color: #3a3c45;
}

.light-mode .icon-scroll-container {
    background-color: #f6f8fa;
}

.icon-scroll-wheel {
    display: flex;
    gap: 8px;
    padding: 8px 0;
    overflow-x: auto;
    scroll-behavior: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    height: 100%;
    align-items: center;
}

/* Hide scrollbar but keep functionality */
.icon-scroll-wheel::-webkit-scrollbar {
    display: none;
}

.icon-scroll-wheel {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Spacers to allow first/last items to be centered */
.scroll-spacer {
    flex-shrink: 0;
    width: calc(50% - 28px);
}

/* Gradient Fade Overlays */
.fade-left,
.fade-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 80px;
    pointer-events: none;
    z-index: 2;
}

.fade-left {
    left: 0;
    border-radius: 12px 0 0 12px;
}

.fade-right {
    right: 0;
    border-radius: 0 12px 12px 0;
}

/* Dark mode gradient fades */
.fade-left.dark-mode {
    background: linear-gradient(to right, #3a3c45 0%, #3a3c45 30%, transparent 100%);
}

.fade-right.dark-mode {
    background: linear-gradient(to left, #3a3c45 0%, #3a3c45 30%, transparent 100%);
}

/* Light mode gradient fades */
.fade-left.light-mode {
    background: linear-gradient(to right, #ffffff 0%, #ffffff 30%, transparent 100%);
}

.fade-right.light-mode {
    background: linear-gradient(to left, #ffffff 0%, #ffffff 30%, transparent 100%);
}

/* Selected Icon Label */
.selected-icon-label {
    text-align: center;
    margin-top: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #e7e7e7;
}

/* Icon Option */
.icon-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    padding: 8px;
    border: 2px solid transparent;
    border-radius: 15px;
    transition: all 0.25s ease;
    flex-shrink: 0;
    scroll-snap-align: center;
    opacity: 0.35;
    transform: scale(0.8);
    background: transparent;
}

/* Selected state - full opacity and scale */
.icon-option.selected {
    opacity: 1;
    transform: scale(1);
    border-color: #f6f8fa;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.dark-mode .icon-option {
    background-color: transparent;
}

.light-mode .icon-option {
    background-color: transparent;
}

.icon-image {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

/* Action Buttons */
.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:active {
    transform: scale(0.98);
}

/* Cancel Button */
.dark-mode .btn-cancel {
    background-color: #3a3c45;
    color: #f6f8fa;
}

.dark-mode .btn-cancel:hover {
    background-color: #4a4c55;
}

.light-mode .btn-cancel {
    background-color: #d0d0d0;
    color: #333333;
}

.light-mode .btn-cancel:hover {
    background-color: #c0c0c0;
}

/* Submit Button */
.btn-submit {
    background: #e7e7e7;
    color: #0b0b0b;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.btn-submit:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Confirm Button (warning state) */
.btn-submit.btn-confirm {
    background: linear-gradient(135deg, #8C94A6 0%, #E7E7E7 100%);
}

.btn-submit.btn-confirm:hover {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

/* Location Warning */
.location-warning {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.warning-icon {
    font-size: 20px;
    flex-shrink: 0;
}

.warning-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
}

.dark-mode .warning-text {
    color: #fcd34d;
}

.light-mode .warning-text {
    color: #92400e;
}

/* Loading Spinner */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 40px 20px;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(102, 126, 234, 0.1);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

.dark-mode .loading-text {
    color: #f6f8fa;
}

.light-mode .loading-text {
    color: #333333;
}
</style>
