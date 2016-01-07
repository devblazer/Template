;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('TileGenerator', function (Util) {

	return function(map,directions){
		var touches = [];
		var layers = [];
		var layersAvailable = [];

		function placeTile(x,y,d,val,canRender) {
			if (typeof layers[d] == 'undefined') {
				layers[d] = {hash:[]};
				layersAvailable.push(d);
			}
			var obj = {x:x,y:y,d:d,c:0,targets:{hash:[]}};
			if (typeof touches[x+'_'+y] != 'undefined') {
				for (var t in touches[x+'_'+y]) {
					var tile = touches[x+'_'+y][t];
					delete(layers[tile.d][tile.x+'_'+tile.y].targets[x+'_'+y]);
					layers[tile.d][tile.x+'_'+tile.y].targets.hash.splice(
						layers[tile.d][tile.x+'_'+tile.y].targets.hash.indexOf(x+'_'+y),
						1
					);
					if (!layers[tile.d][tile.x+'_'+tile.y].targets.hash.length) {
						delete(layers[tile.d][tile.x+'_'+tile.y]);
						layers[tile.d].hash.splice(layers[tile.d].hash.indexOf(tile.x+'_'+tile.y),1);
					}
					if (!layers[tile.d].hash.length) {
						delete(layers[tile.d]);
						layersAvailable.splice(layersAvailable.indexOf(tile.d),1);
					}
				}
				delete(touches[x+'_'+y]);
			}
			var tv = val;
			if (Util.isFunction(val))
				tv = val(x,y,d);
			map.set(x,y,tv);
			for (var dir=0;dir<directions;dir++) {
				var npos = map.move(x,y,dir);
				if (!map.get(npos.x,npos.y)) {
					var ind = npos.x+'_'+npos.y;
					obj.targets[ind] = {x:npos.x,y:npos.y,d:d+1};
					obj.targets.hash.push(ind);
					if (typeof touches[ind] == 'undefined')
						touches[ind] = [];
					touches[ind].push({x:x,y:y,d:d});
				}
			}
			if (typeof layers[d] == 'undefined') {
				layers[d] = {hash:[]};
				layersAvailable.push(d);
			}
			layers[d][x+'_'+y] = obj;
			layers[d].hash.push(x+'_'+y);
		}

		this.generateSplash = function(count,val,gravity,xOff,yOff,canRender,continued) {
			if (typeof gravity == 'undefined')
				gravity = 2;
			if (typeof directions == 'undefined')
				directions = 1;
			if (typeof canRender == 'undefined')
				canRender = function(val) {
					return val!==null;
				};
			if (typeof xOff == 'undefined')
				xOff = 0;
			if (typeof yOff == 'undefined')
				yOff = 0;
			if (typeof continued == 'undefined')
				continued = false;

			if (!continued) {
				touches = [];
				layers = [];
				layersAvailable = [];
				placeTile(xOff,yOff,1,val,canRender);
			}

			for (var c=continued?0:1;c<count;c++) {
				var r1 = Util.randomWeighted(layersAvailable.length,gravity);
				var layer = layers[layersAvailable[ r1 ]];
				var r2 = Util.random(layer.hash.length);
				var tile = layer[layer.hash[ r2 ]];
				var r3 = Util.random(tile.targets.hash.length);
				var target = tile.targets[tile.targets.hash[ r3 ]];
				if (typeof target == 'undefined') {
					c--;
					continue;
				}
				placeTile(target.x,target.y,target.d,val,canRender);
			}
		};
	};
},['Util']);