<template>
    <div :class="['branding', isDarkMode ? 'dark' : 'light']">
        <div class="logo-container">
            <img 
                :src="Logo"
                alt="Mapi Logo" 
                class="logo-icon" 
            />
            <div class="logo-text">
                <h2 class="app-name">MAPI</h2>
                <p class="app-tagline">Reimagining the map</p>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

import LogoDark from '../assets/logos/logo_dark.svg'
import LogoLight from '../assets/logos/logo_light.svg'

export default {
    name: 'Branding',
    props: {
        isDarkMode: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {        
        const Logo = computed(() => props.isDarkMode ? LogoDark : LogoLight)

        return {
            Logo
        }
    }
}
</script>