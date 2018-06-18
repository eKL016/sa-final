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
      console.log(user.displayName)
      console.log(user.photoURL)
      let load = new Promise((resolve, reject) => {
        $(".nav-item").after("<li class=\"nav-item\"><a id=\"ren\"class=\"nav-link js-scroll-trigger\" href=\"ren_center.html\">Rental Center</a></li><li class=\"nav-item\"><a id=\"mem\" class=\"nav-link js-scroll-trigger\" href=\"mem_center.html\">Member Center</a></li><li class=\"nav-item\"><a id=\"signOut\" class=\"nav-link js-scroll-trigger\" href=\"#\" >Sign Out</a></li>")
        resolve()
      });
      load.then(() => {
        waitingDialog.hide();
      })
      $("#signOut").click(() => {
        firebase.auth().signOut().then(() => {
          location.reload();
        },(error) => {
          let errorCode = error.code;
          let errorMessage = error.message;
          console.log(errorCode);
        })
        waitingDialog.hide();
      })
      if (!user.displayName){
        window.location = "new_profile.html";
      }
    } else {

      let load = new Promise((resolve, reject) => {
        $(".nav-item").after("<li class=\"nav-item\"><a class=\"nav-link js-scroll-trigger\" data-toggle=\"modal\" data-target=\"#login\"  href=\"#\">Sign In</a></li><li class=\"nav-item\"><a class=\"nav-link js-scroll-trigger\" data-toggle=\"modal\" data-target=\"#reg\"  href=\"#\">Sign Up</a></li>")
        resolve()
      });
      load.then(() => {
        waitingDialog.hide();
      })

      $("#sendLogin").click(() => {
        let email = $("#login input[name='email']").val();
        let password = $("#login input[name='password']").val();
        firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
          $('#login').modal('hide');
          location.reload();
        },(error) => {
          let errorCode = error.code;
          let errorMessage = error.message;
          $('.form-group:nth-of-type(2) input').not('.is-invalid').after("<div class=\"invalid-feedback\">"+error.message+"</div>");
          $('#login input').addClass("is-invalid");
        });
      });
      $("#forgetPass").click(() => {
          let onSend = (error) => {
            $('#forget-form  .modal-body').replaceWith('<div class=\"modal-body\"><p>重設密碼指示信已寄到您當時的信箱！</p></div>');
            $('#forget-form  .modal-footer').replaceWith('');
          }
          $('#login').modal('hide');
          $('#forget-form').modal('show');
          $('#sendForget').click(() => {
            let emailAddress = $("input[name='email-forget']").val();
            firebase.auth().sendPasswordResetEmail(emailAddress).then(() => {
              onSend();
            },(error) => {
              onSend(error);
            })
          })
      });
      $('#sendReg').click(() => {
        let email = $("#reg input[name='email']").val();
        let password = $("#reg input[name='password']").val();
        console.log(email)
        console.log(password)
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
          $('#reg').modal('hide');
        },(error) => {
          let errorCode     = error.code;
          let errorMessage  = error.message;
          $('.form-group:nth-of-type(2) input').not('.is-invalid').after("<div class=\"invalid-feedback\">"+error.message+"</div>");
          $('#reg input').addClass("is-invalid");
        })
      })

    }
  });
})
