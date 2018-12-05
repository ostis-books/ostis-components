/* --- src/bookSearchByEvents-common.js --- */
var BookSearchByEvents = {};

function extend(child, parent) {
  var F = function() {};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructor = child;
  child.superclass = parent.prototype;
}


/* --- src/bookSearchByEvents-paintPanel.js --- */
/**
 * Paint panel.
 */
var eventsNumber = 1;
var patternIsCreated = false;
var genderParamIs = false;
var nameParamIs = false;
var typeParamIs = false;

BookSearchByEvents.PaintPanel = function(containerId) {
  this.containerId = containerId;
  this.sc_type_arc_pos_var_perm =
    sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm;
};

BookSearchByEvents.PaintPanel.prototype = {
  init: function() {
    this._initMarkup(this.containerId);
  },

  _initMarkup: function(containerId) {
    var container = $("#" + containerId);

    new Promise(function(resolve) {
      window.sctpClient
        .create_node(sc_type_node | sc_type_const)
        .done(function(allEventsNode) {
          window.sctpClient.create_link().done(function(allEventsNodeLink) {
            window.sctpClient.set_link_content(allEventsNodeLink, "setEvents");
            window.sctpClient
              .create_arc(
                sc_type_arc_common | sc_type_const,
                allEventsNode,
                allEventsNodeLink
              )
              .done(function(generatedCommonArc) {
                window.sctpClient
                  .create_arc(
                    sc_type_arc_pos_const_perm,
                    scKeynodes.nrel_system_identifier,
                    generatedCommonArc
                  )
                  .done(function() {
                    resolve(allEventsNode);
                  });
              });
          });
        });
    }).then(response => {
      var self = this;
      container.append('<div class="sc-no-default-cmd">Поиск книги</div>');
      container.append(
        '<input type="button" class = "button-search" value="Добавить поле" id="add-field-1">'
      );
      container.append(
        '<input type = "button" class = "button-search" value= "Добавить информацию" id = "add-info-1"> '
      );
      container.append(
        '<input type = "button" class = "button-search" value = " Сгенерировать шаблон" id= "create-pattern">'
      );
      container.append(
        '<input type = "button" class = "button-search" value = " Начать поиск" id= "search-button">'
      );
      container.append("<br>");

      $("#add-field-1").click(function() {
        self._addNewParam(containerId);
      });

      $("#add-info-1").click(function() {
        self._addNewInfo(containerId);
      });

      $("#create-pattern").click(function() {
        self._createNewPattern(numerOfFields, response);
      });
      $("#search-button").click(function() {
        self._searchBook(response);
      });
    });
  },

  _searchBook: function(allEventsNode) {
    console.log("run search");

    SCWeb.core.Server.resolveScAddr(["ui_menu_search_book_by_events"], function(
      data
    ) {
      var cmd = data["ui_menu_search_book_by_events"];
      SCWeb.core.Main.doCommand(cmd, [allEventsNode], function(result) {
        if (result.question != undefined) {
          SCWeb.ui.WindowManager.appendHistoryItem(result.question);
        }
      });
    });
  },

  _addToPattern: function(pattern, addr) {
    window.scHelper
      .checkEdge(pattern, sc_type_arc_pos_const_perm, addr)
      .fail(function() {
        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, pattern, addr);
      });
  },

  _addNewParam: function(divId) {
    var container = $("#" + divId);
    var literary_event_addr,
      event_death_addr,
      event_medical_action_addr,
      event_deceit_addr,
      event_attempted_murder_addr,
      event_medical_examination_addr,
      event_acquaintance_addr,
      event_breakup_addr,
      event_love_addr,
      event_suicide_addr,
      event_finality_addr,
      event_operation_addr,
      event_mischief_addr,
      event_murder_addr,
      event_death_of_the_protagonist_addr;
    var resolving_addrs = [
      "literary_event",
      "event_death",
      "event_medical_action",
      "event_deceit",
      "event_attempted_murder",
      "event_medical_examination",
      "event_acquaintance",
      "event_breakup",
      "event_love",
      "event_suicide",
      "event_finality",
      "event_operation",
      "event_mischief",
      "event_murder",
      "event_death_of_the_protagonist"
    ];

    SCWeb.core.Server.resolveScAddr(resolving_addrs, function(keynodes) {
      literary_event_addr = keynodes["literary_event"];
      event_death_addr = keynodes["event_death"];
      event_medical_action_addr = keynodes["event_medical_action"];
      event_deceit_addr = keynodes["event_deceit"];
      event_attempted_murder_addr = keynodes["event_attempted_murder"];
      event_medical_examination_addr = keynodes["event_medical_examination"];
      event_acquaintance_addr = keynodes["event_acquaintance"];
      event_breakup_addr = keynodes["event_breakup"];
      event_love_addr = keynodes["event_love"];
      event_suicide_addr = keynodes["event_suicide"];
      event_finality_addr = keynodes["event_finality"];
      event_operation_addr = keynodes["event_operation"];
      event_mischief_addr = keynodes["event_mischief"];
      event_murder_addr = keynodes["event_murder"];
      event_death_of_the_protagonist_addr =
        keynodes["event_death_of_the_protagonist"];
      var all_addr = [
        literary_event_addr,
        event_death_addr,
        event_medical_action_addr,
        event_deceit_addr,
        event_attempted_murder_addr,
        event_medical_examination_addr,
        event_acquaintance_addr,
        event_breakup_addr,
        event_love_addr,
        event_suicide_addr,
        event_finality_addr,
        event_operation_addr,
        event_mischief_addr,
        event_murder_addr,
        event_death_of_the_protagonist_addr
      ];
      SCWeb.core.Server.resolveIdentifiers(all_addr, function(keynodes) {
        var event_types = [
          event_death_addr,
          event_medical_action_addr,
          event_deceit_addr,
          event_attempted_murder_addr,
          event_medical_examination_addr,
          event_acquaintance_addr,
          event_breakup_addr,
          event_love_addr,
          event_suicide_addr,
          event_finality_addr,
          event_operation_addr,
          event_mischief_addr,
          event_murder_addr,
          event_death_of_the_protagonist_addr
        ];
        var event_types_name = [];

        var strProm = '<select id ="event_type">';
        for (var i = 0; i <= event_types.length - 1; i++) {
          event_types_name[i] = keynodes[event_types[i]];
          strProm += '<option value="' + event_types[i];
          strProm += '">' + event_types_name[i] + "</option>";
        }
        strProm += "</select>";

        container.append(strProm);
      });
    });
  },

  /*добавление нового события*/
  _addNewInfo: function(containerId) {
    var container = $("#" + containerId);
    console.log("add new event");
    if (patternIsCreated) {
      $("#event_type").remove();
      eventsNumber++;
      console.log(eventsNumber);
    } else
      alert("Необходимо сформировать шаблон, иначе данные будут потеряны!");
  },
  /*формирование шаблона*/
  _createNewPattern: function(eventsNumber, allInfoNode) {
    var self = this;

    var literary_event_addr,
      event_death_addr,
      event_medical_action_addr,
      event_deceit_addr,
      event_attempted_murder_addr,
      event_medical_examination_addr,
      event_acquaintance_addr,
      event_breakup_addr,
      event_love_addr,
      event_suicide_addr,
      event_finality_addr,
      event_operation_addr,
      event_mischief_addr,
      event_murder_addr,
      event_death_of_the_protagonist_addr;
    var resolving_addrs = [
      "literary_event",
      "event_death",
      "event_medical_action",
      "event_deceit",
      "event_attempted_murder",
      "event_medical_examination",
      "event_acquaintance",
      "event_breakup",
      "event_love",
      "event_suicide",
      "event_finality",
      "event_operation",
      "event_mischief",
      "event_murder",
      "event_death_of_the_protagonist"
    ];

    SCWeb.core.Server.resolveScAddr(resolving_addrs, function(keynodes) {
      literary_event_addr = keynodes["literary_event"];
      event_death_addr = keynodes["event_death"];
      event_medical_action_addr = keynodes["event_medical_action"];
      event_deceit_addr = keynodes["event_deceit"];
      event_attempted_murder_addr = keynodes["event_attempted_murder"];
      event_medical_examination_addr = keynodes["event_medical_examination"];
      event_acquaintance_addr = keynodes["event_acquaintance"];
      event_breakup_addr = keynodes["event_breakup"];
      event_love_addr = keynodes["event_love"];
      event_suicide_addr = keynodes["event_suicide"];
      event_finality_addr = keynodes["event_finality"];
      event_operation_addr = keynodes["event_operation"];
      event_mischief_addr = keynodes["event_mischief"];
      event_murder_addr = keynodes["event_murder"];
      event_death_of_the_protagonist_addr =
        keynodes["event_death_of_the_protagonist"];
      var all_addr = [
        literary_event_addr,
        event_death_addr,
        event_medical_action_addr,
        event_deceit_addr,
        event_attempted_murder_addr,
        event_medical_examination_addr,
        event_acquaintance_addr,
        event_breakup_addr,
        event_love_addr,
        event_suicide_addr,
        event_finality_addr,
        event_operation_addr,
        event_mischief_addr,
        event_murder_addr,
        event_death_of_the_protagonist_addr
      ];
      var temp_event = "new_event_" + eventsNumber;

      // создаем узел события
      new Promise(function(resolve) {
        window.sctpClient
          .create_node(sc_type_node | sc_type_var)
          .done(function(nameGenEvent) {
            console.log("creation of event's node", nameGenEvent);
            window.sctpClient.create_link().done(function(nameGenEventLink) {
              self._addToPattern(allInfoNode, nameGenEvent);
              window.sctpClient.set_link_content(nameGenEventLink, temp_event);
              window.sctpClient
                .create_arc(
                  sc_type_arc_common | sc_type_var,
                  nameGenEvent,
                  nameGenEventLink
                )
                .done(function(nameGenEventCommonArc) {
                  //window.sctpClient.create_arc(sc_type_arc_pos_const_perm, allInfoNode, nameGenEventCommonArc);
                  window.sctpClient
                    .create_arc(
                      self.sc_type_arc_pos_var_perm,
                      scKeynodes.nrel_system_identifier,
                      nameGenEventCommonArc
                    )
                    .done(function() {
                      console.log("generated ", nameGenEvent, temp_event);
                      window.sctpClient
                        .create_arc(
                          self.sc_type_arc_pos_var_perm,
                          literary_event_addr,
                          nameGenEvent
                        )
                        .done(function(genArc) {
                          self._addToPattern(allInfoNode, genArc);
                          self._addToPattern(allInfoNode, literary_event_addr);
                        });
                      resolve(nameGenEvent);
                    });
                });
            });
          });
      }).then(response => {
        window.sctpClient
          .create_arc(
            self.sc_type_arc_pos_var_perm,
            $("#event_type option:selected").val(),
            response
          )
          .done(function(nameGenEventType) {
            self._addToPattern(allInfoNode, nameGenEventType);
            self._addToPattern(
              allInfoNode,
              $("#event_type option:selected").val()
            );
            console.log("everything is okey. Pattern was created");
          });
      });
      patternIsCreated = true;
      eventsNumber++;
    });
  }
};


