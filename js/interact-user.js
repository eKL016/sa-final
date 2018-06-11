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
      page = db.ref("/pages/update_profile").once('value').then((snapshot) => {
        $("#inject-point").append(snapshot.val());
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


      },(error) => {
        console.log(error)
      })

      $("#signOut").click(() => {
        firebase.auth().signOut().then(() => {
          location.reload();
        },(error) => {
          let errorCode = error.code;
          let errorMessage = error.message;
          console.log(errorCode);
        })
      })
    }
    else{
      window.location = "index.html";
    }
  })
})
