// PaintPanel

BookSearchInfo.PaintPanel = function (containerId) {
    this.containerId = containerId;

    this.modules = [
        new ModuleGeneralInfo(this)
    ];

    this.requiredKeynodes = this._collectRequiredKeynodes();
    this.keynodes = {};

    this.sc_type_arc_pos_var_perm = (sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm);
};

BookSearchInfo.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);

        this._resolveKeynodes();
    },

    _collectRequiredKeynodes: function () {
        var requiredKeynodes = [
            'book',
            'ui_menu_search_book_by_template',
            'book_search_pattern'
        ];

        // gather keynodes, that are required by modules
        // without duplicates
        this.modules.forEach(function (module) {
            module.getRequiredKeynodes().forEach(function (keynode) {
                if (!requiredKeynodes.includes(keynode)) {
                    requiredKeynodes.push(keynode);
                }
            });
        });

        return requiredKeynodes;
    },

    _resolveKeynodes: function () {
        var self = this;

        SCWeb.core.Server.resolveScAddr(self.requiredKeynodes, function(resolvedKeynodes) {
            self.keynodes = resolvedKeynodes;

            self.modules.forEach(function (module) {
                module.onKeynodesResolved();
            });
        });
    },

    getKeynode: function (idtf) {
        return this.keynodes[idtf];
    },

    _initMarkup: function (containerId) {
        var cont = $('#' + containerId);

        // book search panel
        cont.append(
            '<div class="panel panel-primary" id="book_search_panel" style="width: 70%;">' +
                '<div class="panel-heading"><h4 class="panel-title">Поиск книг</h4></div>' +
            '</div>'
        );

        // initialize modules markup
        this.modules.forEach(function(module) {
            module.initMarkup("book_search_panel");
        });

        // submit button
        $('#book_search_panel').append(
            '<div class="col-sm-10">' +
                '<button id="find_books_button" type="button" class="btn btn-primary" value>Найти книги</button>' +
            '</div>'
        );

        var self = this;

        $('#find_books_button').click(function () {
            self._findBooks();
        });
    },

    _debugMessage: function (message) {
        console.log("book-search: " + message);
    },

    _findBooks: function () {
        var self = this;

        if (Object.keys(self.keynodes).length != self.requiredKeynodes.length) {
            alert("Ошибка! Не удалось найти необходимые понятия");
            return;
        }

        this._createSearchPattern(function (pattern) {
            self._debugMessage("initiating search agent");

            // initiate ui_menu_search_book_by_template command
            var command = self.getKeynode('ui_menu_search_book_by_template');
            SCWeb.core.Main.doCommand(command, [pattern], function (result) {
                self._debugMessage("pattern executed");

                if (result.question != undefined) {
                    SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                }
            });
        });    
    },

    _getTotalSelectedCriteriaCount: function () {
        var criteriaCount = 0;

        this.modules.forEach(function (module) {
            criteriaCount += module.getSelectedCriteriaCount();
        });

        return criteriaCount;
    },

    _getModulesCount: function () {
        return this.modules.length;
    },

    _addToPattern: function (pattern, addr) {
        window.scHelper.checkEdge(pattern, sc_type_arc_pos_const_perm, addr).fail(function () {
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, pattern, addr);
        });
    },

    _createSearchPattern: function (onPatternCreated) {
        this.criteriaCount = this._getTotalSelectedCriteriaCount();
        if (this.criteriaCount == 0) {
            alert("Необходимо задать хотя бы один критерий поиска.");
            return;
        }

        var self = this;

        // create pattern
        window.sctpClient.create_node(sc_type_node | sc_type_const).done(function(pattern) {
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, self.getKeynode('book_search_pattern'), pattern)

            // create book
            window.sctpClient.create_node(sc_type_node | sc_type_var).done(function(book) {
                self._addToPattern(pattern, book);

                // connect book to book class
                window.sctpClient.create_arc(self.sc_type_arc_pos_var_perm, self.getKeynode('book'), book).done(function (bookArc) {
                    self._addToPattern(pattern, self.getKeynode('book'));
                    self._addToPattern(pattern, bookArc);

                    // set system identifier for pattern
                    window.sctpClient.create_link().done(function(bookLink){
                        window.sctpClient.set_link_content(bookLink, "book_pattern");
                        window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, book, bookLink).done(function(bookLinkArc){
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifier, bookLinkArc);

                            // append modules criteria to the created pattern
                            var totalModules = self._getModulesCount();
                            var preparedModules = 0;
                    
                            modulePreparationFinished = function () {
                                preparedModules += 1;
                    
                                if (preparedModules == totalModules) {
                                    onPatternCreated(pattern);
                                }
                            }

                            self.modules.forEach(function (module) {
                                module.appendSelectedCriteria(pattern, book, modulePreparationFinished);
                            });
                        });
                    });
                });
            });
        });
    }
};