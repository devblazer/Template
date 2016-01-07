;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Builder', function (Arena, Template, Adaptor, Input) {

	var _construct = function(name, container, adaptorListContainer) {
		arena = new Arena(name,true);
		var template = null;
		var selectedAdaptor = null;
		var selectedPosition = null;
		var me = this;
		var adaptorMoveMode = null;
		var adaptors = [];

		container = $(container);
		if (!container.length)
			throw new Error("container not found");
		container.html("");

		adaptorListContainer = $(adaptorListContainer);
		if (!adaptorListContainer.length)
			throw new Error("adaptorListContainer not found");
		adaptorListContainer.html("");

		this.setTemplate = function(_template) {
			if (!(_template instanceof Template))
				throw new Error("template must be an instance of Template");

			template = _template;
			bot = template.spawn();
			arena.addBot(bot);
		};
		this.clearTemplate = function() {
			if (bot)
				arena.removeBot(bot);
			template = null;
			bot = null;
		};

		adaptorListContainer.on('click','table',function() {
			if (selectedPosition && selectedAdaptor===true) {
				selectedAdaptor = $(this).parent()[0].adaptorRef;
				var pos = selectedPosition.split('_');
				template.getCircuit().addAdaptor(selectedAdaptor,pos[0]/1,pos[1]/1);
				me.render();
				me.renderAdaptorList();
			}
		});
		container.on('click','table',function() {
			var x = $(this).attr('id').split('_');
			var y = x[1]/1;
			x = x[0]/1;
			var tile = template.getCircuit().getMap().get(x,y);
			if (tile!==null) {
				if (selectedAdaptor===null || selectedAdaptor===true || !adaptorMoveMode || tile instanceof Adaptor) {
					selectedAdaptor = tile;
				}
				else if (adaptorMoveMode) {
					template.getCircuit().removeAdaptor(selectedAdaptor);
					var pos = selectedPosition.split('_');
					template.getCircuit().getMap().set(pos[0]/1,pos[1]/1,true);
					template.getCircuit().addAdaptor(selectedAdaptor,x,y);
				}
				selectedPosition = $(this).attr('id');
				me.render();
			}
		});

		this.registerAdaptor = function(adaptor) {
			if (!(adaptor instanceof Adaptor))
				throw new Error('adaptor must be an instace of Adaptor');
			adaptors.push(adaptor);
		};

		this.rotateSelectedAdaptor = function(amount) {
			if (typeof amount == 'undefined')
				amount = 1;
			if (selectedPosition && selectedAdaptor instanceof Adaptor) {
				var pos = selectedPosition.split('_');
				template.getCircuit().removeAdaptor(selectedAdaptor);

				selectedAdaptor.orientation+=amount;
				if (selectedAdaptor.orientation>=6)
					selectedAdaptor.orientation = 0;
				template.getCircuit().addAdaptor(selectedAdaptor,pos[0]/1,pos[1]/1);
				this.reset();
			}
		};
		this.removeSelectedAdaptor = function() {
			if (selectedPosition && selectedAdaptor instanceof Adaptor) {
				template.getCircuit().removeAdaptor(selectedAdaptor);
				var pos = selectedPosition.split('_');
				template.getCircuit().getMap().set(pos[0]/1,pos[1]/1,true);
				this.reset();
				selectedAdaptor = true;
				this.renderAdaptorList();
			}
		};
		this.flipSelectedAdaptor = function() {
			if (selectedPosition && selectedAdaptor instanceof Adaptor) {
				selectedAdaptor.flip();
				this.render();
			}
		};
		this.moveModeOn = function() {
			adaptorMoveMode = true;
		};
		this.moveModeOff = function() {
			adaptorMoveMode = null;
		};

		this.reset = function() {
			template.getCircuit().clearIO();
			arena.removeBot(bot);
			bot = template.spawn();
			arena.addBot(bot);
			this.render();
		};
		this.step = function() {
			if (template.getCircuit().isValid()) {
				arena.step();
				this.render();
			}
		};

		var holderWidth = 160;
		var holderHeight = 120;
		var cellWidth = holderWidth/5;
		var cellHeight = holderHeight/5;
		var gridWidth = 5;
		var gridHeight = 5;
		var gridOffX = 2;
		var gridOffY = 2;

		this.renderAdaptorList = function() {
			var adaptorsList = Adaptor.prototype.getAdaptorTypes();
			for (var a=0;a<adaptors.length;a++) {
				var adaptor = adaptors[a];
				if (!adaptor.circuit)
					adaptorsList[adaptor.getCategory()].children[adaptor.type].children.push(adaptor);
			}
			var el = $('<dl />');
			for (var c in adaptorsList) {
				var category = adaptorsList[c];
				el.append('<dt>'+category.title+'</dt><dd><dl rel="'+c+'" /></dd>');
				for (var t in category.children) {
					var type = category.children[t];
					el.find('[rel="'+c+'"]').append('<dt>'+type.title+'</dt><dd><ul rel="'+t+'" />');
					for (var a=0;a<type.children.length;a++) {
						var adaptor = type.children[a];
						var ael = $('<li>'+adaptor.render(adaptor,selectedPosition,cellWidth,cellHeight,holderWidth,holderHeight,gridOffX,gridOffY)+'</li>');
						ael[0].adaptorRef = adaptor;
						el.find('[rel="'+t+'"]').append(ael);
					}
				}
			}
			adaptorListContainer.html("");
			adaptorListContainer.append(el);

			adaptorListContainer.find('[title]').tooltipster({
                contentAsHTML: true
            });
		};

		this.render = function() {
			var info = template.getCircuit().getMap().getRenderInfo();
			container.html("");

			function getTDInfo(tile,slot) {
				var io = tile.val.getOrientedIOBySlot(slot);
				var ret = {content:'',color:'#fff',bgColor:'#fff',tooltip:''};
				if (io) {
					ret.tooltip = ((io instanceof Input)?'Input: ':'Output: ')+io.name;
					ret.content = (io.getPower()/1);
					if (ret.content >= 100 || !ret.content)
						ret.content = ret.content.toFixed(0);
					else if (ret.content >= 10)
						ret.content = ret.content.toFixed(1);
					else if (ret.content >= 1)
						ret.content = ret.content.toFixed(2);
					else
						ret.content = ret.content.toString().substr(1);
					ret.color = io.getColor();
					ret.bgcolor = ((io instanceof Input)?'#040':'#400');
				}
				return ret;
			}

			for (var t=0;t<info.tiles.length;t++) {
				var tile = info.tiles[t];
				if (tile.val && tile.val instanceof Adaptor) {
					container.append(tile.val.render(tile.val,selectedPosition,cellWidth,cellHeight,holderWidth,holderHeight,gridOffX,gridOffY,tile));
				}
				else if (tile.val) {
					container.append(
						'<table id="'+(tile.x)+'_'+(tile.y)+'" style="'+(selectedPosition==tile.x+'_'+tile.y?'border:#0f0 1px solid;':'')+'top:'+((tile.ty+gridOffY)*holderHeight)+'px;left:'+((tile.x+gridOffX)*holderWidth)+'px;width:'+holderWidth+'px;height:'+holderHeight+'px;">'+
							'<tr><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td></tr>'+
							'<tr>'+
								'<td colspan="5" style="text-align:right;height:'+cellHeight+'px;"></td>'+
							'</tr>'+
							'<tr>'+
								'<td style="width:'+cellWidth+'px;height:'+cellHeight+'px;"></td>'+
								'<td colspan="3" rowspan="3" style="background-color:#888;width:'+(cellWidth*3)+'px;height:'+(cellHeight*3)+'px;"></td>'+
								'<td style="width:'+cellWidth+'px;height:'+cellHeight+'px;"></td>'+
							'</tr>'+
							'<tr>'+
								'<td style="height:'+cellHeight+'px"></td>'+
								'<td style="height:'+cellHeight+'px"></td>'+
							'</tr>'+
							'<tr>'+
								'<td style="height:'+cellHeight+'px"></td>'+
								'<td style="height:'+cellHeight+'px"></td>'+
							'</tr>'+
							'<tr>'+
								'<td colspan="5" style="height:'+cellHeight+'px;"></td>'+
							'</tr>'+
						'</table>'
					);
				}
			}

			container.find('[title]').tooltipster({
                contentAsHTML: true
            });
		}
	};

	var proto = _construct.prototype;

	return _construct;
},['Arena','Template', 'Adaptor', 'Input']);