
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

		SCWeb.core.Server.resolveScAddr(['book', 'nrel_main_idtf', 'concept_person', 'concept_book', 'person'],
			function (keynodes) {
				var book_addr = keynodes['book'];
				var concept_book_addr = keynodes['concept_book'];
				var person_addr = keynodes['person'];
				var concept_person_addr = keynodes['concept_person'];
				var nrel_main_idtf_addr = keynodes['nrel_main_idtf'];

				TagCloud.Painter.prototype._appendSet(book_addr, nrel_main_idtf_addr);
				TagCloud.Painter.prototype._appendSet(person_addr, nrel_main_idtf_addr);

				TagCloud.Painter.prototype._appendSet(concept_person_addr, nrel_main_idtf_addr);
				TagCloud.Painter.prototype._appendSet(concept_book_addr, nrel_main_idtf_addr);
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