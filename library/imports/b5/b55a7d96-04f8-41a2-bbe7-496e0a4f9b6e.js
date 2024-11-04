"use strict";
cc._RF.push(module, 'b55a72WBPhBorvnSW4KT5tu', 'startPage');
// Script/startPage.js

"use strict";

/**
 * @author uu
 * @file 开始页面控制
 */
cc.Class({
  extends: cc.Component,
  properties: {
    bannerNode: cc.Node,
    labelNode: cc.Node
  },
  start: function start() {},
  onTouched: function onTouched() {},
  showAnimation: function showAnimation() {
    var _this = this;

    return new Promise(function (resolve, rejects) {
      var action1 = cc.scaleTo(0.5, 0, 0).easing(cc.easeBackIn());
      var action2 = cc.blink(0.5, 3);
      _this.bannerNode.runAction(action1);
      var action = cc.sequence(action2, cc.callFunc(function () {
        resolve();
      }));
      _this.labelNode.runAction(action);
    });
  }
});

cc._RF.pop();