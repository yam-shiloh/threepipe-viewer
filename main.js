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
      debug: false, // ✅ Disable FPS/debug UI
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
  
    // ✅ Transparent canvas background
    viewer.renderManager.renderer.setClearColor(0x000000, 0); // fully transparent
    viewer.renderManager.renderer.setClearAlpha(0);
    viewer.canvas.style.background = 'transparent';
  
    // ✅ HTML container should have background color (CSS or inline style)
    // For example:
    // <div id="viewer-container" style="background: white;">
    //   <canvas id="webgi-canvas"></canvas>
    // </div>
  
    // ✅ Set HDR environment without making it the visible background
    await viewer.setEnvironmentMap(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr',
      { setBackground: false }
    );
  
    // ✅ Keep tone mapping enabled but optional tweaks:
    const tonemap = viewer.getPlugin(TonemapPlugin);
    tonemap.toneMapping = 1; // 1 = LinearToneMapping (or 0 = NoToneMapping)
    tonemap.exposure = 1.0;  // adjust if scene too dark/light
  
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
    viewer.setRenderSize({ width: 2000, height: 1000 }, 'contain', 1);
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
    cam.position.set(-0.1, 0, 1.2);
    controls.target.set(0, -1.2, 0);
    controls.update();
  }
  
  init();
  