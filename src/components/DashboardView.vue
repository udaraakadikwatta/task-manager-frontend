<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Task Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row class="mb-4" align="center">
          <v-col cols="12" sm="4">
            <v-text-field v-model="newTitle" label="New Task Title" clearable />
          </v-col>

          <v-col cols="12" sm="4">
            <v-textarea
              v-model="newDescription"
              label="New Task Description"
              clearable
              rows="2"
            />
          </v-col>

          <v-col cols="12" sm="2" class="d-flex align-end">
            <v-btn color="primary" @click="addTask" :disabled="!newTitle.trim()">Add Task</v-btn>
          </v-col>

          <v-col cols="12" sm="2">
            <v-select
              v-model="filter"
              :items="['all', 'completed', 'pending']"
              label="Filter"
              @update:model-value="fetchTasks"
            />
          </v-col>
        </v-row>

        <v-data-table
          :headers="headers"
          :items="tasks"
          item-value="id"
          item-key="id"
          class="elevation-1"
        >
          <template #item="{ item }">
            <tr :class="{ 'completed-row': item.status === 'completed' }">
              <td>
                <template v-if="editingTaskId === item.id">
                  <v-text-field v-model="editingTitle" dense solo hide-details />
                </template>
                <template v-else>
                  {{ item.title }}
                </template>
              </td>

              <td>
                <template v-if="editingTaskId === item.id">
                  <v-textarea
                    v-model="editingDescription"
                    dense
                    solo
                    hide-details
                    rows="2"
                  />
                </template>
                <template v-else>
                  {{ item.description }}
                </template>
              </td>

              <td>
                <v-chip
                  :color="item.status === 'completed' ? 'green lighten-2' : 'grey lighten-2'"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </td>

              <td class="action-buttons-cell">
                <v-btn
                  icon
                  size="small"
                  color="blue"
                  @click="startEditing(item)"
                  v-if="editingTaskId !== item.id && item.status !== 'completed'"
                >
                  <v-icon size="small">mdi-pencil</v-icon>
                </v-btn>

                <v-btn
                  icon
                  size="small"
                  color="orange"
                  @click="completeTask(item.id)"
                  v-if="item.status !== 'completed' && editingTaskId !== item.id"
                >
                  <v-icon size="small">mdi-check</v-icon>
                </v-btn>

                <v-btn
                  icon
                  size="small"
                  color="red"
                  @click="deleteTask(item.id)"
                  v-if="editingTaskId !== item.id"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>

                <div
                  v-if="editingTaskId === item.id"
                  class="edit-buttons-wrapper"
                >
                  <v-btn
                    size="small"
                    color="primary"
                    @click="updateTask(item.id)"
                  >
                    Save
                  </v-btn>

                  <v-btn
                    size="small"
                    color="grey"
                    @click="cancelEditing"
                  >
                    Cancel
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API from '@/api'

const router = useRouter()

const tasks = ref([])
const newTitle = ref('')
const newDescription = ref('')
const filter = ref('all')

const editingTaskId = ref(null)
const editingTitle = ref('')
const editingDescription = ref('')

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchTasks = async () => {
  try {
    const res = await API.get('/tasks', {
      params: filter.value !== 'all' ? { status: filter.value } : {},
    })
    tasks.value = res.data
  } catch (error) {
    console.error('Fetch tasks error:', error)
  }
}

const addTask = async () => {
  if (!newTitle.value.trim()) return
  try {
    await API.post('/tasks', {
      title: newTitle.value,
      description: newDescription.value,
    })
    newTitle.value = ''
    newDescription.value = ''
    fetchTasks()
  } catch (error) {
    console.error('Add task error:', error)
  }
}

const startEditing = (task) => {
  editingTaskId.value = task.id
  editingTitle.value = task.title
  editingDescription.value = task.description || ''
}

const cancelEditing = () => {
  editingTaskId.value = null
  editingTitle.value = ''
  editingDescription.value = ''
}

const updateTask = async (taskId) => {
  if (!editingTitle.value.trim()) return
  try {
    await API.put(`/tasks/${taskId}`, {
      title: editingTitle.value,
      description: editingDescription.value,
    })
    cancelEditing()
    fetchTasks()
  } catch (error) {
    console.error('Update task error:', error)
  }
}

const completeTask = async (id) => {
  try {
    await API.patch(`/tasks/${id}/complete`)
    fetchTasks()
  } catch (error) {
    console.error('Complete task error:', error)
  }
}

const deleteTask = async (id) => {
  try {
    await API.delete(`/tasks/${id}`)
    fetchTasks()
  } catch (error) {
    console.error('Delete task error:', error)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  router.replace({ name: 'login' })
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.completed-row {
  background-color: #e0f7e9 !important;
  transition: background-color 0.3s ease;
}

.action-buttons-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-buttons-wrapper {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
</style>
