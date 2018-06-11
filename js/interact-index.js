$(document).ready(() => {
  firebase.auth().useDeviceLanguage();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.displayName)
      console.log(user.photoURL)
      $(".nav-item").after("<li class=\"nav-item\"><a class=\"nav-link js-scroll-trigger\" href=\"#\">Rental Center</a></li><li class=\"nav-item\"><a id=\"signOut\" class=\"nav-link js-scroll-trigger\" href=\"#\" >Sign Out</a></li>")
      $("#signOut").click(() => {
        firebase.auth().signOut().then(() => {
          location.reload();
        },(error) => {
          let errorCode = error.code;
          let errorMessage = error.message;
          console.log(errorCode);
        })
      })
      if (!user.displayName){
        window.location = "profile_update.html";
      }
    } else {
      $(".nav-item").after("<li class=\"nav-item\"><a class=\"nav-link js-scroll-trigger\" data-toggle=\"modal\" data-target=\"#login\"  href=\"#\">Sign In</a></li><li class=\"nav-item\"><a class=\"nav-link js-scroll-trigger\" data-toggle=\"modal\" data-target=\"#reg\"  href=\"#\">Sign Up</a></li>")
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
