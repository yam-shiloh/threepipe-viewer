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
   
   let viewer;
   let currentModel = 'loving'; // Track current model
   let currentModelObject = null; // Keep reference to current loaded model
   
   // Model URLs mapping
   const modelUrls = {
       loving: 'https://cdn.shopify.com/3d/models/6bce9a7ae62786dd/new_gold_heart_for_website.glb',
       minimal: 'https://cdn.shopify.com/3d/models/e09fccbf08734217/very_small_silver_diamond.glb'
   };
   
   async function init() {
       viewer = new ThreeViewer({
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
   
       // ✅ Set HDR environment without making it the visible background
       await viewer.setEnvironmentMap(
           'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr',
           { setBackground: false }
       );
   
       // ✅ Keep tone mapping enabled but optional tweaks:
       const tonemap = viewer.getPlugin(TonemapPlugin);
       tonemap.toneMapping = 1; // 1 = LinearToneMapping (or 0 = NoToneMapping)
       tonemap.exposure = 1.0; // adjust if scene too dark/light
   
       // Setup custom loading screen
       const loadingScreen = viewer.getPlugin(LoadingScreenPlugin);
       if (loadingScreen) {
           // Hide all default text and UI elements
           loadingScreen.loadingTextHeader = '';
           loadingScreen.errorTextHeader = '';
           loadingScreen.showFileNames = false;
           loadingScreen.showProcessStates = false;
           loadingScreen.showProgress = false;
           loadingScreen.backgroundOpacity = 0.95;
           loadingScreen.backgroundBlur = 0;
       }
   
       // Load initial model (loving)
       await loadModel('loving');
   
       // Setup camera and controls
       setupCamera();
   
       // Listen for messages from parent window
       window.addEventListener('message', async (event) => {
           console.log('Received message:', event.data);
           
           if (event.data.type === 'changeModel') {
               await loadModel(event.data.modelType);
           }
           // Handle other message types if needed
           else if (event.data.type === 'loadModel') {
               await loadModelByUrl(event.data.modelUrl, event.data.style);
           }
           else if (event.data.type === 'materialChange') {
               // Handle material changes if needed
               console.log('Material changed to:', event.data.material);
           }
       });
   
       console.log('ThreePipe viewer initialized and ready for model switching');
   }
   
   async function loadModel(modelType) {
       const modelUrl = modelUrls[modelType];
       if (!modelUrl) {
           console.error('Unknown model type:', modelType);
           return;
       }
   
       try {
           // Load new model with clearSceneObjects to remove previous models
           console.log('Loading new model:', modelType);
           const result = await viewer.load(modelUrl, {
               autoCenter: true,
               autoScale: true,
               clearSceneObjects: true
           });
   
           // Store reference to the loaded model
           currentModelObject = result;
   
           currentModel = modelType;
           console.log('Successfully loaded model:', modelType);
   
           // Reset camera position after loading new model
           setupCamera();
   
       } catch (error) {
           console.error('Error loading model:', error);
       }
   }
   
   async function loadModelByUrl(modelUrl, style) {
       try {
           // Load new model with clearSceneObjects to remove previous models
           console.log('Loading new model by URL:', modelUrl);
           const result = await viewer.load(modelUrl, {
               autoCenter: true,
               autoScale: true,
               clearSceneObjects: true
           });
   
           // Store reference to the loaded model
           currentModelObject = result;
   
           currentModel = style;
           console.log('Successfully loaded model by URL:', modelUrl, 'Style:', style);
   
           // Reset camera position after loading new model
           setupCamera();
   
       } catch (error) {
           console.error('Error loading model by URL:', error);
       }
   }
   
   function setupCamera() {
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
   
   // Initialize the viewer
   init();