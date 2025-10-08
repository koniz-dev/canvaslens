<template>
  <div class="app">
    <h1>🚀 CanvasLens Vue Test</h1>
    
    <div class="controls">
      <button @click="loadSampleImage" class="btn">
        🖼️ Load Sample Image
      </button>
    </div>
    
    <div class="canvas-container">
      <canvas-lens 
        id="testCanvas" 
        width="889" 
        height="500"
        :tools="toolsJson"
        background-color="#f8f9fa"
        ref="canvasRef"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { CanvasLens } from '../../../dist/index.js';

export default {
  name: 'App',
  setup() {
    const canvasRef = ref(null);
    
    const tools = {
      zoom: true,
      pan: true,
      annotation: {
        rect: true,
        arrow: true,
        text: true,
        circle: true,
        line: true
      }
    };

    // Convert tools object to JSON string for the custom element
    const toolsJson = computed(() => JSON.stringify(tools));

    onMounted(() => {
      // Test CanvasLens with Vue
      console.log('CanvasLens loaded in Vue:', CanvasLens);
      
      // You can add more Vue-specific tests here
    });

    const loadSampleImage = () => {
      // Use Picsum random image
      const imageUrl = 'https://picsum.photos/800/600?random=' + Math.random();
      const canvasLens = document.getElementById('testCanvas');
      if (canvasLens) {
        canvasLens.setAttribute('src', imageUrl);
      }
    };

    return {
      canvasRef,
      tools,
      toolsJson,
      loadSampleImage
    };
  }
};
</script>

<style scoped>
.app {
  padding: 0 20px;
  font-family: Arial, sans-serif;
}

.controls {
  margin-bottom: 20px;
}

.btn {
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background: #0056b3;
}

.canvas-container {
  text-align: center;
}

.status {
  margin-top: 20px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
}
</style>
