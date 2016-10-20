window.onload = function() {
  // If a player has a name, let them use it again
  var name = Cookies.get('name');
  if (name) {
    $('#name').val(name);
  }
}
