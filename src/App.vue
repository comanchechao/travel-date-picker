<script setup lang="ts">
import DatePicker from "./components/DatePicker.vue";
</script>

<template>
  <div class="app-container">
    <div class="date-picker-wrapper">
      <DatePicker />
    </div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Vazirmatn", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  direction: rtl;
  background-color: #1a4cff;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: #1a4cff;
  padding: 1rem;
}

.date-picker-wrapper {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

/* Add smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
