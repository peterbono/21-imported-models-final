import './style.css'
import * as THREE from 'three'

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

  // Set our main variables
  let model,                              // Our character
    neck,                               // Reference to the neck bone in the skeleton
    waist,                               // Reference to the waist bone in the skeleton
    possibleAnims,                      // Animations found in our file                          // THREE.js animations mixer
    idle,                               // Idle, the default state our character returns to        // Used for anims, which run to a clock instead of frame rate 
    currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
    raycaster = new THREE.Raycaster();  // Used to detect the click on our character

/**
 * Loaders
 */

// Anim loader
var loaderAnim = document.getElementById('js-loader');

// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null


// Canvas
const canvas = document.querySelector('canvas.webgl')

const BACKGROUND_COLOR = 0xffffff;

// Scene
const scene = new THREE.Scene()

// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR );






/**
 * Textures
 */


 let stacy_txt = new THREE.TextureLoader().load('texture_total.png');

 stacy_txt.flipY = false; // we flip the texture so that its the right way up
 
 const stacy_mtl = new THREE.MeshPhongMaterial({
   map: stacy_txt,
   color: 0xffffff,
   skinning: true
 });




/**
 * Model
 */
gltfLoader.load(
    'models/Duck/glTF-Binary/perso_v8.glb',
    (gltf) =>
    {

       
        let fileAnimations = gltf.animations;

 
        gltf.scene.scale.set(1,1,1)
        //gltf.scene.scale.set(7,7,7)

        gltf.scene.position.y = -11
        
        gltf.scene.traverse((o) => {

          if (o.isBone) {
            console.log(o.name);
          }
            if (o.isMesh) {
                // o.material = bakedMaterial
                o.castShadow = true;
                o.receiveShadow = true;
                o.material = stacy_mtl;    
            }

              // Reference the neck and waist bones
             if (o.isBone && o.name === 'mixamorigNeck') { 
             neck = o;
                }
            // if (o.isBone && o.name === 'mixamorigSpine2') { 
            //  waist = o;
            // }

        });
        
              
         // Animation
         mixer = new THREE.AnimationMixer(gltf.scene)
         let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle_flo');

        // Add these:
        idleAnim.tracks.splice(3, 3);
        idleAnim.tracks.splice(9, 3);

        let idle = mixer.clipAction(idleAnim);
        idle.play();

        undefined, // We don't need this function
      function(error) {
        console.error(error);
      }

        /** 
         const action = mixer.clipAction(gltf.animations[0])
         action.play()
        */
         
        scene.add(gltf.scene)
        loaderAnim.remove();
    }
)





/**
 * Floor
 */

 var floorGeometry = new THREE.PlaneGeometry(5000, 5000);
        var floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 0
        });
        
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;
        floor.position.y = -11;
        floor.receiveShadow = true;
        scene.add(floor);





// Add lights
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 25, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
dirLight.shadow.normalBias = 0.05;
// Add directional Light to scene
scene.add(dirLight);




/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
camera.position.set( 0, -3, 30 );
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas)

// controls.enablePan = false;
// controls.enableZoom = false;
// controls.target.set( 0, 1, 0 );
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.maxPolarAngle = Math.PI / 2;





/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
      
})

renderer.antialias = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

//Event


document.addEventListener('mousemove', function(e) {

    var mousecoords = getMousePos(e);

      if (neck) {

        moveJoint(mousecoords, neck, 50);
        
      }

  });


  
  function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
  }
  

    function moveJoint(mouse, joint, degreeLimit) {
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      joint.rotation.x = THREE.Math.degToRad(degrees.y);
      joint.rotation.y = THREE.Math.degToRad(degrees.x);
      // console.log(joint.rotation.x);
    }
  
    function getMouseDegrees(x, y, degreeLimit) {
      let dx = 0,
          dy = 0,
          xdiff,
          xPercentage,
          ydiff,
          yPercentage;
    
      let w = { x: window.innerWidth, y: window.innerHeight };
    
      // Left (Rotates neck left between 0 and -degreeLimit)
      
       // 1. If cursor is in the left half of screen
      if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;  
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1; }
    // Right (Rotates neck right between 0 and degreeLimit)
      if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
      }
      // Up (Rotates neck up between 0 and -degreeLimit)
      if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
        }
      
      // Down (Rotates neck down between 0 and degreeLimit)
      if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
      }
      return { x: dx, y: dy };
    }