;(function(n,d,p){var t=this,u='undefined',e='exports',i;if(typeof module!=u&&module[e]){if(p&&require){for(i in p)t[p[i]]=require(p[i]);}module[e]=d();}else if(typeof define!=u&&define.amd)define(n,(p||[]),d);else{for(i in p)p[i]=t[p[i]];t[n]=d.apply(t,p);}})
('Adaptor', function (Input,Output,IOPort,Util) {

	var _construct = function() {
		var outputs = [];
		var inputs = [];
		var ioNameHash = {};
		var processed = false;
		var slots = [null,null,null,null,null,null];
		this.orientation = 0;
		this.correctFit = true;
		this.circuit = null;

		var me = this;

		var parentFunctions = {};
		this.callParentFunction = function(name,args) {
			return parentFunctions[name].apply(this,args);
		};

		this.flip = function() {
			var nOutputs = [];
			var nInputs = [];
			for (var o=0;o<this.orientation;o++) {
				var t = slots.pop();
				slots.unshift(t);
			}
			this.orientation = 0;
			var nSlots = [slots[0],slots[5],slots[4],slots[3],slots[2],slots[1]];
			for (var s=0;s<nSlots.length;s++) {
				if (nSlots[s] && nSlots[s] instanceof Output)
					nOutputs.push(s);
				else if (nSlots[s] && nSlots[s] instanceof Input)
					nInputs.push(s);
			}
			slots = nSlots;
			inputs = nInputs;
			outputs = nOutputs;
		};

		this.getDescription = function() {
			var str = this.description;
			for (var s in this.settings)
				str = str.replace(new RegExp('{'+s+'}','g'),this.settings[s]);
			return '<strong>'+this.name+' adaptor</strong><br /><br />'+str;
		};

		function getIOIndex(indexOrIO) {
			if (typeof indexOrIO == 'string')
				indexOrIO = slots[ioNameHash[indexOrIO]];
			if (indexOrIO instanceof Input)
				indexOrIO = inputs.indexOf(slots.indexOf(indexOrIO));
			else if (indexOrIO instanceof Output)
				indexOrIO = outputs.indexOf(slots.indexOf(indexOrIO));
			if (indexOrIO == -1 || !slots[indexOrIO])
				throw new Error("IO does not appear to belong to this adaptor");
			return indexOrIO;
		};
		function getIOBySlot(index) {
			return slots[index];
		};
		function getInput(indexOrInput) {
			if (typeof indexOrInput == 'string')
				indexOrInput = slots[ioNameHash[indexOrInput]];
			else if (!(indexOrInput instanceof Input))
				indexOrInput = slots[inputs[indexOrInput]];
			return indexOrInput;
		};
		this.getOutput = function(indexOrOutput) {
			if (typeof indexOrOutput == 'string')
				indexOrOutput = slots[ioNameHash[indexOrOutput]];
			else if (!(indexOrOutput instanceof Output))
				indexOrOutput = outputs[indexOrOutput];
			return indexOrOutput;
		};
		var getInstance = function() {
			return me;
		};

		this.addIO = function(io,slot) {
			if (!(io instanceof IOPort))
				throw new Error("IO must derive from type IOPort");
			if (slots[slot])
				throw new Error("IO already occupies slot: "+slot);
			slots[slot] = io;
			if (io instanceof Input)
				inputs.push(slot);
			else
				outputs.push(slot);
			ioNameHash[io.getName()] = slot;
			io.setAdaptor(this);
		};
		this.removeIO = function(indexOrIO) {
			var index = getIOIndex(indexOrIO);
			if (slots[index] instanceof Input)
				inputs.splice(inputs.indexOf(slots[index]),1);
			else
				outputs.splice(outputs.indexOf(slots[index]),1);
			delete(ioNameHash[slot]);
			slots[index] = null;
		};

		this.setInputPower = function(indexOrInput,power) {
			var input = getInput(indexOrInput);
			input.setPower(power);
		};
		this.getInputPower = function(indexOrInput) {
			var input = getInput(indexOrInput);
			return input.getPower();
		};
		this.setOutputPower = function(indexOrOutput,power) {
			var output = this.getOutput(indexOrOutput);
			output.setPower(power);
		}
		this.getOrientedIOBySlot = function(index) {
			return slots[(6-this.orientation+index)%6];
		};
		this.getOrientedSlots = function() {
			var ret = [];
			for (var s=0;s<slots.length;s++)
				ret[(s+this.orientation)%6] = slots[s];
			return ret;
		};

		this.getReport = function() {
			var ret = {};
			for (var i in outputs)
				ret[slots[outputs[i]].getName()] = slots[outputs[i]].getPower();
			for (var i in inputs)
				ret[slots[inputs[i]].getName()] = slots[inputs[i]].getPower();
			return ret;
		}

		this.setupState = function(bot) {
			// do nothing unless overrided
		};
		this.execute = function() {
			throw new Error("Adaptor.execute() is meant to be extended and overrided with adaptor type specific behaviour");
		};
		this.reset = function() {
			for (var s=0;s<slots.length;s++)
				if (slots[s]) {
					slots[s].reset();
				}
		};

		this.getConnected = function() {
			var connected = [];
			for (var o=0;o<outputs.length;o++) {
				var output = slots[outputs[o]];
				if (output.isConnected())
					connected.push(output.getConnected());
			}
			return connected;
		};

		this.getSlots = function() {
			return slots.slice();
		};
		this.hasInputs = function() {
			return !!inputs.length;
		};
		this.readyForExecution = function() {
			for (var i=0;i<inputs.length;i++) {
				var input = slots[inputs[i]];
				if (input.getPower()===null && input.isConnected())
					return false;
			}
			return true;
		};
		this.clearIO = function () {
			for (var s=0;s<slots.length;s++) {
				if (slots[s])
					slots[s].setPower(null);
			}
		};
		this.disperseOutputs = function() {
			for (var o=0;o<outputs.length;o++) {
				var output = slots[outputs[o]];
				if (output.isConnected())
					output.getConnected().setPower(output.getPower());
			}
		};

		this.influencers = {
		};
		this.runInfluencer = function(bot,influencer,args) {
			if (typeof args == 'undefined')
				args = [];
			influencer = this.influencers[influencer];
			if (bot.arena.isSimulator)
				return influencer.value;
			else
				return bot.arena[influencer.method].apply(bot.arena,args);
		};

		function getTDInfo(adaptor,slot) {
			var io = adaptor.getOrientedIOBySlot(slot);
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
		this.render = function(adaptor,selectedPosition,cellWidth,cellHeight,holderWidth,holderHeight,gridOffX,gridOffY,tile) {
			var tileIO = [];
			for (var i=0;i<6;i++)
				tileIO[i] = getTDInfo(adaptor,i);
			var ret =
				'<table id="'+(tile?((tile.x)+'_'+(tile.y)):'')+'" style="'+(tile&&selectedPosition==tile.x+'_'+tile.y?'border:#0f0 1px solid;':'')+(tile?('top:'+((tile.ty+gridOffY)*holderHeight)+'px;left:'+((tile.x+gridOffX)*holderWidth)+'px;'):'')+'width:'+holderWidth+'px;height:'+holderHeight+'px;">'+
					'<tr><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td><td style="height:1px;width:'+cellWidth+'px"></td></tr>'+
					'<tr>'+
						'<td colspan="2">' +
						(Util.hasParam(adaptor.influencers)?(
							'<strong class="open-adaptor-settings">C</strong>' +
							'<div style="display:none">'+adaptor.renderConfig()+'</div>'
						):'')+
						'</td>'+
						'<td title="'+tileIO[0].tooltip+'" style="color:'+tileIO[0].color+';background-color:'+tileIO[0].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[0].content:'')+'</td>'+
						'<td colspan="2"></td>'+
					'</tr>'+
					'<tr>'+
						'<td title="'+tileIO[5].tooltip+'" style="color:'+tileIO[5].color+';background-color:'+tileIO[5].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[5].content:'')+'</td>'+
						'<td title="'+adaptor.getDescription()+'" colspan="3" rowspan="3" style="background-color:'+(!tile||tile.val.correctFit?'#eee':'#fdd')+';width:'+(cellWidth*3)+'px;height:'+(cellHeight*3)+'px;">'+adaptor.name+'</td>'+
						'<td title="'+tileIO[1].tooltip+'" style="color:'+tileIO[1].color+';background-color:'+tileIO[1].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[1].content:'')+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td style="height:'+cellHeight+'px"></td>'+
						'<td style="height:'+cellHeight+'px"></td>'+
					'</tr>'+
					'<tr>'+
						'<td title="'+tileIO[4].tooltip+'" style="color:'+tileIO[4].color+';background-color:'+tileIO[4].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[4].content:'')+'</td>'+
						'<td title="'+tileIO[2].tooltip+'" style="color:'+tileIO[2].color+';background-color:'+tileIO[2].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[2].content:'')+'</td>'+
					'</tr>'+
					'<tr>'+
						'<td colspan="2"></td>'+
						'<td title="'+tileIO[3].tooltip+'" style="color:'+tileIO[3].color+';background-color:'+tileIO[3].bgcolor+';width:'+cellWidth+'px;height:'+cellHeight+'px;">'+(tile?tileIO[3].content:'')+'</td>'+
						'<td colspan="2"></td>'+
					'</tr>'+
				'</table>';
			return ret;
		};

		this.renderConfig = function() {
			return '';
		};
	};

	var proto = _construct.prototype;

	proto.getAdaptorTypes = function() {
		return {
			power: {
				title:'Power Generation',
				children:{
					AdaptorPowerCore:{
						title:'Power Core',
						children:[]
					}
				}
			},
			flow: {
				title:'Flow control',
				children:{
					AdaptorConduit:{
						title:'Conduit',
						children:[]
					},
					AdaptorSwitcher:{
						title:'Switcher',
						children:[]
					}
				}
			},
			detection: {
				title:'Detection',
				children:{
					AdaptorEnemyProximity:{
						title:'Enemy Proximity',
						children:[]
					}
				}
			},
		};
	};

	return _construct;
},['Input','Output','IOPort','Util']);