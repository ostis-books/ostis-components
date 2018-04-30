/**
 * Paint panel.
 */

BookSearchInfo.PaintPanel = function (containerId) {
    this.containerId = containerId;

    this.keynodes = {};
    this.sc_type_arc_pos_var_perm = (sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm);
};

BookSearchInfo.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
        this._resolveKeynodes();
    },

    _resolveKeynodes: function () {
        requiredKeynodes = [
            'nrel_author',
            'book',
            'ui_menu_search_book_by_template',
            'genre'
        ];

        var self = this;

        SCWeb.core.Server.resolveScAddr(requiredKeynodes, function(resolvedKeynodes){
            self.keynodes = resolvedKeynodes;

            // ensure that all keynodes are resolved before filling lists
            self._fillDropDownLists();
        });
    },

    _initMarkup: function (containerId) {
        var cont = $('#' + containerId);

        cont.append('<div class="sc-no-default-cmd">Поиск книги:</div>');
        cont.append('<label>Имя автора:<input id="author_field" type="text" placeholder="введите имя автора"></label>');
        cont.append('<div class="sc-no-default-cmd">');
        cont.append('<label style="display: inline-block;">Жанр:<select id="genre_select" disabled></select></label>');
        cont.append('<label style="display: inline-block;">Учитывать жанр:<input id="genre_check" type="checkbox"></label>');
        cont.append('</div>');
        cont.append('<br>');
        cont.append('<input id="find_books_button" type="button" value="Найти книги">');

        var self = this;

        // enable/disable genre select on checkbox click
        $('#genre_check').click(function () {
            var checked = $('#genre_check').prop('checked');
            $('#genre_select').prop('disabled', !checked);
        });

        $('#find_books_button').click(function () {
            self._findBooks();
        });
    },

    _fillDropDownLists: function () {
        // fill genres list
        window.scHelper.getSetElements(this.keynodes['genre']).done(function (genres) {
            $.each(genres, function (index, genre_addr) {
                window.scHelper.getIdentifier(genre_addr, scKeynodes.lang_ru).done(function (genre_idtf) {
                    $('#genre_select')
                        .append($('<option>', { value : genre_addr }).text(genre_idtf));
                })
            });
        });
    },

    _findBooks: function () {
        var self = this;

        if (self.keynodes.length == 0) {
            alert("Ошибка! Не удалось найти необходимые понятия");
            return;
        }

        this._createSearchPattern(function (pattern) {
            // initiate ui_menu_search_book_by_template command
            var command = self.keynodes['ui_menu_search_book_by_template'];
            SCWeb.core.Main.doCommand(command, [pattern], function (result) {
                if (result.question != undefined) {
                    SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                }
            });
        });
    },

    _checkIfFieldsEmpty: function () {
        var allFieldsEmpty = true;

        if ($("#author_field").val() != "") {
            allFieldsEmpty = false;
        }

        return allFieldsEmpty;
    },

    _addToPattern: function (pattern, addr) {
        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, pattern, addr);
    },

    _addAuthorNameToPattern: function (pattern, book, authorName) {
        var self = this;

        // create link with author name
        window.sctpClient.create_link().done(function (authorLink) {
            window.sctpClient.set_link_content(authorLink, authorName);

            self._addToPattern(pattern, authorLink);

            // create language arc
            window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, scKeynodes.lang_ru, authorLink).done(function (authorLinkArc) {
                self._addToPattern(pattern, scKeynodes.lang_ru);
                self._addToPattern(pattern, authorLinkArc);
            });

            // create author
            window.sctpClient.create_node(sc_type_var).done(function (authorNode) {
                // TODO: add authorNode to person class
                self._addToPattern(pattern, authorNode);

                // create nrel_main_idtf relation
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, authorNode, authorLink).done(function (authorIdtfArc) {
                    self._addToPattern(pattern, authorIdtfArc);
    
                    window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, scKeynodes.nrel_main_idtf, authorIdtfArc).done(function (nrelIdtfArc) {
                        self._addToPattern(pattern, nrelIdtfArc);
                        self._addToPattern(pattern, scKeynodes.nrel_main_idtf);
                    });
                });

                // create nrel_author relation
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, book, authorNode).done(function (authorArc) {
                    self._addToPattern(pattern, authorArc);
    
                    window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self.keynodes['nrel_author'], authorArc).done(function (nrelAuthorArc) {
                        self._addToPattern(pattern, nrelAuthorArc);
                        self._addToPattern(pattern, self.keynodes['nrel_author']);
                    });
                });
            });
        });
    },

    _addGenreToPattern: function (pattern, book, genre) {
        var self = this;
        
        // create genre arc
        window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, genre, book).done(function (genreArc) {
            self._addToPattern(pattern, genreArc);
            self._addToPattern(pattern, genre);
        });
    },

    _createSearchPattern: function (onCreated) {
        if (this._checkIfFieldsEmpty()) {
            alert("Необходимо заполнить хотя бы одно поле.");
            return;
        }

        var self = this;
        var pattern = null;

        // create pattern
        window.sctpClient.create_node(sc_type_node | sc_type_const).done(function(patternNode) {
            pattern = patternNode;

            // create book
            window.sctpClient.create_node(sc_type_node | sc_type_var).done(function(bookNode) {
                window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self.keynodes['book'], bookNode).done(function (bookArc) {
                    self._addToPattern(pattern, self.keynodes['book']);
                    self._addToPattern(pattern, bookArc);

                    // append author name to pattern
                    var authorName = $("#author_field").val();
                    if (authorName != null) {
                        self._addAuthorNameToPattern(pattern, bookNode, authorName);
                    }

                    // append genre to pattern
                    if ($("#genre_check").prop('checked')) {
                        var genre = $("#genre_select option:selected").val();
                        self._addGenreToPattern(pattern, bookNode, genre);
                    }

                    window.sctpClient.create_link().done(function(bookLink){
                        window.sctpClient.set_link_content(bookLink, "book_pattern");
                        window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, bookNode, bookLink).done(function(bookLinkArc){
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifier, bookLinkArc);
                        });
                    });                    
                });

                self._addToPattern(pattern, bookNode);

                onCreated(pattern);
            });
        });
    }
};