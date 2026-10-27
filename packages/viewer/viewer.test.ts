import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ANATOMICAL_IMAGE} from './asset';
import {CATEGORY_META} from './categories';
import {ANATOMY_REGIONS,AnatomySelection,fitAnatomy,focusTransform} from './focus';

test('the full anatomical figure remains proportional and visible in narrow and wide frames',()=>{
  for(const [width,height] of [[280,440],[420,610],[900,500]]){
    const box=fitAnatomy(width,height,1024,1536);
    assert.ok(box.left>=0&&box.top>=0);
    assert.ok(box.left+box.width<=width+.000001);
    assert.ok(box.top+box.height<=height+.000001);
    assert.ok(Math.abs(box.width/box.height-1024/1536)<.000001);
    assert.deepEqual(focusTransform(null,box,width,height),{x:0,y:0,scale:1});
  }
  assert.deepEqual(fitAnatomy(0,440,1024,1536),{left:0,top:0,width:0,height:0});
});

test('every body region zooms to a visible, consistent focal point at every responsive size',()=>{
  for(const [width,height] of [[280,440],[420,610],[900,500]]){
    const box=fitAnatomy(width,height,1024,1536);
    for(const category of CATEGORY_META){
      const region=ANATOMY_REGIONS[category.id];
      const camera=focusTransform(category.id,box,width,height);
      assert.ok(camera.scale>1&&camera.scale<=3.5);
      assert.ok(region.x-region.width/2>=0&&region.x+region.width/2<=1);
      assert.ok(region.y-region.height/2>=0&&region.y+region.height/2<=1);
      assert.ok(Math.abs(box.left+camera.x+region.x*box.width*camera.scale-width*.5)<.000001,category.id+' centered horizontally');
      assert.ok(Math.abs(box.top+camera.y+region.y*box.height*camera.scale-height*.43)<.000001,category.id+' stays below the category heading');
    }
  }
});

test('hover and keyboard focus preview without losing a committed category or leaking across instances',()=>{
  const first=new AnatomySelection('brain');
  const other=new AnatomySelection('skin');
  first.hover('cardiovascular');
  assert.equal(first.active,'cardiovascular');
  assert.equal(first.selected,'brain');
  first.focus('immune');
  first.hover(null);
  assert.equal(first.active,'immune');
  first.focus(null);
  assert.equal(first.active,'brain');
  first.hover('digestive');
  first.commit('digestive');
  assert.equal(first.active,'digestive');
  assert.equal(first.preview,null);
  first.reset();
  assert.equal(first.active,null);
  assert.equal(other.active,'skin');
  first.setSelected('unknown-system');
  assert.equal(first.active,null);
});

test('the shared artwork is bundled locally so every connector renders the same complete image',()=>{
  assert.ok(ANATOMICAL_IMAGE.startsWith('data:image/png;base64,'));
  const png=Buffer.from(ANATOMICAL_IMAGE.split(',')[1],'base64');
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),1024);
  assert.equal(png.readUInt32BE(20),1536);
  assert.ok(png.length>100000,'the complete high-resolution artwork is included');
});