/* --- src/bookSearchByEvents-component.js --- */
BookSearchByEvents.DrawComponent = {
  ext_lang: "book_search_by_events_view",
  formats: ["format_book_search"],
  struct_support: true,
  factory: function(sandbox) {
    return new BookSearchByEvents.DrawWindow(sandbox);
  }
};

BookSearchByEvents.DrawWindow = function(sandbox) {
  this.sandbox = sandbox;
  this.paintPanel = new BookSearchByEvents.PaintPanel(this.sandbox.container);
  this.paintPanel.init();
  this.recieveData = function(data) {
    console.log("in recieve data" + data);
  };

  var scElements = {};

  function drawAllElements() {
    var dfd = new jQuery.Deferred();
    // for (var addr in scElements) {
    jQuery.each(scElements, function(j, val) {
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
  this.requestUpdate = function() {
    var updateVisual = function() {
      // check if object is an arc
      var dfd1 = drawAllElements();
      dfd1.done(function(r) {
        return;
      });

      /// @todo: Don't update if there are no new elements
      window.clearTimeout(self.structTimeout);
      delete self.structTimeout;
      if (self.needUpdate) self.requestUpdate();
      return dfd1.promise();
    };
    self.needUpdate = true;
    if (!self.structTimeout) {
      self.needUpdate = false;
      SCWeb.ui.Locker.show();
      self.structTimeout = window.setTimeout(updateVisual, 1000);
    }
  };

  this.eventStructUpdate = function(added, element, arc) {
    window.sctpClient.get_arc(arc).done(function(r) {
      var addr = r[1];
      window.sctpClient.get_element_type(addr).done(function(t) {
        var type = t;
        var obj = new Object();
        obj.data = new Object();
        obj.data.type = type;
        obj.data.addr = addr;
        if (type & sc_type_arc_mask) {
          window.sctpClient.get_arc(addr).done(function(a) {
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
SCWeb.core.ComponentManager.appendComponentInitialize(
  BookSearchByEvents.DrawComponent
);


