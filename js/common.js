// 生成图片对象方法
const imageFromPath = function(src){
	let img = new Image();
	img.src = './images/' + src;
	return img;
}

const allImg = {
	background: 'background.jpg',
	paddle: 'paddle.png',
	ball: 'ball.png',
	block1: 'block1.png',
	block2: 'block2.png'
}
