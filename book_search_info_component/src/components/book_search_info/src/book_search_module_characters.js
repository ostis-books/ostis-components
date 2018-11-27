function ModuleCharacters(parent) {
    this.parent = parent;

    this.sc_type_arc_pos_var_perm = (sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm);

    this.characters = 0;
    this.maxCharacters = 5;
}

ModuleCharacters.prototype = {

    getRequiredKeynodes: function () {
        return [
            'gender',
            'nrel_character_type'
        ];
    },

    getSelectedCriteriaCount: function () {
        var criteriaCount = 0;

        for (var i = 0; i < this.characters; ++i) {
            if ($(`#name_field_${i}`).val() != "")
                ++criteriaCount;

            if ($(`#gender_check_${i}`).prop('checked'))
                ++criteriaCount;

            if ($(`#type_check_${i}`).prop('checked'))
                ++criteriaCount;
        }

        return criteriaCount;
    },

    initMarkup : function (containerId) {
        this.parent._debugMessage("ModuleCharacters: initializing html");

        var container = $('#' + containerId);

        // form
        container.append('<div class="container-fluid"><form id="characters_form">');

        // 'add character' button
        $('#characters_form').append(
            '<hr/>' +
            '<button id="add_character_button" type="button" class="btn btn-secondary">Добавить персонажа</button>' +
            '<hr/>'
        );

        $('#add_character_button').click(
            () => this._addCharacter()
        );
    },

    onKeynodesResolved: function () {
        this.parent._debugMessage("ModuleCharacters: keynodes resolved (nothing to do)");
    },

    appendCriteriaToPattern: function (pattern) {
        this.parent._debugMessage("ModuleCharacters: appending selected criteria to pattern");

        var dfd = new jQuery.Deferred();

        dfd.resolve();

        return dfd.promise();
    },

    _addCharacter: function () { 
        
        if (this.characters >= this.maxCharacters) {
            alert(`Лимит персонажей (${this.maxCharacters}) достигнут!`);
            return;
        }

        if (this.characters > 0)
            $('#characters_form').append('<hr/>');
        
        var index = this.characters;
        this.characters += 1;

        this.parent._debugMessage(`ModuleCharacters: adding character ${index}`);

        // name
        $('#characters_form').append(
            `<div class="form-group row">` +
                `<label class="col-sm-2 col-form-label" for="name_field_${index}">Имя:</label>` +
                `<div class="col-sm-7">` +
                    `<input id="name_field_${index}" class="form-control" type="text" placeholder="введите имя персонажа">` +
                `</div>` +
            `</div>`
        );

        // gender
        $('#characters_form').append(
            `<div class="form-group row">` + 
                `<label class="col-sm-2 col-form-label" for="gender_select_${index}">Пол:</label>` +
                `<div class="col-sm-4">` +
                    `<select id="gender_select_${index}" class="form-control" disabled></select>` +
                `</div>` +
                `<div class="form-check col-sm-3 book_search_checkbox">` +
                    `<input id="gender_check_${index}" class="form-check-input" type="checkbox">` +
                    `<label class="form-check-label book_search_checkbox_label" for="gender_check_${index}">Учитывать пол</label>` +
                `</div>` +
            `</div>`
        );

        // character type
        $('#characters_form').append(
            `<div class="form-group row">` + 
                `<label class="col-sm-2 col-form-label" for="type_select_${index}">Роль:</label>` +
                `<div class="col-sm-4">` +
                    `<select id="type_select_${index}" class="form-control" disabled></select>` +
                `</div>` +
                `<div class="form-check col-sm-3 book_search_checkbox">` +
                    `<input id="type_check_${index}" class="form-check-input" type="checkbox">` +
                    `<label class="form-check-label book_search_checkbox_label" for="type_check_${index}">Учитывать роль</label>` +
                `</div>` +
            `</div>`
        );

        // enable/disable gender select on checkbox click
        var gender_check = $(`#gender_check_${index}`);
        gender_check.click(() => {
            var checked = gender_check.prop('checked');
            gender_check.prop('disabled', !checked);
        });

        // enable/disable type select on checkbox click
        var type_check = $(`#type_check_${index}`);
        type_check.click(() => {
            var checked = type_check.prop('checked');
            type_check.prop('disabled', !checked);
        });

        this._fillDropdownLists(index);
    },

    _getKeynode: function (idtf) {
        return this.parent.getKeynode(idtf);
    },

    _fillDropdownLists: function (index) {
        this.parent._debugMessage(`ModuleCharacters: filling dropdown lists for character ${index}`);

        // fill genders list
        window.scHelper.getSetElements(this._getKeynode('gender')).done(genders => {
            $.each(genders, (i, gender_addr) => {
                window.scHelper.getIdentifier(gender_addr, scKeynodes.lang_ru).done(gender_idtf => {
                    $(`#gender_select_${index}`).append($('<option>', { value : gender_addr }).text(gender_idtf));
                })
            });
        });

        // fill types list
        window.scHelper.getSetElements(this._getKeynode('nrel_character_type')).done(types => {
            $.each(types, (i, type_addr) => {
                window.scHelper.getIdentifier(type_addr, scKeynodes.lang_ru).done(type_idtf => {
                    $(`#type_select_${index}`).append($('<option>', { value : type_addr }).text(type_idtf));
                })
            });
        });
    }
};