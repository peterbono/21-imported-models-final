import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// 


// Canvas
const canvas = document.querySelector('canvas.webgl')

const BACKGROUND_COLOR = 0xffffff;

// Scene
const scene = new THREE.Scene()

// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR );




/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

/**
 * Object
 */
/*
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

scene.add(cube)


/**
 * Textures
 */
 //const bakedTexture = textureLoader.load('sol_bake.png')


 let stacy_txt = new THREE.TextureLoader().load('texture_total.png');

 stacy_txt.flipY = false; // we flip the texture so that its the right way up
 
 const stacy_mtl = new THREE.MeshPhongMaterial({
   map: stacy_txt,
   color: 0xffffff,
   skinning: true
 });



/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial ({color: 0xff0000 })
//const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })


/**
 * Model
 */
gltfLoader.load(
    'models/Duck/glTF-Binary/perso_v7.glb',
    (gltf) =>
    {
        console.log(gltf)
        

        gltf.scene.scale.set(0.1,0.1,0.1)
        
        //gltf.scene.position.y = 0.5
        
        gltf.scene.traverse((child) => {
            

            if (child.isMesh) {
                // child.material = bakedMaterial
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = stacy_mtl; // Add this line
            }
        });
        
        
            
         // Animation
         mixer = new THREE.AnimationMixer(gltf.scene)
         const action = mixer.clipAction(gltf.animations[0])
         action.play()
         
        scene.add(gltf.scene)
    }
)


/*

const gltfLoader = new GLTFLoader()


let mixer = null

gltfLoader.load(
    '/models/Duck/glTF-Binary/Duck.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        scene.add(gltf.scene)

        gltf.scene.traverse((o) => {

            child.material = bakedMaterial

            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
              
        // Animation
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
    }
)

*/


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
        floor.receiveShadow = true;
        scene.add(floor);





// Add lights
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;
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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 75)
camera.position.set( - 1, 1, 3 );
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)

controls.enablePan = false;
controls.enableZoom = false;
controls.target.set( 0, 1, 0 );
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;

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
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()