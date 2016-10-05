(function ($) {
  $.extend({

    settings: null,
    chain_list: [],

    alert: function(options) {
      this.decline_button_clicked = false;
      this.confirm_button_clicked = false;
      var self = this;

       this.settings = $.extend({
          title: '',
          body: '',
          is_delayed: true,
          close_after_calback_confirm: true,
          close_after_calback_decline: true,
          text_confirm: 'ok',
          text_decline: null,
          callback_confirm: function(){self.debug('accepted');},
          callback_decline: function(){self.debug('declined');},
          extra_class: '',
          loading: false,
          timer_modal: 50,
          click_outside_for_close: true,
          type: '',       //can be sucess, info, warning, danger or empty
          debug: false,
          allow_multiple_modal: true,
      }, options);

      if($('.bootstrap-alert-modal').length){
        this.debug('Modal already exist');
        if(this.settings.allow_multiple_modal){
          this.chain_list.push(this.settings);
        }
        return;
      }


      //You have to give a text to at least on of the 2 buttons confoirm & decline
      if(this.settings.text_confirm === undefined || this.settings.text_confirm === "" && this.settings.text_decline === undefined || this.settings.text_decline === ""){
        this.settings.text_confirm = "ok";
      }

      var template = _.template(this.get_template());
      $('body').prepend( template(this.settings) );
      $('.modal-body form').bind('submit', function(event){
        event.preventDefault();
      });

      if(this.settings.is_delayed){
        //this.debug(self.settings.timer_modal);
        $(".bootstrap-alert-modal .timecircle-timer").TimeCircles({
            //count_past_zero: false,
            total_duration: parseFloat(self.settings.timer_modal),
            time: {
                "Days": {
                    "show": false
                },
                "Hours": {
                    "show": false
                },
                "Minutes": {
                    "show": false
                },
                "Seconds": {
                    "color": "#5186bd",
                    "show": true,
                    "text": ''
                },
            }
        });


        //rebuild the timecircle at the end of the bootstrap modal pop
        $('.bootstrap-alert-modal').on("shown.bs.modal", function(){
          $(".timecircle-timer").TimeCircles().rebuild();
          self.debug('TimeCircles rebuilded');
        });

        $('.bootstrap-alert-modal .timecircle-timer').TimeCircles().addListener (function(unit, value, total){
            if(total <= -1){
                $(this).TimeCircles().stop();
                self.close();
            }
        });
      }
      // if(!this.settings.click_outside_for_close){
      //   $('.bootstrap-alert-modal').modal({
      //       backdrop: 'static',
      //       keyboard: false
      //   });
      // }else{
      //   $('body').on('click', function(e) {
      //     self.callback_decline();
      //      $('body').off('click');
      //   });

      // }


      $('.bootstrap-alert-modal').on("hidden.bs.modal", function(){
        self.debug('close modal');
        $('.bootstrap-alert-modal').remove();
        if(self.confirm_button_clicked && self.settings.close_after_calback_confirm){
          self.debug('callback_confirm called after close');
          self.settings.callback_confirm();
        }
        if(self.decline_button_clicked && self.settings.close_after_calback_decline){
          self.debug('callback_decline called');
          self.settings.callback_decline();
        }
        self.decline_button_clicked = false;
        self.confirm_button_clicked = false;

        if(self.chain_list.length > 0){
          self.alert(self.chain_list.shift());
        }
      });

      $('.bootstrap-alert-modal').modal('show');


      $('.bootstrap-alert-modal .confirmed').on( "click", function(){
        self.debug('button .confirmed clicked');
        self.callback_confirm();});

      $('.bootstrap-alert-modal .declined').on( "click", function(){
        self.debug('button .declined clicked');
        self.callback_decline();});
      $('.bootstrap-alert-modal .close').on( "click", function(){
        self.debug('button .close clicked');
        self.callback_decline();});

      return this;
    },

    debug: function(text){
      if(this.settings.debug){
        console.log(text);
      }
    },

    clean_chain_list: function(){
      this.chain_list = [];
    },

    callback_confirm : function(){
      if(this.settings.close_after_calback_confirm){
        this.confirm_button_clicked = true;
        this.close();

      }else{
        this.debug('callback_confirm called');
        this.settings.callback_confirm();
        this.confirm_button_clicked = false;
      }
    },
    callback_decline : function(){
      if(this.settings.close_after_calback_decline){
        this.debug('callback_decline call modal close');
        this.decline_button_clicked = true;
        this.close();
      }else{
        this.debug('callback_decline called');
        this.settings.callback_decline();
        this.decline_button_clicked = false;
      }
    },

    close: function (event) {


      $('.bootstrap-alert-modal .timecircle-timer').TimeCircles().destroy();
      $('.modal-body form').unbind('submit');
      $('.bootstrap-alert-modal').modal('hide');
    },

    get_template: function(){
      return '<div class="modal fade bootstrap-alert-modal <%= extra_class %>" tabindex="-1" role="dialog">'+
'      <div class="modal-dialog">'+
'            <div class="modal-content">'+
'                  <div class="modal-header <% switch(type) {'+
'                        case "info":'+
'                              %> alert-info <%'+
'                              break;'+
'                        case "success":'+
'                              %> alert-success <%'+
'                              break;'+
'                        case "danger":'+
'                              %> alert-danger <%'+
'                              break;'+
'                        case "warning":'+
'                              %> alert-warning <%'+
'                              break;'+
'                        default:'+
'                              %> "" <%'+
'                              break;'+
'                        } %>">'+
'                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
'                        <h4 class="modal-title"><%= title %></h4>'+
'                  </div>'+
'                  <div class="modal-body">'+
'                        <p><%= body %></p>'+
'                  </div>'+
'                  <div class="modal-footer" style="display: flex;justify-content: space-between; ">'+
'                        <% if(text_decline){ %>'+
'                              <button type="button" class="btn btn-default declined" data-dismiss="modal" style="flex-grow:1; display: flex; align-items: center; ">'+
'                                   <% if(!text_confirm && is_delayed){ %><div class="timecircle-timer" data-timer="<%= timer_modal %>" style="height: 40px; margin-top: 7px;"></div><% } %>'+
'                                   <div class="inline-label" style="flex-grow:1; line-height: 48px;"> <%= text_decline %></div>'+
'                              </button>'+
'                        <% } %>'+
'                        <% if(text_confirm){ %>'+
'                              <% if(is_delayed) { %>'+
'                                    <button type="button" class="btn btn-primary confirmed" style="flex-grow:1;display: flex; align-items: center; ">'+
'                                          <div class="timecircle-timer" data-timer="<%= timer_modal %>" style="height: 40px;"></div>'+ //virer les margin car causaient des soucis d'alignement vertical ( margin-top: 7px;)
'                                          <div class="inline-label" style="flex-grow:1;"><%= text_confirm %></div>'+ // pareil (margin-top: 13px;)
'                                    </button>'+
'                              <% } else { %>'+
'                                    <button type="button" class="btn btn-primary confirmed"  <% if(!text_decline){ %> style="width: 100%; <% } %>" >'+
'                                          <div class="inline-label" style="line-height: 48px; height: 48px; flex-grow:1;"><%= text_confirm %></div>'+
'                              <% } %>'+
'                         <% } %>'+
'                  </div>'+
'            </div>'+
'      </div>';
    },


  confirmable_alert: function(options){
      var self = this;

      this.settings = $.extend({
        title: '',
        body: '',
        text_confirm: 'ok',
        text_decline: 'no',
        is_delayed: false,
        close_after_calback_confirm: false,
        close_after_calback_decline: false,
        callback_confirm: function(){},
        callback_decline: function(){},
        extra_class: '',
        loading: false,
        timer_modal: 50,
        click_outside_for_close: false,
        type: '',       //can be sucess, info, warning, danger or empty
        debug: false,
        allow_multiple_modal: false,
      }, options);

      var template = _.template(this.get_template());
      $('body').prepend(template(this.settings));
      $('.bootstrap-alert-modal').modal('show');

      $('.bootstrap-alert-modal .confirmed').on( "click", function(){
        self.debug('button .confirmed clicked');
        self.settings.callback_confirm();
        if(self.settings.event.currentTarget.form){
            self.settings.event.currentTarget.form.submit();
        }else if (self.settings.event.currentTarget.href){
          window.location.href = self.settings.event.currentTarget.href;
        }
        self.close();
      });

      $('.bootstrap-alert-modal .declined, bootstrap-alert-modal .close').on( "click", function(){
          self.debug('button .declined clicked');
          self.close();
      });

      $('.bootstrap-alert-modal').on("hidden.bs.modal", function(){
        self.debug('close modal');
        $('.bootstrap-alert-modal').remove();
      });
  },

  });

  $.fn.init_confirmable_alert = function(options){
      $(this).click(function(event){
        a = event;
        event.preventDefault();
        options.event = event;
        $.confirmable_alert(options);
      });
  };
})(jQuery);
var a;
