import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './store/auth'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import CalendarView from './views/CalendarView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Calendar',
    component: CalendarView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = !!auth.accessToken

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Signup') && isAuthenticated) {
    next({ name: 'Calendar' })
  } else {
    next()
  }
})

export default router 