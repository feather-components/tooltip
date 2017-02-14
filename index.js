;(function(factory){
if(typeof define == 'function' && define.amd){
    //seajs or requirejs environment
    define(['jquery', 'class', 'overlay'], factory);
}else if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory(
        require('jquery'),
        require('class'),
        require('overlay')
    );
}else{
    factory(window.jQuery, window.jQuery.klass, window.jQuery.overlay);
}
})(function($, Class, Overlay){
var Proxy = $.proxy;

var Tooltip = Class.$factory('tooltip', {
    initialize: function(opt){
        this.options = $.extend({
            dom : null,
            content: null,
            contentAttr: 'data-tooltip',
            hover: true,
            theme: 'orange',
            pos: '',
            offset: 0, 
            className : ''
        }, opt || {});

        this.init();
    },

    init: function(){
        var self = this, options = self.options;

        self.dom = $(options.dom);
        self.$overlay = new Overlay({
            className: 'ui3-tooltip ui3-tooltip-theme-' + options.theme + ' ' + options.className,
            content: '<div class="ui3-tooltip-content"></div><i class="ui3-tooltip-arrow"></i>',
            autoOpen: false
        });

        var content = options.content;

        if(content == null){
            content = self.dom.attr(options.contentAttr || 'title');
            options.contentAttr == 'title' && self.dom.removeAttr('title');
        }

        self.setContent(content);
        self.hide();
        self.initEvent();
    },

    initEvent: function(){
        var self = this;

        if(self.options.hover){
            self.o2s(self.dom, 'mouseenter', Proxy(self.show, self));
            self.o2s(self.dom, 'mouseleave', Proxy(self.hide, self));
        }

        self.o2s(window, 'resize', Proxy(self.hide, self));
    },

    setContent: function(content){
        var self = this;

        self.$overlay.$.find('.ui3-tooltip-content').html(content);
        self.setPos();
    },

    show: function(){
        var self = this;

        self.$overlay.$.appendTo(document.body);
        self.setPos();
        self.trigger('show');
    },

    hide: function(){
        this.$overlay.$.detach();
        this.trigger('hide');
    },

    toggle: function(){
        this.$overlay.toggle();
    },

    setPos: function(pos){
        var self = this;
        var pos = (pos || self.options.pos).split(/\s+|-/), pos1 = pos[0], pos2 = pos[1], result, className;

        if(!pos2 || pos1 && pos2 == 'center'){
            /*
            left -> left center
            top -> top center
            left center -> left center
            center-center -> top center
            */
            result = self.getPos(className = Tooltip.getPosName(pos1), true);
        }else if(pos1 == 'center'){
            /*
            center right -> right center
            center -> top center
            */
            result = self.getPos(className = Tooltip.getPosName(pos2), true);
        }else{
            pos1 = Tooltip.getPosName(pos1);
            pos2 = Tooltip.getPosName(pos2);
            className = pos1 + '-' + pos2;

            result = $.extend(self.getPos(pos1), self.getPos(pos2));
        }

        self.$overlay.css(result).addClass('ui3-tooltip-' + className);
    },

    getPos: function(pos, center){
        var self = this, opts = self.options, offset = opts.offset, result = {}, $dom = self.dom;
        var size = self.$overlay.getSize();
        var dOffset = $dom.offset(), 
            dTop = dOffset.top, 
            dLeft = dOffset.left, 
            dWidth = $dom.outerWidth(), 
            dHeight = $dom.outerHeight(),
            tWidth = size.width, 
            tHeight = size.height;

        switch(pos){
            case 'left':
                result.left = dLeft - tWidth - offset + (center ? -Tooltip.ARROW_WIDTH : Tooltip.NOT_CENTER_OFFSET);
                break;

            case 'right':
                result.left = dLeft + dWidth + offset +  (center ? Tooltip.ARROW_WIDTH : -Tooltip.NOT_CENTER_OFFSET);
                break;

            case 'bottom': 
                result.top = dTop + dHeight + offset + Tooltip.ARROW_WIDTH;
                break;

            default: 
                result.top = dTop - tHeight - offset - Tooltip.ARROW_WIDTH;
        };

        if(center){
            if(pos == 'left' || pos == 'right'){
                result.top = dTop + dHeight/2 - tHeight/2;
            }else{
                result.left = dLeft + dWidth/2 - tWidth/2;
            }
        }

        return result;
    },

    destroy: function(){
        var self = this;

        self.ofs(self.dom, 'mouseleave mouseenter');
        self.ofs(window, 'resize');
        self.$overlay.destroy();
        self.$overlay = null;
    }
});


Tooltip.ARROW_WIDTH = 7;
Tooltip.NOT_CENTER_OFFSET = 25 + Tooltip.ARROW_WIDTH;

Tooltip.getPosName = function(pos){
    return /^(?:left|bottom|right)$/.test(pos) ? pos : 'top';
};

return Tooltip;

});