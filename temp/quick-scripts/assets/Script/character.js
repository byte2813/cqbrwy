(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/character.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '33cd23uZ6JD4pTLpKtgjbbS', 'character', __filename);
// Script/character.js

"use strict";

cc.Class({
  extends: cc.Component,

  properties: {
    levelUp1: cc.Node,
    levelUp2: cc.Node,
    character: cc.Node,
    fail: cc.Node,
    dbArray: [dragonBones.DragonBonesAsset],
    textureArr: [dragonBones.DragonBonesAtlasAsset]
  },
  start: function start() {
    this.loadRes();
  },
  loadRes: function loadRes() {
    var _this = this;

    var self = this;

    var _loop = function _loop(i) {
      var nameSke = "db/sanxiao" + (i + 1 + '') + "_ske";
      var nameTex = "db/sanxiao" + (i + 1 + '') + "_tex";
      cc.loader.loadRes(nameSke, dragonBones.DragonBonesAsset, function (err, assert) {
        _this.dbArray[i] = assert;
      });
      cc.loader.loadRes(nameTex, dragonBones.DragonBonesAtlasAsset, function (err, texture) {
        _this.textureArr[i] = texture;
      });
    };

    for (var i = 0; i < 15; i++) {
      _loop(i);
    }
    //console.log('数据加载完毕')
  },
  onWalk: function onWalk(target) {
    target.playAnimation('walk', -1);
  },
  onLevelUp: function onLevelUp() {
    //this.levelUp2.getComponent(dragonBones.ArmatureDisplay).playAnimation('jump', -1)
  },
  onSuccessDialog: function onSuccessDialog(level) {
    // this.showCharacter(level - 1, this.levelUp1)
    this.showCharacter(level, this.levelUp2, true);
  },
  onLevelUpBtn: function onLevelUpBtn(level) {
    this.showCharacter(level);
  },
  onFail: function onFail(level) {
    this.showCharacter(level, this.fail);
  },
  initStartPage: function initStartPage() {},
  showCharacter: function showCharacter(level, target, jump) {
    target = target || this.character;
    var assert = target.getComponent(dragonBones.ArmatureDisplay);
    //  cc.log("before", assert)
    assert.destroy();
    //  console.log(level)
    var main = target.addComponent(dragonBones.ArmatureDisplay);
    main.dragonAsset = this.dbArray[level - 1];
    main.dragonAtlasAsset = this.textureArr[level - 1];
    main.armatureName = "Armature";
    main.timeScale = 0.5;
    // console.log("after", main)
    main.playAnimation(jump ? "jump" : "walk", -1);
    //this.onWalk(main)
  }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=character.js.map
        