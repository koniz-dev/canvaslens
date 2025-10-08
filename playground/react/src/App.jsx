import React, { useRef, useEffect } from 'react';
import { CanvasLens } from '../../../dist/index.js';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Test CanvasLens with React
      console.log('CanvasLens loaded in React:', CanvasLens);
      
      // You can add more React-specific tests here
    }
  }, []);

  const loadSampleImage = () => {
    // Use Picsum random image
    const imageUrl = 'https://picsum.photos/800/600?random=' + Math.random();
    const canvasLens = document.getElementById('test-canvas');
    if (canvasLens) {
      canvasLens.setAttribute('src', imageUrl);
    }
  };

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 CanvasLens React Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={loadSampleImage}
          style={{
            padding: '10px 15px',
            margin: '5px',
            border: 'none',
            borderRadius: '4px',
            background: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🖼️ Load Sample Image
        </button>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <canvas-lens 
          id="test-canvas" 
          width="889" 
          height="500"
          tools='{"zoom": true, "pan": true, "annotation": {"rect": true, "arrow": true, "text": true, "circle": true, "line": true}, "comparison": true}'
          background-color="#f8f9fa"
          ref={canvasRef}
        />
      </div>
    </div>
  );
}

export default App;
