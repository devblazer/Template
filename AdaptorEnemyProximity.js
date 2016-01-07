;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('AdaptorEnemyProximity', function (Adaptor,Input,Output) {

	var _construct = function() {
		this.type = 'AdaptorEnemyProximity';
		this.name = 'Enemy Proximity';
		this.getCategory = function() {
			return 'detection';
		};
		this.description =
			'Takes power from the red input and pushes out the yellow output (power-1) when an enemy is within range:{range}.<br />' +
			'When no enemy is in range, power drains out the orange output (power-1) instead.';

		Adaptor.call(this);
		var me = this;
		this.settings = {};

		this.influencers.getClosestEnemy = {
			type: 'enemyDistance',
			min: 0,
			max: 100,
			method: 'getClosestEnemy',
			value:null
		};

		var setupAdaptor = function() {
			me.addIO(new Input('Power','#ff0000'),3);
			me.addIO(new Output('Activated','#ffff00'),0);
			me.addIO(new Output('Drain','#ff8800'),1);
			me.settings.range = 100;
		};

		setupAdaptor();

		this.execute = function(bot) {
			var power = this.getInputPower('Power');
			if (power>1) {
				var info = this.runInfluencer(bot,'getClosestEnemy');
				//var info = bot.arena.getClosestEnemy();
				if (info && info.distance<=this.settings.range)
					this.setOutputPower('Activated',power-1);
				else
					this.setOutputPower('Drain',power-1);
			}
		};
	};

	var proto = _construct.prototype = Object.create(Adaptor.prototype);

	return _construct;
},['Adaptor','Input','Output']);