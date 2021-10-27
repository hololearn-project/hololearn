const chai = require('chai');
const expect = chai.expect;
const mocha = require('mocha');
const describe = mocha.describe;
const THREE = require('three');
const modelling =
    require('../../public/javascripts/threejs-scripts/modelling.js');

const {subSample, thresh, imgWidth,
  imgLength, perWidth, perLength,
  initModel, initUV, initIndex,
  getBaseIndices, getScene, setModelType, getTeacherModel,
  setTeacherModel, okToModel, getTeacherX, setTeacherX,
  getAdvOpts, setAdvOpts, toggleAdvancedOptions} = modelling;


describe('modelling.initIndex', () => {
  it('should return an array of indicies', () => {
    expect(getBaseIndices()).to.equal(undefined);
    initIndex();
    expect(getBaseIndices().length).to.equal(
        (perWidth - 1) * (perLength - 1) * 6);
  });
});

describe('modelling.initUV', () => {
  it('should update the uv attribute of getTeacherModel()', () => {
    expect(getTeacherModel().getAttribute('uv')).to.equal(undefined);
    setTeacherModel(initUV());
    expect(getTeacherModel().getAttribute('uv').array.length)
        .to.equal(perWidth * perLength * 2);
  });
});

describe('modelling.initPoints', () => {
  it('should update the position attribute of getTeacherModel()', () => {
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    expect(getTeacherModel().getAttribute('position').array.length).to.equal(3);
    modelling.initPoints();
    expect(getTeacherModel().getAttribute('position').array.length)
        .to.equal(perWidth * perLength * 3);
  });
});

// describe('modelling.to1D', () => {
//   it('should convert 2d coordinates into a single 1d coordinate', () => {
//     expect(modelling.to1D(1, 10)).to.equal(1 + (perWidth * 10));
//   });
// });

describe('modelling.getUVx', () => {
  it('returns the corresponding x coordinate in normalized UV space', () => {
    expect(modelling.getUVx(100)).to.be.closeTo(100 / imgWidth, 0.005);
  });
});

describe('modelling.getUVy', () => {
  it('eturns the corresponding y coordinate in normalized UV space', () => {
    expect(modelling.getUVy(100))
        .to.be.closeTo((imgLength - 100) / imgLength, 0.005);
  });
});

describe('modelling.getDepth', () => {
  it('given (x,y) coordinates, returns the corresponding z coordinate', () => {
    expect(modelling.getDepth(1, 10)).to.equal((1 + (imgWidth * 10)) * 4);
  });
});

describe('modelling.filterIndices', () => {
  it(`returns an array of size = the size of 
  baseIndices if all z values are under the threshold`, () => {
    modelling.baseIndices = Array((perWidth - 1) * (perLength - 1) * 6).fill(0);
    const verts = Array(perWidth * perLength * 3).fill(255 - thresh - 1);
    const ret = modelling.filterIndices(verts);
    expect(ret.length).to.equal(modelling.baseIndices.length);
  });
  it(`returns an array if size = 0
  if no z values are under the threshold`, () => {
    modelling.baseIndices = Array((perWidth - 1) * (perLength - 1) * 6).fill(0);
    const verts = Array(perWidth * perLength * 3).fill(255 + thresh);
    const ret = modelling.filterIndices(verts);
    expect(ret.length).to.equal(0);
  });
  // it('returns an array if size <= the
  // size baseIndices if not all z values are under the threshold', () => {
  //     baseIndices = Array((perWidth - 1) * (perLength - 1) * 6).fill(0)
  //     const verts =
  //      Array(perWidth * perLength * 3).fill(255 + thresh, 0, perWidth)
  //      .fill(255 - thresh - 1, perWidth, perWidth * perLength * 3)
  //     const ret = modelling.filterIndices(verts)
  //     expect(ret.length).to.be.above(0).and.to.be.below(baseIndices.length)
  // })
});

