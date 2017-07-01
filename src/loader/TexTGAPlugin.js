import { XhrTask } from './XHRLoader';
import { BinDataView } from '../core/BinDataView';

/**
 * @see http://blog.csdn.net/xiajun07061225/article/details/7646058
 * @param {ArrayBuffer} buffer
 */
function TexTGAPlugin(buffer) {
	let stream = new BinDataView(buffer);
	let colorTable = 0;
	console.log('图像信息字段长度: ', stream.int8());
	console.log('颜色表类型: ', colorTable = stream.int8());
	console.log('图像类型码: ', stream.int8());
	
	if (colorTable !== 0) {
		console.log('颜色表首址: ', stream.int16());
		console.log('颜色表的长度: ', stream.int16());
		console.log('颜色表项位数: ', stream.int8());
	}


	return Promise.resolve(buffer);
}

XhrTask.plugin('TexTGAPlugin', TexTGAPlugin);
