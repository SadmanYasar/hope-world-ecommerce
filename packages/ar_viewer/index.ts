// Generate the HTML content for the iframe
export const generateARHtml = (imageSrc: string) => `
<!doctype html>
<html>
<head>
  <script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-detector.js"></script>
  <script src="https://raw.githack.com/AR-js-org/studio-backend/master/src/modules/marker/tools/gesture-handler.js"></script>
  <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
  <script src="https://raw.githack.com/jeromeetienne/AR.js/master/aframe/build/aframe-ar.min.js"></script>
  <script src="https://raw.githack.com/donmccurdy/aframe-extras/master/dist/aframe-extras.loaders.min.js"></script>
  <script>
    // Listen for a message to stop the camera stream
    window.addEventListener('message', function(event) {
      if (event.data === 'stopCamera') {
        const scene = document.querySelector('a-scene');
        const video = document.querySelector('video');
        if (video && video.srcObject) {
          const stream = video.srcObject;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
        if (scene && scene.camera) {
          scene.camera.stop(); // Attempt to stop A-Frame/AR.js camera
        }
      }
    });
  </script>
</head>
<body style="margin: 0; overflow: hidden;">
  <a-scene vr-mode-ui="enabled: false;" loading-screen="enabled: false;"
    arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    id="scene" embedded gesture-detector>
    <a-marker id="animated-marker" type="barcode" value="10">
      <a-image src="${imageSrc}" scale="10 10 10" class="clickable" rotation="-90 0 0" gesture-handler></a-image>
    </a-marker>
    <a-entity camera></a-entity>
  </a-scene>
</body>
</html>
`;