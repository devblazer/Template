;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Arena', function (Player, Bot, Util) {

	return function(_name,isSimulator){
		if (typeof isSimulator == 'undefined')
			isSimulator = false;
		this.isSimulator = isSimulator;
		this.name = _name;
		var bots = [];
		var currentBot = null;
		var me = this;
		this.botCache = {};

		this.getBotDistances = function() {
			if (typeof this.botCache.botDistances == 'undefined') {
				this.botCache.botDistances = [];
				for (var b=0;b<bots.length;b++)
					this.botCache.botDistances[b] = Util.objDistance(currentBot, bots[b]);
			}
			return this.botCache.botDistances;
		}

		this.getClosestEnemy = function() {
			if (typeof this.botCache.closestEnemy == 'undefined') {
				var closest = null;
				var dist = 10000000;
				var botDistances = this.getBotDistances();
				for (var b=0;b<botDistances.length;b++) {
					if (bots[b].getTemplate().getPlayer().isEnemyOf(currentBot.getTemplate().getPlayer()) && dist > botDistances[b]) {
						dist = d;
						closest = bots[b];
					}
				}
				this.botCache.closestEnemy = closest;
				this.botCache.closestEnemyDistance = dist;
			}
			return {bot:this.botCache.closestEnemy,distance:this.botCache.closestEnemyDistance};
		};

		this.step = function() {
			for (var b=0;b<bots.length;b++) {
				currentBot = bots[b];
				this.botCache = {};
				bots[b].step();
			}
		}
		this.addBot = function(bot) {
			this.botCache = {};
			bots.push(bot);
			bot.arena = this;
		};
		this.removeBot = function(bot) {
			this.botCache = {};
			var ind = bots.indexOf(bot);
			if (ind>-1)
				bots.splice(ind,1);
		};
	};
},['Player', 'Bot', 'Util']);