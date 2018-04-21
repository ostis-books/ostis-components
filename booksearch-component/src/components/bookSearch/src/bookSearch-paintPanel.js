/**
 * Paint panel.
 */

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

Example.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

         var self = this;
        container.append('<div class="sc-no-default-cmd">Поиск книги</div>');
        container.append('<input type="button" value="Добавить поле" id="add-field-1">');
        container.append('<input type = "button" value= "Добавить информацию" id = "add-info-1"> ');
        container.append('<input type = "button" value = " Сгенерировать шаблон" id= "create-pattern">');

        $('#newButton').click(function () {
			self._showMainMenuNode();
		});

		$('#add-field-1').click(function () {
			self._addNewParam(containerId, 1);
		});

		$('#add-info-1').click(function () {
			self._addNewInfo();
		});

		$('#create-pattern').click(function () {
			self._createNewPattern();
		});

    },

    /* она работает!!!!*/
	_addNewParam: function(divId, numerOfFields){
		var container = $('#' + divId);
        var new_param_field_addr, name_addr, age_addr, gender_addr, type_addr;
        SCWeb.core.Server.resolveScAddr(['nrel_character_gender', 'nrel_character_name', 'nrel_main_idtf', 'nrel_character_type', 'nrel_character_age'], function(keynodes){
        	gender_addr = keynodes['nrel_character_gender'];
        	name_addr = keynodes['nrel_main_idtf'];
        	type_addr = keynodes['nrel_character_type'];
        	age_addr = keynodes['nrel_character_age'];

        	var character_params = [gender_addr, name_addr, type_addr, age_addr];
        	SCWeb.core.Server.resolveIdentifiers(character_params, function(keynodes){
        		var character_params_name = [];
        		var strProm = "";
    	       	for (var i = 0; i <= character_params.length - 1; i++) {
        			character_params_name[i] = keynodes[character_params[i]];
        			strProm = strProm + ((i+1)+"."+" "+character_params_name[i]+"\n");
        		}
        		var param_to_create_addr;
        		var attr = prompt(strProm);
        		switch(attr){
        			case '1': param_to_create_addr = character_params[0];
        				break;
        			case '2': param_to_create_addr = character_params[1];
        				break;
        			case '3': param_to_create_addr = character_params[2];
        				break;
        			case '4': param_to_create_addr = character_params[3];
        				break;
        		}
        		var name_of_nrel = keynodes[param_to_create_addr];
        		//console.log(name_of_nrel);
        		container.append("<input type = \"text\" placeholder = \""+name_of_nrel+"\">");	
        	});    	
        });
    },


    /*добавление нового персонажа*/
    _addNewInfo: function(){

    },
    /*формирование шаблона
    еще не доделано*/
    _createNewPattern: function(){
    	// create node
    	var concept_book_addr;
    	SCWeb.core.Server.resolveScAddr(['concept_book'], function(keynodes){
    		concept_book_addr = keynodes['concept_book'];

    		window.sctpClient.create_node(sc_type_node).done(function (generatedNode) {
    			window.sctpClient.create_link().done(function (generatedLink) {
    				window.sctpClient.set_link_content(generatedLink, 'new_book');
    				window.sctpClient.create_arc(sc_type_arc_common| sc_type_const, generatedNode, generatedLink).done(function(generatedCommonArc){
    					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifer, generatedCommonArc).done(function(){
    						console.log('generated ', generatedNode, 'new_book');
    						resolve(generatedNode);
    					});
    				});
    			});
    		});
    	});
    }
};