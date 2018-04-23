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