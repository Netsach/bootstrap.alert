(function ($) {
  $.extend({

    settings: null,
    chain_list: [],

    alert: function(options) {

      this.settings = $.extend({
          title: '',
          body: '',
          is_delayed: true,
          close_after_calback_confirm: true,
          close_after_calback_decline: true,
          callback_confirm: function(){console.log('accepted');},
          callback_decline: function(){console.log('declined');},
          text_confirm: 'ok',
          text_decline: null,
          extra_class: '',
          loading: false,
          timer_modal: 50,
          click_outside_for_close: true,
          type: '',       //can be sucess, info, warning, danger or empty
          debug: true,
          allow_multiple_modal: true,
          already_add: false,
      }, options);

      console.log('start modale', this.chain_list);
      if(!this.settings.already_add){
        this.chain_list.push(this.settings);
      }
      console.log('start modale', this.chain_list);

      if($('.bootstrap-alert-modal').length){
        this.debug('Modal already exist');
        // if(this.settings.allow_multiple_modal){
        //   this.chain_list.push(this.settings);
        // }
        return;
      }


      //You have to give a text to at least on of the 2 buttons confoirm & decline
      if(this.chain_list[0].text_confirm === undefined || this.chain_list[0].text_confirm === "" && this.chain_list[0].text_decline === undefined || this.chain_list[0].text_decline === ""){
        this.chain_list[0].text_confirm = "ok";
      }

      var template = _.template(this.get_template());
      $('body').prepend( template(this.chain_list[0]) );
      $('.modal-body form').bind('submit', function(event){
        event.preventDefault();
      });

      var self = this;
      if(this.chain_list[0].is_delayed){
        //this.debug(self.timer_modal);
        $(".bootstrap-alert-modal .timecircle-timer").TimeCircles({
            //count_past_zero: false,
            total_duration: parseFloat(self.chain_list[0].timer_modal),
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
      if(!this.chain_list[0].click_outside_for_close){
        $('.bootstrap-alert-modal').modal({
            backdrop: 'static',
            keyboard: false
        });
      }else{
        $('body').on('click', function(e) {
          self.callback_decline();
           $('body').off('click');
        });

      }


      $('.bootstrap-alert-modal').on("hidden.bs.modal", function(){
        self.debug('close modal');
        $('.bootstrap-alert-modal').remove();
        if(self.confirm_button_clicked && self.chain_list[0].close_after_calback_confirm){
          self.chain_list[0].callback_confirm();
        }
        if(self.decline_button_clicked && self.chain_list[0].close_after_calback_decline){
          self.chain_list[0].callback_decline();
        }
          self.decline_button_clicked = false;
          self.confirm_button_clicked = false;

        if(self.chain_list.length > 0){
          self.chain_list.shift();
          self.chain_list[0].already_add = true;
          console.log('cahin lsit after shift', self.chain_list);
          self.alert(self.chain_list[0]);
        }
      });
      $('.bootstrap-alert-modal').modal('show');


      $('.bootstrap-alert-modal .confirmed').click(function(){self.callback_confirm();});

      $('.bootstrap-alert-modal .declined').click(function(){self.callback_decline();});
      $('.bootstrap-alert-modal .close').click(function(){self.callback_decline();});

      return this;
    },

    debug: function(text){
      if(this.chain_list[0].debug){
        console.log(text);
      }
    },

    clean_chain_list: function(){
      this.chain_list = [];
    },

    callback_confirm : function(){
      if(this.chain_list[0].close_after_calback_confirm){
        this.close();
      }else{
        this.chain_list[0].callback_confirm();
        this.callback_called = true;
      }
      this.confirm_button_clicked = true;
    },
    callback_decline : function(){
      if(this.chain_list[0].close_after_calback_decline){
        this.close();
      }else{
        this.chain_list[0].callback_decline();
        this.callback_called = true;
      }
      this.decline_button_clicked = true;
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
'                                          <div class="timecircle-timer" data-timer="<%= timer_modal %>" style="height: 40px; margin-top: 7px;"></div>'+
'                                          <div class="inline-label" style="margin-top: 13px; flex-grow:1;"><%= text_confirm %></div>'+
'                                    </button>'+
'                              <% } else { %>'+
'                                    <button type="button" class="btn btn-primary confirmed"  <% if(!text_decline){ %> style="width: 100%; <% } %>" >'+
'                                          <div class="inline-label" style="line-height: 48px; height: 48px; flex-grow:1;"><%= text_confirm %></div>'+
'                              <% } %>'+
'                         <% } %>'+
'                  </div>'+
'            </div>'+
'      </div>';
    }

  });
})(jQuery);
