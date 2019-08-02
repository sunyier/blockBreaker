// 定义挡板对象
class Paddle {
	constructor(main) {
		let p = {
			x: main.paddle_x,						// x轴坐标
			y: main.paddle_y,						// y轴坐标
			w: 102,									// 图片宽度
			h: 22,									// 图片高度
			speed: 10,								// x轴移动速度
			ballSpeedMax: 8,						// 小球反弹速度最大值
			image: imageFromPath(allImg.paddle),	// 引入图片对象
			isLeftMove: true,						// 能否左移
			isRightMove: true         				// 能否右移
		}
		Object.assign(this, p);
	}

	moveLeft() {
		this.x -= this.speed;
	}

	moveRight() {
		this.x += this.speed;
	}

	// 小球、挡板碰撞检测
	collide(ball) {
		let b = ball;
		let p = this;

		// 要检测小球和挡板是否碰撞，则需要判断 小球中心点 和 挡板中心点 的水平方向及竖直方向的间隔
		// 小球中心点水平方向坐标： b.x + b.w / 2      竖直方向坐标： b.y + b.h / 2
		// 挡板中心点水平方向坐标： p.x + p.w / 2      竖直方向坐标： p.y + p.h / 2
		// 若碰撞则小球和挡板 水平方向 和 竖直方向 的距离需小于 宽度或高度之和 的一半
		if (Math.abs((b.x + b.w / 2) - (p.x + p.w / 2)) < (b.w + p.w) / 2 && Math.abs((b.y + b.h / 2) - (p.y + p.h / 2)) < (b.h + p.h) / 2) {
			return true;
		}

		return false;
	}

	// 计算小球、挡板碰撞后x轴速度值
	collideRange(ball) {
		let b = ball;
		let p = this;
		let rangeX = 0;
		rangeX = (p.x + p.w / 2) - (b.x + b.w / 2);   // 小球和挡板中心点在碰撞时水平方向的距离
		if (rangeX < 0) {  // 小球撞击挡板右侧
			return rangeX / (b.w / 2 + p.w / 2) * p.ballSpeedMax;   // 小球和挡板中心点在碰撞时水平方向的距离 与 极端情况（即距离最大）的比值 越靠近挡板中心速度越小  
		} else if (rangeX > 0) {  // 小球撞击挡板左侧
			return rangeX / (b.w / 2 + p.w / 2) * p.ballSpeedMax;
		}
	}
}

class Ball {
	constructor(main) {
		let b = {
			x: main.ball_x,						// x轴坐标
			y: main.ball_y,						// y轴坐标
			w: 18,								// 图片宽度
			h: 18,								// 图片高度
			speedX: 1,							// x轴速度
			speedY: 5,							// y轴速度
			image: imageFromPath(allImg.ball),	// 图片对象
			fired: false 						// 是否运动，默认静止不动
		}
		Object.assign(this, b);
	}

	move(game) {
		if (this.fired) {
			// 碰撞边界检测
			if (this.x < 0 || this.x > 1000 - this.w) {
				this.speedX *= -1;
			} 
			if (this.y < 0) {
				this.speedY *= -1;
			}
			if (this.y > 500 - this.h) {
				// 游戏结束
				game.state = game.state_GAMEOVER;
			}

			// 移动（沿一个方向匀速运动）
			this.x -= this.speedX;  
			this.y -= this.speedY;  
		}
	}
}

// 砖块
class Block {
	constructor(x, y, life = 1) {
		let bk = {
			x: x,			// x轴坐标
			y: y,			// y轴坐标
			w: 50,			// 图片宽度
			h: 20,			// 图片高度
			image: life === 1 ? imageFromPath(allImg.block1) : imageFromPath(allImg.block2),		// 图片对象
			life: life,		// 生命值
			alive: true		// 是否存活	
		}
		Object.assign(this, bk);
	}
	// 消除砖块
	kill() {
		this.life--;
		if (this.life === 0) {
			this.alive = false;
		} else if(this.life === 1) {
			this.image = imageFromPath(allImg.block1);
		}
	}

	// 小球、砖块碰撞检测
	collide(ball) {
		let b = ball;
		if (Math.abs((b.x + b.w / 2) - (this.x + this. w / 2)) < (b.w + this.w) / 2 && Math.abs((b.y + b.h / 2) - (this.y + this.h / 2)) < (b.h + this.h) / 2) {
			// 与小球和挡板碰撞同理，需检测x轴坐标和y轴坐标，确定临界条件
			this.kill();
			return true;
		} else{
			return false;
		}
	}

	// 计算小球、砖块碰撞后x轴速度方向
	collideBlockHorn(ball) {
		let b = ball;		// 小球
		let bk = this;		// 砖块
		let rangeX = 0;
		let rangeY = 0;

		rangeX = Math.abs((b.x + b.w / 2) - (bk.x + bk.w / 2));
		rangeY = Math.abs((b.y + b.h / 2) - (bk.y + bk.h / 2));

		if (rangeX > bk.w / 2 && rangeX < (bk.w / 2 + b.w / 2) && rangeY < (bk.h / 2 + b.h / 2)) {   // x轴方向与砖块四角相交
			if (b.x < bk.x && b.speedX > 0 || b.x > bk.x && b.speedX < 0) {   // 小球运动方向趋向砖块中心
				return false;
			} else {   
				return true;
			}
		}
		return false;
	}
}

