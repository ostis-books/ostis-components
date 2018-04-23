/* --- src/tag-cloud-common.js --- */
var TagCloud = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/tag-cloud-painter.js --- */

TagCloud.Painter = function (containerId) {
    this.containerId = containerId;
};

TagCloud.Painter.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
        
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;
        
	     $('#window-header-tools').append('<div id="cloudCanvasContainer"><canvas width="250" height="250" id="cloudCanvas"><p>Anything in here will be replaced on browsers that support the canvas element</p></canvas></div>')

	       container.append('<button id="showCloud" type="button" class="btn btn-info sc-no-default-cmd">Показать облако тегов</button>')
	       container.append('<button id="hideCloud" type="button" class="btn btn-danger sc-no-default-cmd">Скрыть</button>')
			         
			if($('#tags').length){
				$('#hideCloud').prop("disabled",false);
				$('#showCloud').prop("disabled",true);
			} else{
				$('#hideCloud').prop("disabled",true);
				$('#showCloud').prop("disabled",false);
			}
		$('#showCloud').click(function(){

	 			$('#cloudCanvasContainer').show();
				self._showCloud();
	 			$(this).prop("disabled",true);

	 			$('#hideCloud').prop("disabled",false);

	 		})
	 		
	 	$('#hideCloud').click(function(){
	 			$('#cloudCanvasContainer').hide();
	 			$('#tags').remove();
	 			$(this).prop("disabled",true);
	 			$('#showCloud').prop("disabled",false);

	 	})
 		
    },

	_showCloud: function(){
		 
       $('#window-header-tools').append('<div id="tags"><ul></ul></div>');
       var sc_elements_cmd_selector = '[sc_addr]:not(.sc-window, .sc-no-default-cmd, .btn-group)';
            $('#tags').delegate(sc_elements_cmd_selector, 'click', function (e) {
                if (!SCWeb.ui.ArgumentsPanel.isArgumentAddState()) {
                    SCWeb.core.Main.doDefaultCommand([$(e.currentTarget).attr('sc_addr')]);
                    e.stopPropagation();
                }
            });

		SCWeb.core.Server.resolveScAddr(['subject_domain_of_sets', 'nrel_main_idtf', 'concept_person'],
			function (keynodes) {
				var set_domain = keynodes['subject_domain_of_sets'];
				var person_addr = keynodes['concept_person'];
				var nrel_main_idtf_addr = keynodes['nrel_main_idtf'];

				TagCloud.Painter.prototype._appendSet(person_addr, nrel_main_idtf_addr);
		});
	
						
	}, 
	_appendSet: function(set_addr,nrel_main_idtf_addr){
		window.scHelper.getSetElements(set_addr).done(function(elements){

			
				for(var el = 0; el<elements.length; el++) {

					element = elements[el];
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
										 				element,
										 				sc_type_arc_common | sc_type_const,
										 				sc_type_link,
										 				sc_type_arc_pos_const_perm,
										 				nrel_main_idtf_addr])
	 				.done(function(identifiers){
	 					 window.sctpClient.get_link_content(identifiers[0][2],'string')
	 					 	.done(function(content){
	 					 	
		 					 	 $('#tags ul')
		 					 	.append('<li><a href="#" class="scs-scn-element scs-scn-field scs-scn-highlighted" sc_addr="'
		 					 		+identifiers[0][0]+'">'+content+'</a></li>');

		 					 	 $('#cloudCanvas').tagcanvas({
								          		textColour: '#337ab7',
								          		outlineColour: '#71ad55',
								          		reverse: true,
								          		depth: 0.8,
								          		maxSpeed: 0.05},
								          		'tags');
		 					});
	 				});
				}
			
				});
	}
};

/* --- src/tag-cloud-component.js --- */
/**
 * TagCloud component.
 */
TagCloud.DrawComponent = {
    ext_lang: 'tag_cloud_code',
    formats: ['format_tag_cloud_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new TagCloud.DrawWindow(sandbox);
    }
};

TagCloud.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new TagCloud.Painter(this.sandbox.container);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    var scElements = {};

    function drawAllElements() {
        var dfd = new jQuery.Deferred();
       // for (var addr in scElements) {
            jQuery.each(scElements, function(j, val){
                var obj = scElements[j];
                if (!obj || obj.translated) return;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
                    // logic for component update should go here
                }

        });
        SCWeb.ui.Locker.hide();
        dfd.resolve();
        return dfd.promise();
    }

// resolve keynodes
    var self = this;
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
// check if object is an arc
            var dfd1 = drawAllElements();
            dfd1.done(function (r) {
                return;
            });


/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
            return dfd1.promise();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            SCWeb.ui.Locker.show();
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(TagCloud.DrawComponent);

