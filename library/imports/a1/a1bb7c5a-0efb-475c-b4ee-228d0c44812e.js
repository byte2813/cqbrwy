"use strict";
cc._RF.push(module, 'a1bb7xaDvtHXLTuIo0MRIEu', 'pageMgr');
// Script/pageMgr.js

'use strict';

/**
 * @author uu
 * @file  通用页面控制器和适配
 */
var AC = require('action');
cc.Class({
	extends: cc.Component,
	properties: {
		status: 0, //页面状态
		pages: [cc.Node]
	},
	// 0 开始游戏页面
	// 1 游戏页面
	// 2 UI页面
	// 3 过关页面
	// 4 失败页面
	// 5 复活页面
	// 6 排行榜页面

	start: function start() {
		this.lateStart();
	},
	lateStart: function lateStart() {
		this.width = cc.director.getWinSizeInPixels().width;
		window.width = this.width;
		this.height = cc.director.getWinSizeInPixels().height;
		window.height = this.height;
		// 存为全局变量
		this.adoptCanvas();
	},

	// 适配解决方案
	adoptCanvas: function adoptCanvas() {
		var canvas = cc.director.getScene().getChildByName('Canvas').getComponent(cc.Canvas);
		// 设计分辨率比
		var rateR = canvas.designResolution.height / canvas.designResolution.width;
		// 显示分辨率比
		var rateV = this.height / this.width;
		if (rateV > rateR) {
			canvas.fitHeight = false;
			canvas.fitWidth = true;
		} else {
			canvas.fitHeight = true;
			canvas.fitWidth = false;
		}
	},
	onOpenPage: function onOpenPage(num, callFun) {
		this.closeAllPages();
		this.pages[num].active = true;
		// if (callFun) {
		//   this.callFun();
		// }
	},
	addPage: function addPage(num, callFun) {
		this.pages[num].scale = 0.5;
		this.pages[num].active = true;
		this.pages[num].runAction(AC.popOut(0.5));
		// if (callFun) {
		//   this.callFun();
		// }
	},
	openPageTarget: function openPageTarget(target) {
		target.scale = 0.5;
		target.active = true;
		target.runAction(AC.popOut(0.5));
	},
	removePage: function removePage(num, callFun) {
		var _this = this;

		this.pages[num].runAction(cc.sequence(AC.popIn(0.5), cc.callFunc(function () {
			_this.pages[num].active = false;
		}, this)));
		// if (callFun) {
		//   this.callFun();
		// }
	},
	onButtonOpenPage: function onButtonOpenPage(event, cust) {
		this.onOpenPage(cust);
	},
	onButtonAddPage: function onButtonAddPage(event, cust) {
		this.addPage(cust);
	},
	onButtonRemovePage: function onButtonRemovePage(event, cust) {
		this.removePage(cust);
	},
	closeAllPages: function closeAllPages() {
		this.pages.forEach(function (element) {
			element.active = false;
		});
	}
});

cc._RF.pop();