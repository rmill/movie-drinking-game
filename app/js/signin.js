window.onload = function() {
  // If a player has a name, let them use it again
  var name = Cookies.get('name');
  if (name) {
    $('#name').val(name);
  }

  $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
    console.log('downloaded');
    FB.init({
      appId: '296945143653057',
      version: 'v2.7' // or v2.1, v2.2, v2.3, ...
    });

    FB.login(function(response) {
       console.log(response);
     }, {scope: 'public_profile'});
  });
}
