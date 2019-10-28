window.Physics3D = function(initialMemory, interactive) {
	window.conch.setGetWorldTransformFunction(interactive.getWorldTransform);
	window.conch.setSetWorldTransformFunction(interactive.setWorldTransform);
	var conchBullet = window.layaConchBullet;
	conchBullet.then = (complete) => {
		complete();
	};
	window.Physics3D = conchBullet;
	return conchBullet;
};