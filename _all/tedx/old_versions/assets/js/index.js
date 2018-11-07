var scrollStart = false;

$(document).ready(function() {
	if (document.cookie.substring(7, document.cookie.length)=="true") {
		scrollStart = true;
		return;
	}
	$('header #header-title').hide();
	$('#proceed-page').hide();
	$('#header-banner').hide().fadeIn('slow', function() {
		$('header #header-title').fadeIn('slow', function() {
			setTimeout(function() {
				$('#proceed-page').fadeIn('slow');
				scrollStart = true;
			}, 1500);
		});
	});
	document.cookie = "loaded=true";
});

window.addEventListener('wheel', function(e) {
	if (scrollStart && e.deltaY > 0) {
		$('main, footer').fadeIn('slow');
		$('html, body').animate({
			scrollTop: $('main').offset().top
		}, 1000);
		scrollStart = false;
	}
});

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

$(window).scroll(function() {    
    if(isScrolledIntoView($('main')))
    {
        console.log('visible');
    }    
});

$('#proceed-page i').click(function() {
	$('main, footer').fadeIn('slow');
	$('html, body').animate({
		scrollTop: $('main').offset().top
	}, 1000);
	scrollStart = false;
});