// tutorial from https://www.youtube.com/watch?v=cp-H_6VODko

let renderer, scene, camera, controls;
let isMobile = false;
let device;

initDevice();
initTHREE();

function initDevice() {
    // detect kind of device this code is being displayed
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    GUI.print("is mobile: " + isMobile);
    device = new DevicePos();
    device.setup();
    GUI.print("Initial oriantation Offset: " + initialOffset);
    GUI.print("GPS status: " + device.status);
    GUI.print("Lat: " + device.pos.lat + ", Lon :  " + device.pos.lon);
    GUI.print("Heading: " + device.heading);
}

function initTHREE() {
    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("skyBox").appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50000);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 0, 2000);
    camera.lookAt(-720, 0, 0);
    GCamera.setCamera(camera);

    controls.autorotate = true;
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 1;
    // controls.minDistance = 10;
    // controls.maxDistance = 200;
    controls.update();

    // let skyBox = new SkyBox(1344, 216, 288);
    // skyBox.addToScene(scene);

    // LIGHTING
    var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    scene.add(keyLight);
    scene.add(fillLight);
    scene.add(backLight);

    //MODEL
    var loader = new THREE.GLTFLoader();
    loader.load('models/test.glb', function(gltf) {
        scaleModel(gltf, 12)
        switchToWhite(gltf);

        // add model to scene
        scene.add(gltf.scene);

    }, undefined, function(error) {
        console.error(error);
    });

    //  **** NETWORK *****

    // Axes
    var axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper)

    let nodes = [];
    for (let i = 0; i < 30; i++) {
        let tmp = new Node();
        let posX = (Math.random() * 720);
        let posY = (Math.random() * 24);
        tmp.obj.position.set(posX, posY, -144)
        translateNode(tmp, new THREE.Vector3(-1195, 24, -80))
        nodes.push(tmp);
        tmp.addToScene(scene);
    }

    // let nodeA = new Node();
    // let nodeB = new Node();
    // nodeA.obj.position.set(0, 0, -144);
    // nodeB.obj.position.set(720, 0, -144);
    // translateNode(nodeA, new THREE.Vector3(-1195, 24, -80))
    // translateNode(nodeB, new THREE.Vector3(-1195, 24, -80))
    // nodes.push(nodeA)
    // nodes.push(nodeB)
    // nodeA.addToScene(scene);
    // nodeB.addToScene(scene);

    let edges = [];

    for (let i = 0; i < 100; i++) {
        let sourceIndex = Math.floor(Math.random() * nodes.length);
        let targetIndex = Math.floor(Math.random() * nodes.length);
        if (sourceIndex == targetIndex) {
            targetIndex = Math.floor(Math.random() * nodes.length);
        }
        let edgeST = new Edge(nodes[sourceIndex], nodes[targetIndex], Math.floor(Math.random() * 4));
        edges.push(edgeST);
        edgeST.addToScene(scene);
    }


    animate();
}

function animate() {
    requestAnimationFrame(animate)
    controls.update();
    renderer.render(scene, camera);
}

function switchToWhite(model) {
    let objects = model.scene.children[2].children

    for (const object of objects) {
        object.material.color = new THREE.Color(1, 1, 1);
    }
}

function scaleModel(model, units) {
    let objects = model.scene.children[2].children
    for (const object of objects) {
        object.scale.set(units, units, units)
    }
}

function translateNode(node, vector) {
    let currentPos = node.obj.position;
    let newPosition = currentPos.add(vector)
    node.obj.position.set(newPosition.x, newPosition.y, newPosition.z);
}


function motionEvent() {
    // camera
    if (isMobile) {
        // If the device is a mobile phone move the camera pivot. 
        GCamera.lookingFrom(0, 0, 50);
    }
}
// Attach motion event
window.addEventListener('devicemotion', motionEvent);