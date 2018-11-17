function ModuleGeneralInfo(parent) {
    this.parent = parent;

    this.sc_type_arc_pos_var_perm = (sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm);
}

ModuleGeneralInfo.prototype = {

    getRequiredKeynodes: function () {
        return [
            'nrel_author',
            'genre',
            'nrel_original_language',
            'nrel_sc_text_translation',
            'resolving_link'
        ];
    },

    getSelectedCriteriaCount: function () {
        var criteriaCount = 0;

        if ($("#author_field").val() != "") {
            ++criteriaCount;
        }

        if ($("#genre_check").prop('checked')) {
            ++criteriaCount;
        }

        if ($("#lang_check").prop('checked')) {
            ++criteriaCount;
        }

        return criteriaCount;
    },

    initMarkup : function (containerId) {
        var container = $('#' + containerId);

        // form
        container.append('<div class="container-fluid" id="book_search_container"><form id="book_search_form">');

        // author name
        $('#book_search_form').append(
            '<div class="form-group row">' +
                '<label class="col-sm-2 col-form-label" for="author_field">Имя автора:</label>' +
                '<div class="col-sm-7">' +
                    '<input id="author_field" class="form-control" type="text" placeholder="введите имя автора">' +
                '</div>' +
            '</div>'
        );

        // genre
        $('#book_search_form').append(
            '<div class="form-group row">' + 
                '<label class="col-sm-2 col-form-label" for="genre_select">Жанр:</label>' +
                '<div class="col-sm-4">' +
                    '<select id="genre_select" class="form-control" disabled></select>' +
                '</div>' +
                '<div class="form-check col-sm-3 book_search_checkbox">' +
                    '<input id="genre_check" class="form-check-input" type="checkbox">' +
                    '<label class="form-check-label book_search_checkbox_label" for="genre_check">Учитывать жанр</label>' +
                '</div>' +
            '</div>'
        );

        // language
        $('#book_search_form').append(
            '<div class="form-group row">' + 
                '<label class="col-sm-2 col-form-label" for="lang_select">Язык:</label>' +
                '<div class="col-sm-4">' +
                    '<select id="lang_select" class="form-control" disabled></select>' +
                '</div>' +
                '<div class="form-check col-sm-3 book_search_checkbox">' +
                    '<input id="lang_check" class="form-check-input" type="checkbox">' +
                    '<label class="form-check-label book_search_checkbox_label" for="lang_check">Учитывать язык</label>' +
                '</div>' +
            '</div>'
        );

        // enable/disable genre select on checkbox click
        $('#genre_check').click(function () {
            var checked = $('#genre_check').prop('checked');
            $('#genre_select').prop('disabled', !checked);
        });

        // enable/disable language select on checkbox click
        $('#lang_check').click(function () {
            var checked = $('#lang_check').prop('checked');
            $('#lang_select').prop('disabled', !checked);
        });
    },

    onKeynodesResolved: function () {
        this.parent._debugMessage("ModuleGeneralInfo: keynodes resolved");
        this._fillDropDownLists();
    },

    appendSelectedCriteria: function (pattern, book, onCriteriaAppended) {

        var totalCriteriaCount = this.getSelectedCriteriaCount();
        var currentCriteriaCount = 0;

        appendCriteria = function () {
            currentCriteriaCount += 1;

            if (currentCriteriaCount == totalCriteriaCount) {
                onCriteriaAppended(pattern);
            }
        }

        var self = this;

        // append author name to pattern
        var authorName = $("#author_field").val();
        if (authorName != "") {
            self._addAuthorNameToPattern(pattern, book, authorName, appendCriteria);
        }

        // append genre to pattern
        if ($("#genre_check").prop('checked')) {
            var genre = $("#genre_select option:selected").val();
            self._addGenreToPattern(pattern, book, genre, appendCriteria);
        }

        // append language to pattern
        if ($("#lang_check").prop('checked')) {
            var lang = $("#lang_select option:selected").val();
            self._addLanguageToPattern(pattern, book, lang, appendCriteria);
        }
    },

    _getKeynode: function (idtf) {
        return this.parent.getKeynode(idtf);
    },

    _fillDropDownLists: function () {
        this.parent._debugMessage("ModuleGeneralInfo: filling dropdown lists");

        // fill genres list
        window.scHelper.getSetElements(this._getKeynode('genre')).done(function (genres) {
            $.each(genres, function (index, genre_addr) {
                window.scHelper.getIdentifier(genre_addr, scKeynodes.lang_ru).done(function (genre_idtf) {
                    $('#genre_select')
                        .append($('<option>', { value : genre_addr }).text(genre_idtf));
                })
            });
        });

        // fill languages list
        window.scHelper.getLanguages().done(function (languages) {
            $.each(languages, function (index, lang_addr) {
                window.scHelper.getIdentifier(lang_addr, scKeynodes.lang_ru).done(function (lang_idtf) {
                    $('#lang_select')
                        .append($('<option>', { value : lang_addr }).text(lang_idtf));
                })
            });
        });
    },

    _addToPattern: function (pattern, addr) {
        window.scHelper.checkEdge(pattern, sc_type_arc_pos_const_perm, addr).fail(function () {
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, pattern, addr);
        });
    },

    _addAuthorNameToPattern: function (pattern, book, authorName, onAdded) {
        var self = this;

        // create variable node that corresponds to link with author name
        window.sctpClient.create_node(sc_type_var).done(function (authorNameNode) {
            self._addToPattern(pattern, authorNameNode);

            // mark author name node as a link that needs to be resolved
            window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self._getKeynode('resolving_link'), authorNameNode);

            // create language arc
            window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, scKeynodes.lang_ru, authorNameNode).done(function (languageArc) {
                self._addToPattern(pattern, scKeynodes.lang_ru);
                self._addToPattern(pattern, languageArc);
            });

            // create link with author name
            window.sctpClient.create_link().done(function (authorLink) {
                window.sctpClient.set_link_content(authorLink, authorName);

                // create nrel_sc_text_translation arc
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, authorLink, authorNameNode).done(function (translationArc) {
                    window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self._getKeynode('nrel_sc_text_translation'), translationArc);
                });
            });

            // create author
            window.sctpClient.create_node(sc_type_var).done(function (authorNode) {
                // TODO: add authorNode to person class
                self._addToPattern(pattern, authorNode);

                // create nrel_main_idtf relation
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, authorNode, authorNameNode).done(function (authorIdtfArc) {
                    self._addToPattern(pattern, authorIdtfArc);
    
                    window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, scKeynodes.nrel_main_idtf, authorIdtfArc).done(function (nrelIdtfArc) {
                        self._addToPattern(pattern, nrelIdtfArc);
                        self._addToPattern(pattern, scKeynodes.nrel_main_idtf);
                    });
                });

                // create nrel_author relation
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, book, authorNode).done(function (authorArc) {
                    self._addToPattern(pattern, authorArc);
    
                    window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self._getKeynode('nrel_author'), authorArc).done(function (nrelAuthorArc) {
                        self._addToPattern(pattern, nrelAuthorArc);
                        self._addToPattern(pattern, self._getKeynode('nrel_author'));

                        self.parent._debugMessage("add author to pattern");
                        onAdded();
                    });
                });
            });

        });
    },

    _addGenreToPattern: function (pattern, book, genre, onAdded) {
        var self = this;
        
        // create genre arc
        window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, genre, book).done(function (genreArc) {
            self._addToPattern(pattern, genreArc);
            self._addToPattern(pattern, genre);

            self.parent._debugMessage("add genre to pattern");
            onAdded();
        });
    },

    _addLanguageToPattern: function (pattern, book, lang, onAdded) {
        var self = this;
        
        // create language arc
        window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, lang, book).done(function (langArc) {
            self._addToPattern(pattern, langArc);
            self._addToPattern(pattern, lang);

            window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self._getKeynode('nrel_original_language'), langArc).done(function (nrelLangArc) {
                self._addToPattern(pattern, nrelLangArc);
                self._addToPattern(pattern, self._getKeynode('nrel_original_language'));

                self.parent._debugMessage("add language to pattern");
                onAdded();
            });
        });
    }
};