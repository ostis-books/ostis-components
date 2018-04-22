/* --- src/note-common.js --- */
var Example = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/note-paintPanel.js --- */
var id = 0;

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
        container.append('<button id="addNote" type="button">Добавить заметку</button>');


        $('#addNote').click(function () {
            self._addNote(containerId, 1);
        });
    },

    _addNote: function(divId, numerOfFields){
        var container = $('#' + divId);
        var new_param_field_addr, name_addr, age_addr, gender_addr, type_addr;
        SCWeb.core.Server.resolveScAddr(['nrel_character_gender', 'nrel_character_name', 'nrel_main_idtf', 'nrel_character_type', 'nrel_character_age'], function(keynodes){
            gender_addr = keynodes['nrel_character_gender'];
            name_addr = keynodes['nrel_main_idtf'];
            type_addr = keynodes['nrel_character_type'];
            age_addr = keynodes['nrel_character_age'];

            var character_params = [gender_addr, name_addr, type_addr, age_addr];
            SCWeb.core.Server.resolveIdentifiers(character_params, function(keynodes){
                var strProm = "Введите текст заметки";
                var attr = prompt(strProm);
                container.append("<div id=\"" + id + "\" class=\"note\"><button class=\"exit\" onclick=exit(" + id + ")>X</button>"+attr+"</div>"); 
                id = id+1;
            });      
        });
    },
};

function exit(str) {
  var el = document.getElementById(str);
    el.parentNode.removeChild(el);
};

/* --- src/note-component.js --- */
/**
 * Example component.
 */
Example.DrawComponent = {
    ext_lang: 'note_view',
    formats: ['format_notes'],
    struct_support: true,
    factory: function (sandbox) {
        return new Example.DrawWindow(sandbox);
    }
};

Example.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new Example.PaintPanel(this.sandbox.container);
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
SCWeb.core.ComponentManager.appendComponentInitialize(Example.DrawComponent);

