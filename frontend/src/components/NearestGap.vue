<template>
    <div :class="['nearest-gap', isDarkMode ? 'dark' : 'light']">
        <div v-if="nearestGap" class="gap-info">
            <span v-if="canUploadHere" class="count can-upload">You can upload here!</span>
            <span v-else class="count move-to-gap">Move {{ formattedDistance }} to the circle to upload!</span>
        </div>
        <div v-else class="no-gap">
            <span>No nearby gaps found</span>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

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

        return {
            formattedDistance,
            canUploadHere
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
    margin-left: 12px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.nearest-gap.dark {
    background: rgba(11, 11, 13, 0.85);
    color: #e7e7e7;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.nearest-gap.light {
    background: rgba(239, 242, 245, 0.9);
    color: #0b0b0d;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.gap-info {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.distance {
    font-size: 1rem;
    font-weight: 700;
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