// 计分板
class Score {
	constructor(main) {
		let s = {
			x: main.score_x,						// x轴坐标
			y: main.score_y,						// y轴坐标
			text: '分数： ',							// 文本分数
			textLv: '关卡： ',						// 文本关卡
			score: 200,								// 每个砖块对应分数
			allScore: 0,							// 总分
			blockList: main.blockList,				// 砖块对象集合
			blockListLen: main.blockList.length,	// 砖块总数量
			lv: main.LV 							// 当前关卡
		}
		Object.assign(this, s);
	}

	// 计算总分
	computeScore() {
		let num = 0;
		let allNum = this.blockListLen;
		num = this.blockListLen - this.blockList.length;   // 砖块总数量减去现在的砖块数量为已消失的数量
		this.allScore = this.score * num;
	}
}

// 定义场景
class Scene {
	constructor(lv) {
		let s = {
			lv: lv,											// 游戏难度级别
			canvas: document.getElementById('canvas'),		// canvas对象
			blockList: []									// 砖块坐标集合
		}
		Object.assign(this, s);
	}

	// 实例化所有砖块对象
	initBlockList() {
		this.createBlockList();
		let arr = [];
		for (let item of this.blockList) {
			// for...of循环可以使用的范围包括数组、Set 和 Map 结构、某些类似数组的对象（比如arguments对象、DOM NodeList 对象）以及字符串，但不能用来遍历对象。
			// for...in 循环可用来遍历对象
			// for...in循环读取键名，for...of循环读取键值。
			for (let list of item) {
				if (list.type === 1) {
					let obj = new Block(list.x, list.y);
					arr.push(obj);
				} else if(list.type === 2) {
					let obj = new Block(list.x, list.y, 2);
					arr.push(obj);
				}
			}
		}
		return arr;
	}

	// 创建砖块坐标二维数组，并生成不同关卡
	createBlockList() {
		let lv = this.lv,					// 游戏难度级别
			c_w = this.canvas.width,		// canvas宽度
			c_h = this.canvas.height,		// canvas高度
			xNum_max = c_w / 50,			// x轴砖块最大数量
			yNum_max = 12,					// y轴砖块最大数量
			x_start = 0,					// x轴起始坐标，根据砖块数量浮动
			y_start = 60;					// y轴起始坐标，默认从60起
		
		switch (lv) {
			case 1: // 正三角形
				var xNum = 16,			// x轴砖块第一层数量
					yNum = 9;			// y轴砖块层数
				
				// 循环y轴	
				for (let i = 0; i < yNum; i++) {
					let arr = [];
					// 修改每层x轴砖块数量
					if (i === 0) {
						xNum = 1;
					} else if (i === 1) {
						xNum = 2;
					} else {
						xNum += 2
					}
					x_start = (xNum_max - xNum) / 2 * 50;   // 修改每层x轴砖块起始坐标

					// 循环x轴
					for (let k = 0; k < xNum; k++) {
						if (i < 3) {	// 前三排为特殊砖块
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 2
							})
						} else {
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 1
							})
						}
					}
					this.blockList.push(arr);
				}
				break;
			case 2:    // 倒三角形
				var xNum = 16,		// x轴砖块第一层数量
					yNum = 9;		// y轴砖块层数

				// 循环y轴
				for (let i = 0; i < yNum; i++) {
					let arr = [];
					// 修改每层x轴砖块数量
					if (i === yNum - 1) {
						xNum = 1;
					} else if (i === 0) {
						xNum = xNum;
					} else {
						xNum -= 2;
					}
					x_start = (xNum_max - xNum) / 2 * 50;	// 修改每层x轴砖块起始坐标

					// 循环x轴
					for (let k = 0; k < xNum; k++) {
						if (i < 3) {   // 前三排为特殊砖块
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 2
							})
						} else {
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 1
							})
						}
					}
					this.blockList.push(arr);
				}
				break;
			case 3:  // 工字形
				var xNum = 16,
					yNum = 9;

				// 循环y轴
				for (let i = 0; i < yNum; i++) {
					let arr = [];
					// 修改每层x轴砖块数量
					if (i === 0) {
						xNum = xNum;
					} else if (i > 4) {
						xNum += 2;
					} else {
						xNum -= 2;
					}
					x_start = (xNum_max - xNum) / 2 * 50;  // 修改每层x轴砖块起始坐标

					// 循环x轴
					for (let k = 0; k < xNum; k++) {
						if (i < 3) {
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 2
							})
						} else{
							arr.push({
								x: x_start + k * 50,
								y: y_start + i * 20,
								type: 1
							})
						}
					}
					this.blockList.push(arr);
				}	
				break;
		}
	}
}

