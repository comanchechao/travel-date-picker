<template>
  <div class="app-container">
    <div class="date-picker-wrapper">
      <DatePicker />
    </div>
  </div>
</template>

<script setup>
import DatePicker from '~/components/DatePicker.vue';
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Vazirmatn", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  direction: rtl;
  background-color: #121212;
  color: #f5f5f5;
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
  background-color: #121212;
  padding: 1rem;
  background-image: radial-gradient(
    rgba(255, 215, 0, 0.1) 1px,
    transparent 1px
  );
  background-size: 30px 30px;
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