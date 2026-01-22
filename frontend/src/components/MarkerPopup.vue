<template>
    <div class="modal-overlay" v-if="isOpen" @click.self="handleClose">
        <div class="marker-popup-modal" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }">
            <!-- Header -->
            <div class="popup-header">
                <div class="popup-header-content">
                    <div class="popup-icon-wrapper">
                        <img 
                            v-if="markerData?.icon_name" 
                            :src="getMarkerIcon(markerData.icon_name)" 
                            :alt="markerData.icon_name"
                            class="popup-icon"
                        />
                    </div>
                    <h2 class="popup-title">{{ markerData?.description || 'Marker Details' }}</h2>
                </div>
                <button class="close-btn" @click="handleClose" aria-label="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <!-- Content -->
            <div class="popup-content">
                <div class="info-row">
                    <span class="info-label">Category</span>
                    <span class="info-value category-badge">{{ markerData?.icon_name || 'Unknown' }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Submitted by</span>
                    <span class="info-value">{{ markerData?.submitted_by || 'Anonymous' }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Location</span>
                    <span class="info-value coordinates">
                        {{ formatCoordinate(markerData?.latitude) }}, {{ formatCoordinate(markerData?.longitude) }}
                    </span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Created</span>
                    <span class="info-value">{{ formatDate(markerData?.created_at) }}</span>
                </div>
                
                <div class="info-row" v-if="markerData?.expiry_date">
                    <span class="info-label">Expires</span>
                    <span class="info-value expiry">{{ formatDate(markerData?.expiry_date) }}</span>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="popup-actions">
                <button class="action-btn secondary" @click="handleClose">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
// Import marker SVGs for both themes
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

export default {
    name: 'MarkerPopup',
    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        isDarkMode: {
            type: Boolean,
            default: false
        },
        markerData: {
            type: Object,
            default: null
        }
    },
    emits: ['close'],
    setup(props, { emit }) {
        // Marker SVG mapping
        const markerSVGs = {
            'Architecture': { light: Architecture_light, dark: Architecture_dark },
            'ArtsDesign': { light: ArtsDesign_light, dark: ArtsDesign_dark },
            'Drink': { light: Drink_light, dark: Drink_dark },
            'Food': { light: Food_light, dark: Food_dark },
            'GreenSpace': { light: GreenSpace_light, dark: GreenSpace_dark },
            'MuseumGallery': { light: MuseumGallery_light, dark: MuseumGallery_dark },
            'People': { light: People_light, dark: People_dark },
            'Play': { light: Play_light, dark: Play_dark },
            'Shopping': { light: Shopping_light, dark: Shopping_dark },
            'Transport': { light: Transport_light, dark: Transport_dark }
        }

        const handleClose = () => {
            emit('close');
        };

        const getMarkerIcon = (iconName) => {
            const theme = props.isDarkMode ? 'dark' : 'light'
            if (markerSVGs[iconName] && markerSVGs[iconName][theme]) {
                return markerSVGs[iconName][theme]
            }
            // Default to Architecture if not found
            return markerSVGs['Architecture'][theme]
        }

        const formatDate = (isoDateString) => {
            if (!isoDateString) return 'N/A'
            const date = new Date(isoDateString)
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const formatCoordinate = (coord) => {
            if (coord === null || coord === undefined) return 'N/A'
            return parseFloat(coord).toFixed(6)
        }

        return {
            handleClose,
            getMarkerIcon,
            formatDate,
            formatCoordinate
        };
    }
};
</script>

<style scoped>
/* Modal Overlay */
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
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

/* Modal Container */
.marker-popup-modal {
    width: 90%;
    max-width: 400px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

/* Dark Mode Styles */
.marker-popup-modal.dark-mode {
    background: rgba(30, 30, 35, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
}

/* Light Mode Styles */
.marker-popup-modal.light-mode {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #1d1d1f;
}

/* Header */
.popup-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 16px 20px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.popup-header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.popup-icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.popup-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.popup-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
}

.dark-mode .popup-title {
    color: #ffffff;
}

.light-mode .popup-title {
    color: #1d1d1f;
}

/* Close Button */
.close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dark-mode .close-btn {
    color: #888;
}

.dark-mode .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.light-mode .close-btn {
    color: #666;
}

.light-mode .close-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
}

/* Content */
.popup-content {
    padding: 16px 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 0.875rem;
    font-weight: 500;
}

.dark-mode .info-label {
    color: #888;
}

.light-mode .info-label {
    color: #666;
}

.info-value {
    font-size: 0.9rem;
    font-weight: 500;
    text-align: right;
}

.dark-mode .info-value {
    color: #f6f8fa;
}

.light-mode .info-value {
    color: #0b0b0b;
}

.category-badge {
    color: white !important;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
}

.marker-popup-modal.dark-mode .category-badge {
    color: #f6f8fa;
    background-color: #484a55;
    box-shadow: -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
        0.5px 1px 2px 0px rgba(0, 0, 0, 0.38),
        inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.61);
}

.marker-popup-modal.light-mode .category-badge {
    color: #0b0b0b;
    background-color: #f6f8fa;
    box-shadow: -1px -0.5px 3.5px 0px rgba(255, 255, 255, 0.7),
        0.5px 1px 2px 0px rgba(0, 0, 0, 0.15),
        inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.9);
}

.coordinates {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.8rem;
}

.expiry {
    color: #ff9500 !important;
}

/* Actions */
.popup-actions {
    display: flex;
    gap: 12px;
    padding: 16px 20px 20px 20px;
    border-top: 1px solid rgba(128, 128, 128, 0.1);
}

.action-btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.action-btn.secondary {
    background: rgba(128, 128, 128, 0.2);
}

.dark-mode .action-btn.secondary {
    color: #e0e0e0;
}

.dark-mode .action-btn.secondary:hover {
    background: rgba(128, 128, 128, 0.3);
}

.light-mode .action-btn.secondary {
    color: #333;
}

.light-mode .action-btn.secondary:hover {
    background: rgba(128, 128, 128, 0.25);
}

.action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.action-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>