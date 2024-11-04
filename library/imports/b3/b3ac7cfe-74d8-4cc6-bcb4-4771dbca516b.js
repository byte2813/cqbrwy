"use strict";
cc._RF.push(module, 'b3ac7z+dNhMxry0R3HbylFr', 'scoreParticle');
// Script/scoreParticle.js

"use strict";

cc.Class({
  extends: cc.Component,

  properties: {
    particle: cc.ParticleSystem
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},
  init: function init(s, pos, time) {
    var _this = this;

    this._score = s;
    this.node.x = pos.x;
    this.node.y = pos.y;
    this.node.active = true;
    // this.particle.resetSystem()
    this.node.scale = 1;
    setTimeout(function () {
      _this.node.active = false;
      _this.particle.stopSystem();
      //  s.scoreParticlePool.put(this.node)
    }, time / 1
    //(cc.game.getFrameRate() / 60)
    );
  }

  // update (dt) {},

});

cc._RF.pop();