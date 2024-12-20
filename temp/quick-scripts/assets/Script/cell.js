(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/cell.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'dbc3cQxtHpPj77TncyB18gQ', 'cell', __filename);
// Script/cell.js

'use strict';

/**
 * @author uu
 * @file 单个方块控制
 */
cc.Class({
  extends: cc.Component,
  properties: {
    _status: 0, //1为可触发点击 2为已经消失
    _itemType: 0, //新增道具功能 1为双倍倍数 2为炸弹
    warningSprite: cc.Sprite,
    lightSprite: cc.Sprite
  },
  init: function init(g, data, width, itemType, pos) {
    this._game = g;
    this._status = 1;
    if (pos) {
      //cc.log('生成的方块', pos)
    }
    pos = pos || {
      x: data.x,
      y: data.y
    };
    this._itemType = itemType || 0;
    this.warningType = 0;
    this.isPush = false;
    this.bindEvent();
    this.color = data.color || Math.ceil(Math.random() * 4);
    this.colorSprite = this.node.getChildByName('color').getComponent(cc.Sprite);
    this.colorSprite.spriteFrame = itemType ? g.propSpriteFrame[(itemType - 1) * 4 + this.color - 1] : this._game.blockSprite[this.color - 1];
    this.warningSprite.spriteFrame = '';
    this._width = width;
    this._controller = g._controller;
    // 计算宽
    this.lightSprite.node.active = false;
    //  this.lightSprite.spriteFrame = this._game.blockSprite[this.color - 1]
    this.node.width = this.node.height = width;
    this.startTime = data.startTime;
    this.iid = data.y;
    this.jid = data.x;
    // console.log('生成方块位置', data.y, data.x)
    this.node.x = -(730 / 2 - g.gap - width / 2) + pos.x * (width + g.gap);
    this.node.y = 730 / 2 - g.gap - width / 2 - pos.y * (width + g.gap);
    this.node.rotation = 0;
    this.playStartAction();
  },
  changeItemType: function changeItemType(type) {
    this._itemType = type;
    this.colorSprite.spriteFrame = type ? this._game.propSpriteFrame[(type - 1) * 4 + this.color - 1] : this._game.blockSprite[this.color - 1];
  },
  onWarning: function onWarning(type) {
    this.warningSprite.spriteFrame = this._game.warningSpriteFrame[type - 1] || '';
    this.warningType = type;
    //   this.lightSprite.node.active = true
    var action1 = cc.blink(1, 10);
    //   this.lightSprite.node.runAction(action1)
  },
  warningInit: function warningInit() {
    this.warningSprite.spriteFrame = '';
    //  this.lightSprite.node.active = false
    this.isPush = false;
  },
  growInit: function growInit() {
    this.growType = 0;
    this.colorSprite.node.height = this.colorSprite.node.width = this._width;
    this.colorSprite.node.y = this.colorSprite.node.x = 0;
  },
  grow: function grow(type) {
    //1234 上下左右
    switch (type) {
      case 1:
        if (this.growType != 2) {
          this.colorSprite.node.height += this._game.gap * 2;
          this.colorSprite.node.y += this._game.gap;
          this.growType = 1;
        }
        break;
      case 2:
        if (this.growType != 2) {
          this.colorSprite.node.height += this._game.gap * 2;
          this.colorSprite.node.y -= this._game.gap;
          this.growType = 1;
        }
        break;
      case 3:
        if (this.growType != 1) {
          this.colorSprite.node.width += this._game.gap * 2;
          this.colorSprite.node.x -= this._game.gap;
          this.growType = 2;
        }
        break;
      case 4:
        if (this.growType != 1) {
          this.colorSprite.node.width += this._game.gap * 2;
          this.colorSprite.node.x += this._game.gap;
          this.growType = 2;
        }
        break;
    }
  },
  bindEvent: function bindEvent() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouched, this);
  },

  // 用户点击 或者被其他方块触发
  onTouched: function onTouched(color, isChain, isBomb, time) {
    var _this = this;

    //道具新增参数 isChain是否连锁 isBomb是否强制消除
    if (time) {
      setTimeout(function () {
        _this.onTouched(color, false, isBomb);
      }, time);
      return;
    }
    isChain = JSON.stringify(isChain) == 'null' ? true : isChain;
    isBomb = isBomb ? isBomb : false;
    color = color || this.color;
    var self = this;
    // 爆炸触发
    if (this._status == 1 && isBomb == true) {
      this._status = 2;
      this.playDieAction().then(function () {
        _this.onBlockPop(color, isChain, isBomb);
      });
      return;
    }

    if (color.type) {
      // 一定是用户主动触发 保存这个坐标给game
      if (this.isSingle && this._itemType <= 1) {
        this.node.scale = 1;
        this._game._score.tipBox.init(this._game._score, 3);
        var action1 = cc.scaleTo(0.1, 1.1, 0.9);
        var action2 = cc.scaleTo(0.3, 1).easing(cc.easeBackOut(2.0));
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
        return;
      }
      // console.log('方块位置', this.iid, this.jid, this._itemType)
      color = this.color;
      if (this._status == 1 && this._game._status == 1 && this.color == color) {
        this._game.onUserTouched(this.iid, this.jid, this._itemType, this.color, this.warningType, {
          x: this.node.x,
          y: this.node.y
        });
        this._game._score.onStep(-1).then(function (res) {
          if (res) {
            _this.playDieAction().then(function () {
              _this.onBlockPop(color, null, null);
            });
          }
        });
      }
    } else {
      // 由其他方块触发
      if (this._status == 1 && this._game._status == 5 && this.color == color) {
        this.playDieAction().then(function () {
          _this.onBlockPop(color, null, null);
        });
      }
    }
  },
  onBlockPop: function onBlockPop(color, isChain, isBomb) {
    var self = this;
    isChain = JSON.stringify(isChain) == 'null' ? true : isChain;
    isBomb = isBomb ? isBomb : false;
    self._game.checkNeedFall();
    self._game._status = 5;
    self._controller.musicMgr.onPlayAudio(0
    //self._game._score.chain - 1
    );
    if (this._itemType != 0) {
      // console.log("触发了道具", this._itemType)

      self._game.onItem(this._itemType, this.color, {
        x: this.node.x,
        y: this.node.y
      });
    }
    self._game._score.addScore(cc.v2(this.node.x, this.node.y - this.node.width + this._game.gap), this._itemType == 3 ? this._game._controller.config.json.propConfig[2].score : null);

    // 连锁状态
    if (isChain) {
      if (self.iid - 1 >= 0) {
        self._game.map[self.iid - 1][self.jid].getComponent('cell').onTouched(color);
      }
      if (self.iid + 1 < this._game.rowNum) {
        self._game.map[self.iid + 1][self.jid].getComponent('cell').onTouched(color);
      }
      if (self.jid - 1 >= 0) {
        self._game.map[self.iid][self.jid - 1].getComponent('cell').onTouched(color);
      }
      if (self.jid + 1 < this._game.rowNum) {
        self._game.map[self.iid][self.jid + 1].getComponent('cell').onTouched(color);
      }
    }
  },
  playFallAction: function playFallAction(y, data) {
    var _this2 = this;

    //下降了几个格子
    this._status = 0;
    if (data) {
      this.iid = data.y;
      this.jid = data.x;
    }
    var action = cc.moveBy(0.25, 0, -y * (this._game.gap + this._game.blockWidth)).easing(cc.easeBounceOut(5 / y)); //1 * y / this._game.animationSpeed
    var seq = cc.sequence(action, cc.callFunc(function () {
      _this2._status = 1;
      //  this._game.checkNeedGenerator()
    }, this));
    this.node.runAction(seq);
  },
  playStartAction: function playStartAction() {
    var _this3 = this;

    this.node.scaleX = 0;
    this.node.scaleY = 0;
    var action = cc.scaleTo(0.8 / this._game.animationSpeed, 1, 1).easing(cc.easeBackOut());
    var seq = cc.sequence(action, cc.callFunc(function () {
      _this3._status = 1;
    }, this));
    // 如果有延迟时间就用延迟时间
    if (this.startTime) {
      setTimeout(function () {
        _this3.node.runAction(seq);
      }, this.startTime / 1
      // (cc.game.getFrameRate() / 60)
      );
    } else {
      this.node.runAction(seq);
    }
  },
  playDieAction: function playDieAction() {
    var _this4 = this;

    var self = this;
    clearTimeout(this.surfaceTimer);
    this.node.stopAllActions();
    this._status = 2;
    this.node.scaleX = 1;
    this.node.scaleY = 1;
    return new Promise(function (resolve, reject) {
      var action = void 0;
      if (_this4.warningSprite.spriteFrame) {
        //有道具预警
        var action1 = cc.scaleTo(0.2 / self._game.animationSpeed, 1.1);
        var action2 = cc.moveTo(0.2 / self._game.animationSpeed, _this4._game.target.x, _this4._game.target.y);
        var action3 = cc.scaleTo(0.2, 0);
        var seq = cc.sequence(action1, cc.callFunc(function () {
          resolve('');
        }, _this4), cc.spawn(action2, action3));
      } else {
        action = cc.scaleTo(0.2 / self._game.animationSpeed, 0, 0);
        var seq = cc.sequence(action, cc.callFunc(function () {
          resolve('');
        }, _this4));
      }
      self.node.runAction(seq);
    });
  },
  surfaceAction: function surfaceAction(dela) {
    var _this5 = this;

    this.surfaceTimer = setTimeout(function () {
      var action = cc.scaleTo(0.4 / _this5._game.animationSpeed, 0.8, 0.8);
      var action1 = cc.scaleTo(0.4 / _this5._game.animationSpeed, 1, 1);
      _this5.node.runAction(cc.sequence(action, action1));
    }, dela);
  },
  generatePropAction: function generatePropAction() {},
  generateItem: function generateItem(type) {
    this._itemType = type;
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
        //# sourceMappingURL=cell.js.map
        