describe('odelling.createMeshModel', () => {
  it('should update the position attribute of teacher model', () => {
    initModel();
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Float32Array([1, 1]), 2));
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    const prevPos = getTeacherModel().getAttribute('position');
    const verts = [];
    verts.push(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    verts.push(new Float32Array([0, 0, 0, 0, 0, 0]));

    modelling.createMeshModel(verts);
    const res = getTeacherModel().getAttribute('position');
    expect(prevPos).to.not.deep.equal(res);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
  it('should update the uv attribute of teacher model', () => {
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Float32Array([1, 1]), 2));
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    const prevUV = getTeacherModel().getAttribute('uv');
    const verts = [];
    verts.push(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    verts.push(new Float32Array([0, 0, 0, 0, 0, 0]));
    modelling.createMeshModel(verts);
    const res = getTeacherModel().getAttribute('uv');
    expect(prevUV).to.not.deep.equal(res);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
  it('should add a mesh to the scene', () => {
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Float32Array([1, 1]), 2));
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    const verts = [];
    const prevCount = getScene().children.length;
    verts.push(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    verts.push(new Float32Array([0, 0, 0, 0, 0, 0]));
    modelling.prevId = 0;
    modelling.createMeshModel(verts);
    const newCount = getScene().children.length;
    expect(newCount).to.be.above(prevCount);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
});

describe('modelling.createIndexedModel', () => {
  it('should update the position attribute of teacher model', () => {
    modelling.initPoints();
    modelling.points = getTeacherModel().getAttribute('position');
    const indices = new Uint32Array([]);
    const prevPos = modelling.points;
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    modelling.createIndexedModel(indices);

    const newPos = getTeacherModel().getAttribute('position');

    expect(newPos).to.not.equal(prevPos);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
  it('should update the index attribute of teacher model', () => {
    modelling.initPoints();
    modelling.points = getTeacherModel().getAttribute('position');
    const indices = new Uint32Array([]);
    expect(getTeacherModel().getAttribute('index')).to.equal(undefined);
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    modelling.createIndexedModel(indices);

    const newPos = getTeacherModel().getAttribute('position');

    expect(newPos).to.not.equal(undefined);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
  it('should add a mesh to the getScene()', () => {
    modelling.initPoints();
    const indices = new Uint32Array([]);
    const prevCount = getScene().children.length;
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Float32Array([-1, -1, -1]), 3));
    modelling.prevId = 0;
    modelling.createIndexedModel(indices);
    const newCount = getScene().children.length;
    expect(newCount).to.be.above(prevCount);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
});

describe('modelling.createPointCloudModel', () => {
  it('should add a mesh to the getScene()', () => {
    const prevCount = getScene().children.length;
    modelling.prevId = 0;
    console.log('starting');
    modelling.createPointCloudModel();
    const newCount = getScene().children.length;
    console.log('done');
    expect(newCount).to.be.above(prevCount);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
});

describe('modelling.updatePoints', () => {
  it(`should return an array of size equal to the size 
  of the position attribute of getTeacherModel()`, () => {
    const len = imgLength * imgWidth * 3 / subSample;
    const arr = new Uint32Array(Array(len).fill(255));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(arr, 3));

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');
    const res = modelling.updatePoints(dctx);

    expect(res.length).to.equal(len);
  });
});

describe('modelling.updatePointsAndColors', () => {
  it('should update the position attribute of getTeacherModel()', () => {
    const len = imgLength * imgWidth * 3 / subSample;
    const arr = new Uint32Array(Array(len).fill(255));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(arr, 3));

    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    const canvas2 = document.createElement('canvas');
    canvas2.width = imgWidth;
    canvas2.height = imgLength;
    const ctx = canvas.getContext('2d');

    modelling.updatePointsAndColors(dctx, ctx);
    const res = getTeacherModel().getAttribute('position').array;
    expect(res.length).to.equal(len);
  });
  it('should update the color attribute of getTeacherModel()', () => {
    const len = imgLength * imgWidth * 3 / subSample;
    const arr = new Uint32Array(Array(len).fill(255));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(arr, 3));
    const prevColor = new Uint32Array([]);

    getTeacherModel().setAttribute('color',
        new THREE.BufferAttribute(prevColor, 3));
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    const canvas2 = document.createElement('canvas');
    canvas2.width = imgWidth;
    canvas2.height = imgLength;
    const ctx = canvas.getContext('2d');

    modelling.updatePointsAndColors(dctx, ctx);
    const res = getTeacherModel().getAttribute('color').array;
    expect(res).to.not.deep.equal(prevColor);
  });
});

describe('modelling.initTriangles', () => {
  it('should return an array containing two other arrays', () => {
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    const res = modelling.initTriangles(dctx);
    expect(res.length).to.equal(2);
    expect(typeof res[0]).to.equal(typeof new Float32Array());
    expect(typeof res[1]).to.equal(typeof new Float32Array());
  });

  it(`the first array should be of size ((imgWidth - subSample)/subSample)
  * ((imgLength - subSample)/subSample) * 3 * 6`, () => {
    const a = Math.ceil((imgWidth - subSample) / subSample);
    const b = Math.ceil((imgLength - subSample) / subSample);
    const len = a * b * 18;
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    const res = modelling.initTriangles(dctx);
    expect(res[0].length).to.equal(len);
  });

  it(`the second array should be of size ((imgWidth - subSample)/subSample)
  * ((imgLength - subSample)/subSample) * 2 * 6`, () => {
    const a = Math.ceil((imgWidth - subSample) / subSample);
    const b = Math.ceil((imgLength - subSample) / subSample);
    const len = a * b * 12;
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    const res = modelling.initTriangles(dctx);
    expect(res[1].length).to.equal(len);
  });
});

// describe('modelling.modelFromPoints', () => {
//     initKernels()
//     it('should add a mesh to the getScene()', () => {
//         const count = getScene().children.length

//         const canvas = document.createElement('canvas')
//         canvas.width = imgWidth
//         canvas.height = imgLength
//         const dctx = canvas.getContext('2d')

//         const canvas2 = document.createElement('canvas')
//         canvas2.width = imgWidth
//         canvas2.height = imgLength
//         const ctx = canvas.getContext('2d')

//         modelling.prevId = 0
//         modelling.modelFromPoints(dctx, ctx)
//         const newCount = getScene().children.length
//         expect(newCount).to.equal(count + 1)
//     })
//     it('should update the position attribute of getTeacherModel()', () => {
//         const prev = new Uint32Array([])
//         getTeacherModel().setAttribute('position',
//            new THREE.BufferAttribute(prev, 3))

//         const canvas = document.createElement('canvas')
//         canvas.width = imgWidth
//         canvas.height = imgLength
//         const dctx = canvas.getContext('2d')

//         const canvas2 = document.createElement('canvas')
//         canvas2.width = imgWidth
//         canvas2.height = imgLength
//         const ctx = canvas.getContext('2d')

//         modelling.prevId = 0
//         modelling.modelFromPoints(dctx, ctx)
//         const newPos = getTeacherModel().getAttribute('position')
//         expect(newPos).to.not.equal(prev)
//     })
//     it('should update the color attribute of getTeacherModel()', () => {
//         const prev = new Uint32Array([])
//         getTeacherModel().setAttribute('color',
//         new THREE.BufferAttribute(prev, 3))

//         const canvas = document.createElement('canvas')
//         canvas.width = imgWidth
//         canvas.height = imgLength
//         const dctx = canvas.getContext('2d')

//         const canvas2 = document.createElement('canvas')
//         canvas2.width = imgWidth
//         canvas2.height = imgLength
//         const ctx = canvas.getContext('2d')

//         modelling.prevId = 0
//         modelling.modelFromPoints(dctx, ctx)
//         const newCol = getTeacherModel().getAttribute('color')
//         expect(newCol).to.not.equal(prev)
//     })
// })

describe('modelling.modelFromTriangles', () => {
  it('should add a new mesh to the getScene()', () => {
    const count = getScene().children.length;
    const canvas = document.createElement('canvas');
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');
    const texture = new THREE.Texture();

    modelling.prevId = 0;
    modelling.modelFromTriangles(dctx, texture);

    const newCount = getScene().children.length;
    expect(newCount).to.equal(count + 1);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
});

describe('modelling.modelFromIndexes', () => {
  it('should add a new mesh to the getScene()', () => {
    const count = getScene().children.length;
    const canvas = document.createElement('canvas');
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);
    canvas.width = imgWidth;
    canvas.height = imgLength;
    const dctx = canvas.getContext('2d');

    modelling.prevId = 0;
    modelling.modelFromIndexes(dctx);

    const newCount = getScene().children.length;
    expect(newCount).to.equal(count + 1);
    document.body.removeChild(element);
    const toRemove = getScene().getObjectByName('toRemove');
    getScene().remove(toRemove);
  });
});


describe('modelling.createModel', () => {
  const canvas = document.createElement('canvas');
  canvas.id = '2d';
  canvas.width = imgWidth;
  canvas.height = imgLength;
  const dctx = canvas.getContext('2d');

  const canvas2 = document.createElement('canvas');
  canvas2.width = imgWidth;
  canvas2.height = imgLength;
  const ctx = canvas.getContext('2d');


  it(`should create a mesh model without indexes when 
  given "mesh" as an argument for type`, () => {
    const vidElement = document.createElement('video');
    vidElement.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(vidElement);

    const depElement = document.createElement('video');
    depElement.setAttribute('id', 'lidarVideoStream2');
    document.body.appendChild(depElement);

    getTeacherModel().setAttribute('index',
        new THREE.BufferAttribute(new Uint32Array([]), 1));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Uint32Array([]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Uint32Array([]), 2));
    setModelType('mesh');
    modelling.createModel(dctx, ctx, canvas, canvas2);

    expect(getTeacherModel().getAttribute('index').array.length).to.equal(0);
    expect(getTeacherModel().getAttribute('position').array.length)
        .to.not.equal(0);
    expect(getTeacherModel().getAttribute('uv').array.length).to.not.equal(0);

    document.body.removeChild(vidElement);
    document.body.removeChild(depElement);
  });
  it(`should create a mesh model with indexes when given
  "index" as an argument for type`, () => {
    const vidElement = document.createElement('video');
    vidElement.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(vidElement);

    const depElement = document.createElement('video');
    depElement.setAttribute('id', 'lidarVideoStream2');
    document.body.appendChild(depElement);

    const verts = Array(perWidth * perLength * 3).fill(255 - thresh - 1);

    getTeacherModel()
        .setIndex(new THREE.BufferAttribute(new Uint32Array(verts), 1));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Uint32Array([1, 2, 3, 4]), 3));
    getTeacherModel().setAttribute(
        'uv', new THREE.BufferAttribute(new Uint32Array([1, 2, 3]), 2));
    setModelType('index');
    modelling.createModel(dctx, ctx, canvas, canvas2);

    document.body.removeChild(vidElement);
    document.body.removeChild(depElement);

    expect(getTeacherModel().getAttribute('index').array.length).to.equal(0);
    expect(getTeacherModel().getAttribute('position').array.length).to.equal(4);
    expect(getTeacherModel().getAttribute('uv').array.length).to.equal(3);
  });
  it(`should create a point cloud model with indexes
  when given "point cloud" as an argument for type`, () => {
    const vidElement = document.createElement('video');
    vidElement.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(vidElement);

    const depElement = document.createElement('video');
    depElement.setAttribute('id', 'lidarVideoStream2');
    document.body.appendChild(depElement);

    const verts = Array(perWidth * perLength * 3).fill(255 - thresh - 1);

    getTeacherModel().setIndex(
        new THREE.BufferAttribute(new Uint32Array(verts), 1));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Uint32Array([1, 2, 3, 4]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Uint32Array([1, 2, 3]), 2));
    setModelType('point cloud');
    modelling.createModel(dctx, ctx, canvas, canvas2);

    document.body.removeChild(vidElement);
    document.body.removeChild(depElement);

    expect(getTeacherModel().getAttribute('index').array.length).to.equal(0);
    expect(getTeacherModel().getAttribute('position').array[0]).to.not.equal(1);
    expect(getTeacherModel().getAttribute('uv').array.length).to.equal(3);
  });
});


describe('modelling.getPictureVideo', () => {
  it('should return the html element with the Id lidarVideoStream1', () => {
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream1');
    document.body.appendChild(element);

    const res = modelling.getPictureVideo();

    expect(res).to.equal(element);
    document.body.removeChild(element);
  });
});

describe('modelling.getDepthVideo', () => {
  it('should return the html element with the Id lidarVideoStream2', () => {
    const element = document.createElement('video');
    element.setAttribute('id', 'lidarVideoStream2');
    document.body.appendChild(element);

    const res = modelling.getDepthVideo();

    expect(res).to.equal(element);
    document.body.removeChild(element);
  });
});

describe('modelling.okToModel', () => {
  it(`should return 2 if both getPictureVideo and 
    getDepthVideo return videos with duration > 0`, () => {
    const element1 = document.createElement('video');
    const element2 = document.createElement('video');

    const source = document.createElement('source');
    source.setAttribute('src', 'https://youtu.be/rXuasgbBetc');
    element1.innerHTML = source.outerHTML;
    element2.innerHTML = source.outerHTML;

    element1.setAttribute('id', 'lidarVideoStream1');
    element2.setAttribute('id', 'lidarVideoStream2');

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    element1.autoplay = true;
    element2.autoplay = true;

    const newEl = modelling.getPictureVideo();
    newEl.onloadedmetadata = function() {
      const ok = okToModel();
      expect(ok).to.equal(2);
    };


    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });

  it(`should return 1 if only getPictureVideo 
  returns a video with duration > 0`, () => {
    const element1 = document.createElement('video');
    const element2 = document.createElement('video');

    element1.setAttribute('id', 'lidarVideoStream1');
    element2.setAttribute('id', 'lidarVideoStream2');

    const source = document.createElement('source');
    source.setAttribute('src', 'https://youtu.be/rXuasgbBetc');
    element1.innerHTML = source.outerHTML;

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    const newEl = modelling.getPictureVideo();
    newEl.onloadedmetadata = function() {
      const ok = okToModel();
      expect(ok).to.equal(1);
    };
    document.body.removeChild(element1);
  });

  it(`should return 0 if neither getPictureVideo or
  getDepthVideo returns a video with duration > 0`, () => {
    const element1 = document.createElement('video');
    const element2 = document.createElement('video');

    element1.setAttribute('id', 'lidarVideoStream1');
    element2.setAttribute('id', 'lidarVideoStream2');

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    const newEl = modelling.getPictureVideo();
    newEl.onloadedmetadata = function() {
      const ok = okToModel();
      expect(ok).to.equal(0);
    };
    document.body.removeChild(element1);
  });
});

describe('modelling.animateTeacher', () => {
  const canvas = document.createElement('canvas');
  canvas.id = '2d';
  canvas.width = imgWidth;
  canvas.height = imgLength;
  const dctx = canvas.getContext('2d');

  const canvas2 = document.createElement('canvas');
  canvas2.width = imgWidth;
  canvas2.height = imgLength;
  const ctx = canvas.getContext('2d');

  it(`should create a mesh model and add it to
  the scene if okToModel returns 2`, () => {
    const element1 = document.createElement('video');
    const element2 = document.createElement('video');

    element1.setAttribute('id', 'lidarVideoStream1');
    element2.setAttribute('id', 'lidarVideoStream2');

    const source = document.createElement('source');
    source.setAttribute('src', 'https://youtu.be/rXuasgbBetc');
    element1.innerHTML = source.outerHTML;
    element2.innerHTML = source.outerHTML;

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    initModel();
    const prevCount = getScene().children.length;

    getTeacherModel().setAttribute('index',
        new THREE.BufferAttribute(new Uint32Array([]), 1));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Uint32Array([]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Uint32Array([]), 2));

    const newEl = modelling.getPictureVideo();
    newEl.onloadedmetadata = function() {
      modelling.animateTeacher(dctx, ctx, canvas, canvas2);

      const newCount = getScene().children.length;

      expect(newCount).to.be.above(prevCount);
      document.body.removeChild(element1);
      document.body.removeChild(element2);
      const toRemove = getScene().getObjectByName('toRemove');
      getScene().remove(toRemove);
    };
  });

  it('should not create a model if okToModel returns 1 or 0', () => {
    const element1 = document.createElement('video');
    const element2 = document.createElement('video');

    element1.setAttribute('id', 'lidarVideoStream1');
    element2.setAttribute('id', 'lidarVideoStream2');

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    initModel();
    const prevCount = getScene().children.length;

    getTeacherModel().setAttribute('index',
        new THREE.BufferAttribute(new Uint32Array([]), 1));
    getTeacherModel().setAttribute('position',
        new THREE.BufferAttribute(new Uint32Array([]), 3));
    getTeacherModel().setAttribute('uv',
        new THREE.BufferAttribute(new Uint32Array([]), 2));

    const newEl = modelling.getPictureVideo();
    newEl.onloadedmetadata = function() {
      modelling.animateTeacher(dctx, ctx, canvas, canvas2);

      const newCount = getScene().children.length;

      expect(newCount).to.equal(prevCount);
      document.body.removeChild(element1);
      document.body.removeChild(element2);
      const toRemove = getScene().getObjectByName('toRemove');
      getScene().remove(toRemove);
    };
  });
});


describe('modelling.updateSubSample', () => {
  it('should update the subSample, perWidth and perLength vars', () => {
    const element1 = document.createElement('slider');
    element1.setAttribute('value', '10');
    element1.setAttribute('id', 'subSampleRange');

    const prevValue = '5';
    const element2 = document.createElement('p');
    element2.setAttribute('value', prevValue);
    element2.setAttribute('id', 'subSampleVal');

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    modelling.updateSubSample();
    const newValue = document.getElementById('subSampleVal').value;
    expect(newValue).to.not.equal(prevValue);
    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });
});


describe('modelling.updateType', () => {
  it('should update the modelType', () => {
    const prevType = 'mesh';
    modelling.setModelType(prevType);

    const newType = 'index';
    const element1 = document.createElement('select');
    element1.setAttribute('id', 'modelType');
    element1.setAttribute('value', newType);
    document.body.appendChild(element1);


    modelling.updateType();
    const actualNewType = document.getElementById('modelType').value;
    expect(actualNewType).to.not.equal(prevType);
    document.body.removeChild(element1);
  });
});

describe('modelling.updateModelPos', () => {
  it('should update the x position const of the teacher model', () => {
    const prevX = 20;
    setTeacherX(prevX);
    const element1 = document.createElement('slider');
    element1.setAttribute('value', '10');
    element1.setAttribute('id', 'modelPosRange');

    const element2 = new THREE.Object3D();
    element2.name = 'toRemove';
    getScene().add(element2);

    document.body.appendChild(element1);

    modelling.updateModelPos();
    const newValue = getTeacherX();
    expect(newValue).to.not.equal(prevX);
    document.body.removeChild(element1);
    getScene().remove(element2);
  });
});


describe('modelling.toggleAdvancedOptions', () => {
  it(`should set display of the advancedOptionsDiv 
  to none if advOpts is true`, () => {
    setAdvOpts(true);

    const element1 = document.createElement('div');
    element1.setAttribute('id', 'advancedOptionsDiv');
    element1.style.display = 'block';

    const element2 = document.createElement('button');
    element2.setAttribute('id', 'advOptBtn');
    element2.style.display = 'block';

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    toggleAdvancedOptions();

    expect(getAdvOpts()).to.equal(false);

    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });

  it(`should set display of the advancedOptionsDiv 
  to block if advOpts is false`, () => {
    setAdvOpts(false);

    const element1 = document.createElement('div');
    element1.setAttribute('id', 'advancedOptionsDiv');
    element1.style.display = 'block';

    const element2 = document.createElement('button');
    element2.setAttribute('id', 'advOptBtn');
    element2.style.display = 'block';

    document.body.appendChild(element1);
    document.body.appendChild(element2);

    toggleAdvancedOptions();

    expect(getAdvOpts()).to.equal(true);

    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });
});
