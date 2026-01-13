<template>
    <div :class="['branding', isDarkMode ? 'dark' : 'light']">
        <div class="logo-container">
            <img 
                :src="Logo"
                alt="Mapi Logo" 
                class="logo-icon" 
            />
            <div class="logo-text">
                <h1 class="app-name">MAPI</h1>
                <p class="app-tagline">Reimagining the map</p>
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
    name: 'Branding',
    props: {
        isDarkMode: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const retryGeolocation = () => {
            emit('retry-geolocation')
        }
        
        const Logo = computed(() => props.isDarkMode ? LogoDark : LogoLight)

        return {
            Logo,
            Geolocation
        }
    }
}
</script>