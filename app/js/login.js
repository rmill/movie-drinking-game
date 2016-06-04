window.onload = function() {
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
}
