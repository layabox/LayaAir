window.Physics3D = function(initialMemory, interactive) {
	return new Promise((resolve) => {
		window.conch.setGetWorldTransformFunction(interactive.getWorldTransform);
		window.conch.setSetWorldTransformFunction(interactive.setWorldTransform);
		window.Physics3D = window.layaConchBullet;
		resolve();
	});
};