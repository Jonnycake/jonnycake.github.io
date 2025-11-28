(function($) {
    const header_nav = $('header > nav#main-nav > ul');
    const toggle_icon = $('#nav-toggle > i.fa');
    $('#nav-toggle').click(function() {
        if (header_nav.hasClass('active')) {
            header_nav.removeClass('active');
            toggle_icon.removeClass('fa-caret-down');
            toggle_icon.addClass('fa-caret-right');
            return;
        }
        toggle_icon.removeClass('fa-caret-right');
        toggle_icon.addClass('fa-caret-down');
        header_nav.addClass('active');
    });
})(jQuery);
