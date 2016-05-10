$( document ).ready(function() {

	var isHorizontal = null;

	$(window).on('resize', function() {
		var windowHeight = $(window).height();
        	var windowWidth = $(window).width();

		if (windowHeight > windowWidth) {
			$('.answer').each(function() {
        	        	var width = $(this).outerWidth();
                		$(this).css({
					'height':width+'px',
					'width': '100%'
				});

				$(this).css({
                        	        'height':width+'px',
                        	        'width': '100%'
                        	});
        		});
		} else {
			$('.answer').each(function() {
                		var height = $(this).outerHeight();
	                	$(this).css({
                        		'width':height+'px',
                                	'height': '100%'
                        	});
			
				$(this).css({
                                	'width':height+'px',
                                	'height': '100%'
                        	});
	        	});

		}

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
	
	$('#name').html(Cookies.get('name'));

	$('.answer').click(function(e) {
		e.preventDefault();
		var data = {
		  'answer': $(this).data('answer-id')
		}

		$.ajax({
		  'url': '/answer',
		  'method': 'POST',
		  'data': data
		});
	});
});

