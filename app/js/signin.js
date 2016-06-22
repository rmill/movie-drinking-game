window.onload = function() {
  var isHorizontal = null;

  /**
   * Resize the buttons when the winsow changes
   */
  $(window).on('resize', function() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    var newIsHorizontal = windowWidth > windowHeight;
    if (isHorizontal === null ||
        isHorizontal !== newIsHorizontal)
      {
        isHorizontal = newIsHorizontal;
        $(window).trigger('resize');
      }

      var height = $('.header').height();
      $('.header').css({
        'font-size': height / 2 + 'px'
      });
    });

    $(window).trigger('resize');

    // If a player has a name, let them use it again
    var name = Cookies.get('name');
    if (name) {
      $('#name').val(name);
    }
  }
