;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Circuit', function (Adaptor, DynamicHexMap, TileGenerator, Bot) {

	return function(){
		var adaptors = [];
		var map = new DynamicHexMap();
		var gen = new TileGenerator(map,6);
		var incorrectFits = [];

		var processAdaptors = [];

		this.setupTiles = function(count,weight) {
			gen.generateSplash(count,true,weight);
		}

		this.setupState = function(bot) {
			for (var a=0;a<adaptors.length;a++)
				adaptors[a].setupState(bot);
		};

		this.addAdaptor = function(adaptor,x,y) {
			if (!(adaptor instanceof Adaptor))
				throw new Error("adaptor must be an instance of Adaptor");

			var slots = adaptor.getOrientedSlots();
			adaptor.correctFit = true;
			for (var s in slots) {
				var slot = slots[s];
				if (slot) {
					var pos = map.move(x,y,s);
					var remoteAdaptor = map.get(pos.x,pos.y);
					if (remoteAdaptor && remoteAdaptor instanceof Adaptor) {
						var res = slot.connectTo(remoteAdaptor,((s/1)+3)%6);
						adaptor.correctFit = (adaptor.correctFit && res.correctFit);
						if (!res.correctFit) {
							incorrectFits.push(remoteAdaptor);
							remoteAdaptor.correctFit = false;
						}
					}
				}
			}
			if (!adaptor.correctFit)
				incorrectFits.push(adaptor);
			adaptors.push(adaptor);
			adaptor.circuit = this;
			map.set(x,y,adaptor);
		};

		this.removeAdaptor = function(adaptor,noFitChecking) {
			if (typeof noFitChecking == 'undefined')
				noFitChecking = false;
			if (!(adaptor instanceof Adaptor))
				throw new Error("adaptor must be an instance of Adaptor");
			var pos = map.getPosByObjRef(adaptor);
			map.removeObjectReferences(adaptor);
			var slots = adaptor.getOrientedSlots();
			for (var s=0;s<slots.length;s++)
				if (slots[s]) {
					if (!noFitChecking) {
						var npos = map.move(pos.x,pos.y,s);
						var remoteAdaptor = map.get(npos.x,npos.y);
						if (remoteAdaptor && remoteAdaptor instanceof Adaptor) {
							this.removeAdaptor(remoteAdaptor,true);
							this.addAdaptor(remoteAdaptor,npos.x,npos.y);
						}
					}
					slots[s].disconnect();
				}
			adaptor.correctFit = true;
			adaptor.circuit = null;
			var ind = incorrectFits.indexOf(adaptor);
			if (ind>-1)
				incorrectFits.splice(ind,1);
			adaptors.splice(adaptors.indexOf(adaptor),1);
		};

		this.recheckFits = function(adaptor) {

		};

		this.clearIO = function() {
			for (var a=0;a<adaptors.length;a++)
				adaptors[a].clearIO();
		};

		this.processAdaptors = function(bot) {
			if (!(bot instanceof Bot))
				throw new Error("bot must be an instance of Bot");

			processAdaptorsList = [];
			for (var a=0;a<adaptors.length;a++) {
				adaptors[a].processed = false;
				adaptors[a].clearIO();
				if (!adaptors[a].hasInputs())
					processAdaptorsList.push(adaptors[a]);
			}

			var timeout = 0;
			while (processAdaptorsList.length) {
				var achievement = false;
timeout++;
				if (timeout>100)
				return;
				function processAdaptor(adaptor,index) {
					adaptor.execute(bot);
					adaptor.processed = true;
					processAdaptorsList.splice(index,1);
					achievement = true;

					adaptor.disperseOutputs();
					var connected = adaptor.getConnected();
					for (var c=0;c<connected.length;c++)
						processAdaptorsList.push(connected[c].getAdaptor());
				}

				for (var a=0;a<processAdaptorsList.length;a++) {
					var adaptor = processAdaptorsList[a];
					if (adaptor.readyForExecution()) {
						processAdaptor(adaptor,a)
						a--;
					}
				}

				if (!achievement) {
					processAdaptor(processAdaptorsList[0],0);
				}
			}
		};

		this.isValid = function() {
			for (var a=0;a<adaptors.length;a++)
				if (!adaptors[a].correctFit) {
					return false;
				}
			return true;
		};

		this.getMap = function() {
			return map;
		};
	};
},['Adaptor','DynamicHexMap','TileGenerator','Bot']);