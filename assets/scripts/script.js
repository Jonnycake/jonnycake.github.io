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

    const archive_list = $('ul.archive-list');
    archive_list.filter = function(category) {
        if (category === '') {
            $(this).find('li').show();
            return;
        }

        $(this).find('li').each(function() {
            let categories = $(this).attr('data-categories').split(',');

            if (categories.includes(category)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    const category_filter = $('select.category-filter');
    if (category_filter) {
        category_filter.on('change', function() {
            archive_list.filter($(this).val());
        });
    }
})(jQuery);
