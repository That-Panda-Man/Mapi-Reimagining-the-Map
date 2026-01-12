<template>
  <div class="profile-modal-overlay">
    <div class="profile-modal-content">
      <div class="profile-header">
        <h2>📝 Complete Your Profile</h2>
        <p>Email verified! Now choose a username to get started.</p>
      </div>

      <div v-if="profileMessage" :class="['profile-message', profileMessage.type]">
        {{ profileMessage.text }}
      </div>

      <div class="profile-form">
        <div class="form-group">
          <label for="username-input">Choose a Username</label>
          <input
            id="username-input"
            v-model="username"
            type="text"
            placeholder="Enter a username (3-20 characters)"
            minlength="3"
            maxlength="20"
            @keyup.enter="submitProfile"
            @input="validateUsername"
            :disabled="submitting"
          >
          <div v-if="usernameError" class="error-text">
            {{ usernameError }}
          </div>
          <div v-if="username" class="username-info">
            {{ username.length }}/20 characters
          </div>
        </div>

        <div class="form-group">
          <label>Email (verified)</label>
          <input
            type="email"
            :value="email"
            disabled
            class="disabled-input"
          >
        </div>

        <button
          @click="submitProfile"
          class="btn-submit"
          :disabled="submitting || !username || usernameError"
        >
          {{ submitting ? '⏳ Setting up profile...' : '✨ Complete Profile & Get Started' }}
        </button>

        <div class="profile-note">
          <p>💡 <strong>Username Guidelines:</strong></p>
          <ul>
            <li>3-20 characters long</li>
            <li>Can contain letters, numbers, and underscores</li>
            <li>Must be unique across the app</li>
            <li>You can change it later</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

export default {
  name: 'CompleteProfile',
  props: {
    accessToken: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  },
  emits: ['profile-complete', 'profile-error'],
  setup(props, { emit }) {
    const username = ref('')
    const submitting = ref(false)
    const profileMessage = ref(null)
    const usernameError = ref(null)

    const validateUsername = () => {
      const value = username.value.trim()
      usernameError.value = null

      if (value.length < 3) {
        usernameError.value = 'Username must be at least 3 characters'
        return
      }

      if (value.length > 20) {
        usernameError.value = 'Username must be at most 20 characters'
        return
      }

      // Check for valid characters (letters, numbers, underscores)
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        usernameError.value = 'Username can only contain letters, numbers, and underscores'
        return
      }
    }

    const submitProfile = async () => {
      validateUsername()
      
      if (usernameError.value || !username.value.trim()) {
        return
      }

      submitting.value = true
      profileMessage.value = null

      try {
        console.log('📝 Submitting profile setup with username:', username.value)

        const response = await axios.post(
          '/api/user/setup-profile',
          { username: username.value.trim() },
          {
            headers: {
              'Authorization': `Bearer ${props.accessToken}`
            }
          }
        )

        if (response.data.success) {
          console.log('✓ Profile setup successful:', response.data)
          
          const userProfile = {
            user_id: response.data.user_id,
            username: response.data.username,
            email: response.data.email,
            access_token: props.accessToken
          }

          // Store in localStorage
          localStorage.setItem('geofencing_user', JSON.stringify(userProfile))
          localStorage.setItem('geofencing_token', props.accessToken)

          // Emit success event with user data
          emit('profile-complete', userProfile)
        } else {
          throw new Error(response.data.error || 'Profile setup failed')
        }
      } catch (error) {
        console.error('❌ Profile setup error:', error)
        
        let errorText = error.response?.data?.error || error.message
        
        // Handle specific error cases
        if (errorText.includes('already taken')) {
          usernameError.value = 'Username already taken. Try another one!'
          profileMessage.value = { type: 'error', text: '❌ Username already taken' }
        } else if (errorText.includes('between 3 and 20')) {
          profileMessage.value = { type: 'error', text: '❌ Username must be between 3-20 characters' }
        } else {
          profileMessage.value = { type: 'error', text: `❌ Error: ${errorText}` }
        }

        emit('profile-error', errorText)
      } finally {
        submitting.value = false
      }
    }

    return {
      username,
      email: props.email,
      submitting,
      profileMessage,
      usernameError,
      validateUsername,
      submitProfile
    }
  }
}
</script>

<style scoped>
.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.profile-modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 32px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-header {
  margin-bottom: 24px;
  text-align: center;
}

.profile-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.profile-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.profile-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.profile-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.profile-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

#username-input,
.disabled-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

#username-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

#username-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled-input {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.error-text {
  font-size: 12px;
  color: #d9534f;
  font-weight: 500;
}

.username-info {
  font-size: 12px;
  color: #999;
}

.btn-submit {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-note {
  background: #f0f4ff;
  border: 1px solid #dde4ff;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: #555;
  margin-top: 8px;
}

.profile-note p {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
}

.profile-note ul {
  margin: 0;
  padding-left: 18px;
  list-style-position: inside;
}

.profile-note li {
  margin: 4px 0;
  line-height: 1.4;
}
</style>
