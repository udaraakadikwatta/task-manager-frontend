<template>
  <v-app>
    <v-main>
      <v-container fill-height>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card>
              <v-toolbar color="primary" dark>
                <v-toolbar-title>{{ isRegister ? 'Register' : 'Login' }}</v-toolbar-title>
              </v-toolbar>

              <v-card-text>
                <v-form @submit.prevent="isRegister ? register() : login()">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    required
                    :error-messages="errors.email"
                  />

                  <v-text-field
                    v-model="password"
                    label="Password"
                    type="password"
                    required
                    :error-messages="errors.password"
                  />

                  <v-text-field
                    v-if="isRegister"
                    v-model="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    required
                    :error-messages="errors.confirmPassword"
                  />

                  <div v-if="errors.general.length" class="text-error my-3">
                    <div v-for="(msg, index) in errors.general" :key="index">
                      {{ msg }}
                    </div>
                  </div>

                  <v-btn color="primary" type="submit" block>
                    {{ isRegister ? 'Register' : 'Login' }}
                  </v-btn>
                </v-form>

                <div class="text-center mt-4" style="cursor:pointer" @click="toggleForm">
                  {{ isRegister ? 'Already have an account? Login' : "Don't have an account? Register" }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API from '@/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isRegister = ref(false)

const errors = ref({
  email: [],
  password: [],
  confirmPassword: [],
  general: [],
})

const toggleForm = () => {
  isRegister.value = !isRegister.value
  clearForm()
}

const clearForm = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errors.value = {
    email: [],
    password: [],
    confirmPassword: [],
    general: [],
  }
}

const login = async () => {
  errors.value = { email: [], password: [], confirmPassword: [], general: [] }
  try {
    const res = await API.post('/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', res.data.token)
    router.push({ name: 'dashboard' })
  } catch (err) {
    if (err.response?.status === 401) {
      errors.value.general = ['Invalid email or password.']
    } else if (err.response?.status === 422) {
      errors.value = { ...errors.value, ...err.response.data.errors, general: [] }
    } else {
      errors.value.general = ['An unexpected error occurred.']
    }
  }
}

const register = async () => {
  errors.value = { email: [], password: [], confirmPassword: [], general: [] }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = ['Passwords do not match']
    return
  }
  try {
    const res = await API.post('/register', {
      name: email.value,
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', res.data.token)
    router.push({ name: 'dashboard' })
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = { ...errors.value, ...err.response.data.errors, general: [] }
    } else {
      errors.value.general = [err.response?.data?.message || 'Registration failed']
    }
  }
}
</script>

<style scoped>
.text-error {
  color: red;
}
</style>
