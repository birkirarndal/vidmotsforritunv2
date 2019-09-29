"use strict";
// býr til senuna
let scene = new THREE.Scene();
// býr til perspective camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let group = new THREE.Object3D();

// býr til renderer og stillir stærðinna á honum
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// býr til diskin
let diskgeometry = new THREE.CylinderGeometry( 2, 1, 0.5, 32  );
let material = new THREE.MeshBasicMaterial({color: 'gray'})
let disk = new THREE.Mesh(diskgeometry, material);

// býr til kertið
let candlegeometry = new THREE.CylinderGeometry( 0.60, 0.6, 2.5, 32  );
let material2 = new THREE.MeshBasicMaterial({color: 'white'});
let candle = new THREE.Mesh(candlegeometry, material2);

// býr til logan
var flamegeometry = new THREE.ConeGeometry( 0.3, 0.5, 32 );
var material3 = new THREE.MeshBasicMaterial( {color: "yellow"} );
var flame = new THREE.Mesh( flamegeometry, material3 );

// stilla staðsetningar á hlutunum
flame.rotation.x = 3;
candle.position.y = 1.5;
flame.position.y = 3;
camera.position.z = 10;

// lætur logan vera ósýnilegan
flame.visible = false;

// setja allt saman í einn object
group.add(disk);
group.add(candle);
group.add(flame);

// setja objectið inn í senuna
scene.add(group);

// lætur logan verða sýnilegan eða ósýnilegan
function candleFlame() {
    if (!flame.visible) {
        flame.visible = true;
    }
    else {
        flame.visible = false;
    }
}
// byrtir allt á senuna og lætur þá hreyfast
function animate() {
    requestAnimationFrame(animate);
    group.rotation.x += 0.01;
    group.rotation.z += 0.01;

    renderer.render(scene, camera);
}
animate();

// þegar að það er smellt á skjáinn kallar það í candleFlame fallið
renderer.domElement.addEventListener('click', candleFlame);

