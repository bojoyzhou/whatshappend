module.exports = function(path, $) {
    $('img').each(function(idx, img){
        $(img).attr('src', $(img).attr('data-src'))
    })
    if (path.match(/^\/video\//)) {
        return video($)
    }
    if (path.match(/^\/(news|tvshowbiz)\//)) {
        return news($)
    }
}

function video($) {
    return {
        title: $('title').text(),
        content: $('<div>').append($('.vm_lead_module_wrapper').clone()).html(),
        cover: $('.vjs-poster').css('background-image').slice(5).slice(0, -2)
    }
}

function news($) {
    $('.byline-plain, .byline-section, #articleIconLinksContainer, .related-carousel').remove()
    var external = $('#external-source-links')
    while(external.next().get(0)){
        external.next().remove()
    }
    external.remove()
    return {
        title: $('title').text(),
        content: $('<div>').append($('#js-article-text').clone()).html(),
        cover: (function() {
            var img = [].slice.call($('#js-article-text img')).map(function(img) {
                var src = $(img).attr('data-src')
                if (src && src.match(/^https?:/)) {
                    return src
                } else if (img.src && img.src.match(/^https?:/)) {
                    return img.src
                } else {
                    return null
                }
            }).filter(src => (!!src))[0]
            return img;
        })()
    }
}
