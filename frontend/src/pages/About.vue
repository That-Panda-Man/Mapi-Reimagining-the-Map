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
                    <h1>Welcome to Mapi!</h1>
                    <p>
                        Following research into informational governance in digital mapping technologes, Mapi provides a platform for exploring the world through natural language descriptions. We're redesigning how we engage with maps, avoiding advertisement-driven and algorithmically curated content.
                    </p>
                    <p>
                        Mapi is an open-source project developed by a dedicated team developer and designer. Our mission is to create a user-friendly mapping application that prioritizes user contributions and community engagement.
                    </p>
                    <h2>Tech Stack</h2>
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
                    <h2>Code</h2>
                    <p>
                        To view the code for this website, please head to <a href="https://github.com/your-repo-link">Github</a>.
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