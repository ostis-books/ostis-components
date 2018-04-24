var id = 1;
var definition;

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

var id = 1;
var definition;

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

Example.PaintPanel.prototype = {
    init: function () {
        this._showNotes(this.containerId);
        this._initMarkup(this.containerId);
    },

    // вывод имеющихся заметок и закладок
    _showNotes: function (containerId) {
        var container = $('#' + containerId);
        SCWeb.core.Server.resolveScAddr(['concept_note', 'concept_bookmark'], function(keynodes){
            concept_note_addr = keynodes['concept_note'];
            concept_bookmark_addr = keynodes['concept_bookmark'];
            var params = [concept_note_addr];
            SCWeb.core.Server.resolveIdentifiers(params, function(keynodes){
                // вывод всех заметок
                window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A,
                    [
                        concept_note_addr,
                        sc_type_arc_pos_const_perm,
                        0
                    ])
                .done(function (res) {
                    for (var i = 0; i < res.length; i++){
                    	var link = res[i][2];
                    	window.sctpClient.get_link_content(link,'string')
                    	.done(function(attr){
	                        var param = attr;
					            // перевод в формат, который передастся как параметр в другие функции 
					        for (var i=0; i< attr.length; i++){
					            param = param.replace(" ", "___");
					        }
	                        container.append("<div id=\"" + id + "\" class=\"note\" ><button class=\"exit\" onclick=exit(" + id +"\,"+ link +")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editSimpleNote(" + id+ "\,"+ link +"\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+attr+"</div>"); 
	                        id = id +1;
	                    });
                    } 
                }); 
                // вывод всех закладок
                window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A,
                    [
                        concept_bookmark_addr,
                        sc_type_arc_pos_const_perm,
                        0
                    ])
                .done(function (res) {
                    for (var i = 0; i < res.length; i++){
                    	var link = res[i][2];
                    	window.sctpClient.get_link_content(link,'string')
                    	.done(function(attr){
	                        var param = attr;
					        // перевод в формат, который передастся как параметр в другие функции 
					        for (var i=0; i< attr.length; i++){
					            param = param.replace(" ", "___");
					        }
	                        container.append("<div id=\"" + id + "\" class=\"note bookmark\" ><button class=\"exit\" onclick=exit(" + id +"\,"+ link +")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editBookmark(" + id+ "\,"+ link +"\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+attr+"</div>"); 
	                        id = id +1;
	                    });
                    } 
                }); 
            });
        });
    }, 


    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
        var self = this;
        
        container.append('<button id="addSimpleNote" type="button">Добавить заметку</button>');
        container.append('<button id="addBookmarkNote" type="button">Добавить закладку</button>');

        $('#addSimpleNote').click(function () {
            self._addSimpleNote(containerId, 1);
        });

        $('#addBookmarkNote').click(function () {
            self._addBookmarkNote(containerId, 1);
        });
    },

    //добавление заметок
   _addSimpleNote: function(divId, numerOfFields){
        var container = $('#' + divId);
        SCWeb.core.Server.resolveScAddr(['concept_note', 'concept_note_list'], function(keynodes){
            concept_note_addr = keynodes['concept_note'];
            concept_note_list_addr = keynodes['concept_note_list'];
            var params = [concept_note_addr];
            SCWeb.core.Server.resolveIdentifiers(params, function(keynodes){
                var strProm = "Введите текст заметки";
                var attr = prompt(strProm); 
                window.sctpClient.create_link().done(function (generatedLink) {
                    // если не Отмена
                    if (attr != null){
                        addr = generatedLink;
                        // перевод в формат, который передастся как параметр в другие функции 
                        param = attr;
                        for (var i=0; i< attr.length; i++){
                            param = param.replace(" ", "___");
                        }
                        container.append("<div id=\"" + id + "\" class=\"note\"><button class=\"exit\" onclick=exit(" + id +"\,"+ addr +")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editSimpleNote(" + id+ "\,"+ addr + "\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+attr+"</div>"); 
                        id = id+1;
                    }
                    // привязка текста в concept_note в sc
                    window.sctpClient.set_link_content(generatedLink, attr);
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, concept_note_addr, generatedLink);
               }); 
            }); 
        });
    },

     //добавление закладок
    _addBookmarkNote: function(divId, numerOfFields){
        var container = $('#' + divId);
        SCWeb.core.Server.resolveScAddr(['concept_bookmark'], function(keynodes){
            concept_bookmark_addr = keynodes['concept_bookmark'];
            var params = [concept_bookmark_addr];
            SCWeb.core.Server.resolveIdentifiers(params, function(keynodes){
                var strProm = "Введите название книги";
                var name = prompt(strProm);
                window.sctpClient.create_link().done(function (generatedLink) {
                    if (name != null){
                    var attr = "Вы остановились в книге " + name + " ";
                    strProm = "Выберите тип задания закладки: \n1. По № страницы\n2. По № главы\n3. По описанию помента";
                    var choose = prompt(strProm);
                    if (choose != null){
                        switch(choose){
                            case '1': 
                                strProm = "Введите номер страницы: ";
                                var info = prompt(strProm); 
                                attr += " на странице " + info; 
                                break;
                            case '2': 
                                strProm = "Введите номер или название главы: ";
                                var info = prompt(strProm); 
                                attr += " на главе " + info; 
                                break;
                            case '3': 
                                strProm = "Введите описание момента: ";
                                var info = prompt(strProm); 
                                attr += " на моменте, соответствующему описанию \"" + info + "\""; 
                                break;
                            default: alert(" Вы ввели неправильное число. Попробуйте заново.");
                                break;
                        }
                    }
                    addr = generatedLink;
                    var param = attr;
                    // перевод в формат, который передастся как параметр в другие функции 
                    for (var i=0; i< attr.length; i++){
                        param = param.replace(" ", "___");
                    }
                    container.append("<div id=\"" + id + "\" class=\"note bookmark\"><button class=\"exit\" onclick=exit(" + id +"\,"+ addr +")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editBookmark(" + id+ "\,"+ addr + "\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+attr+"</div>"); 
                    id = id+1;
                }
                     // привязка текста в concept_bookmark в sc
                    window.sctpClient.set_link_content(generatedLink, attr);
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, concept_bookmark_addr, generatedLink);
                }); 
            });      
        });
    },
};

