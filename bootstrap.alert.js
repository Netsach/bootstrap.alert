(function ($) {
  $.extend({

    settings: null,
    chain_list: [],

    callback_decline_called: false,
    callback_confirm_called: false,

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
          decline_spinner_color: "#fff",
          confirm_spinner_color: "#fff",
          enable_multiple_callback: true,
          text_confirm: 'ok',
          text_decline: null,
          callback_confirm: function(){self.debug('accepted');},
          callback_decline: function(){self.debug('declined');},
          extra_class: '',
          loading: false,
          timer_modal: 50,
          click_outside_for_close: false,
          type: '',       //can be sucess, info, warning, danger or empty
          debug: false,
          allow_multiple_modal: true,
          no_close_btn: false,
      }, options);

      if($('.bootstrap-alert-modal').length){
        this.debug('Modal already exist');
        if(this.settings.allow_multiple_modal){this.chain_list.push(this.settings);
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
        this.activate_timer();
      }

      $('.bootstrap-alert-modal').modal({
          backdrop: 'static',
          keyboard: false
      });

      // this feature doesnt work

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


      // display modal
      $('.bootstrap-alert-modal').modal('show');

      // event on button confirm clicked
      $('.bootstrap-alert-modal .confirmed').on( "click", function(){
        self.debug('button .confirmed clicked');
        if(self.settings.enable_multiple_callback){
          self.callback_confirm();
        }else{
          if(!self.callback_decline_called && !self.callback_confirm_called){
            self.callback_confirm();
          }
        }
      });

      // event on button decline clicked
      $('.bootstrap-alert-modal .declined').on( "click", function(){
        self.debug('button .declined clicked');
        if(self.settings.enable_multiple_callback){
          self.callback_decline();
        }else{
          if(!self.callback_decline_called && !self.callback_confirm_called){
            self.callback_decline();
          }
        }
      });

      // event on close button (cross "X")
      $('.bootstrap-alert-modal .close').on( "click", function(){
        self.debug('button .close clicked');
        self.callback_decline();
      });

      // Close modal
      $('.bootstrap-alert-modal').on("hidden.bs.modal", function(e){
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


        if(self.chain_list.length > 0){
          self.alert(self.chain_list.shift());
        }
        self.reset_data();
      });

      return this;
    },

    activate_timer: function() {
        $(".bootstrap-alert-modal .timecircle-timer").TimeCircles({
            //count_past_zero: false,
            total_duration: parseFloat(this.settings.timer_modal),
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
        $('.bootstrap-alert-modal').on("shown.bs.modal", function() {
            $(".timecircle-timer").TimeCircles().rebuild();
            this.debug('TimeCircles rebuilded');
        });

        $('.bootstrap-alert-modal .timecircle-timer').TimeCircles().addListener(function(unit, value, total) {
            if (total <= -1) {
                $(this).TimeCircles().stop();
                self.debug('timer end, i close');
                self.close();
            }
        });
    },

    reset_data: function(){
      this.callback_confirm_called = false;
      this.callback_decline_called = false;
      this.decline_button_clicked = false;
      this.confirm_button_clicked = false;
    },

    debug: function(text){
      if(this.settings.debug){
        console.log(text);
      }
    },

    clean_chain_list: function(){
      this.chain_list = [];
    },

    add_loader: function(button_class){
      var spinner_color;
      if(button_class === ".declined"){
        spinner_color = this.settings.decline_spinner_color;
      }else{
        spinner_color = this.settings.confirm_spinner_color;
      }
      $(".ba-spinner").remove();
      $(button_class).append('<div class="spinner ba-spinner" style="border-color:'+spinner_color+';border-bottom-color: transparent;"></div>');
    },

    callback_confirm : function(){
      var callback_confirm_validated = true;
      if(this.settings.close_after_calback_confirm){
        this.confirm_button_clicked = true;
        this.close();

      }else{
        callback_confirm_validated = this.settings.callback_confirm();
        this.confirm_button_clicked = false;
      }

      // is the callback does this job?
      if(callback_confirm_validated !== false){
        this.add_loader(".confirmed");
        this.callback_confirm_called = true;
        this.callback_decline_called = true;
      }
    },

    callback_decline : function(){
      var callback_decline_validated = true;
      if(this.settings.close_after_calback_decline){
        this.decline_button_clicked = true;
        this.close();
      }else{
        callback_decline_validated = this.settings.callback_decline();
        this.decline_button_clicked = false;
        console.log(callback_decline_validated);
      }
      // is the callback does this job?
      if(callback_decline_validated !== false){
        console.log("add loarder .decline");
        this.add_loader(".declined");
        this.callback_decline_called = true;
        this.callback_confirm_called = true;
      }
    },

    close: function (event) {

      $('.bootstrap-alert-modal .timecircle-timer').TimeCircles().destroy();
      $('.modal-body form').unbind('submit');
      $('.bootstrap-alert-modal').modal('hide');
    },

    get_template: function(){
      return '<div class="modal fade bootstrap-alert-modal <%= extra_class %>" tabindex="-1" role="dialog">\
      <div class="modal-dialog">\
      <style type="text/css">.spinner{height:28px;width:28px;animation:rotate 0.8s infinite linear;border:8px solid #fff;border-right-color:transparent;border-radius:50%;}@keyframes rotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>\
            <div class="modal-content">\
                  <div class="modal-header <% switch(type) {\
                        case "info":\
                              %> alert-info <%\
                              break;\
                        case "success":\
                              %> alert-success <%\
                              break;\
                        case "danger":\
                              %> alert-danger <%\
                              break;\
                        case "warning":\
                              %> alert-warning <%\
                              break;\
                        default:\
                              %> "" <%\
                              break;\
                        } %>">\
                        <% if(!no_close_btn) { %>\
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
                        <% } %>\
                        <h4 class="modal-title"><%= title %></h4>\
                  </div>\
                  <div class="modal-body">\
                        <p><%= body %></p>\
                  </div>\
                  <div class="modal-footer" style="display: flex;justify-content: space-between; ">\
                        <% if(text_decline){ %>\
                              <button type="button" class="btn btn-default declined" style="flex-basis: 50%;display: flex;align-items: center; <% if(text_confirm){ %> flex-basis: 50%; <% }else{ %> flex-basis: 100%; <% }%> display: flex; align-items: center; ">\
                                   <% if(!text_confirm && is_delayed){ %><div class="timecircle-timer" data-timer="<%= timer_modal %>" style="height: 40px; margin-top: 7px;"></div><% } %>\
                                   <div class="inline-label" style="flex-grow:1; line-height: 48px;"> <%= text_decline %></div>\
                              </button>\
                        <% } %>\
                        <% if(text_confirm){ %>\
                              <% if(is_delayed) { %>\
                                    <button type="button" class="btn btn-primary confirmed" style="flex-basis: 50%;display: flex;align-items: center; <% if(text_decline){ %> flex-basis: 50%; <% }else{ %> flex-basis: 100%; <% }%> flex; align-items: center; ">\
                                          <div class="timecircle-timer" data-timer="<%= timer_modal %>" style="height: 40px;"></div>\
                                          <div class="inline-label" style="flex-grow:1;"><%= text_confirm %></div>\
                                    </button>\
                              <% } else { %>\
                                    <button type="button" class="btn btn-primary confirmed" style="flex-basis: 50%;display: flex;align-items: center;  <% if(text_decline){ %> flex-basis: 50%; <% }else{ %> flex-basis: 100%; <% }%>"  >\
                                          <div class="inline-label" style="line-height: 48px; height: 48px; flex-grow:1;"><%= text_confirm %></div>\
                              <% } %>\
                         <% } %>\
                  </div>\
            </div>\
      </div>';
    },


  confirmable_alert: function(options){
      var self = this;

      this.settings = $.extend({
        title: '',
        body: 'Are you sure? This operation needs confirmations.',
        text_confirm: 'Proceed',
        text_decline: 'Cancel',
        is_delayed: false,
        close_after_calback_confirm: false,
        close_after_calback_decline: false,
        callback_confirm: function(){},
        callback_decline: function(){},
        extra_class: '',
        loading: false,
        timer_modal: 50,
        click_outside_for_close: false,
        enable_multiple_callback: true,
        type: '',       //can be sucess, info, warning, danger or empty
        debug: false,
        allow_multiple_modal: false,
        no_close_btn: false,
      }, options);

      if(this.settings.title === ''){
        if(self.settings.event.currentTarget.form){
          this.settings.title = "Submit form";
        }else{
            this.settings.title = $(self.settings.event.currentTarget).text();
        }
      }

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
    options = options || {};
      $(this).click(function(event){
        event.preventDefault();
        options.event = event;
        $.confirmable_alert(options);
      });
  };
})(jQuery);
