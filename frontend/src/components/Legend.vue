<template>
    <div v-if="isOpen" class="legend-container" :class="{ dark: isDarkMode, light: !isDarkMode }">
        <div class="legend-header">
            <h3 class="legend-title" :class="{ dark: props.isDarkMode, light: !props.isDarkMode }">Legend</h3>
            <button class="legend-close-btn" @click="toggleLegend" :title="'Close legend'">
                <img class="legend-icon close" :src="props.isDarkMode ? Close_dark : Close_light" alt="Close" />
            </button>
        </div>
        <div class="legend-content">
            <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
                <div class="legend-icon"><img class="legend-icon-image" :src="props.isDarkMode ? icons[index].dark : icons[index].light" alt="" /></div>
                <span class="legend-label" :class="{ dark: props.isDarkMode, light: !props.isDarkMode }">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'

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

import Close_dark from '../assets/utility_icons/close/dark_round_regular.svg'
import Close_light from '../assets/utility_icons/close/light_round_regular.svg'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'desktop',
        validator: (value) => ['desktop', 'compact'].includes(value)
    },
    isDarkMode: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['toggle-legend'])

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

const legendItems = computed(() => {
    return icons.map(icon => ({
        label: icon.name,
        color: props.isDarkMode ? `url(#${icon.id}_dark)` : `url(#${icon.id}_light)`
    }))
})

const toggleLegend = () => {
    emit('toggle-legend')
}
</script>