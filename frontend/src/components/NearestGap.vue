<template>
    <div :class="['nearest-gap', isDarkMode ? 'dark' : 'light']">
        <div class="logo-container">
            <img :src="Logo" alt="Mapi" class="icon" />
        </div>
        <div v-if="nearestGap" class="gap-info">
            <span v-if="canUploadHere" class="count can-upload">You can upload here!</span>
            <span v-else class="count move-to-gap"><p class="distance">{{ formattedDistance }}</p> Move into the circle to upload!</span>
        </div>
        <div v-else class="no-gap">
            <span>No nearby gaps found</span>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

import LogoDark from '../assets/logos/logo_dark.svg'
import LogoLight from '../assets/logos/logo_light.svg'

export default {
    name: 'NearestGap',
    props: {
        nearestGap: {
            type: Object,
            default: null
        },
        nearbyGapsCount: {
            type: Number,
            default: 0
        },
        isDarkMode: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        // User can upload here if the nearest gap is very close (within ~1m means they're at a gap)
        // If distance > 0 but small, they're at a valid gap location
        // If distance is larger, they need to move to the gap
        const canUploadHere = computed(() => {
            if (!props.nearestGap || props.nearestGap.distance == null) return false
            // If nearest gap is within ~5m, user is essentially at a valid upload location
            return props.nearestGap.distance <= 5
        })

        const formattedDistance = computed(() => {
            if (!props.nearestGap || props.nearestGap.distance == null) return ''
            
            const distance = props.nearestGap.distance
            if (distance < 1000) {
                return `${Math.round(distance)}m`
            } else {
                return `${(distance / 1000).toFixed(1)}km`
            }
        })
        
        const Logo = computed(() => props.isDarkMode ? LogoDark : LogoLight)

        return {
            formattedDistance,
            canUploadHere,
            Logo
        }
    }
}


</script>

<style scoped>
.nearest-gap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-width: 200px;
    padding: 12px 20px;
    margin: 12px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.nearest-gap.dark {
    color: #e7e7e7;
    background-color: #484a55;
    box-shadow:
        -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
        0.5px 1px 2px 0px rgba(0, 0, 0, 0.38),
        inset 0.5px 1px 2.25px 0px rgba(255, 255, 255, 0.61);
}

.nearest-gap.light {
    color: #0b0b0d;
    background-color: #e7e7e7;
    box-shadow:
        -1px -0.5px 3.5px 0px rgba(0, 0, 0, 0.25),
        0.5px 1px 2px 0px rgba(0, 0, 0, 0.38),
        inset 0.5px 1px 2.25px 0px rgba(0, 0, 0, 0.15);
}

.gap-info {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 12px;
    margin-left: -8px;
    width: 64px;
    height: auto;
}

.logo-container .icon {
    width: 100%;
    height: auto;
}

.distance {
    font-size: 1rem;
    font-weight: 700;
    line-height: 2rem;
    background: #f8f8f8;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.label {
    font-size: 0.9rem;
    opacity: 0.8;
}

.count {
    font-size: 0.9rem;
}

.count.can-upload {
    color: #8C94A6;
    font-weight: 600;
}

.count.move-to-gap {
    opacity: 0.8;
}

.no-gap {
    font-size: 0.9rem;
    opacity: 0.6;
}
</style>