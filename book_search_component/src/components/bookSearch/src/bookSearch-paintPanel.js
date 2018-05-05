/**
 * Paint panel.
 */
 var numerOfFields = 1;
 var patternIsCreated = false;
 var genderParamIs = false;
 var nameParamIs = false;
 var typeParamIs = false;

BookSearch.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

BookSearch.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

            new Promise(function(resolve){
                window.sctpClient.create_node(sc_type_node | sc_type_const ).done(function(allInfoNode){
                window.sctpClient.create_link().done(function(allInfoNodeLink){
                window.sctpClient.set_link_content(allInfoNodeLink, 'setChar');
                window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, allInfoNode, allInfoNodeLink).done(function(generatedCommonArc){
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifier, generatedCommonArc).done(function(){
                        resolve(allInfoNode);
                        console.log("ok");
                    });
                });
                });
                });    
            }).then((response) => {
                var self = this;
                container.append('<div class="sc-no-default-cmd">Поиск книги</div>');
                container.append('<input type="button" class = "button-search" value="Добавить поле" id="add-field-1">');
                container.append('<input type = "button" class = "button-search" value= "Добавить информацию" id = "add-info-1"> ');
                container.append('<input type = "button" class = "button-search" value = " Сгенерировать шаблон" id= "create-pattern">');
                container.append('<input type = "button" class = "button-search" value = " Начать поиск" id= "search-button">');
                container.append('<br>');

                $('#newButton').click(function () {
                    self._showMainMenuNode();
                });

                $('#add-field-1').click(function () {
                    self._addNewParam(containerId);
                });

                $('#add-info-1').click(function () {
                    self._addNewInfo(containerId);
                });

                $('#create-pattern').click(function () {
                    self._createNewPattern(numerOfFields, response);
                });
                $('#search-button').click(function () {
                    self._searchBook(numerOfFields, response);
                });                
            });
    },

    _searchBook: function(numerOfFields, allInfoNode){
        alert('пока в разработке');

    /*    SCWeb.core.Server.resolveScAddr(["allInfoNode_full_semantic_neighborhood"], function(data){
            var cmd = data["allInfoNode_full_semantic_neighborhood"];
            SCWeb.core.Main.doCommand(cmd, [allInfoNode], function(result){
                if (result.question != undefined){
                    SCWeb.ui.WindowManager.appendHistoryItem(result.question);
                }            
            });
        });*/
    },

    _addNewParam: function(divId){

        var container = $('#' + divId);
        var new_param_field_addr, name_addr, age_addr, gender_addr, type_addr, fem_addr, male_addr;
        SCWeb.core.Server.resolveScAddr(['nrel_character_gender', 'nrel_character_name', 'nrel_main_idtf', 'nrel_character_type'/*, 'nrel_character_age'*/, 'concept_female', 'concept_male', 'concept_person', 'concept_dog', 'concept_cat' ], function(keynodes){
            gender_addr = keynodes['nrel_character_gender'];
            name_addr = keynodes['nrel_main_idtf'];
            type_addr = keynodes['nrel_character_type'];
            // age_addr = keynodes['nrel_character_age'];
            fem_addr = keynodes['concept_female'];
            male_addr = keynodes['concept_male'];  
            person_addr = keynodes['concept_person'];
            dog_addr = keynodes['concept_dog'];
            cat_addr = keynodes['concept_cat'];         

            
            var all_addr = [gender_addr, name_addr, type_addr,/*age_addr,*/ fem_addr, male_addr];
            SCWeb.core.Server.resolveIdentifiers(all_addr, function(keynodes){
                var character_params = [gender_addr, name_addr, type_addr];
                var character_params_name = [];
                var strProm = "";
                for (var i = 0; i <= character_params.length - 1; i++) {
                    character_params_name[i] = keynodes[character_params[i]];
                    strProm = strProm + ((i+1)+"."+" "+character_params_name[i]+"\n");
                }
                var param_to_create_addr;
                var attr = prompt(strProm);
                switch(attr){
                    case '1': if(!genderParamIs){param_to_create_addr = character_params[0];
                        container.append("<select id =\"gender_id\"><option value=\""+ male_addr+"\">Мужской</option><option value=\""+ fem_addr+"\">Женский</option></select>");
                        genderParamIs = true;}
                        else{alert("Вы уже добавляли данный параметр");}
                        break;
                    case '2': if(!nameParamIs){param_to_create_addr = character_params[1];
                        var name_of_nrel = keynodes[param_to_create_addr];
                        container.append("<input type = \"text\" placeholder = \""+name_of_nrel+"\" id = \"name_id\">"); 
                        nameParamIs = true;}
                        else {alert("Вы уже добавляли данный параметр");}
                        break;
                    case '3': if (!typeParamIs){param_to_create_addr = character_params[2];
                        container.append("<select placeholder = \"Выберите вид персонажа\" id = \"type_id\"><option value = \""+person_addr+"\">Человек</option><option value = \""+dog_addr+"\">Пес</option><option value=\""+cat_addr+"\">Кот</option></select>");
                        typeParamIs = true;}
                        else {alert("Вы уже добавляли данный параметр");}
                        break;
                    // case '4': param_to_create_addr = character_params[3];
                    // var name_of_nrel = keynodes[param_to_create_addr];
                    // container.append("<input type = \"text\" placeholder = \""+name_of_nrel+"\" id = \"age_id\">");
                    //     break;
                }
            });     
        });
    },

    /*добавление нового персонажа*/
    _addNewInfo: function(containerId){
        var container = $('#' + containerId);
        if(patternIsCreated){
            $("#name_id").remove();
            $("#gender_id").remove();
            $("#type_id").remove();
            numerOfFields++;
            genderParamIs = false;
            nameParamIs = false;
            typeParamIs = false;

        }
        else alert("Необходимо сформировать шаблон, иначе данные будут потеряны!");

    },
    /*формирование шаблона*/
    _createNewPattern: function(numerOfFields, allInfoNode){
        
        var  fem_addr, male_addr, person_addr, dog_addr, cat_addr, char_addr;
        SCWeb.core.Server.resolveScAddr(['concept_female', 'concept_male', 'concept_person', 'concept_dog', 'concept_cat', 'concept_character' ], function(keynodes){
            
            fem_addr = keynodes['concept_female'];
            male_addr = keynodes['concept_male'];
            person_addr = keynodes['concept_person'];
            dog_addr = keynodes['concept_dog'];
            cat_addr = keynodes['concept_cat'];
            char_addr = keynodes['concept_character'];

            var temp_char = 'new_char_' + numerOfFields;

            // создаем узел персонажа
            new Promise (function(resolve){
                window.sctpClient.create_node(sc_type_node | sc_type_var).done(function(nameGenCharName){
                    window.sctpClient.create_link().done(function(nameGenCharLink){
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharName);
                        window.sctpClient.set_link_content(nameGenCharLink, temp_char);
                        //window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharLink);
                        window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, nameGenCharName, nameGenCharLink).done(function(nameGenCharCommonArc){
                            //window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharCommonArc);
                            window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, scKeynodes.nrel_system_identifier, nameGenCharCommonArc).done(function(nameGenCharHelpArc_1){
                                //window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharHelpArc_1);
                                //window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, scKeynodes.nrel_system_identifier);
                                console.log('generated ', nameGenCharName, temp_char);
                                window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, char_addr, nameGenCharName).done(function(genArc){
                                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, genArc);
                                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, char_addr);
                                });
                                resolve(nameGenCharName);
                            });
                        });
                    });
                });
            }).then((response) => {

                if($("#name_id").val() != undefined){    
                    console.log($("#name_id").val());
                    window.sctpClient.create_link().done(function(nameGenCharIdtf){
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharIdtf);
                        window.sctpClient.set_link_content(nameGenCharIdtf, $("#name_id").val());
                        window.sctpClient.create_arc(sc_type_arc_common | sc_type_var, response, nameGenCharIdtf).done(function(nameGenCharCommonArc_2){
                             window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, scKeynodes.nrel_main_idtf, nameGenCharCommonArc_2).done(function(genHelp_Arc){
                                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, genHelp_Arc);
                             });
                             window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, scKeynodes.nrel_main_idtf);
                             window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharCommonArc_2);
                        });
                        window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, scKeynodes.lang_ru, nameGenCharIdtf).done( function(nameGenCharHelpArc_2){
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode,nameGenCharHelpArc_2);
                            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode,scKeynodes.lang_ru);
                        });
                 });
                // -------------------------------------
                }
                
                if($( "#type_id option:selected" ).text() != ""){
                    console.log($( "#type_id option:selected" ).text());
                    var charType = "";
                    switch($( "#type_id option:selected" ).text()){
                        case 'Человек': charType = person_addr;
                            break;
                        case 'Пес': charType = dog_addr;
                            break;
                        case 'Кот' : charType = cat_addr;
                            break; 
                    }
                    window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, charType, response).done(function(nameGenCharType){
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode,nameGenCharType);
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode,charType);
                    });
                }
                if($( "#gender_id option:selected" ).text() != ""){
                    console.log($( "#gender_id option:selected" ).text());
                    var charGender = "";
                    switch($( "#gender_id option:selected" ).text()){
                        case 'Мужской': charGender = male_addr;
                            break;
                        case 'Женский': charGender = fem_addr;
                            break; 
                    }
                    window.sctpClient.create_arc(sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm, charGender, response).done(function(nameGenCharGender){
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenCharGender);
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, charGender);
                    });
                }
                
                // функция для возраста
                
            }/*подозреваю, что здесь отправка персонажа или агенту или поисковику*/);
        
        patternIsCreated = true;
        numerOfFields++;
        });
    }
};