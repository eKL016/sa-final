function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
}


$(document).ready(() => {

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      var db = firebase.database();
      page = db.ref("/pages/new_profile").once('value').then((snapshot) => {
        $("#inject-point").append(snapshot.val());
        $(".nav-item").after("<li class=\"nav-item\"><a id=\"ren\"class=\"nav-link js-scroll-trigger\" href=\"ren_center.html\">Rental Center</a></li><li class=\"nav-item\"><a id=\"mem\" class=\"nav-link js-scroll-trigger\" href=\"mem_center.html\">Member Center</a></li><li class=\"nav-item\"><a id=\"signOut\" class=\"nav-link js-scroll-trigger\" href=\"#\" >Sign Out</a></li>")
        var $form = $("form");
        $("#submit").click((s) => {
          s.preventDefault();
          let data = getFormData($form);
          var stringified_data = JSON.stringify(data);
          user.updateProfile({
            displayName: data.name,
            photoURL: stringified_data
          }).then(() => {
            window.location = "index.html";
          },(error) => {
            console.log(error)
          })
        })
        $("#signOut").click(() => {
          firebase.auth().signOut().then(() => {
            window.location = "index.html";
          },(error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
          })
        })

      },(error) => {
        console.log(error)
      })

    }
    else{
      window.location = "index.html";
    }
  })
})
