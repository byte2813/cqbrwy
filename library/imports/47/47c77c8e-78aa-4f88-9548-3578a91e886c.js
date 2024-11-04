"use strict";
cc._RF.push(module, '47c77yOeKpPiJVINXipHohs', 'game');
// Script/game.js

'use strict';

/**
 * @author uu
 * @file 游戏控制
 */
var AC = require('action');
cc.Class({
	extends: cc.Component,
	properties: {
		_status: 0, //0 未开始 1 游戏开始 2 游戏暂停 3 游戏结束 4 下落状态 5无法触摸状态
		blockPrefab: cc.Prefab,
		blockSprite: [cc.SpriteFrame], //todo: 换成动态生成 暂不处理
		warningSpriteFrame: [cc.SpriteFrame],
		propSpriteFrame: [cc.SpriteFrame],
		checkMgr: require("check"),
		revivePage: cc.Node,
		tutorialNode: cc.Node,
		shareBtn: cc.Node,
		shareSuccessDialog: cc.Node
	},
	start: function start() {
		this.bindNode();
		this.generatePool();
		this.loadRes();
	},
	loadRes: function loadRes() {},
	init: function init(c) {
		this._controller = c;
		this._score = c.scoreMgr;
		this.rowNum = c.config.json.rowNum;
		this.gap = c.config.json.gap;
		this.animationSpeed = c.config.json.gap;
		this.blockWidth = (730 - (this.rowNum + 1) * this.gap) / this.rowNum;
		this.reviveTimer = null;
		this.tutorialNode.active = false;
		this.isWeChat = this._controller.social.node.active;
		this.shareSuccessDialog.active = false;
		//console.log(this.gap)
		//console.log(this.blockWidth)
	},

	// 动态获取需要动态控制的组件
	bindNode: function bindNode() {
		this.blocksContainer = this.node.getChildByName('map');
	},

	//---------------- 游戏控制 ---------------------
	// 游戏开始
	gameStart: function gameStart() {
		var _this = this;

		this.recoveryAllBlocks().then();
		this.shareBtn.active = true;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			this._controller.social.hasShared = false;
		}
		this._score.init(this);
		var data = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [4, 2, 3, 4, 2, 2, 3, 4]];
		if (this.isFirstTime()) {
			this.mapSet(this.rowNum, data).then(function (result) {
				_this.showTutorial(_this.map[1][4], '点击连续的区域生成炸弹鸭');
				_this.tutorialProgress = 1;
				_this._status = 1;
			});
		} else {
			this.mapSet(this.rowNum).then(function (result) {
				_this._status = 1;
			});
		}
	},
	showTutorial: function showTutorial(target, label) {
		this.tutorialNode.active = true;
		this.tutorialNode.getChildByName('targetBtn').getChildByName('sqr').runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 0.8), cc.scaleTo(0.3, 1.2))));
		this.tutorialNode.getChildByName('target').x = target.x;
		this.tutorialNode.getChildByName('target').y = target.y;
		this.tutorialNode.getChildByName('targetBtn').x = target.x;
		this.tutorialNode.getChildByName('targetBtn').y = target.y;
		this.tutorialNode.getChildByName('label').getChildByName('label').getComponent(cc.Label).string = label;
	},
	closeTutorial: function closeTutorial() {
		var _this2 = this;

		this.tutorialNode.getChildByName('targetBtn').getChildByName('sqr').stopAllActions();
		// console.log('close Tutorial ')
		this.tutorialNode.active = false;
		this._status = 1;

		this.map[1][4].getComponent('cell').onTouched({
			type: 1
		}, false, false);
		if (this.tutorialProgress == 1) {
			setTimeout(function () {
				_this2.showTutorial(_this2.map[1][4], '点击炸弹消除所有同色方块哦');
				_this2.tutorialProgress = 2;
			}, 1000);
		}
	},
	isFirstTime: function isFirstTime() {
		var isFirst = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME && !wx.getStorageSync('isFirst')) {
			wx.setStorageSync('isFirst', "1");
			isFirst = true;
		} else if (!cc.sys.localStorage.getItem('isFirst')) {
			cc.sys.localStorage.setItem('isFirst', "1");
			isFirst = true;
		}
		return isFirst;
	},
	onItemShare: function onItemShare() {
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			this._controller.social.onItemShareButton();
		} else {
			this.fakeShareSuccess();
		}
	},
	onItemAdv: function onItemAdv() {
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			this._controller.social.onReviveButton(2);
		} else {
			this.fakeShareSuccess();
		}
	},
	fakeShareSuccess: function fakeShareSuccess() {
		this.shareBtn.active = false;
		this.shareSuccessDialog.active = true;
	},
	onCreateBomb: function onCreateBomb() {
		var x = Math.floor(Math.random() * 8);
		var y = Math.floor(Math.random() * 8);
		this.shareSuccessDialog.active = false;
		if (this.map[x][y].getComponent('cell')._itemType == 0) {
			this.map[x][y].getComponent('cell').changeItemType(2);
		} else {
			this.onCreateBomb();
			return;
		}
	},

	/**
  * 初始化地图
  * @param {*} num 
  * @param {*} data 传入颜色数组
  */
	mapSet: function mapSet(num, data) {
		var _this3 = this;

		this.map = new Array();
		var self = this;
		// 生成两个随机的对象数组
		var a = Math.floor(Math.random() * num);
		var b = Math.floor(Math.random() * num);

		var c = Math.floor(1 + Math.random() * (num - 1)) - 1;
		a == c ? c++ : '';
		var d = Math.floor(Math.random() * num);
		this.tutorialPos = [c, d];

		return new Promise(function (resolve, reject) {
			for (var i = 0; i < num; i++) {
				//行
				_this3.map[i] = new Array();
				for (var j = 0; j < num; j++) {
					//列
					var itemType = i == a && j == b ? 1 : i == c && j == d ? data ? 1 : 2 : 0;
					self.map[i][j] = self.instantiateBlock(self, {
						x: j,
						y: i,
						color: data && data[i] ? data[i][j] : null,
						width: self.blockWidth,
						startTime: (i + j + 1) * self._controller.config.json.startAnimationTime / num * 2
					}, self.blocksContainer, itemType);
				}
			}
			_this3.checkMgr.init(_this3);
			setTimeout(function () {
				resolve('200 OK');
				_this3.checkMgr.check(_this3);
			}, self._controller.config.json.startAnimationTime * num / 2 / 1
			//  (cc.game.getFrameRate() / 60)
			);
		});
	},

	//防抖动 判断是否需要检测下落
	checkNeedFall: function checkNeedFall() {
		var _this4 = this;

		if (this.checkNeedFallTimer) {
			clearTimeout(this.checkNeedFallTimer);
		}
		this.checkNeedFallTimer = setTimeout(function () {
			if (_this4._status == 5) {
				_this4._status = 4;
				_this4.onFall();
			}
		}, 300 / 1
		// (cc.game.getFrameRate() / 60)
		);
	},

	//方块下落
	onFall: function onFall() {
		var _this5 = this;

		this.checkGenerateProp(this._score.chain).then(function () {
			var self = _this5;
			var canFall = 0;
			//从每一列的最下面一个开始往上判断
			//如果有空 就判断有几个空 然后让最上方的方块掉落下来
			for (var j = _this5.rowNum - 1; j >= 0; j--) {
				canFall = 0;
				for (var i = _this5.rowNum - 1; i >= 0; i--) {
					if (_this5.map[i][j].getComponent('cell')._status == 2) {
						_this5.blockPool.put(_this5.map[i][j]);
						_this5.map[i][j] = null;
						canFall++;
					} else {
						if (canFall != 0) {
							_this5.map[i + canFall][j] = _this5.map[i][j];
							_this5.map[i][j] = null;
							_this5.map[i + canFall][j].getComponent('cell').playFallAction(canFall, {
								x: j,
								y: i + canFall
							});
						}
					}
				}
				for (var k = 0; k < canFall; k++) {
					_this5.map[k][j] = _this5.instantiateBlock(_this5, {
						x: j,
						y: k,
						width: _this5.blockWidth,
						startTime: null
					}, _this5.blocksContainer, '', {
						x: j,
						y: -canFall + k
					});
					_this5.map[k][j].getComponent('cell').playFallAction(canFall, null);
				}
			}
			setTimeout(function () {
				_this5.checkMgr.init(_this5);
				_this5.checkMgr.check(_this5);
				_this5._status = 1;
			}, 250);
		});
	},
	gameOver: function gameOver() {
		this._status = 3;
		this._controller.pageMgr.addPage(2);
		this._controller.pageMgr.addPage(4);
		if (this._controller.social.node.active) {
			this._controller.social.closeBannerAdv();
		}
	},

	// todo 复活
	askRevive: function askRevive() {
		var _this6 = this;

		this._controller.pageMgr.addPage(2);
		this._controller.pageMgr.addPage(5);
		this.revivePage.active = true;
		this.revivePage.getChildByName('askRevive').active = true;
		this.revivePage.getChildByName('successRevive').active = false;
		this.rangeSprite = this.revivePage.getChildByName('askRevive').getChildByName('numBg').getChildByName('sprite').getComponent(cc.Sprite);
		this.rangeSprite.fillRange = 1;
		this.isRangeAction = true;
		var numLabel = this.revivePage.getChildByName('askRevive').getChildByName('numBg').getChildByName('num').getComponent(cc.Label);
		numLabel.string = 9;
		if (this.reviveTimer) {
			clearInterval(this.reviveTimer);
		}
		this.reviveTimer = setInterval(function () {
			if (+numLabel.string > 0) {
				numLabel.string--;
				_this6.rangeSprite.fillRange = 1;
			} else {
				_this6.onSkipRevive();
			}
		}, 1000);
	},
	onReviveButton: function onReviveButton() {
		clearInterval(this.reviveTimer);
		this.isRangeAction = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			this._controller.social.onReviveButton(1);
		} else {
			this.showReviveSuccess();
		}
	},
	showReviveSuccess: function showReviveSuccess() {
		//console.log('打开复活成功页面')
		this.revivePage.getChildByName('askRevive').active = false;
		this.revivePage.getChildByName('successRevive').active = true;
	},
	onReviveCertainBtn: function onReviveCertainBtn() {
		this._controller.pageMgr.removePage(2);
		this.revivePage.active = false;
		this._status = 1;
		this._score.onRevive();
	},
	update: function update() {
		if (this.isRangeAction) {
			this.rangeSprite.fillRange -= 1 / 60;
		}
	},
	onSkipRevive: function onSkipRevive() {
		clearInterval(this.reviveTimer);
		this._controller.pageMgr.pages[5].active = false;
		this._score.onGameOver(true);
		this.isRangeAction = false;
	},
	restart: function restart() {
		var _this7 = this;

		this._controller.pageMgr.onOpenPage(1);
		this.recoveryAllBlocks().then(function () {
			_this7.gameStart();
		});
	},

	// -----------------道具相关---------------
	// 储存用户点击时的方块 用于生成道具
	onUserTouched: function onUserTouched(iid, jid, itemType, color, warning, pos) {
		this.target = {
			i: iid,
			j: jid,
			color: color,
			itemType: itemType,
			x: pos.x,
			y: pos.y,
			warning: warning
		};
	},

	// 生成道具 type 1为双倍倍数 2为炸弹 3为加五百
	generatePropItem: function generatePropItem(type) {
		var _this8 = this;

		return new Promise(function (resolve, reject) {
			// 是否做道具生成动画
			_this8.map[_this8.target.i][_this8.target.j] = _this8.instantiateBlock(_this8, {
				x: _this8.target.j,
				y: _this8.target.i,
				color: _this8.target.color,
				width: _this8.blockWidth,
				startTime: null
			}, _this8.blocksContainer, type);
			setTimeout(function () {
				resolve();
			}, 300);
		});
	},
	checkGenerateProp: function checkGenerateProp(chain) {
		var _this9 = this;

		return new Promise(function (resolve, reject) {
			if (_this9.target && _this9.target.warning) {
				_this9.generatePropItem(_this9.target.warning).then(function () {
					resolve();
					return;
				});
			}
			resolve();
		});
	},
	onItem: function onItem(type, color, pos) {
		switch (type) {
			case 1:
				// 分数翻倍 最高八倍
				this._score.tipBox.init(this._score, 1);
				this._score.addMult(color, pos);
				this._controller.musicMgr.onDouble();
				for (var i = 0; i < this.rowNum; i++) {
					//行
					for (var j = 0; j < this.rowNum; j++) {
						//列
						if (this.map[i][j] && this.map[i][j].getComponent('cell')._status == 1) {
							var distance = Math.sqrt(Math.pow(pos.x - this.map[i][j].x, 2) + Math.pow(pos.y - this.map[i][j].y, 2));
							if (distance != 0) {
								this.map[i][j].getComponent('cell').surfaceAction(distance);
							}
						}
					}
				}
				break;
			case 2:
				// 炸弹 消除同种颜色的
				this._score.tipBox.init(this._score, 2);
				this.node.runAction(AC.shackAction(0.1, 10));
				if (this._controller.social.node.active) {
					this._controller.social.onShakePhone();
				}
				this.isPropChain = true;
				this._controller.musicMgr.onBoom();
				for (var _i = 0; _i < this.rowNum; _i++) {
					//行
					for (var _j = 0; _j < this.rowNum; _j++) {
						//列
						if (this.map[_i][_j] && this.map[_i][_j].getComponent('cell').color == color && this.map[_i][_j] && this.map[_i][_j].getComponent('cell')._status != 2) {
							this.map[_i][_j].getComponent('cell').onTouched(color, false, true);
						} else {
							this.map[_i][_j].runAction(AC.rockAction(0.2, 10));
						}
					}
				}
				break;
			case 3:
				//:  加步数
				this._score.tipBox.init(this._score, 4);
				this._controller.musicMgr.onDouble();
				for (var _i2 = 0; _i2 < this.rowNum; _i2++) {
					//行
					for (var _j2 = 0; _j2 < this.rowNum; _j2++) {
						//列
						if (this.map[_i2][_j2] && this.map[_i2][_j2].getComponent('cell')._status == 1) {
							var _distance = Math.sqrt(Math.pow(pos.x - this.map[_i2][_j2].x, 2) + Math.pow(pos.y - this.map[_i2][_j2].y, 2));
							if (_distance != 0) {
								this.map[_i2][_j2].getComponent('cell').surfaceAction(_distance);
							}
						}
					}
				}
				this._score.onStep(3).then();
				break;
			case 4:
				// : 消除全部单身的方块
				this._score.tipBox.init(this._score, 5);
				this.isPropChain = true;
				this._controller.musicMgr.onMagic();
				for (var _i3 = 0; _i3 < this.rowNum; _i3++) {
					//行
					for (var _j3 = 0; _j3 < this.rowNum; _j3++) {
						//列
						if (this.map[_i3][_j3] && this.map[_i3][_j3].getComponent('cell').isSingle && this.map[_i3][_j3] && this.map[_i3][_j3].getComponent('cell')._status != 2) {
							var _distance2 = Math.sqrt(Math.pow(pos.x - this.map[_i3][_j3].x, 2) + Math.pow(pos.y - this.map[_i3][_j3].y, 2));
							this.map[_i3][_j3].getComponent('cell').onTouched(color, false, true, _distance2);
							// console.log("魔法棒触发的点", i, j, this.map[i][j].getComponent('cell').color, this.map[i][j].getComponent('cell').isSingle)
						}
					}
				}
				break;
		}
	},

	//--------------------- 预制体实例化---------------------
	// 生成对象池
	generatePool: function generatePool() {
		this.blockPool = new cc.NodePool();
		for (var i = 0; i < Math.pow(this.rowNum, 2); i++) {
			var block = cc.instantiate(this.blockPrefab);
			this.blockPool.put(block);
		}
	},

	// 实例化单个方块
	instantiateBlock: function instantiateBlock(self, data, parent, itemType, pos) {
		itemType = itemType ? itemType : 0;
		if (itemType != 0) {
			// console.log("道具节点数据", data, itemType)
		}
		var block = null;
		if (self.blockPool && self.blockPool.size() > 0) {
			block = self.blockPool.get();
		} else {
			block = cc.instantiate(self.blockPrefab);
		}
		block.parent = parent;
		block.scale = 1;
		block.x = 0;
		block.y = 0;
		block.getComponent('cell').init(self, data, this.blockWidth, itemType, pos);
		return block;
	},

	// 回收所有节点
	recoveryAllBlocks: function recoveryAllBlocks() {
		var _this10 = this;

		return new Promise(function (resolve, reject) {
			var children = _this10.blocksContainer.children;
			if (children.length != 0) {
				var length = children.length;
				//   console.log(length)
				for (var i = 0; i < length; i++) {
					_this10.blockPool.put(children[0]);
				}
				for (var _i4 = 0; _i4 < _this10.rowNum; _i4++) {
					for (var j = 0; j < _this10.rowNum; j++) {
						_this10.map[_i4][j] = null;
					}
				}
			}
			resolve('');
		});
	}
});

cc._RF.pop();