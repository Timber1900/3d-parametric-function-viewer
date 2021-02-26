import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, DirectionalLight, ParametricGeometry, AmbientLight, MeshNormalMaterial, DoubleSide, Plane, Vector3, Color, Group, PlaneHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as math from 'mathjs';
import * as dat from 'dat.gui';
import { PlaneGeometry, MeshBasicMaterial } from 'three';

const scene = new Scene();

const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new WebGLRenderer({
  antialias:  true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const options = {
  upper: 10,
  lower: 10,
  expression: decodeURIComponent(window.location.search).replace('?value=', ''),
  res: 200,
  xmin: -10,
  xmax: 10,
  ymin: -10,
  ymax: 10
}

if(options.expression === ''){
  options.expression = 'x*y'
}

let expressionFunction = math.compile(options.expression);
let currentMesh;

let testFunc = function ( v, u, target ) {
  const x = u * (options.xmax - options.xmin) + options.xmin;
  const y = v * (options.ymax - options.ymin) + options.ymin;
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

let geometry;

try{
  geometry = new ParametricGeometry(testFunc, options.res, options.res);
} catch(err) {
  alert(err)
  console.warn(err)
  window.location.href = window.location.origin
}

const material = new MeshNormalMaterial( {
  side: DoubleSide,
  clippingPlanes: clipPlanes
} )

let cube = new Mesh( geometry, material );
currentMesh = cube;
scene.add( currentMesh );

const helpers = new Group();
helpers.add( new PlaneHelper( clipPlanes[ 0 ], 2, 0xff0000 ) );
helpers.add( new PlaneHelper( clipPlanes[ 1 ], 2, 0x00ff00 ) );
helpers.visible = true;
scene.add( helpers );

let planeGeometry = new PlaneGeometry(2 * Math.max(Math.abs(options.xmax), Math.abs(options.xmin)), 2 * Math.max(Math.abs(options.ymax), Math.abs(options.ymin)), 1, 1);
const planeMaterial = new MeshBasicMaterial( {
  color: 0xffffff,
  side: DoubleSide,
  opacity: 0.4,
  transparent: true
} );
let plane = new Mesh( planeGeometry, planeMaterial );
scene.add( plane );
plane.rotation.x = Math.PI / 2;

const directionalLight = new DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );
const ambientLight = new AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );
directionalLight.position.y = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
camera.position.z = 10;
controls.update();
renderer.localClippingEnabled = true;

const gui = new dat.GUI();

const clips = gui.addFolder('Clipping Planes');
clips.add(options, 'upper', 0, 100).name("Upper clipping").listen().onChange((val) => {
  clipPlanes[1].constant = val;
});
clips.add(options, 'lower', 0, 100).name("Lower clipping").listen().onChange((val) => {
  clipPlanes[0].constant = val;
});

const expression = gui.addFolder("Expression");
expression.add(options, 'expression').onFinishChange(val => {
  expressionFunction = math.compile(val)
  testFunc = function ( v, u, target ) {
    const x = u * (options.xmax - options.xmin) + options.xmin;
    const y = v * (options.ymax - options.ymin) + options.ymin;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
    } else {
      target.set( x, res, y);
    }
  };

  let funcGeometry;

  try{
    funcGeometry = new ParametricGeometry(testFunc, options.res, options.res);
  } catch(err) {
    alert(err)
    console.warn(err)
    window.location.href = window.location.origin
  }

  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube)
});

expression.add(options, 'res', 10, 2000).step(5).onFinishChange(val => {
  const funcGeometry = new ParametricGeometry(testFunc, val, val);
  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube)
});

const xvals = expression.addFolder("X Values");

xvals.add(options, 'xmax', 0, 100).onFinishChange(val => {
  testFunc = function ( v, u, target ) {
    const x = u * (val - options.xmin) + options.xmin;
    const y = v * (options.ymax - options.ymin) + options.ymin;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
    } else {
      target.set( x, res, y);
    }
  };
  const funcGeometry = new ParametricGeometry(testFunc, 1000, 1000);
  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube);

  planeGeometry = new PlaneGeometry(2 * Math.max(Math.abs(val), Math.abs(options.xmin)), 2 * Math.max(Math.abs(options.ymax), Math.abs(options.ymin)), 1, 1);
  scene.remove( plane );
  plane = new Mesh( planeGeometry, planeMaterial );
  scene.add( plane );
  plane.rotation.x = Math.PI / 2;
});

xvals.add(options, 'xmin', -100, 0).onFinishChange(val => {
  testFunc = function ( v, u, target ) {
    const x = u * (options.xmax - val) + val;
    const y = v * (options.ymax - options.ymin) + options.ymin;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
    } else {
      target.set( x, res, y);
    }
  };
  const funcGeometry = new ParametricGeometry(testFunc, 1000, 1000);
  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube)

  planeGeometry = new PlaneGeometry(2 * Math.max(Math.abs(options.xmax), Math.abs(val)), 2 * Math.max(Math.abs(options.ymax), Math.abs(options.ymin)), 1, 1);
  scene.remove( plane );
  plane = new Mesh( planeGeometry, planeMaterial );
  scene.add( plane );
  plane.rotation.x = Math.PI / 2;
});


const yvals = expression.addFolder("Y Values");

yvals.add(options, 'ymax', 0, 100).onFinishChange(val => {
  testFunc = function ( v, u, target ) {
    const x = u * (options.xmax - options.xmin) + options.xmin;
    const y = v * (val - options.ymin) + options.ymin;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
    } else {
      target.set( x, res, y);
    }
  };
  const funcGeometry = new ParametricGeometry(testFunc, 1000, 1000);
  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube);

  planeGeometry = new PlaneGeometry(2 * Math.max(Math.abs(options.xmax), Math.abs(options.xmin)), 2 * Math.max(Math.abs(val), Math.abs(options.ymin)), 1, 1);
  scene.remove( plane );
  plane = new Mesh( planeGeometry, planeMaterial );
  scene.add( plane );
  plane.rotation.x = Math.PI / 2;
});

yvals.add(options, 'ymin', -100, 0).onFinishChange(val => {
  testFunc = function ( v, u, target ) {
    const x = u * (options.xmax - options.xmin) + options.xmin;
    const y = v * (options.ymax - val) + val;
    const scope = {x, y}
    const res = expressionFunction.evaluate(scope);
    if (res.hasOwnProperty('re')) {
    } else {
      target.set( x, res, y);
    }
  };
  const funcGeometry = new ParametricGeometry(testFunc, 1000, 1000);
  const tempMesh = new Mesh(funcGeometry, material)
  scene.remove(cube)
  cube = tempMesh;
  scene.add(cube)

  planeGeometry = new PlaneGeometry(2 * Math.max(Math.abs(options.xmax), Math.abs(options.xmin)), 2 * Math.max(Math.abs(options.ymax), Math.abs(val)), 1, 1);
  scene.remove( plane );
  plane = new Mesh( planeGeometry, planeMaterial );
  scene.add( plane );
  plane.rotation.x = Math.PI / 2;
});

window.onresize = () => {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

(function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
})();
