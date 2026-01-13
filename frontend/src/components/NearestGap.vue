
<template>
    <div :class="['nearest-gap', isDarkMode ? 'dark' : 'light']">
        <div class="gap-content">
            <div class="gap-content">
                <div v-if="!isLocationAvailable" class="no-geo-info">
                    <span class="label">Enable geolocation to find the nearest gap.</span>
                    <button class="btn-retry-geo" @click="retryGeolocation">
                        <img :src="Geolocation" alt="Enable Geolocation" class="icon" />
                    </button>
                </div>
                <div v-else-if="nearestGap && nearestGap.distance <= 1" class="no-gap">
                    You can upload here!
                </div>
                <div v-else-if="nearestGap && nearestGap.distance > 1" class="gap-info">
                    <span class="label">Move {{ formattedDistance }} to upload!</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

import LogoDark from '../assets/logos/logo_dark.svg'
import LogoLight from '../assets/logos/logo_light.svg'

import GeoLight from '../assets/utility_icons/geolocation/geo_light.svg'
import GeoDark from '../assets/utility_icons/geolocation/geo_dark.svg'

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
        },
        userLocation: {
            type: Object,
            default: null
        }
    },
    setup(props, { emit }) {
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

        const retryGeolocation = () => {
            emit('retry-geolocation')
        }
        
        const Logo = computed(() => props.isDarkMode ? LogoDark : LogoLight)
        const Geolocation = computed(() => props.isDarkMode ? GeoDark : GeoLight)
        const isLocationAvailable = computed(() => props.userLocation !== null)

        return {
            formattedDistance,
            canUploadHere,
            retryGeolocation,
            Logo,
            Geolocation,
            isLocationAvailable
        }
    }
}
</script>

<style scoped>

</style>