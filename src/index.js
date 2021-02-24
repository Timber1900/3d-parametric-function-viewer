import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, DirectionalLight, ParametricGeometry, AmbientLight, MeshNormalMaterial, DoubleSide, Plane, Vector3, Color, Group, PlaneHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as math from 'mathjs';
import * as dat from 'dat.gui';
import { PlaneGeometry, MeshBasicMaterial } from 'three';

const scene = new Scene();

const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



const options = {
  upper: 10,
  lower: 10,
  expression: "x * y"
}

const expressionFunction = math.compile(options.expression);
let currentMesh;

const testFunc = function ( v, u, target ) {
  const x = (2 * u - 1) * 25;
  const y = (2 * v - 1) * 25;
  const scope = {x, y}
  const res = expressionFunction.evaluate(scope);
  if (res.hasOwnProperty('re')) {
    // target.set( x, res.re, y);
  } else {
    target.set( x, res, y);
  }
};


const clipPlanes = [
  new Plane( new Vector3( 0, 1, 0 ), options.upper ),
  new Plane( new Vector3( 0, -1, 0 ), options.lower ),
];

const geometry = new ParametricGeometry(testFunc, 1000, 1000);
const material = new MeshNormalMaterial( {
  // color: new Color().setHSL( Math.random(), 0.5, 0.5 ),
  side: DoubleSide,
  clippingPlanes: clipPlanes
} )

const cube = new Mesh( geometry, material );
currentMesh = cube;
scene.add( currentMesh );

const helpers = new Group();
helpers.add( new PlaneHelper( clipPlanes[ 0 ], 2, 0xff0000 ) );
helpers.add( new PlaneHelper( clipPlanes[ 1 ], 2, 0x00ff00 ) );
helpers.visible = true;
scene.add( helpers );

const planeGeometry = new PlaneGeometry(50, 50, 10, 10);
const planeMaterial = new MeshBasicMaterial( {
  color: 0xffffff,
  side: DoubleSide,
  opacity: 0.4,
  transparent: true
} );
const plane = new Mesh( planeGeometry, planeMaterial );
scene.add( plane );
plane.rotation.x = Math.PI / 2;


const directionalLight = new DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );
const ambientLight = new AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );
directionalLight.position.y = 5;

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 5;
controls.update();
renderer.localClippingEnabled = true;

function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

const gui = new dat.GUI();

const clips = gui.addFolder('Clipping Planes');
clips.add(options, 'upper', 0, 100).name("Upper clipping").listen().onChange((val) => {
  clipPlanes[1].constant = val;
  render();
});
clips.add(options, 'lower', 0, 100).name("Lower clipping").listen().onChange((val) => {
  clipPlanes[0].constant = val;
  render();
});
clips.open();

const expression = gui.addFolder("Expression");
expression.add(options, 'expression').onFinishChange(val => {
  const expressionFunction = math.compile(val);

  const testFunc = function ( v, u, target ) {
    const x = (2 * u - 1) * 25;
    const y = (2 * v - 1) * 25;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
      // target.set( x, res.re, y);
    } else {
      target.set( x, res, y);
    }
  };

  const geometry = new ParametricGeometry(testFunc, 1000, 1000);
  const material = new MeshNormalMaterial( {
    // color: new Color().setHSL( Math.random(), 0.5, 0.5 ),
    side: DoubleSide,
    clippingPlanes: clipPlanes
  } )

  const cube = new Mesh( geometry, material );
  scene.remove( currentMesh );
  currentMesh = cube;
  scene.add(currentMesh)
});

expression.open();

animate();

// var geom = new THREE.Geometry();
// var v1 = new THREE.Vector3(0,0,0);
// var v2 = new THREE.Vector3(0,500,0);
// var v3 = new THREE.Vector3(0,500,500);

// geom.vertices.push(v1);
// geom.vertices.push(v2);
// geom.vertices.push(v3);

// geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
// geom.computeFaceNormals();

// var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

// object.position.z = -100;//move a bit back - size of 500 is a bit big
// object.rotation.y = -Math.PI * .5;//triangle is pointing in depth, rotate it -90 degrees on Y

// scene.add(object);

