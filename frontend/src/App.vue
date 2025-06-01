<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
</template>

<script setup>
import { NMessageProvider } from 'naive-ui'
// No imports necesarios
</script>

<style scoped>
body {
  background: #f5f5f5;
}
</style>
