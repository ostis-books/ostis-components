/**
 * Paint panel.
 */

SearchMark.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

SearchMark.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;




        container.append('<label>Сюжет</label><select id="story"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Персонажи</label><select id="characters"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Атмосфера</label><select id="world"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Погружение</label><select id="deep"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
         container.append('<label>Средняя оценка</label><select id="final"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
         container.append('<input type="button" id="newButton1" value="Поиск"> <br>');

		$('#newButton1').click(function () {



			self._generateNodes4('story', 'characters', 'world', 'deep', 'final');


		});



    },




	_generateNodes4: function (input1, input2, input3, input4, input5) {
		var book, nrel_plot_mark,nrel_character_mark, nrel_wrold_mark, nrel_dip_mark, nrel_narrative_mark,nrel_main_idtf,lang_ru;

		// Resolve sc-addr. Get sc-addr of ui_main_menu node
		SCWeb.core.Server.resolveScAddr(['book', 'nrel_plot_mark', 'nrel_character_mark', 'nrel_world_mark', 'nrel_dip_mark', 'nrel_number_of_pages','nrel_main_idtf','lang_ru'], function (keynodes) {
			book = keynodes['book'];
			nrel_plot_mark = keynodes['nrel_plot_mark'];
			nrel_character_mark = keynodes['nrel_character_mark'];
			nrel_wrold_mark = keynodes['nrel_world_mark'];
			nrel_dip_mark = keynodes['nrel_dip_mark'];
			nrel_narrative_mark = keynodes['nrel_narrative_mark'];
			nrel_main_idtf=keynodes['nrel_main_idtf'];
			lang_ru=keynodes['lang_ru'];


			window.sctpClient.create_node(sc_type_const).done(function (node) {


				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, book, node);

				window.sctpClient.create_link().done(function (generatedLink1) {
					window.sctpClient.set_link_content(generatedLink1, document.getElementById(input1).value);
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, node, generatedLink1).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_plot_mark, generatedCommonArc);
					});
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_ru, generatedLink1);
				});

				window.sctpClient.create_link().done(function (generatedLink2) {
					window.sctpClient.set_link_content(generatedLink2, document.getElementById(input2).value);
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, node, generatedLink2).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_character_mark, generatedCommonArc);
					});

				});

				window.sctpClient.create_link().done(function (generatedLink3) {
					window.sctpClient.set_link_content(generatedLink3, document.getElementById(input3).value);
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, node, generatedLink3).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_wrold_mark, generatedCommonArc);
					});

				});

				window.sctpClient.create_link().done(function (generatedLink4) {
					window.sctpClient.set_link_content(generatedLink4, document.getElementById(input4).value);
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, node, generatedLink4).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_dip_mark, generatedCommonArc);
					});

				});

				window.sctpClient.create_link().done(function (generatedLink5) {
					window.sctpClient.set_link_content(generatedLink5, document.getElementById(input5).value);
					window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, node, generatedLink5).done(function (generatedCommonArc) {
						window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_narrative_mark, generatedCommonArc);
					});

				});

				self._showMainMenuNode(node);
			});


		});

	},










    /* Call agent of searching semantic neighborhood,
	send ui_main_menu node as parameter and add it in web window history
	*/
/*	_showMainMenuNode: function (node) {
		var addr;
		// Resolve sc-addr. Get sc-addr of ui_main_menu node
		SCWeb.core.Server.resolveScAddr([node], function (keynodes) {
			addr = keynodes[node];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			SCWeb.core.Server.resolveScAddr(["ui_menu_file_for_finding_books_by_marks"],
			function (data) {
				// Get command of ui_menu_view_full_semantic_neighborhood
				var cmd = data["ui_menu_file_for_finding_books_by_marks"];
				// Simulate click on ui_menu_view_full_semantic_neighborhood button
				SCWeb.core.Main.doCommand(cmd,
				[addr], function (result) {
					// waiting for result
					if (result.question != undefined) {
						// append in history
						SCWeb.ui.WindowManager.appendHistoryItem(result.question);
					}
				});
			});
		});
	},*/





    _showMainMenuNode: function (node) {
        var addr;
        // Resolve sc-addr. Get sc-addr of ui_main_menu node


            // Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
            SCWeb.core.Server.resolveScAddr(["ui_menu_file_for_finding_books_by_marks"],
                function (data) {
                    // Get command of ui_menu_view_full_semantic_neighborhood
                    var cmd = data["ui_menu_file_for_finding_books_by_marks"];
                    // Simulate click on ui_menu_view_full_semantic_neighborhood button
                    SCWeb.core.Main.doCommand(cmd,
                        [node], function (result) {
                            // waiting for result
                            if (result.question != undefined) {
                                // append in history
                                SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                            }
                        });
                });

    },



	_findMainIdentifier: function () {
		console.log("inFind");
		var main_menu_addr, nrel_main_idtf_addr;
		// Resolve sc-addrs.
		SCWeb.core.Server.resolveScAddr(['ui_main_menu', 'nrel_main_idtf'], function (keynodes) {
			main_menu_addr = keynodes['ui_main_menu'];
			nrel_main_idtf_addr = keynodes['nrel_main_idtf'];
			console.log(main_menu_addr);
			console.log(nrel_main_idtf_addr);
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
 				main_menu_addr,
 				sc_type_arc_common | sc_type_const,
 				sc_type_link,
 				sc_type_arc_pos_const_perm,
 				nrel_main_idtf_addr]).
			done(function(identifiers){	 
				 window.sctpClient.get_link_content(identifiers[0][2],'string').done(function(content){
				 	alert('Главный идентификатор: ' + content);
				 });			
			});
		});
    },


};
