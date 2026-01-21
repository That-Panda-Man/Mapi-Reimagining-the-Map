
<template>
    <div :class="['nearest-gap', isDarkMode ? 'dark' : 'light']">
        <div class="gap-content">
            <div v-if="!isLocationAvailable" class="no-geo-info">
                <!-- <span class="label">Location</span> -->
                <button class="btn-retry-geo" @click="retryGeolocation">
                    <div class="icon tooltip">
                        <img :src="Geolocation" alt="Enable Geolocation" class="icon" />
                        <span class="tooltip-text">Retry Geolocation</span>    
                    </div>                
                </button>
            </div>
            <div v-else-if="nearestGap && nearestGap.distance <= 1" class="upload-possible">
                <span class="label">You can upload here!</span>
            </div>
            <div v-else-if="nearestGap && nearestGap.distance > 1" class="gap-info">
                <span class="label">
                    <!-- <h2>Nearly there!</h2> -->
                    Move {{ formattedDistance }} into the circle!</span>
            </div>
            <div v-else class="gap-info">
                <span class="label">Explore the map, we're having trouble locating you.</span>
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