;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Template', function (Player, Adaptor, Circuit, Bot) {

	return function(player, count, weight){
		if (!(player instanceof Player))
			throw new Error("player must be an instance of Player");

		var circuit = new Circuit();
		circuit.setupTiles(count,weight);

		this.getPlayer = function() {
			return player;
		};

		this.spawn = function() {
			var bot = new Bot(this);
			circuit.setupState(bot);
			return bot;
		};

		this.getCircuit = function() {
			return circuit;
		};

		this.processAdaptors = function(bot) {
			if (!(bot instanceof Bot))
				throw new Error("bot must be an instance of Bot");

			circuit.processAdaptors(bot);
		};
	};
},['Player', 'Adaptor','Circuit','Bot']);