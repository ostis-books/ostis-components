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
        container.append('<div class="sc-no-default-cmd">Функции закладок:</div>');
        container.append('<button id="bookmarksList" type="button">Посмотреть список закладок</button>');
        container.append('<button id="addToBookmarks" type="button">Добавить понятие в закладки</button>');
        container.append('<button id="delFromBookmarks" type="button">Удалить понятие из закладок</button>');

        $('#bookmarksList').click(function () {
            self._showBookmarksList();
        });


        $('#delFromBookmarks').click(function () {
            self._delFromBookmarks();
        });

        $('#addToBookmarks').click(function () {
            self._addToBookmarks();
        });
    },

	_showBookmarksList: function () {  // переход на страницу Закладки
        var addr;
        SCWeb.core.Server.resolveScAddr(['concept_bookmark_list'], function (keynodes) {
            addr = keynodes['concept_bookmark_list'];
            SCWeb.core.Server.resolveScAddr(["ui_menu_view_full_semantic_neighborhood"],
            function (data) {
                var cmd = data["ui_menu_view_full_semantic_neighborhood"];
                SCWeb.core.Main.doCommand(cmd,
                [addr], function (result) {
                    if (result.question != undefined) {
                        SCWeb.ui.WindowManager.appendHistoryItem(result.question); // добавление действия в боковую историю
                    }
                });
            });
        });
    },


    _delFromBookmarks: function () {  // удаление дуги (пока не работает только видает модальное окно
        console.log("delete from bookmarks list");
        var main_menu_addr, nrel_main_idtf_addr;
        SCWeb.core.Server.resolveScAddr(['ui_main_menu', 'nrel_main_idtf'], function (keynodes) {
            main_menu_addr = keynodes['ui_main_menu'];
            nrel_main_idtf_addr = keynodes['nrel_main_idtf'];
            console.log(main_menu_addr);
            console.log(nrel_main_idtf_addr);
            window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
                main_menu_addr,
                sc_type_arc_common | sc_type_const,
                sc_type_link,
                sc_type_arc_pos_const_perm,
                nrel_main_idtf_addr]).
            done(function(identifiers){  
                 window.sctpClient.get_link_content(identifiers[0][2],'string').done(function(content){
                    alert(' Функция не реализована ');
                 });            
            });
        });
    },

    _addToBookmarks: function () { // добавление закрепленного понятия в закладки
        var concept_bookmark_list_addr, addr;
        SCWeb.core.Server.resolveScAddr([SCWeb.core.Arguments._arguments[0],'concept_bookmark_list'], function (keynodes) {
            concept_bookmark_list_addr = keynodes['concept_bookmark_list'];
            addr = SCWeb.core.Arguments._arguments[0];
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, concept_bookmark_list_addr, addr);  // добавление дуги
            SCWeb.core.Server.resolveScAddr(["ui_menu_view_full_semantic_neighborhood"],
            function (data) {
                var cmd = data["ui_menu_view_full_semantic_neighborhood"];
                SCWeb.core.Main.doCommand(cmd,
                [concept_bookmark_list_addr], function (result) {
                    if (result.question != undefined) {
                        SCWeb.ui.WindowManager.appendHistoryItem(result.question); // добавление действия в боковую историю
                    }
                });
            });         
        });
    }
};