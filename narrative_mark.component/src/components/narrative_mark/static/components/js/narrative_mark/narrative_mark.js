/* --- src/narrative_mark-common.js --- */
var NarrativeMark = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/narrative_mark-paintPanel.js --- */
/**
 * Paint panel.
 */

  function generateNodesValue (addr_id) {
		var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
		// Resolve sc-addr. Get sc-addr of ui_main_menu node
		SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_value'], function (keynodes) {
			main_menu_addr = keynodes[addr_id];
			nrel_main_idtf_addr = keynodes['nrel_value'];
			lang_en_addr = keynodes['concept_quantity'];

			window.sctpClient.create_link().done(function (generatedLink) {
				window.sctpClient.set_link_content(generatedLink, document.getElementById(addr_id).value);
				window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
				});
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
			});
					
		});
	}


NarrativeMark.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

NarrativeMark.PaintPanel.prototype = {


    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
	 var self = this;

        container.append('<select id="example_books"> <option>book_Viy</option> <option>book_A_hero_of_our_time</option><option>book_Demon</option></select><br> ');
        container.append('<label>Сюжет</label><select id="story"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Персонажи</label><select id="characters"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Атмосфера</label><select id="world"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');
        container.append('<label>Погружение</label><select id="deep"> <option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option></select><br>');

        container.append('<input type="button" id="newButton1" value="OK" onclick="generateNodesValue("example_books")"> <br>');


        $('#newButton1').click(function () {
            var n = +document.getElementById('story').value + +document.getElementById('characters').value + +document.getElementById('world').value + +document.getElementById('deep').value;
            var s = n/4;


            container.append('<label>Итог</label> <input type="text" id="OS" > <br>');

            document.getElementById('OS').value =s;

            self. _generateNodes($("#example_books option:selected").text(), 'OS');
            self. _generateNodes1($("#example_books option:selected").text(), 'story');
            self. _generateNodes2($("#example_books option:selected").text(), 'characters');
            self. _generateNodes3($("#example_books option:selected").text(), 'world');
            self. _generateNodes4($("#example_books option:selected").text(), 'deep');


        });
    },


	_showMainMenuNode: function () {
		var addr;
		// Resolve sc-addr. Get sc-addr of ui_main_menu node
		SCWeb.core.Server.resolveScAddr([''], function (keynodes) {
			addr = keynodes[''];
			// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
			SCWeb.core.Server.resolveScAddr(["ui_menu_view_full_semantic_neighborhood"],
			function (data) {
				// Get command of ui_menu_view_full_semantic_neighborhood
				var cmd = data["ui_menu_view_full_semantic_neighborhood"];
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

    _generateNodes: function (addr_id, input) {
		var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
		// Resolve sc-addr. Get sc-addr of ui_main_menu node
		SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_narrative_mark'], function (keynodes) {
			main_menu_addr = keynodes[addr_id];
			nrel_main_idtf_addr = keynodes['nrel_narrative_mark'];
			lang_en_addr = keynodes['concept_quantity'];

			window.sctpClient.create_link().done(function (generatedLink) {
				window.sctpClient.set_link_content(generatedLink, document.getElementById(input).value);
				window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
					window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
				});
				window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
			});

		});
	},

    _generateNodes1: function (addr_id, input) {
        var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
        // Resolve sc-addr. Get sc-addr of ui_main_menu node
        SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_plot_mark'], function (keynodes) {
            main_menu_addr = keynodes[addr_id];
            nrel_main_idtf_addr = keynodes['nrel_plot_mark'];
            lang_en_addr = keynodes['concept_quantity'];

            window.sctpClient.create_link().done(function (generatedLink) {
                window.sctpClient.set_link_content(generatedLink, document.getElementById(input).value);
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
                });
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
            });

        });
    },

    _generateNodes2: function (addr_id, input) {
        var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
        // Resolve sc-addr. Get sc-addr of ui_main_menu node
        SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_character_mark'], function (keynodes) {
            main_menu_addr = keynodes[addr_id];
            nrel_main_idtf_addr = keynodes['nrel_character_mark'];
            lang_en_addr = keynodes['concept_quantity'];

            window.sctpClient.create_link().done(function (generatedLink) {
                window.sctpClient.set_link_content(generatedLink, document.getElementById(input).value);
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
                });
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
            });

        });
    },

    _generateNodes3: function (addr_id, input) {
        var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
        // Resolve sc-addr. Get sc-addr of ui_main_menu node
        SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_world_mark'], function (keynodes) {
            main_menu_addr = keynodes[addr_id];
            nrel_main_idtf_addr = keynodes['nrel_world_mark'];
            lang_en_addr = keynodes['concept_quantity'];

            window.sctpClient.create_link().done(function (generatedLink) {
                window.sctpClient.set_link_content(generatedLink, document.getElementById(input).value);
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
                });
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
            });

        });
    },

    _generateNodes4: function (addr_id, input) {
        var main_menu_addr, nrel_main_idtf_addr, lang_en_addr;
        // Resolve sc-addr. Get sc-addr of ui_main_menu node
        SCWeb.core.Server.resolveScAddr([addr_id, 'concept_quantity', 'nrel_dip_mark'], function (keynodes) {
            main_menu_addr = keynodes[addr_id];
            nrel_main_idtf_addr = keynodes['nrel_dip_mark'];
            lang_en_addr = keynodes['concept_quantity'];

            window.sctpClient.create_link().done(function (generatedLink) {
                window.sctpClient.set_link_content(generatedLink, document.getElementById(input).value);
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, main_menu_addr, generatedLink).done(function (generatedCommonArc) {
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, nrel_main_idtf_addr, generatedCommonArc);
                });
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, lang_en_addr, generatedLink);
            });

        });
    },


};


/* --- src/narrative_mark-component.js --- */
/**

 * Example component.
 */

NarrativeMark.DrawComponent = {
    ext_lang: 'narrative_mark',
    formats: ['format_narrative_mark_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new NarrativeMark.DrawWindow(sandbox);
    }
};

NarrativeMark.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new NarrativeMark.PaintPanel(this.sandbox.container);
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
SCWeb.core.ComponentManager.appendComponentInitialize(NarrativeMark.DrawComponent);


