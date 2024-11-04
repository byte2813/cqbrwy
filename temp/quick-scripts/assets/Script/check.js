(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/check.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'a3721/aOY1GFrIWHHBzYGsi', 'check', __filename);
// Script/check.js

'use strict';

/**
 * @author uu
 * @file 检测组件
 */
cc.Class({
  extends: cc.Component,
  properties: {
    groups: [],
    map: [],
    mapLength: 8
  },
  init: function init(g) {
    this._game = g;
    this.map = g.map;
    this.mapLength = g.rowNum;
    for (var i = 0; i < this.mapLength; i++) {
      //行
      this.groups[i] = [];
      for (var j = 0; j < this.mapLength; j++) {
        //列
        // this.map[i][j].getComponent('cell').growInit() //全部初始化
        if (!this.map[i][j]) {
          //    cc.log('报错x,y:', i, j)
        }
        this.map[i][j].getComponent('cell').isSingle = false;
        this.map[i][j].getComponent('cell').warningInit();
        this.groups[i][j] = [];
      }
    }
  },
  check: function check(g) {
    //该函数主要用于检测一个区块能否形成道具等
    var propConfig = g._controller.config.json.propConfig;
    this._game = g;
    this.map = g.map;
    this.mapLength = g.rowNum;
    var min = 999;
    for (var i = 0; i < propConfig.length; i++) {
      min = propConfig[i].min < min ? propConfig[i].min : min;
    }
    for (var _i = 0; _i < this.mapLength; _i++) {
      //行
      for (var j = 0; j < this.mapLength; j++) {
        //列
        this.pushPop(this.map[_i][j], _i, j);
        var target = this.map[_i][j];
        var x = target.getComponent('cell').iid;
        var y = target.getComponent('cell').jid;
        var isSingle = true;
        if (x - 1 >= 0 && this.map[x - 1][y].getComponent('cell').color == target.getComponent('cell').color) {
          isSingle = false;
        }
        if (x + 1 < this.mapLength && this.map[x + 1][y].getComponent('cell').color == target.getComponent('cell').color) {
          isSingle = false;
        }

        if (y - 1 >= 0 && this.map[x][y - 1].getComponent('cell').color == target.getComponent('cell').color) {
          isSingle = false;
        }
        if (y + 1 < this.mapLength && this.map[x][y + 1].getComponent('cell').color == target.getComponent('cell').color) {
          isSingle = false;
        }
        this.map[_i][j].getComponent('cell').isSingle = isSingle;
        // console.log(i, j, this.map[i][j].getComponent('cell').isSingle, this.map[i][j].getComponent('cell').color)
        if (this.groups[_i][j].length >= min) {
          for (var z = 0; z < propConfig.length; z++) {
            if (this.groups[_i][j].length <= propConfig[z].max && this.groups[_i][j].length >= propConfig[z].min) {
              this.warning(propConfig[z].type, this.groups[_i][j]);
            }
          }
        }
      }
    }
  },
  pushPop: function pushPop(target, i, j) {
    //用于判断一个方块四个方向上的方块颜色是否一样 如果一样则加入组 如果组长度小于1则返回false?
    // if (target.getComponent('cell').isPush==true) {
    //   return
    // }
    target.getComponent('cell').isPush = true;
    this.groups[i][j].push(target);
    var x = target.getComponent('cell').iid;
    var y = target.getComponent('cell').jid;
    if (x - 1 >= 0) {
      if (!this.map[x - 1][y].getComponent('cell').isPush && this.map[x - 1][y].getComponent('cell').color == target.getComponent('cell').color) {
        this.pushPop(this.map[x - 1][y], i, j);
      }
    }
    if (x + 1 < this.mapLength) {
      if (!this.map[x + 1][y].getComponent('cell').isPush && this.map[x + 1][y].getComponent('cell').color == target.getComponent('cell').color) {
        this.pushPop(this.map[x + 1][y], i, j);
      }
    }
    if (y - 1 >= 0) {
      if (!this.map[x][y - 1].getComponent('cell').isPush && this.map[x][y - 1].getComponent('cell').color == target.getComponent('cell').color) {
        this.pushPop(this.map[x][y - 1], i, j);
      }
    }
    if (y + 1 < this.mapLength) {
      if (!this.map[x][y + 1].getComponent('cell').isPush && this.map[x][y + 1].getComponent('cell').color == target.getComponent('cell').color) {
        this.pushPop(this.map[x][y + 1], i, j);
      }
    }

    // 判断方块是否单身
  },
  warning: function warning(type, group) {
    group.map(function (item) {
      item.getComponent('cell').onWarning(type);
    });
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
        //# sourceMappingURL=check.js.map
        