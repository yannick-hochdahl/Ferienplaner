$(function() {
    
    DaysView = Backbone.View.extend({
    	initialize : function(days) {
    		this.el = document.getElementById("canvas");
            this.delegateEvents(this.events);
    		this.absenseTypes = new AbsenseTypes();
            this.days=days;
            this.persons=days?days.persons:null;
            this.monthLength = days?this.days.length/persons.length:null;
        	this.weekdays = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    	},
    	events: { 
    		"click rect[id^='cc_']" : "click"
    	}, 
    	change: function(days){
    		this.days=days;
    		this.monthLength = this.days.length/persons.length;
    	},
    	click: function(e){ 
    		var clickedEl = $(e.currentTarget);
    		var id = clickedEl.attr("id").split("_");
    		var x = parseInt(id[1]);
    		var y = parseInt(id[2]);
    		
    		var day = this.days.at(y*this.monthLength+x);
    		var color = this.absenseTypes.colors[scheduler.get('selectedAbsenseType')];
    		var cc=canvas.rect(x*20+62,y*40+32,16,16,4).attr({fill: color});
    		cc.node.id='cc_'+x+"_"+y;
    		
    		if (scheduler.get('selectedAbsenseType')==2 && this.days.at(y*this.monthLength+x).get('absenseType')!=2){
    			persons.at(y).holidays=parseInt(persons.at(y).holidays)+1;
    		} else if (scheduler.get('selectedAbsenseType')!=2 && this.days.at(y*this.monthLength+x).get('absenseType')==2){
    			persons.at(y).holidays=parseInt(persons.at(y).holidays)-1;
    		}
			$('#holi_'+y).remove();
			var holi = canvas.text(this.monthLength*20+70, y*40+40, persons.at(y).holidays).attr({"font": '12px Fontin-Sans, Arial', stroke: "none", fill: "yellow"});
			holi.node.id='holi_'+y;
			
    		day.set({absenseType: scheduler.get('selectedAbsenseType')});
    		day.save();
    	},
    	renderNames: function(){
			for ( var k=0; k<persons.length ; k++){
				var name = persons.at(k).name.replace(' ','\n');
				//var name = persons.at(k).name;
				canvas.text(30, k*40+40, name).attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#fff"});
			}
    	},
    	renderHolidays: function(i){
    		for ( var k=0; k<persons.length ; k++){
        		var holi = canvas.text(i*20+70, k*40+40, persons.at(k).holidays).attr({"font": '12px Fontin-Sans, Arial', stroke: "none", fill: "yellow"});
    			holi.node.id='holi_'+k;
    		}
    	},
    	render: function(){ 
    		var p1 = (new Date).getTime();
    		var startDay = new XDate(2012,scheduler.get('actualMonth'),1).getDay();
    		this.renderNames();
    		this.renderHolidays(this.monthLength);
    		for ( var i=0; i<31; i++){
                var t = (startDay+i)%7;
                if (i<this.monthLength){
                    canvas.text().attr({x:i*20+70,y:15,text:this.weekdays[t]+"\n"+(i+1)+".","font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#fff"});
                }
            }
			var diff = (new Date).getTime()-p1;
			console.log('Ueberschrift:'+diff);
			for ( var k=0; k<persons.length ; k++){
	    		var p2 = (new Date).getTime();
				for ( var i=0; i<this.monthLength; i++){
        			var day = this.days.at(i);
        			var name = persons.at(k).name.replace(' ','\n');
        			var day = this.days.at(i+k*this.monthLength);
                	var abstype = day.get('absenseType');
                   	var color = this.absenseTypes.colors[abstype];
                   	var cc=canvas.rect(i*20+62,k*40+32,16,16,4).attr({fill: color});
                   	if (abstype!=1){
                       	cc.node.id='cc_'+i+"_"+k;
                   	}
				}
    			var diff = (new Date).getTime()-p2;
    			console.log('eine Zeile:'+diff);
        	}
			var diff = (new Date).getTime()-start
			console.log('Gesamt:'+diff);
    	}
    });
    
    AbsenseTypesSelectionView = Backbone.View.extend({
    	initialize : function() {
            this.x=0;
            this.y=700;
    		this.absenses = new AbsenseTypes();
            this.el = document.getElementById("canvas");
            this.delegateEvents(this.events);
    	},
    	events: { 
    		"click circle[id^='abt_']" : "click"
    	}, 
    	click: function(e){ 
    		var clickedEl = $(e.currentTarget);
    		var id = clickedEl.attr("id");
    		scheduler.set({selectedAbsenseType:id.substr(4)});
    		this.render();
    		
    	}, 
    	render: function(){
			$('#oc').remove();
    		for ( var i=0; i<this.absenses.type.length ; i++){
    			var ic = canvas.circle().attr({cx:i*80+20, cy:this.y, r:8, fill: this.absenses.colors[i]});
    			ic.node.id='abt_'+i;
    			if (i==scheduler.get('selectedAbsenseType')){
    				var oc = canvas.circle().attr({cx:ic.attr('cx'),cy:ic.attr('cy'),r:10, stroke:'#b4cbec',"stroke-width":3,hue: .45});
       				oc.node.id='oc';
    			}
    			canvas.text(i*80+20, this.y+20, this.absenses.type[i]).attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#fff"});
    		}
    	}
    	
    });
    
    MonthPaginationView = Backbone.View.extend({
    	initialize : function() {
            this.x=800;
            this.y=695;
            
            this.bg = canvas.rect();
            this.month = canvas.text();
            this.rightc = canvas.circle();
            this.leftc = canvas.circle();
            this.right = canvas.path();
            this.left = canvas.path();
            
            
            this.el = document.getElementById("canvas");
            this.delegateEvents(this.events);
    	},
    	events: { 
            "click #rightc,#right" : "clickR",
            "click #leftc,#left" : "clickL"
    	}, 
    	clickR: function(){ 
    		var actualMonth = scheduler.get('actualMonth');
    		var am=(actualMonth==11)?0:actualMonth+1;
    		this.setMonth(am);
    	}, 
    	clickL: function(){ 
    		var actualMonth = scheduler.get('actualMonth');
    		var am=(actualMonth==0)?11:actualMonth-1;
    		this.setMonth(am);
    	},
    	setMonth: function(am){
    		scheduler.set({actualMonth:am});
    	},
    	render: function(){
    		canvas.rect().attr({x:this.x,y:this.y,width:134,height:26,r:13,fill: "#666", stroke: "none"});

            canvas.text().attr({x:this.x+67, y:this.y+13, text: new XDate(2012, scheduler.get('actualMonth')).toString('MMMM', 'de'), fill: "#fff", stroke: "none", "font": '100 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});

            var left = canvas.circle().attr({cx:this.x+13,cy:this.y+13,r:10, fill: "#fff", stroke: "none"});
            var right = canvas.circle().attr({cx: this.x+121, cy:this.y+13, r:10, fill: "#fff", stroke: "none"});
            var leftc = canvas.path().attr({path:"M"+(this.x+17)+","+(this.y+8)+"l-10,5 10,5z",fill: "#000"});
            var rightc = canvas.path().attr({path:"M"+(this.x+117)+","+(this.y+8)+"l10,5 -10,5z",fill: "#000"});

            rightc.node.id = 'rightc';
            leftc.node.id = 'leftc';
            right.node.id = 'right';
            left.node.id = 'left';
            
    		return this;
    	}
    	
    });
    
    ScheduleView = Backbone.View.extend({
		days : new Backbone.Collection,
    	initialize : function(persons) {
    		this.scheduler=scheduler;
    		this.persons = persons;
    		this.days.model=Day;
    		//********************************************
    		//now let's render()
    		//********************************************
    		this.fetch();
    		//********************************************
    		//now let's bind()
    		//********************************************
    		this.render1 = _.bind(this.fetch, this); 
    		this.scheduler.bind('change:actualMonth',this.render1);
    	},
    	fetch: function(){
    		start = (new Date).getTime();
    		this.days.url = '/rest/fp/days/'+this.scheduler.get('actualMonth');
    		this.days.fetch({success: function(collection){
    			var diff = (new Date).getTime()-start;
    			console.log('Fetch:'+diff);
    			canvas.clear();
        		monthPaginationView.render();
        		absenseTypesSelectionView.render();
        		var days = new Days(collection, [{persons: persons},{am:scheduler.get('actualMonth')}]);
        		daysView.change(days);
        		diff = (new Date).getTime()-start;
    			console.log('Page/Absence/day:'+diff);
    			daysView.render();
    		}, error: function(e) {
    			console.log(e+'error');
    		}});
    	},
    });
    
    
    start = (new Date).getTime();
    XDate.locales['de'] = {
           	monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
    };
    
	scheduler = new Scheduler({actualMonth:new XDate().getMonth(), selectedAbsenseType:2}); 
	
    canvas = new Raphael(document.getElementById("canvas"));     
    
    monthPaginationView = new MonthPaginationView(canvas);
	absenseTypesSelectionView = new AbsenseTypesSelectionView(canvas);
	daysView = new DaysView();
    
	persons = new Persons();
    persons.fetch({success: function(){
    	console.log('persons loaded ...');				
    	scheduleView = new ScheduleView(persons);
    },error:function (xhr, ajaxOptions, thrownError){
        console.log(xhr.status);
        console.log(thrownError);
    }});
});