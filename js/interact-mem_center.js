function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
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


$(document).ready(() => {
  waitingDialog.show('載入中');
  firebase.auth().useDeviceLanguage();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var db = firebase.database();
      page = db.ref("/pages/mem_center").once('value').then((snapshot) => {
        $("#inject-point").append(snapshot.val());
        var name = user.displayName
        var user_info = JSON.parse(user.photoURL)
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
        load = new Promise((resolve,reject) => {
          $('#name').append(name);
          $('#gender').append(user_info.gender?"男":"女");
          $('#birth').append(user_info.birth);
          $('#id').append(user_info.id);
          $('#phone').append(user_info.phone);
          resolve()
        })
        load.then(waitingDialog.hide())
        $("#submit").click((s) => {
          s.preventDefault();
          let data = getFormData($("form"));
          let cred = firebase.auth.EmailAuthProvider.credential(
            user.email,
            data.old_password
          );
          user.reauthenticateAndRetrieveDataWithCredential(cred).then(()=>{
            user.updatePassword(data.new_password).then(() => {
              alert("密碼已成功變更！");
              location.reload();
            },(error) => {
              $('#new_password').not('.is-invalid').after("<div class=\"invalid-feedback\">"+error.message+"</div>");
              $('#new_password').addClass("is-invalid");
            });
          },(error) => {
            $('#old_password').not('.is-invalid').after("<div class=\"invalid-feedback\">"+error.message+"</div>");
            $('#old_password').addClass("is-invalid");
          })

        })
        if (!user.displayName){
          window.location = "new_profile.html";
        }
      })
    } else {
      window.location = "index.html";
    }
  });
})
