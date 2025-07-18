import {
    ThreeViewer,
    LoadingScreenPlugin,
    BaseGroundPlugin,
    PickingPlugin,
    ProgressivePlugin,
    CanvasSnapshotPlugin,
    TonemapPlugin
  } from 'threepipe';
  
  import {
    ThreeGpuPathTracerPlugin
  } from '@threepipe/plugin-path-tracing';
  
  async function init() {
    const viewer = new ThreeViewer({
      canvas: document.getElementById('webgi-canvas'),
      msaa: false,
      debug: true,
      renderScale: 'auto',
      dropzone: {
        allowedExtensions: ['gltf', 'glb', 'hdr', 'bin', 'png', 'jpeg', 'webp', 'jpg', 'exr', 'json'],
        addOptions: {
          disposeSceneObjects: true,
          autoSetEnvironment: true,
          autoSetBackground: false
        }
      },
      plugins: [
        LoadingScreenPlugin,
        PickingPlugin,
        ProgressivePlugin,
        BaseGroundPlugin,
        CanvasSnapshotPlugin,
        ThreeGpuPathTracerPlugin,
        TonemapPlugin
      ]
    });
  
    // Disable path tracing and ground
    viewer.getPlugin(ThreeGpuPathTracerPlugin).enabled = false;
    viewer.getPlugin(BaseGroundPlugin).enabled = false;
  
    // Set white background
    viewer.renderManager.renderer.setClearColor(0xffffff, 1);
  
    // Set environment map
    await viewer.setEnvironmentMap(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr',
      { setBackground: false }
    );
  
    // Load the 3D model
    await viewer.load(
      'https://cdn.shopify.com/3d/models/6bce9a7ae62786dd/new_gold_heart_for_website.glb',
      {
        autoCenter: true,
        autoScale: true
      }
    );
  
    // === ORBIT CONTROLS SETUP ===
    const cam = viewer.scene.mainCamera;
    const controls = cam.controls;
  
    // Lock orbit to Y-axis only
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = false;
    controls.enablePan = false;
  
    // Set canvas size in pixels and layout
viewer.setRenderSize({ width: 1200, height: 2000 }, 'contain', 1);
viewer.container.style.position = 'relative';
viewer.canvas.style.position = 'absolute';
viewer.canvas.style.top = '50%';
viewer.canvas.style.left = '50%';
viewer.canvas.style.transform = 'translate(-50%, -50%)';

    // Enable auto-rotate
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
  
    // Pause auto-rotate on interaction, resume after 1s
    let autoRotateTimeout;
    const resetAutoRotate = () => {
      controls.autoRotate = false;
      clearTimeout(autoRotateTimeout);
      autoRotateTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 1000);
    };
  
    controls.addEventListener('start', resetAutoRotate);
  
    // === FIXED CAMERA POSITION & UPDATED TARGET ===
    cam.position.set(-2.7724068312354144, 0, 4.16098069715773);
    controls.target.set(0, -1, 0); // target is now 1 unit below origin
    controls.update();
  }
  
  init();
  