// удаление заметок
function exit(id, addr) {
  var el = document.getElementById(id);
    // удаление html
    el.parentNode.removeChild(el);
    // удаление sc
    window.sctpClient.set_link_content(addr, "Объект удален");
};

// редактирование заметок
function editSimpleNote(id, addr, str) {
    // дешифровка параметра 
    param = str;
    for (var i=0; i< str.length; i++){
        param = param.replace("___", " ");
    }
    var el = document.getElementById(id);
    var newvalue = prompt("Введите текст заметки", param);
    // Если не Отмена
    if (newvalue != null){
        // перезапись текста sc 
        window.sctpClient.set_link_content(addr, newvalue);
        param = newvalue;
        // перевод в формат, который передастся как параметр в другие функции 
        for (var i=0; i< newvalue.length; i++){
            param = param.replace(" ", "___");
    }
    el.innerHTML = "<button class=\"exit\" onclick=exit(" + id + ")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editSimpleNote(" + id+ "\,"+ addr + "\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+newvalue;}
};

function editBookmark(id, addr, str) {
    for (var i=0; i< str.length; i++){
        str = str.replace("___", " ");
    }
    var start = str.indexOf("книге ") + 6;
    var end = str.indexOf(" на странице "); 
    var choose = 1;
    if (end == -1 ){
        var end = str.indexOf(" на главе ");
        choose = 2;
        if (end == -1 ){
            var end = str.indexOf(" на моменте, соответствующему описанию:  ");
            choose = 3;
        }
    }
    var name = str.substring(start, end);
    var start = str.indexOf(" на странице ") + 13;
    if (end == -1 ){
        var start = str.indexOf(" на главе ") + 10;
        if (end == -1 ){
            var start = str.indexOf(" на моменте, соответствующему описанию:  ") + 41;
        }
    }
    var info = str.substring(start);    
    var el = document.getElementById(id);
    var strProm = "Введите название книги";
        var name = prompt(strProm, name);
            if (name != null){
            var attr = "Вы остановились в книге " + name +" ";
            strProm = "Выберите тип задания закладки: \n1. По № страницы\n2. По № главы\n3. По описанию помента";
            var choose = prompt(strProm, choose);
            if (choose != null){
                switch(choose){
                            case '1': 
                                strProm = "Введите номер страницы: ";
                                var info = prompt(strProm, info); 
                                attr += " на странице " + info; 
                                break;
                            case '2': 
                                strProm = "Введите номер или название главы: ";
                                var info = prompt(strProm, info); 
                                attr += " на главе " + info; 
                                break;
                            case '3': 
                                strProm = "Введите описание момента: ";
                                var info = prompt(strProm, info); 
                                attr += " на моменте, соответствующему описанию:  " + info + " "; 
                                break;
                            default: alert(" Вы ввели неправильное число. Попробуйте заново.");
                                break;
                        }
                    }
    if (attr != null){
        window.sctpClient.set_link_content(addr, attr);
        var param = attr;
            // перевод в формат, который передастся как параметр в другие функции 
            for (var i=0; i< attr.length; i++){
            param = param.replace(" ", "___");
        }
        el.innerHTML = "<button class=\"exit\" onclick=exit(" + id + ")><span class=\"glyphicon glyphicon-trash\"></span></button> <button class=\"edit\" onclick=editBookmark(" + id+ "\,"+ addr + "\,\"" + param + "\")><span class=\"glyphicon glyphicon-pencil\"></span></button>"+attr;}
    };
};