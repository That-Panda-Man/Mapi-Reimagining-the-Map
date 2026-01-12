<!-- This page is to describe details of how the application is built  - like the colophon of the website -->
<template>
    <div class="app-container" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }">
        <div class="app-wrapper">
            <!-- Floating Control Bar (Top Right) -->
            <div class="control-bar-floating">
                <ControlBar
                    variant="desktop"
                    :isDarkMode="isDarkMode"
                    @submit="handleControlBarSubmit"
                    @map-toggle="handleMapToggle"
                    @settings-click="handleSettingsClick"
                    @theme-toggle="toggleTheme"
                />
            </div>
            
            <div class="about-page" :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }">
                <div class="about-content">
                    <h1>About This Application</h1>
                    <p>
                        This application is built using Vue.js for the frontend and leverages various modern web technologies to provide an interactive mapping experience.
                    </p>
                    <h2>Technologies Used</h2>
                    <ul>
                        <li><strong>Vue.js:</strong> A progressive JavaScript framework for building user interfaces.</li>
                        <li><strong>Vue Router:</strong> The official router for Vue.js, enabling navigation between different pages.</li>
                        <li><strong>Axios:</strong> A promise-based HTTP client for making API requests.</li>
                        <li><strong>Mapbox GL:</strong> A JavaScript library for interactive, customizable vector maps.</li>
                    </ul>
                    <h2>Features</h2>
                    <ul>
                        <li>Interactive map with custom markers.</li>
                        <li>User submissions with geolocation support.</li>
                        <li>Dark and light mode themes.</li>
                        <li>Responsive design for various screen sizes.</li>
                    </ul>
                    <h2>Development</h2>
                    <p>
                        The application is developed following best practices in web development, including component-based architecture, state management, and responsive design principles.
                    </p>
                    <h2>Contact</h2>
                    <p>
                        For more information or inquiries, please contact the development team at <a href="mailto:info@example.com">info@example.com</a>.
                    </p>
                    
                    <button class="back-btn" @click="handleMapToggle">← Back to Map</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ControlBar from '../components/ControlBar.vue';

export default {
  name: 'About',
  components: {
    ControlBar
  },
  setup() {
    const isDarkMode = ref(true);
    const router = useRouter();

    const handleControlBarSubmit = () => {
      // Handle search submission
    };

    const handleMapToggle = () => {
      router.push('/');
    };

    const handleSettingsClick = () => {
      // Handle settings button click
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      console.log('🎨 Theme toggled to:', isDarkMode.value ? 'dark' : 'light')
    };

    return {
      isDarkMode,
      handleControlBarSubmit,
      handleMapToggle,
      handleSettingsClick,
      toggleTheme
    };
  }
}
</script>