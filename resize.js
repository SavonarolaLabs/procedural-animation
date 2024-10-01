export function addResizeListener(window, camera, renderer) {
  // Check if a handler already exists
  if (window._resizeHandler) {
    window.removeEventListener('resize', window._resizeHandler);
  }

  // Define the new handler
  window._resizeHandler = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Add the new handler
  window.addEventListener('resize', window._resizeHandler);
}
