function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
}
function bikeBlock(bike){
  return '<div class="card bg-light border rounded-bottom">' +
    '<img class="card-img-top" src="'+bike.image+'" alt="Card image cap"/>' +
    '<div class="card-body">'+
      '<h5 class="card-title text-dark">'+ bike.name +'</h5><br>'+
      '<h6 class="card-text text-dark"> 租金：</h6>'+
      '<p class="card-text text-dark"> 七小時 '+bike.price[0]+'<br>十二小時 '+bike.price[1]+'<br>二十四小時 '+bike.price[2]+'</p>'+
      '<button type="button" class="btn btn-primary btn-lg btn-block" id="submit-'+bike.uid+'" >送出</button>'+
    '</div>'+
  '</div>';
}



var waitingDialog = waitingDialog || (function ($) {
    'use strict';

	// Creating modal dialog's DOM
	var $dialog = $(
    '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
		'<div class="modal-dialog modal-m">' +
		'<div class="modal-content" style="background-color: #2b2b2b">' +
			'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			'<div class="modal-body">' +
        '<div class="spinner">'+
          '<div class="cube1"></div>'+
          '<div class="cube2"></div>'+
        '</div>'+
			'</div>' +
		'</div></div></div>');

	return {
		/**
		 * Opens our dialog
		 * @param message Custom message
		 * @param options Custom options:
		 * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
		 * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
		 */
		show: function (message, options) {
			// Assigning defaults
			if (typeof options === 'undefined') {
				options = {};
			}
			if (typeof message === 'undefined') {
				message = 'Loading';
			}
			var settings = $.extend({
				dialogSize: 'm',
				progressType: '',
				onHide: null // This callback runs after the dialog was hidden
			}, options);

			// Configuring dialog
			$dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
			$dialog.find('.progress-bar').attr('class', 'progress-bar');
			if (settings.progressType) {
				$dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
			}
			$dialog.find('h3').text(message);
			// Adding callbacks
			if (typeof settings.onHide === 'function') {
				$dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
					settings.onHide.call($dialog);
				});
			}
			// Opening dialog
			$dialog.modal();
		},
		/**
		 * Closes dialog
		 */
		hide: function () {
			$dialog.modal('hide');
		}
	};

})(jQuery);

var $type_set = (index, type_name, content="") => {
  return '<div class="card bg-secondary">' +
    '<div class="card-header" id="heading-'+String(index)+'">' +
      '<h5 class="mb-0">' +
        '<button class="btn btn-link collapsed text-white" type="button" data-toggle="collapse" data-target="#collapse-'+String(index)+'" aria-expanded="true" aria-controls="collapse-'+String(index)+'">' +
          'Type-' + String(type_name) +
        '</button>' +
      '</h5>' +
    '</div>' +
    '<div id="collapse-'+ String(index) +'" class="collapse" aria-labelledby="heading-'+ String(index) +' " data-parent="#accordion">' +
      '<div class="card-deck">'+ content
      '</div>'+
    '</div>'+
  '</div>';
}
$(document).ready(() => {
  waitingDialog.show('載入中');
  firebase.auth().useDeviceLanguage();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var db = firebase.database();
      db.ref("/vehicles/").once('value').then((vehicles) => {
        $(".nav-item").after("<li class=\"nav-item\"><a id=\"ren\"class=\"nav-link js-scroll-trigger\" href=\"ren_center.html\">Rental Center</a></li><li class=\"nav-item\"><a id=\"mem\" class=\"nav-link js-scroll-trigger\" href=\"mem_center.html\">Member Center</a></li><li class=\"nav-item\"><a id=\"signOut\" class=\"nav-link js-scroll-trigger\" href=\"#\" >Sign Out</a></li>")
        $("#signOut").click(() => {
          firebase.auth().signOut().then(() => {
            window.location = "index.html";
          },(error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            })
          })
          var typeset = {}
          preparebike = new Promise((resolve, reject) => {
            vehicles = vehicles.val()
            let bikeset = []
            vehicles.forEach((v) => {
              let flag = bikeset.find(b => b==v.name)
              if(typeset[v.type] && !flag){
                bikeset.push(v.name)
                typeset[v.type].push(v)
              }
              else if(!flag){
                bikeset.push(v.name)
                typeset[v.type] = [v]
              }
            })
            resolve();
          })
          load = new Promise((resolve,reject) => {
            Object.keys(typeset).sort((a, b) => {
              if(typeset[a][0].type>typeset[b][0].type) return 1;
              else if(typeset[a][0].type<typeset[b][0].type) return -1;
              else return 0;
            }).forEach((type,index) => {
              let c = typeset[type].map(bikeBlock)
              $("#accordion").append($type_set(index,typeset[type][0].type,c))

            })
            resolve()
          })
          preparebike.then(load).then(() => {
            $("#inject-point").fadeIn()
            waitingDialog.hide()
          })
          $("[id|='submit']").click((triggered) => {
            waitingDialog.show('載入中');
            $("#inject-point").fadeOut()
            var uid = triggered.target.id.split("-")[1];
            db.ref("/preservations/").once('value').then((orders) => {
              relative_orders = Object.keys(orders.val()).filter((o_key) => {
                return o_key.split('-')[1]==uid
              }).map((o_key) => {
                let t = orders.val()[o_key]
                t.push(o_key.split('-')[0])
                return t;
              })
              console.log(relative_orders)
              waitingDialog.hide();
              $('#select-time').fadeIn()
            },(error) => {
              console.log(error)
            })
          })
        })
        if (!user.displayName){
          window.location = "new_profile.html";
        }
    } else {
      window.location = "index.html";
    }
  });
})
