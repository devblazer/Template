;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('DynamicHexMap', function () {

	return function(startSize,expandSize){
		if (typeof startSize == 'undefined')
			startSize = 15;
		startSize = startSize - (startSize%2) + 1;
		if (typeof expandSize == 'undefined')
			expandSize = Math.ceil(startSize*2/3);

		var directionCalculator = [
			{x:0,y:[-1,-1]},
			{x:1,y:[-1,0]},
			{x:1,y:[0,1]},
			{x:0,y:[1,1]},
			{x:-1,y:[0,1]},
			{x:-1,y:[-1,0]},
		];

		var grid, allObjects, allObjectRefs, gridOffsetX, gridOffsetY;

		var expand = function(direction) {
			if (direction=='up' || direction=='down') {
				var row = [];
				for (var x=0;x<grid[0].length;x++)
					row[x] = null;
				for (var y=0;y<expandSize;y++) {
					if (direction=='up')
						grid.unshift(row.slice());
					else
						grid.push(row.slice());
				}
				if (direction=='up')
					gridOffsetY += expandSize;
			}
			else {
				for (var x=0;x<expandSize;x++)
					for (var y=0;y<grid.length;y++) {
						if (direction=='left')
							grid[y].unshift(null);
						else
							grid[y].push(null);
					}
				if (direction=='left')
					gridOffsetX += expandSize;
			}
		};

		var inBounds = function(x,y) {
			return x>=-gridOffsetX && x+gridOffsetX<grid[0].length && y>=-gridOffsetY && y+gridOffsetY<grid.length;
		};

		this.get = function(x,y) {
			return inBounds(x,y)?grid[y+gridOffsetY][x+gridOffsetX]:null;
		};
		this.set = function(x,y,val) {
			if (!inBounds(x,y)) {
				while (y<-gridOffsetY)
					expand('up');
				while (x+gridOffsetX>=grid[0].length)
					expand('right');
				while (y+gridOffsetY>=grid.length)
					expand('down');
				while (x<-gridOffsetX)
					expand('left');
			}

			grid[y+gridOffsetY][x+gridOffsetX] = val;
			if (val && typeof val == 'object') {
				var ind = allObjects.indexOf(val);
				if (ind == -1) {
					ind = allObjectRefs.length;
					allObjectRefs[ind] = [];
					allObjects[ind] = val;
				}
				allObjectRefs[ind].push({x:x,y:y});
			}
		};

		this.removeObjectReferences = function(obj) {
			var ind = allObjects.indexOf(obj);
			if (ind > -1) {
				for (var i in allObjectRefs[ind])
					this.set(allObjectRefs[ind][i].x,allObjectRefs[ind][i].y,null);
				allObjectRefs.splice(ind,1);
				allObjects.splice(ind,1);
			}
		};
		this.getPosByObjRef = function (obj) {
			var ind = allObjects.indexOf(obj);
			if (ind > -1) {
				return allObjectRefs[ind][0]
			}
			return null;
		};

		this.move = function(x,y,direction,distance) {
			if (typeof distance == 'undefined')
				distance = 1;
			var xmod = (x+gridOffsetX+1+(gridOffsetX%2))%2;
			return {
				x: x + (directionCalculator[direction].x * distance),
				y: y + (directionCalculator[direction].y[xmod] * distance)
			};
		}

		this.clear = function() {
			grid = [];
			allObjects = [];
			allObjectRefs = [];

			gridOffsetX = (startSize-1)/2;
			gridOffsetY = (startSize-1)/2;
			for (var y=0;y<startSize;y++) {
				grid[y] = [];
				for (var x=0;x<startSize;x++)
					grid[y][x] = null;
			}
		};

		this.clear();

		this.getRenderInfo = function() {
			var ret = {tiles:[],left:0,top:0,width:0,height:0};
			for (var y=0;y<grid.length;y++)
				for (var x=0;x<grid[y].length;x++) {
					var xmod = (x+gridOffsetX+(gridOffsetX%2))%2;
					if (grid[y][x]) {
						ret.tiles.push({x:x-gridOffsetX,y:y-gridOffsetY,ty:y-gridOffsetY+(xmod/2),val:grid[y][x]});
						ret.left = Math.min(ret.left,x-gridOffsetX);
						ret.top = Math.min(ret.top,y-gridOffsetY);
						ret.width = Math.max(ret.width,x-gridOffsetX);
						ret.height = Math.max(ret.height,y-gridOffsetY);
					}
				}
			ret.width = ret.width - ret.left + 1;
			ret.height = ret.height - ret.top + 1;
			return ret
		};
	};
},[]);