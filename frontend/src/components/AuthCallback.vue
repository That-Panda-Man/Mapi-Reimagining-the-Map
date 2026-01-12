<template>
  <div class="auth-callback-container">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>{{ message }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AuthCallback',
  emits: ['auth-complete', 'auth-error'],
  setup(props, { emit }) {
    const message = ref('Processing your email verification...')
    const errorMessage = ref('')
    let tokenProcessed = false  // Prevent multiple processing

    onMounted(async () => {
      // Prevent processing the callback multiple times
      if (tokenProcessed) {
        console.log('⚠️ Callback already processed, skipping...')
        return
      }
      tokenProcessed = true

      try {
        // Extract auth token from URL hash
        const hash = window.location.hash.substring(1) // Remove '#'
        const params = new URLSearchParams(hash)
        
        const accessToken = params.get('access_token')
        const type = params.get('type')

        console.log('🔐 Auth callback received:', { type, hasToken: !!accessToken })

        if (!accessToken) {
          throw new Error('No access token found in callback')
        }

        // Accept magiclink, recovery, and signup token types
        if (type !== 'recovery' && type !== 'signup' && type !== 'magiclink') {
          throw new Error(`Unexpected token type: ${type}`)
        }

        // Get user email from Supabase auth (using the access token)
        message.value = 'Verifying your email...'
        
        // Call backend to complete registration - FIRST TIME ONLY
        console.log('📤 Sending token to backend...')
        const response = await axios.post('/api/auth/callback', {
          access_token: accessToken
        })

        console.log('📥 Backend response:', response.data)

        if (response.data.success) {
          console.log('✅ Email verified!:', response.data.email)
          
          message.value = '✅ Email verified! Setting up your profile...'
          
          // Emit event with auth data (NOT stored yet - user will set username next)
          const authData = {
            access_token: response.data.access_token,
            user_id: response.data.user_id,
            email: response.data.email
          }
          
          emit('auth-complete', authData)
          
          // Clear the hash from URL to prevent re-processing
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Don't redirect - let parent component show profile setup
        } else {
          throw new Error(response.data.error || 'Verification failed')
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error.message)
        errorMessage.value = error.message || 'Verification failed'
        message.value = 'Verification failed'
        
        emit('auth-error', error)
        
        // Parent component will handle showing the error and redirecting back to auth form
      }
    })

    return {
      message,
      errorMessage
    }
  }
}
</script>

<style scoped>
.auth-callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: white;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.loading-spinner p.error {
  color: #ff6b6b;
  font-size: 14px;
}
</style>
