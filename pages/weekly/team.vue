<script setup lang="ts">
// Team weekly report is now a tab on the main weekly page
// Redirect to /weekly with team tab active
await navigateTo('/weekly', { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-slate-400 text-sm">正在跳转...</p>
  </div>
</template>
