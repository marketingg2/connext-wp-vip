!function ($) {

	"use strict"; // jshint ;_;

	/* MODAL CLASS DEFINITION
	* ====================== */

	var Modal = function (element, options) {
		this.init(element, options);
	};

	Modal.prototype = {

		constructor: Modal,

		init: function (element, options) {
			var that = this;

			this.options = options;

			this.$element = $(element)
				.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));

			this.options.remote && this.$element.find('.modal-body').load(this.options.remote, function () {
				var e = $.Event('loaded');
				that.$element.trigger(e);
			});

			var manager = typeof this.options.manager === 'function' ?
				this.options.manager.call(this) : this.options.manager;

			manager = manager.appendModal ?
				manager : $(manager).modalmanager().data('modalmanager');

			manager.appendModal(this);
		},

		toggle: function () {
			return this[!this.isShown ? 'show' : 'hide']();
		},

		show: function () {
			var e = $.Event('show');

			if (this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return;

			this.escape();

			this.tab();

			this.options.loading && this.loading();
		},

		hide: function (e) {
			e && e.preventDefault();

			e = $.Event('hide');

			this.$element.trigger(e);

			if (!this.isShown || e.isDefaultPrevented()) return;

			this.isShown = false;

			this.escape();

			this.tab();

			this.isLoading && this.loading();

			$(document).off('focusin.modal');

			this.$element
				.removeClass('in')
				.removeClass('animated')
				.removeClass(this.options.attentionAnimation)
				.removeClass('modal-overflow')
				.attr('aria-hidden', true);

			$.support.transition && this.$element.hasClass('fade') ?
				this.hideWithTransition() :
				this.hideModal();
		},

		layout: function () {
			var prop = this.options.height ? 'height' : 'max-height',
				value = this.options.height || this.options.maxHeight;

			if (this.options.width){
				this.$element.css('width', this.options.width);

				var that = this;
				this.$element.css('margin-left', function () {
					if (/%/ig.test(that.options.width)){
						return -(parseInt(that.options.width) / 2) + '%';
					} else {
						return -($(this).width() / 2) + 'px';
					}
				});
			} else {
				this.$element.css('width', '');
				this.$element.css('margin-left', '');
			}

		    this.$element.find('.modal-body')
				.css('overflow', '')
				.css(prop, '');

			if (value){
			    this.$element.find('.modal-body')
					.css('overflow', 'auto')
					.css(prop, value);
			}

			var modalOverflow = $(window).height() - 10 < this.$element.height();
            
			if (modalOverflow || this.options.modalOverflow) {
				this.$element
					.css('margin-top', 0)
					.addClass('modal-overflow');
			} else {
				this.$element
					.css('margin-top', 0 - this.$element.height() / 2)
					.removeClass('modal-overflow');
			}
		},

		tab: function () {
			var that = this;

			if (this.isShown && this.options.consumeTab) {
			    this.$element.on('keydown.tabindex.modal', '[data-tabindex]', function (e) {
			    	if (e.keyCode && e.keyCode == 9){
						var elements = [],
							tabindex = Number($(this).data('tabindex'));

						that.$element.find('[data-tabindex]:enabled:visible:not([readonly])').each(function (ev) {
							elements.push(Number($(this).data('tabindex')));
						});
						elements.sort(function(a,b){return a-b});
						
						var arrayPos = $.inArray(tabindex, elements);
						if (!e.shiftKey){
						 		arrayPos < elements.length-1 ?
									that.$element.find('[data-tabindex='+elements[arrayPos+1]+']').focus() :
									that.$element.find('[data-tabindex='+elements[0]+']').focus();
							} else {
								arrayPos == 0 ?
									that.$element.find('[data-tabindex='+elements[elements.length-1]+']').focus() :
									that.$element.find('[data-tabindex='+elements[arrayPos-1]+']').focus();
							}
						
						e.preventDefault();
					}
				});
			} else if (!this.isShown) {
			    this.$element.off('keydown.tabindex.modal');
			}
		},

		escape: function () {
			var that = this;
			if (this.isShown && this.options.keyboard) {
				if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);

				this.$element.on('keyup.dismiss.modal', function (e) {
					e.which == 27 && that.hide();
				});
			} else if (!this.isShown) {
			    this.$element.off('keyup.dismiss.modal')
			}
		},

		hideWithTransition: function () {
			var that = this
				, timeout = setTimeout(function () {
					that.$element.off($.support.transition.end);
					that.hideModal();
				}, 500);

			this.$element.one($.support.transition.end, function () {
				clearTimeout(timeout);
				that.hideModal();
			});
		},

		hideModal: function () {
			var prop = this.options.height ? 'height' : 'max-height';
			var value = this.options.height || this.options.maxHeight;

			if (value){
			    this.$element.find('.modal-body')
					.css('overflow', '')
					.css(prop, '');
			}

			this.$element
				.hide()
				.trigger('hidden');
		},

		removeLoading: function () {
			this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		loading: function (callback) {
			callback = callback || function () {};

			var animate = this.$element.hasClass('fade') ? 'fade' : '';

			if (!this.isLoading) {
				var doAnimate = $.support.transition && animate;

				this.$loading = $('<div class="loading-mask ' + animate + '">')
					.append(this.options.spinner)
					.appendTo(this.$element);

				if (doAnimate) this.$loading[0].offsetWidth; // force reflow

				this.$loading.addClass('in');

				this.isLoading = true;

				doAnimate ?
					this.$loading.one($.support.transition.end, callback) :
					callback();

			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				var that = this;
				$.support.transition && this.$element.hasClass('fade')?
					this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		},

		focus: function () {
			var $focusElem = this.$element.find(this.options.focusOn);

			$focusElem = $focusElem.length ? $focusElem : this.$element;

			$focusElem.focus();
		},

		attention: function (){
			// NOTE: transitionEnd with keyframes causes odd behaviour

			if (this.options.attentionAnimation){
				this.$element
					.removeClass('animated')
					.removeClass(this.options.attentionAnimation);

				var that = this;

				setTimeout(function () {
					that.$element
						.addClass('animated')
						.addClass(that.options.attentionAnimation);
				}, 0);
			}


			this.focus();
		},


		destroy: function () {
			var e = $.Event('destroy');

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return;

			this.$element
				.off('.connextmodal')
				.removeData('modal')
				.removeClass('in')
				.attr('aria-hidden', true);
			
			if (this.$parent !== this.$element.parent()) {
				this.$element.appendTo(this.$parent);
			} else if (!this.$parent.length) {
				// modal is not part of the DOM so remove it.
				this.$element.remove();
				this.$element = null;
			}

			this.$element.trigger('destroyed');
		}
	};



	$.fn.connextmodal = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('modal'),
				options = $.extend({}, $.fn.connextmodal.defaults, $this.data(), typeof option == 'object' && option);

			if (!data) $this.data('modal', (data = new Modal(this, options)));
			if (typeof option == 'string') data[option].apply(data, [].concat(args));
			else if (options.show) data.show()
		})
	};

	$.fn.connextmodal.defaults = {
		keyboard: true,
		backdrop: true,
		loading: false,
		show: true,
		width: null,
		height: null,
		maxHeight: null,
		modalOverflow: false,
		consumeTab: true,
		focusOn: null,
		replace: false,
        resize: false,
        attentionAnimation: false,
		//attentionAnimation: 'shake',
		manager: 'body',
		spinner: '<div class="loading-spinner" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>',
		backdropTemplate: '<div class="modal-backdrop" />'
	};

	$.fn.connextmodal.Constructor = Modal;

	$(function () {
	    $(document).off('click.modal').on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
			var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

			e.preventDefault();
			$target
				.connextmodal(option)
				.one('hide', function () {
					$this.focus();
				})
		});
	});

}(window.jQuery);

!function ($) {

	"use strict"; // jshint ;_;

	/* MODAL MANAGER CLASS DEFINITION
	* ====================== */

	var ModalManager = function (element, options) {
		this.init(element, options);
	};

	ModalManager.prototype = {

		constructor: ModalManager,

		init: function (element, options) {
			this.$element = $(element);
			this.options = $.extend({}, $.fn.modalmanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];
			this.backdropCount = 0;

			if (this.options.resize) {
				var resizeTimeout,
					that = this;

				$(window).on('resize.modal', function(){
					resizeTimeout && clearTimeout(resizeTimeout);
					resizeTimeout = setTimeout(function(){
						for (var i = 0; i < that.stack.length; i++){
							that.stack[i].isShown && that.stack[i].layout();
						}
					}, 10);
				});
			}
		},

		createModal: function (element, options) {
			$(element).modal($.extend({ manager: this }, options));
		},

		appendModal: function (modal) {
			this.stack.push(modal);

			var that = this;

			modal.$element.on('show.modalmanager', targetIsSelf(function (e) {

				var showModal = function(){
					modal.isShown = true;

					var transition = $.support.transition && modal.$element.hasClass('fade');

					that.$element
						.toggleClass('modal-open', that.hasOpenModal())
						.toggleClass('page-overflow', $(window).height() < that.$element.height());

					modal.$parent = modal.$element.parent();

					modal.$container = that.createContainer(modal);

					modal.$element.appendTo(modal.$container);

					that.backdrop(modal, function () {
						modal.$element.show();

						if (transition) {       
							//modal.$element[0].style.display = 'run-in';       
							modal.$element[0].offsetWidth;
							//modal.$element.one($.support.transition.end, function () { modal.$element[0].style.display = 'block' });  
						}
						
						modal.layout();

						modal.$element
							.addClass('in')
							.attr('aria-hidden', false);

						var complete = function () {
							that.setFocus();
							modal.$element.trigger('shown');
						};

						transition ?
							modal.$element.one($.support.transition.end, complete) :
							complete();
					});
				};

				modal.options.replace ?
					that.replace(showModal) :
					showModal();
			}));

			modal.$element.on('hidden.modalmanager', targetIsSelf(function(e) {
			    that.backdrop(modal);
			    // handle the case when a modal may have been removed from the dom before this callback executes
			    that.destroyModal(modal);
			    if (!modal.$element.parent().length) {
			        that.destroyModal(modal);
			    } else if (modal.$backdrop) {
			        var transition = $.support.transition && modal.$element.hasClass('fade');

			        // trigger a relayout due to firebox's buggy transition end event 
			        if (transition) {
			            modal.$element[0].offsetWidth;
			        }
			        $.support.transition && modal.$element.hasClass('fade') ?
			            modal.$backdrop.one($.support.transition.end, function() { modal.destroy(); }) :
			            modal.destroy();
			    } else {
			        modal.destroy();
			    }
			}));

			modal.$element.on('destroyed.modalmanager', targetIsSelf(function (e) {
				that.destroyModal(modal);
			}));
		},

		getOpenModals: function () {
			var openModals = [];
			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) openModals.push(this.stack[i]);
			}

			return openModals;
		},

		hasOpenModal: function () {
			return this.getOpenModals().length > 0;
		},

		setFocus: function () {
			var topModal;

			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) topModal = this.stack[i];
			}

			if (!topModal) return;

			topModal.focus();
		},

		destroyModal: function (modal) {
		    modal.$element.off('.modalmanager');
			if (modal.$backdrop) this.removeBackdrop(modal);
			this.stack.splice(this.getIndexOfModal(modal), 1);

			var hasOpenModal = this.hasOpenModal();

			this.$element.toggleClass('modal-open', hasOpenModal);

			if (!hasOpenModal){
				this.$element.removeClass('page-overflow');
			}

			this.removeContainer(modal);

			this.setFocus();
		},

		getModalAt: function (index) {
			return this.stack[index];
		},

		getIndexOfModal: function (modal) {
			for (var i = 0; i < this.stack.length; i++){
				if (modal === this.stack[i]) return i;
			}
		},

		replace: function (callback) {
			var topModal;

			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) topModal = this.stack[i];
			}

			if (topModal) {
				this.$backdropHandle = topModal.$backdrop;
				topModal.$backdrop = null;

				callback && topModal.$element.one('hidden',
					targetIsSelf( $.proxy(callback, this) ));

				topModal.hide();
			} else if (callback) {
				callback();
			}
		},

		removeBackdrop: function (modal) {
			modal.$backdrop.remove();
			modal.$backdrop = null;
		},

		createBackdrop: function (animate, tmpl) {
			var $backdrop;

			if (!this.$backdropHandle) {
				$backdrop = $(tmpl)
					.addClass(animate)
					.appendTo(this.$element);
			} else {
				$backdrop = this.$backdropHandle;
				$backdrop.off('.modalmanager');
				this.$backdropHandle = null;
				this.isLoading && this.removeSpinner();
			}

			return $backdrop;
		},

		removeContainer: function (modal) {
			modal.$container.remove();
			modal.$container = null;
		},

		createContainer: function (modal) {
			var $container;

			$container = $('<div class="modal-scrollable">')
				.css('z-index', getzIndex('modal', this.getOpenModals().length))
				.appendTo(this.$element);

			if (modal && modal.options.backdrop != 'static') {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.hide();
				}));
			} else if (modal) {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.attention();
				}));
			}

			return $container;

		},

		backdrop: function (modal, callback) {
			var animate = modal.$element.hasClass('fade') ? 'fade' : '',
				showBackdrop = modal.options.backdrop &&
					this.backdropCount < this.options.backdropLimit;

			if (modal.isShown && showBackdrop) {
				var doAnimate = $.support.transition && animate && !this.$backdropHandle;

				modal.$backdrop = this.createBackdrop(animate, modal.options.backdropTemplate);

				modal.$backdrop.css('z-index', getzIndex( 'backdrop', this.getOpenModals().length ));

				if (doAnimate) modal.$backdrop[0].offsetWidth; // force reflow

				modal.$backdrop.addClass('in');

				this.backdropCount += 1;

				doAnimate ?
					modal.$backdrop.one($.support.transition.end, callback) :
					callback();

			} else if (!modal.isShown && modal.$backdrop) {
				modal.$backdrop.removeClass('in');

				this.backdropCount -= 1;

				var that = this;

				$.support.transition && modal.$element.hasClass('fade')?
					modal.$backdrop.one($.support.transition.end, function () { that.removeBackdrop(modal) }) :
					that.removeBackdrop(modal);

			} else if (callback) {
				callback();
			}
		},

		removeSpinner: function(){
			this.$spinner && this.$spinner.remove();
			this.$spinner = null;
			this.isLoading = false;
		},

		removeLoading: function () {
			this.$backdropHandle && this.$backdropHandle.remove();
			this.$backdropHandle = null;
			this.removeSpinner();
		},

		loading: function (callback) {
			callback = callback || function () { };

			this.$element
				.toggleClass('modal-open', !this.isLoading || this.hasOpenModal())
				.toggleClass('page-overflow', $(window).height() < this.$element.height());

			if (!this.isLoading) {

				this.$backdropHandle = this.createBackdrop('fade', this.options.backdropTemplate);

				this.$backdropHandle[0].offsetWidth; // force reflow

				var openModals = this.getOpenModals();

				this.$backdropHandle
					.css('z-index', getzIndex('backdrop', openModals.length + 1))
					.addClass('in');

				var $spinner = $(this.options.spinner)
					.css('z-index', getzIndex('modal', openModals.length + 1))
					.appendTo(this.$element)
					.addClass('in');

				this.$spinner = $(this.createContainer())
					.append($spinner)
					.on('click.modalmanager', $.proxy(this.loading, this));

				this.isLoading = true;

				$.support.transition ?
					this.$backdropHandle.one($.support.transition.end, callback) :
					callback();

			} else if (this.isLoading && this.$backdropHandle) {
				this.$backdropHandle.removeClass('in');

				var that = this;
				$.support.transition ?
					this.$backdropHandle.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		}
	};

	/* PRIVATE METHODS
	* ======================= */

	// computes and caches the zindexes
	var getzIndex = (function () {
		var zIndexFactor,
			baseIndex = {};

		return function (type, pos) {

			if (typeof zIndexFactor === 'undefined'){
				var $baseModal = $('<div class="modal hide" />').appendTo('body'),
					$baseBackdrop = $('<div class="modal-backdrop hide" />').appendTo('body');

				baseIndex['modal'] = +$baseModal.css('z-index');
				baseIndex['backdrop'] = +$baseBackdrop.css('z-index');
				zIndexFactor = baseIndex['modal'] - baseIndex['backdrop'];

				$baseModal.remove();
				$baseBackdrop.remove();
				$baseBackdrop = $baseModal = null;
			}

			return baseIndex[type] + (zIndexFactor * pos);

		}
	}());

	// make sure the event target is the modal itself in order to prevent
	// other components such as tabsfrom triggering the modal manager.
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsSelf(callback){
		return function (e) {
			if (e && this === e.target){
				return callback.apply(this, arguments);
			}
		}
	}


	/* MODAL MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.modalmanager = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('modalmanager');

			if (!data) $this.data('modalmanager', (data = new ModalManager(this, option)));
			if (typeof option === 'string') data[option].apply(data, [].concat(args))
		})
	};

	$.fn.modalmanager.defaults = {
		backdropLimit: 999,
		resize: true,
		spinner: '<div class="loading-spinner fade" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>',
		backdropTemplate: '<div class="modal-backdrop" />'
	};

	$.fn.modalmanager.Constructor = ModalManager

	// ModalManager handles the modal-open class so we need 
	// to remove conflicting bootstrap 3 event handlers
	$(function () {
		$(document).off('show.bs.modal').off('hidden.bs.modal');
	});

}(jQuery);

if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
}(jQuery);

+function ($) {
    'use strict';

    // AFFIX CLASS DEFINITION
    // ======================

    var Affix = function (element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options)

        this.$target = $(this.options.target)
          .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
          .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))

        this.$element = $(element)
        this.affixed = null
        this.unpin = null
        this.pinnedOffset = null

        this.checkPosition()
    }

    Affix.VERSION = '3.3.7'

    Affix.RESET = 'affix affix-top affix-bottom'

    Affix.DEFAULTS = {
        offset: 0,
        target: window
    }

    Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        var targetHeight = this.$target.height()

        if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

        if (this.affixed == 'bottom') {
            if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
            return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
        }

        var initializing = this.affixed == null
        var colliderTop = initializing ? scrollTop : position.top
        var colliderHeight = initializing ? targetHeight : height

        if (offsetTop != null && scrollTop <= offsetTop) return 'top'
        if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

        return false
    }

    Affix.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset) return this.pinnedOffset
        this.$element.removeClass(Affix.RESET).addClass('affix')
        var scrollTop = this.$target.scrollTop()
        var position = this.$element.offset()
        return (this.pinnedOffset = position.top - scrollTop)
    }

    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1)
    }

    Affix.prototype.checkPosition = function () {
        if (!this.$element.is(':visible')) return

        var height = this.$element.height()
        var offset = this.options.offset
        var offsetTop = offset.top
        var offsetBottom = offset.bottom
        var scrollHeight = Math.max($(document).height(), $(document.body).height())

        if (typeof offset != 'object') offsetBottom = offsetTop = offset
        if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element)
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

        if (this.affixed != affix) {
            if (this.unpin != null) this.$element.css('top', '')

            var affixType = 'affix' + (affix ? '-' + affix : '')
            var e = $.Event(affixType + '.bs.affix')

            this.$element.trigger(e)

            if (e.isDefaultPrevented()) return

            this.affixed = affix
            this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

            this.$element
              .removeClass(Affix.RESET)
              .addClass(affixType)
              .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
        }

        if (affix == 'bottom') {
            this.$element.offset({
                top: scrollHeight - height - offsetBottom
            })
        }
    }


    // AFFIX PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.affix')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.affix

    $.fn.affix = Plugin
    $.fn.affix.Constructor = Affix


    // AFFIX NO CONFLICT
    // =================

    $.fn.affix.noConflict = function () {
        $.fn.affix = old
        return this
    }


    // AFFIX DATA-API
    // ==============

    $(window).on('load', function () {
        $('[data-spy="affix"]').each(function () {
            var $spy = $(this)
            var data = $spy.data()

            data.offset = data.offset || {}

            if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
            if (data.offsetTop != null) data.offset.top = data.offsetTop

            Plugin.call($spy, data)
        })
    })

}(jQuery);

(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
      push = ArrayProto.push,
      slice = ArrayProto.slice,
      concat = ArrayProto.concat,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
      nativeForEach = ArrayProto.forEach,
      nativeMap = ArrayProto.map,
      nativeReduce = ArrayProto.reduce,
      nativeReduceRight = ArrayProto.reduceRight,
      nativeFilter = ArrayProto.filter,
      nativeEvery = ArrayProto.every,
      nativeSome = ArrayProto.some,
      nativeIndexOf = ArrayProto.indexOf,
      nativeLastIndexOf = ArrayProto.lastIndexOf,
      nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.6.0';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function (obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function (value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function (value, index, list) {
            index = keys ? keys[--length] : --length;
            if (!initial) {
                memo = obj[index];
                initial = true;
            } else {
                memo = iterator.call(context, memo, obj[index], index, list);
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function (obj, predicate, context) {
        var result;
        any(obj, function (value, index, list) {
            if (predicate.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
        each(obj, function (value, index, list) {
            if (predicate.call(context, value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function (obj, predicate, context) {
        return _.filter(obj, function (value, index, list) {
            return !predicate.call(context, value, index, list);
        }, context);
    };

    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
        each(obj, function (value, index, list) {
            if (!(result = result && predicate.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
        each(obj, function (value, index, list) {
            if (result || (result = predicate.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `include`.
    _.contains = _.include = function (obj, target) {
        if (obj == null) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        return any(obj, function (value) {
            return value === target;
        });
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
            return (isFunc ? method : value[method]).apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    _.where = function (obj, attrs) {
        return _.filter(obj, _.matches(attrs));
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matches(attrs));
    };

    // Return the maximum element or (element-based computation).
    // Can't optimize arrays of integers longer than 65,535 elements.
    // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
    _.max = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        var result = -Infinity, lastComputed = -Infinity;
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            if (computed > lastComputed) {
                result = value;
                lastComputed = computed;
            }
        });
        return result;
    };

    // Return the minimum element (or element-based computation).
    _.min = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        var result = Infinity, lastComputed = Infinity;
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            if (computed < lastComputed) {
                result = value;
                lastComputed = computed;
            }
        });
        return result;
    };

    // Shuffle an array, using the modern version of the
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
    _.shuffle = function (obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function (value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };

    // Sample **n** random values from a collection.
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function (obj, n, guard) {
        if (n == null || guard) {
            if (obj.length !== +obj.length) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };

    // An internal function to generate lookup iterators.
    var lookupIterator = function (value) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return value;
        return _.property(value);
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function (obj, iterator, context) {
        iterator = lookupIterator(iterator);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    var group = function (behavior) {
        return function (obj, iterator, context) {
            var result = {};
            iterator = lookupIterator(iterator);
            each(obj, function (value, index) {
                var key = iterator.call(context, value, index, obj);
                behavior(result, key, value);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = group(function (result, key, value) {
        _.has(result, key) ? result[key].push(value) : result[key] = [value];
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    _.indexBy = group(function (result, key, value) {
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    _.countBy = group(function (result, key) {
        _.has(result, key) ? result[key]++ : result[key] = 1;
    });

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function (array, obj, iterator, context) {
        iterator = lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0, high = array.length;
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };

    // Safely create a real, live array from anything iterable.
    _.toArray = function (obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function (obj) {
        if (obj == null) return 0;
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null) return void 0;
        if ((n == null) || guard) return array[0];
        if (n < 0) return [];
        return slice.call(array, 0, n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function (array, n, guard) {
        if (array == null) return void 0;
        if ((n == null) || guard) return array[array.length - 1];
        return slice.call(array, Math.max(array.length - n, 0));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array. The **guard**
    // check allows it to work with `_.map`.
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    _.compact = function (array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function (input, shallow, output) {
        if (shallow && _.every(input, _.isArray)) {
            return concat.apply(output, input);
        }
        each(input, function (value) {
            if (_.isArray(value) || _.isArguments(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, []);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Split an array into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    _.partition = function (array, predicate, context) {
        predicate = lookupIterator(predicate);
        var pass = [], fail = [];
        each(array, function (elem) {
            (predicate.call(context, elem) ? pass : fail).push(elem);
        });
        return [pass, fail];
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function (array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function (value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function () {
        return _.uniq(_.flatten(arguments, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function (array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function (item) {
            return _.every(rest, function (other) {
                return _.contains(other, item);
            });
        });
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function (array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function (value) { return !_.contains(rest, value); });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function () {
        var length = _.max(_.pluck(arguments, 'length').concat(0));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
            results[i] = _.pluck(arguments, '' + i);
        }
        return results;
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function (list, values) {
        if (list == null) return {};
        var result = {};
        for (var i = 0, length = list.length; i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function (array, item, isSorted) {
        if (array == null) return -1;
        var i = 0, length = array.length;
        if (isSorted) {
            if (typeof isSorted == 'number') {
                i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
            } else {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (; i < length; i++) if (array[i] === item) return i;
        return -1;
    };

    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    _.lastIndexOf = function (array, item, from) {
        if (array == null) return -1;
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--) if (array[i] === item) return i;
        return -1;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function (start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(length);

        while (idx < length) {
            range[idx++] = start;
            start += step;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    var ctor = function () { };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function (func, context) {
        var args, bound;
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function () {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder, allowing any combination of arguments to be pre-filled.
    _.partial = function (func) {
        var boundArgs = slice.call(arguments, 1);
        return function () {
            var position = 0;
            var args = boundArgs.slice();
            for (var i = 0, length = args.length; i < length; i++) {
                if (args[i] === _) args[i] = arguments[position++];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return func.apply(this, args);
        };
    };

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    _.bindAll = function (obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length === 0) throw new Error('bindAll must be passed function names');
        each(funcs, function (f) { obj[f] = _.bind(obj[f], obj); });
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function (func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function () {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () { return func.apply(null, args); }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function (func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function () {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function () {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            var last = _.now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function (func) {
        var ran = false, memo;
        return function () {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func);
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function () {
        var funcs = arguments;
        return function () {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };

    // Returns a function that will only be executed after being called N times.
    _.after = function (times, func) {
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Object Functions
    // ----------------

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = function (obj) {
        if (!_.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys.push(key);
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = new Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = new Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function (key) {
            if (key in obj) copy[key] = obj[key];
        });
        return copy;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) copy[key] = obj[key];
        }
        return copy;
    };

    // Fill in a given object with default properties.
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function (obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Internal recursive comparison function for `isEqual`.
    var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
                // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                       a.global == b.global &&
                       a.multiline == b.multiline &&
                       a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] == a) return bStack[length] == b;
        }
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                                 _.isFunction(bCtor) && (bCtor instanceof bCtor))
                            && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                }
            }
        } else {
            // Deep compare objects.
            for (var key in a) {
                if (_.has(a, key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) break;
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function (a, b) {
        return eq(a, b, [], []);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function (obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true;
    };

    // Is a given value a DOM element?
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) == '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function (obj) {
        return obj === Object(obj);
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // Optimize `isFunction` if appropriate.
    if (typeof (/./) !== 'function') {
        _.isFunction = function (obj) {
            return typeof obj === 'function';
        };
    }

    // Is a given object a finite number?
    _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj != +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function (obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iterators.
    _.identity = function (value) {
        return value;
    };

    _.constant = function (value) {
        return function () {
            return value;
        };
    };

    _.property = function (key) {
        return function (obj) {
            return obj[key];
        };
    };

    // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
    _.matches = function (attrs) {
        ////////////edited so it compares only strings, so i don't care if 2 !== '2'
        return function (obj) {
            if (obj === attrs) return true; //avoid comparing an object to itself.
            for (var key in attrs) {
                if (String(attrs[key]) !== String((obj[key])))
                    return false;
            }
            return true;
        }
    };

    // Run a function **n** times.
    _.times = function (n, iterator, context) {
        var accum = Array(Math.max(0, n));
        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    _.now = Date.now || function () { return new Date().getTime(); };

    // List of HTML entities for escaping.
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);

    // Regexes containing the keys and values listed immediately above.
    var entityRegexes = {
        escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    };

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    _.each(['escape', 'unescape'], function (method) {
        _[method] = function (string) {
            if (string == null) return '';
            return ('' + string).replace(entityRegexes[method], function (match) {
                return entityMap[method][match];
            });
        };
    });

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function (object, property) {
        if (object == null) return void 0;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function (obj) {
        each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function (text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
              .replace(escaper, function (match) { return '\\' + escapes[match]; });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
          "print=function(){__p+=__j.call(arguments,'');};\n" +
          source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data, _);
        var template = function (data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function, which will delegate to the wrapper.
    _.chain = function (obj) {
        return _(obj).chain();
    };


    /******************* Custome Functions, move over if upgrading ************/
    _.findByKey = function (obj, attrs) {
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        var f;
        _.each(obj, function (k, v) {
            for (var key in attrs) {
                if (attrs[key] == k[key]) {
                    
                    f = obj[v];
                    return true;
                }
            }
        });

        return f;
    };

    _.omitByKey = function (obj, attrs) {
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        var f = [];
        _.each(obj, function (k, v) {
            for (var key in attrs) {
                var omit = attrs[key];
                var cur = k[key];
                if (attrs[key] != k[key]) {
                    f.push(obj[v]);
                    return true;
                }
            }
        });

        return f;
    };

    _.findAllByKey = function (obj, attrs) {
        var skipAttrs = (arguments[2]) ? arguments[2] : false;
        if (_.isEmpty(attrs)) return first ? void 0 : [];
        var f = [];
        _.each(obj, function (k, v) {
            for (var key in attrs) {
                if (skipAttrs) {
                    //console.log('key', key, 'attrs', attrs, 'attrs[key]', attrs[key], 'k[key]', k[key], 'obj[v]', obj[v]);
                }
                if (attrs[key] == k[key]) {
                    
                    f.push(obj[v]);
                    //return true;
                }
            }
        });

        return f;
    };

    _.hasKeyVal = function (obj, attr) {
        return ((_.where(obj, attr)).length > 0) ? true : false;
    }

    //replace a single key by key name
    _.replaceKey = function (obj, r, rw) {
        return _.map(obj, function (obj, key) {
            var o = {};
            _.each(obj, function (val, key) {
                if (key == r) {
                    o[rw] = val;
                } else {
                    o[key] = val;
                }
            });
            return o;
        });
    };

    //replace all keys by obj map
    _.replaceObjKeysByMap = function (obj, map) {
        var temp = [obj];

        _.each(map, function (val, key) {
            temp = _.replaceKey(temp, key, val);
        });
        return temp[0];
    };

    _.addDisplayOrder = function (obj, orderKey) {
        var a = [];
        _.each(obj, function (val, key) {
            var o = {};
            o[orderKey] = key + 1;
            a.push(_.extend(val, o));
        });
        return a;
    };


    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    _.capitalizeKeys = function (arr) {
        //this takes an array of objects and makes the 'keys' into title case.
        var a = [];
        //console.log(arr);
        _.each(arr, function (value, key) {
            //console.info(value, key);
            var obj = {};
            _.each(value, function (val, key) {
                //console.log(val, key.toProperCase());
                obj[key.capitalize()] = val;
            });
            a.push(obj);
            
        });

        return a;
    }

    _.uniqueByKey = function (obj, attr) {
        //any extra arguments are used to limit which keys are returend.
        var keys = concat.apply(ArrayProto, slice.call(arguments, 2));
        var a = [];
        _.each(obj, function (v, k) {
            var o = {}; o[attr] = v[attr];
            if ((!_.hasKeyVal(a, o)) && v[attr] !== null) {
                if (keys.length > 0) {
                    a.push(_.pick(v, keys));
                } else {
                    a.push(v);
                }
            };
        });
        return a;
    };



    _.pickKeysFromObjArray = function (obj) {
        //any extra arguments are used to limit which keys are returend.
        var a = [];
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        _.each(obj, function (v, k) {
            a.push(_.pick(v, keys));
        });
        
        return a;
    }


    _.dedupeByKey = function (obj1, obj2, key1, key2) {
        var a = [];
        
        _.each(obj1, function (v, k) {
            console.log('OBJ1 ---->  ', v);
                
            _.each(obj2, function (v2, k2) {
                //console.log('OBJ2 ---->  ', v2);
                
                console.log('obj1 key - > ', v[key], ' obj2 key -> ', v2[key]);
            });


        });
        return a;
    };

    //takes 2 objs and separates the difference between the 2 based on the given key for each obj.
    _.differenceByKey = function (obj1, obj2, key1, key2) {

        //key1 is key for obj1, key2 is key for obj2
        var r1 = [], r2 = [];
        
        _.each(obj1, function (val, key) {
            var search = {};
            search[key2] = val[key1];
            if (_.hasKeyVal(obj2, search)) {
                //console.log('--------- HAS MATCH', key, val);
                r1.push(val);
            } else {
                //console.log('ooooooooooooooo NO MATCH', key, val);
                r2.push(val);
            }
        });
        return { Matches: r1, NoMatches: r2 };
    };

    //extends the groupby function to return the groups as a single array (native groupBy returns an array of array objects, as well as give options to to what keys are returned.
    _.groupByFilter = function (obj, filter, exludeNulls) {
        var keys = concat.apply(ArrayProto, slice.call(arguments, 3));//4th argument is options array of keys to return.
        var _allGroups = [];//holds array of grouped items.
        var _matchedGroups = [];
        var group = {};
        
        /*
        var groups = _.groupBy(obj, function (obj) {
            return obj[filter];
        });
        
        console.log('groups', groups);
        var sortedGroups = _.sortBy(groups, 'RulePriority');
        console.log('sortedGroups', sortedGroups);
        */
        _.each(obj, function (val, key) {
            console.log('#### group.each', val, key);
            console.log('XXXX group.each filter', group[val.filter]);
            if (_.isArray(group[val.filter])) {
                console.log('array', 'group[filter]', val[filter], 'val', val);
                group[val.filter].push(val);
            } else {
                console.log('not array', 'group[filter]', val[filter], 'val', val);
                group[val.filter] = new Array(val);
            }
        });

        

        /*

        _.each(obj, function (val, key) {
            console.log('#### group.each', val, key);
        });

        _.groupBy = group(function (result, key, value) {
            _.has(result, key) ? result[key].push(value) : result[key] = [value];
        });

        var groups = _.groupBy(obj, function (obj) {
            return obj[filter];
        });
        console.log('UNDERSCORE Grouped Rules', groups);
        var _groups = [];//holds array of grouped items.
        
        _.each(groups, function (val, key) {
            console.log('group.each', val, key);
            if (exludeNulls && key == 'null') {
                console.log('_groupByFilter null');
                return;
            } else {
                console.log('keys', keys, 'length', keys.length, 'evaluator', ((keys).length > 0) ? _.pick(val[0], keys) : val[0]);
                _groups.push(((keys).length > 0) ? _.pick(val[key], keys) : val[key]);
            }
            
        });
        */
        return group;
    };


    //this enahnces the groupBy funcion so it respects sorting. If the key to your groupBy is an integer the object returned will automatically be sorted by integer even if the object is in the correct sort before grouping.
    //to get around this we need to add a precace before the filter so the object returned is a string like _1: instead of 1:
    _.sortedGroupBy = function (obj, filter, sortby) {
        var preface = (arguments[3]) ? arguments[3] : '_';

        //get unique values.
        var unique = _.uniqueByKey(obj, filter);
        unique = _.sortBy(unique, sortby);

        var newObj = {};
        var findKeyFilter = {};
        console.log('underscore.sortedGroupby', 'unique', unique);
        _.each(unique, function (val, key) {
            findKeyFilter[filter] = val[filter];
            newObj[preface + String(val[filter])] = _.findAllByKey(obj, findKeyFilter);
        });
        return newObj;
    };

    //this combines a few of the checks if a value exists (currently there is no check if this is a string and it is set to "")
    _.isNothing = function (obj) {
        //if (_.isObject(obj)) {
        //    return _.isNull
        //}

        if (_.isEmpty(obj) || _.isNull(obj) || obj === "") {
            return true;
        } else {
            return false;
        }

    }

    /******************* END Custom Functions, move over if upgrading ************/




    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function (obj) {
        return this._chain ? _(obj).chain() : obj;
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
            return result.call(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });

    _.extend(_.prototype, {

        // Start chaining a wrapped Underscore object.
        chain: function () {
            this._chain = true;
            return this;
        },

        // Extracts the result from a wrapped and chained object.
        value: function () {
            return this._wrapped;
        }

    });

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
            return _;
        });
    }
}).call(this);


var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' : gap ?
                        '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' : gap ?
                    '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                    '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', { '': value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({ '': j }, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

(function (factory) {
    var _OldCookies = window.Cookies;
    var api = window.Cookies = factory();
    api.noConflict = function () {
        window.Cookies = _OldCookies;
        return api;
    };
    //if (typeof define === 'function' && define.amd) {
    //    define(factory);
    //} else if (typeof exports === 'object') {
    //    module.exports = factory();
    //} else {
    //    var _OldCookies = window.Cookies;
    //    var api = window.Cookies = factory();
    //    api.noConflict = function () {
    //        window.Cookies = _OldCookies;
    //        return api;
    //    };
    //}
}(function () {
    function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[i];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    function init(converter) {
        function api(key, value, attributes) {
            var result;

            // Write

            if (arguments.length > 1) {
                attributes = extend({
                    path: '/'
                }, api.defaults, attributes);

                if (typeof attributes.expires === 'number') {
                    var expires = new Date();
                    expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
                    attributes.expires = expires;
                }

                try {
                    result = JSON.stringify(value);
                    if (/^[\{\[]/.test(result)) {
                        value = result;
                    }
                } catch (e) { }
                if (key != 'igmRegID' && key != 'igmContent') {
                    if (!converter.write) {
                        value = encodeURIComponent(String(value))
                            .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
                    } else {
                        value = converter.write(value, key);
                    }
                }

                key = encodeURIComponent(String(key));
                key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
                key = key.replace(/[\(\)]/g, escape);

                return (document.cookie = [
                    key, '=', value,
                    attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
                    attributes.path && '; path=' + attributes.path,
                    attributes.domain && '; domain=' + attributes.domain,
                    attributes.secure ? '; secure' : ''
                ].join(''));
            }

            // Read

            if (!key) {
                result = {};
            }

            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all. Also prevents odd result when
            // calling "get()"
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var rdecode = /(%[0-9A-Z]{2})+/g;
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var name = parts[0].replace(rdecode, decodeURIComponent);
                var cookie = parts.slice(1).join('=');

                if (cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    cookie = converter.read ?
                        converter.read(cookie, name) : converter(cookie, name) ||
                        cookie.replace(rdecode, decodeURIComponent);

                    if (this.json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) { }
                    }

                    if (key === name) {
                        result = cookie;
                        break;
                    }

                    if (!key) {
                        result[name] = cookie;
                    }
                } catch (e) { }
            }

            return result;
        }

        api.get = api.set = api;
        api.getJSON = function () {
            return api.apply({
                json: true
            }, [].slice.call(arguments));
        };
        api.defaults = {};

        api.remove = function (key, attributes) {
            api(key, '', extend(attributes, {
                expires: -1
            }));
        };

        api.withConverter = init;

        return api;
    }

    return init(function () { });
}));


var MD5 = function (s) { function L(k, d) { return (k << d) | (k >>> (32 - d)) } function K(G, k) { var I, d, F, H, x; F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824); x = (G & 1073741823) + (k & 1073741823); if (I & d) { return (x ^ 2147483648 ^ F ^ H) } if (I | d) { if (x & 1073741824) { return (x ^ 3221225472 ^ F ^ H) } else { return (x ^ 1073741824 ^ F ^ H) } } else { return (x ^ F ^ H) } } function r(d, F, k) { return (d & F) | ((~d) & k) } function q(d, F, k) { return (d & k) | (F & (~k)) } function p(d, F, k) { return (d ^ F ^ k) } function n(d, F, k) { return (F ^ (d | (~k))) } function u(G, F, aa, Z, k, H, I) { G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F) } function f(G, F, aa, Z, k, H, I) { G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F) } function D(G, F, aa, Z, k, H, I) { G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F) } function t(G, F, aa, Z, k, H, I) { G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F) } function e(G) { var Z; var F = G.length; var x = F + 8; var k = (x - (x % 64)) / 64; var I = (k + 1) * 16; var aa = Array(I - 1); var d = 0; var H = 0; while (H < F) { Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = (aa[Z] | (G.charCodeAt(H) << d)); H++ } Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = aa[Z] | (128 << d); aa[I - 2] = F << 3; aa[I - 1] = F >>> 29; return aa } function B(x) { var k = "", F = "", G, d; for (d = 0; d <= 3; d++) { G = (x >>> (d * 8)) & 255; F = "0" + G.toString(16); k = k + F.substr(F.length - 2, 2) } return k } function J(k) { k = k.replace(/rn/g, "n"); var d = ""; for (var F = 0; F < k.length; F++) { var x = k.charCodeAt(F); if (x < 128) { d += String.fromCharCode(x) } else { if ((x > 127) && (x < 2048)) { d += String.fromCharCode((x >> 6) | 192); d += String.fromCharCode((x & 63) | 128) } else { d += String.fromCharCode((x >> 12) | 224); d += String.fromCharCode(((x >> 6) & 63) | 128); d += String.fromCharCode((x & 63) | 128) } } } return d } var C = Array(); var P, h, E, v, g, Y, X, W, V; var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var U = 6, T = 10, R = 15, O = 21; s = J(s); C = e(s); Y = 1732584193; X = 4023233417; W = 2562383102; V = 271733878; for (P = 0; P < C.length; P += 16) { h = Y; E = X; v = W; g = V; Y = u(Y, X, W, V, C[P + 0], S, 3614090360); V = u(V, Y, X, W, C[P + 1], Q, 3905402710); W = u(W, V, Y, X, C[P + 2], N, 606105819); X = u(X, W, V, Y, C[P + 3], M, 3250441966); Y = u(Y, X, W, V, C[P + 4], S, 4118548399); V = u(V, Y, X, W, C[P + 5], Q, 1200080426); W = u(W, V, Y, X, C[P + 6], N, 2821735955); X = u(X, W, V, Y, C[P + 7], M, 4249261313); Y = u(Y, X, W, V, C[P + 8], S, 1770035416); V = u(V, Y, X, W, C[P + 9], Q, 2336552879); W = u(W, V, Y, X, C[P + 10], N, 4294925233); X = u(X, W, V, Y, C[P + 11], M, 2304563134); Y = u(Y, X, W, V, C[P + 12], S, 1804603682); V = u(V, Y, X, W, C[P + 13], Q, 4254626195); W = u(W, V, Y, X, C[P + 14], N, 2792965006); X = u(X, W, V, Y, C[P + 15], M, 1236535329); Y = f(Y, X, W, V, C[P + 1], A, 4129170786); V = f(V, Y, X, W, C[P + 6], z, 3225465664); W = f(W, V, Y, X, C[P + 11], y, 643717713); X = f(X, W, V, Y, C[P + 0], w, 3921069994); Y = f(Y, X, W, V, C[P + 5], A, 3593408605); V = f(V, Y, X, W, C[P + 10], z, 38016083); W = f(W, V, Y, X, C[P + 15], y, 3634488961); X = f(X, W, V, Y, C[P + 4], w, 3889429448); Y = f(Y, X, W, V, C[P + 9], A, 568446438); V = f(V, Y, X, W, C[P + 14], z, 3275163606); W = f(W, V, Y, X, C[P + 3], y, 4107603335); X = f(X, W, V, Y, C[P + 8], w, 1163531501); Y = f(Y, X, W, V, C[P + 13], A, 2850285829); V = f(V, Y, X, W, C[P + 2], z, 4243563512); W = f(W, V, Y, X, C[P + 7], y, 1735328473); X = f(X, W, V, Y, C[P + 12], w, 2368359562); Y = D(Y, X, W, V, C[P + 5], o, 4294588738); V = D(V, Y, X, W, C[P + 8], m, 2272392833); W = D(W, V, Y, X, C[P + 11], l, 1839030562); X = D(X, W, V, Y, C[P + 14], j, 4259657740); Y = D(Y, X, W, V, C[P + 1], o, 2763975236); V = D(V, Y, X, W, C[P + 4], m, 1272893353); W = D(W, V, Y, X, C[P + 7], l, 4139469664); X = D(X, W, V, Y, C[P + 10], j, 3200236656); Y = D(Y, X, W, V, C[P + 13], o, 681279174); V = D(V, Y, X, W, C[P + 0], m, 3936430074); W = D(W, V, Y, X, C[P + 3], l, 3572445317); X = D(X, W, V, Y, C[P + 6], j, 76029189); Y = D(Y, X, W, V, C[P + 9], o, 3654602809); V = D(V, Y, X, W, C[P + 12], m, 3873151461); W = D(W, V, Y, X, C[P + 15], l, 530742520); X = D(X, W, V, Y, C[P + 2], j, 3299628645); Y = t(Y, X, W, V, C[P + 0], U, 4096336452); V = t(V, Y, X, W, C[P + 7], T, 1126891415); W = t(W, V, Y, X, C[P + 14], R, 2878612391); X = t(X, W, V, Y, C[P + 5], O, 4237533241); Y = t(Y, X, W, V, C[P + 12], U, 1700485571); V = t(V, Y, X, W, C[P + 3], T, 2399980690); W = t(W, V, Y, X, C[P + 10], R, 4293915773); X = t(X, W, V, Y, C[P + 1], O, 2240044497); Y = t(Y, X, W, V, C[P + 8], U, 1873313359); V = t(V, Y, X, W, C[P + 15], T, 4264355552); W = t(W, V, Y, X, C[P + 6], R, 2734768916); X = t(X, W, V, Y, C[P + 13], O, 1309151649); Y = t(Y, X, W, V, C[P + 4], U, 4149444226); V = t(V, Y, X, W, C[P + 11], T, 3174756917); W = t(W, V, Y, X, C[P + 2], R, 718787259); X = t(X, W, V, Y, C[P + 9], O, 3951481745); Y = K(Y, h); X = K(X, E); W = K(W, v); V = K(V, g) } var i = B(Y) + B(X) + B(W) + B(V); return i.toLowerCase() };
(function () {
    'use strict';

    var
    /* jStorage version */
        JSTORAGE_VERSION = '0.4.12',

        /* detect a dollar object or create one if not found */
        $ = window.jQuery || window.$ || (window.$ = {}),

        /* check for a JSON handling support */
        JSON = {
            parse: window.JSON && (window.JSON.parse || window.JSON.decode) ||
                String.prototype.evalJSON && function (str) {
                    return String(str).evalJSON();
                } ||
                $.parseJSON ||
                $.evalJSON,
            stringify: Object.toJSON ||
                window.JSON && (window.JSON.stringify || window.JSON.encode) ||
                $.toJSON
        };

    // Break if no JSON support was found
    if (typeof JSON.parse !== 'function' || typeof JSON.stringify !== 'function') {
        throw new Error('No JSON support found, include //cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.js to page');
    }

    var
    /* This is the object, that holds the cached values */
        _storage = {
            __jstorage_meta: {
                CRC32: {}
            }
        },

        /* Actual browser storage (localStorage or globalStorage['domain']) */
        _storage_service = {
            jStorage: '{}'
        },

        /* DOM element for older IE versions, holds userData behavior */
        _storage_elm = null,

        /* How much space does the storage take */
        _storage_size = 0,

        /* which backend is currently used */
        _backend = false,

        /* onchange observers */
        _observers = {},

        /* timeout to wait after onchange event */
        _observer_timeout = false,

        /* last update time */
        _observer_update = 0,

        /* pubsub observers */
        _pubsub_observers = {},

        /* skip published items older than current timestamp */
        _pubsub_last = +new Date(),

        /* Next check for TTL */
        _ttl_timeout,

        /**
         * XML encoding and decoding as XML nodes can't be JSON'ized
         * XML nodes are encoded and decoded if the node is the value to be saved
         * but not if it's as a property of another object
         * Eg. -
         *   $.jStorage.set('key', xmlNode);        // IS OK
         *   $.jStorage.set('key', {xml: xmlNode}); // NOT OK
         */
        _XMLService = {

            /**
             * Validates a XML node to be XML
             * based on jQuery.isXML function
             */
            isXML: function (elm) {
                var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
                return documentElement ? documentElement.nodeName !== 'HTML' : false;
            },

            /**
             * Encodes a XML node to string
             * based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
             */
            encode: function (xmlNode) {
                if (!this.isXML(xmlNode)) {
                    return false;
                }
                try { // Mozilla, Webkit, Opera
                    return new XMLSerializer().serializeToString(xmlNode);
                } catch (E1) {
                    try { // IE
                        return xmlNode.xml;
                    } catch (E2) { }
                }
                return false;
            },

            /**
             * Decodes a XML node from string
             * loosely based on http://outwestmedia.com/jquery-plugins/xmldom/
             */
            decode: function (xmlString) {
                var dom_parser = ('DOMParser' in window && (new DOMParser()).parseFromString) ||
                    (window.ActiveXObject && function (_xmlString) {
                        var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                        xml_doc.async = 'false';
                        xml_doc.loadXML(_xmlString);
                        return xml_doc;
                    }),
                    resultXML;
                if (!dom_parser) {
                    return false;
                }
                resultXML = dom_parser.call('DOMParser' in window && (new DOMParser()) || window, xmlString, 'text/xml');
                return this.isXML(resultXML) ? resultXML : false;
            }
        };


    ////////////////////////// PRIVATE METHODS ////////////////////////

    /**
     * Initialization function. Detects if the browser supports DOM Storage
     * or userData behavior and behaves accordingly.
     */
    function _init() {
        /* Check if browser supports localStorage */
        var localStorageReallyWorks = false;
        if ('localStorage' in window) {
            try {
                window.localStorage.setItem('_tmptest', 'tmpval');
                localStorageReallyWorks = true;
                window.localStorage.removeItem('_tmptest');
            } catch (BogusQuotaExceededErrorOnIos5) {
                // Thanks be to iOS5 Private Browsing mode which throws
                // QUOTA_EXCEEDED_ERRROR DOM Exception 22.
            }
        }

        if (localStorageReallyWorks) {
            try {
                if (window.localStorage) {
                    _storage_service = window.localStorage;
                    _backend = 'localStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E3) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
            /* Check if browser supports globalStorage */
        else if ('globalStorage' in window) {
            try {
                if (window.globalStorage) {
                    if (window.location.hostname == 'localhost') {
                        _storage_service = window.globalStorage['localhost.localdomain'];
                    } else {
                        _storage_service = window.globalStorage[window.location.hostname];
                    }
                    _backend = 'globalStorage';
                    _observer_update = _storage_service.jStorage_update;
                }
            } catch (E4) { /* Firefox fails when touching localStorage and cookies are disabled */ }
        }
            /* Check if browser supports userData behavior */
        else {
            _storage_elm = document.createElement('link');
            if (_storage_elm.addBehavior) {

                /* Use a DOM element to act as userData storage */
                _storage_elm.style.behavior = 'url(#default#userData)';

                /* userData element needs to be inserted into the DOM! */
                document.getElementsByTagName('head')[0].appendChild(_storage_elm);

                try {
                    _storage_elm.load('jStorage');
                } catch (E) {
                    // try to reset cache
                    _storage_elm.setAttribute('jStorage', '{}');
                    _storage_elm.save('jStorage');
                    _storage_elm.load('jStorage');
                }

                var data = '{}';
                try {
                    data = _storage_elm.getAttribute('jStorage');
                } catch (E5) { }

                try {
                    _observer_update = _storage_elm.getAttribute('jStorage_update');
                } catch (E6) { }

                _storage_service.jStorage = data;
                _backend = 'userDataBehavior';
            } else {
                _storage_elm = null;
                return;
            }
        }

        // Load data from storage
        _load_storage();

        // remove dead keys
        _handleTTL();

        // start listening for changes
        _setupObserver();

        // initialize publish-subscribe service
        _handlePubSub();

        // handle cached navigation
        if ('addEventListener' in window) {
            window.addEventListener('pageshow', function (event) {
                if (event.persisted) {
                    _storageObserver();
                }
            }, false);
        }
    }

    /**
     * Reload data from storage when needed
     */
    function _reloadData() {
        var data = '{}';

        if (_backend == 'userDataBehavior') {
            _storage_elm.load('jStorage');

            try {
                data = _storage_elm.getAttribute('jStorage');
            } catch (E5) { }

            try {
                _observer_update = _storage_elm.getAttribute('jStorage_update');
            } catch (E6) { }

            _storage_service.jStorage = data;
        }

        _load_storage();

        // remove dead keys
        _handleTTL();

        _handlePubSub();
    }

    /**
     * Sets up a storage change observer
     */
    function _setupObserver() {
        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            if ('addEventListener' in window) {
                window.addEventListener('storage', _storageObserver, false);
            } else {
                document.attachEvent('onstorage', _storageObserver);
            }
        } else if (_backend == 'userDataBehavior') {
            setInterval(_storageObserver, 1000);
        }
    }

    /**
     * Fired on any kind of data change, needs to check if anything has
     * really been changed
     */
    function _storageObserver() {
        var updateTime;
        // cumulate change notifications with timeout
        clearTimeout(_observer_timeout);
        _observer_timeout = setTimeout(function () {

            if (_backend == 'localStorage' || _backend == 'globalStorage') {
                updateTime = _storage_service.jStorage_update;
            } else if (_backend == 'userDataBehavior') {
                _storage_elm.load('jStorage');
                try {
                    updateTime = _storage_elm.getAttribute('jStorage_update');
                } catch (E5) { }
            }

            if (updateTime && updateTime != _observer_update) {
                _observer_update = updateTime;
                _checkUpdatedKeys();
            }

        }, 25);
    }

    /**
     * Reloads the data and checks if any keys are changed
     */
    function _checkUpdatedKeys() {
        var oldCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32)),
            newCrc32List;

        _reloadData();
        newCrc32List = JSON.parse(JSON.stringify(_storage.__jstorage_meta.CRC32));

        var key,
            updated = [],
            removed = [];

        for (key in oldCrc32List) {
            if (oldCrc32List.hasOwnProperty(key)) {
                if (!newCrc32List[key]) {
                    removed.push(key);
                    continue;
                }
                if (oldCrc32List[key] != newCrc32List[key] && String(oldCrc32List[key]).substr(0, 2) == '2.') {
                    updated.push(key);
                }
            }
        }

        for (key in newCrc32List) {
            if (newCrc32List.hasOwnProperty(key)) {
                if (!oldCrc32List[key]) {
                    updated.push(key);
                }
            }
        }

        _fireObservers(updated, 'updated');
        _fireObservers(removed, 'deleted');
    }

    /**
     * Fires observers for updated keys
     *
     * @param {Array|String} keys Array of key names or a key
     * @param {String} action What happened with the value (updated, deleted, flushed)
     */
    function _fireObservers(keys, action) {
        keys = [].concat(keys || []);

        var i, j, len, jlen;

        if (action == 'flushed') {
            keys = [];
            for (var key in _observers) {
                if (_observers.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            action = 'deleted';
        }
        for (i = 0, len = keys.length; i < len; i++) {
            if (_observers[keys[i]]) {
                for (j = 0, jlen = _observers[keys[i]].length; j < jlen; j++) {
                    _observers[keys[i]][j](keys[i], action);
                }
            }
            if (_observers['*']) {
                for (j = 0, jlen = _observers['*'].length; j < jlen; j++) {
                    _observers['*'][j](keys[i], action);
                }
            }
        }
    }

    /**
     * Publishes key change to listeners
     */
    function _publishChange() {
        var updateTime = (+new Date()).toString();

        if (_backend == 'localStorage' || _backend == 'globalStorage') {
            try {
                _storage_service.jStorage_update = updateTime;
            } catch (E8) {
                // safari private mode has been enabled after the jStorage initialization
                _backend = false;
            }
        } else if (_backend == 'userDataBehavior') {
            _storage_elm.setAttribute('jStorage_update', updateTime);
            _storage_elm.save('jStorage');
        }

        _storageObserver();
    }

    /**
     * Loads the data from the storage based on the supported mechanism
     */
    function _load_storage() {
        /* if jStorage string is retrieved, then decode it */
        if (_storage_service.jStorage) {
            try {
                _storage = JSON.parse(String(_storage_service.jStorage));
            } catch (E6) {
                _storage_service.jStorage = '{}';
            }
        } else {
            _storage_service.jStorage = '{}';
        }
        _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;

        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.CRC32) {
            _storage.__jstorage_meta.CRC32 = {};
        }
    }

    /**
     * This functions provides the 'save' mechanism to store the jStorage object
     */
    function _save() {
        _dropOldEvents(); // remove expired events
        try {
            _storage_service.jStorage = JSON.stringify(_storage);
            // If userData is used as the storage engine, additional
            if (_storage_elm) {
                _storage_elm.setAttribute('jStorage', _storage_service.jStorage);
                _storage_elm.save('jStorage');
            }
            _storage_size = _storage_service.jStorage ? String(_storage_service.jStorage).length : 0;
        } catch (E7) { /* probably cache is full, nothing is saved this way*/ }
    }

    /**
     * Function checks if a key is set and is string or numberic
     *
     * @param {String} key Key name
     */
    function _checkKey(key) {
        if (typeof key != 'string' && typeof key != 'number') {
            throw new TypeError('Key name must be string or numeric');
        }
        if (key == '__jstorage_meta') {
            throw new TypeError('Reserved key name');
        }
        return true;
    }

    /**
     * Removes expired keys
     */
    function _handleTTL() {
        var curtime, i, TTL, CRC32, nextExpire = Infinity,
            changed = false,
            deleted = [];

        clearTimeout(_ttl_timeout);

        if (!_storage.__jstorage_meta || typeof _storage.__jstorage_meta.TTL != 'object') {
            // nothing to do here
            return;
        }

        curtime = +new Date();
        TTL = _storage.__jstorage_meta.TTL;

        CRC32 = _storage.__jstorage_meta.CRC32;
        for (i in TTL) {
            if (TTL.hasOwnProperty(i)) {
                if (TTL[i] <= curtime) {
                    delete TTL[i];
                    delete CRC32[i];
                    delete _storage[i];
                    changed = true;
                    deleted.push(i);
                } else if (TTL[i] < nextExpire) {
                    nextExpire = TTL[i];
                }
            }
        }

        // set next check
        if (nextExpire != Infinity) {
            _ttl_timeout = setTimeout(_handleTTL, Math.min(nextExpire - curtime, 0x7FFFFFFF));
        }

        // save changes
        if (changed) {
            _save();
            _publishChange();
            _fireObservers(deleted, 'deleted');
        }
    }

    /**
     * Checks if there's any events on hold to be fired to listeners
     */
    function _handlePubSub() {
        var i, len;
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }
        var pubelm,
            _pubsubCurrent = _pubsub_last,
            needFired = [];

        for (i = len = _storage.__jstorage_meta.PubSub.length - 1; i >= 0; i--) {
            pubelm = _storage.__jstorage_meta.PubSub[i];
            if (pubelm[0] > _pubsub_last) {
                _pubsubCurrent = pubelm[0];
                needFired.unshift(pubelm);
            }
        }

        for (i = needFired.length - 1; i >= 0; i--) {
            _fireSubscribers(needFired[i][1], needFired[i][2]);
        }

        _pubsub_last = _pubsubCurrent;
    }

    /**
     * Fires all subscriber listeners for a pubsub channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload data to deliver
     */
    function _fireSubscribers(channel, payload) {
        if (_pubsub_observers[channel]) {
            for (var i = 0, len = _pubsub_observers[channel].length; i < len; i++) {
                // send immutable data that can't be modified by listeners
                try {
                    _pubsub_observers[channel][i](channel, JSON.parse(JSON.stringify(payload)));
                } catch (E) { }
            }
        }
    }

    /**
     * Remove old events from the publish stream (at least 2sec old)
     */
    function _dropOldEvents() {
        if (!_storage.__jstorage_meta.PubSub) {
            return;
        }

        var retire = +new Date() - 2000;

        for (var i = 0, len = _storage.__jstorage_meta.PubSub.length; i < len; i++) {
            if (_storage.__jstorage_meta.PubSub[i][0] <= retire) {
                // deleteCount is needed for IE6
                _storage.__jstorage_meta.PubSub.splice(i, _storage.__jstorage_meta.PubSub.length - i);
                break;
            }
        }

        if (!_storage.__jstorage_meta.PubSub.length) {
            delete _storage.__jstorage_meta.PubSub;
        }

    }

    /**
     * Publish payload to a channel
     *
     * @param {String} channel Channel name
     * @param {Mixed} payload Payload to send to the subscribers
     */
    function _publish(channel, payload) {
        if (!_storage.__jstorage_meta) {
            _storage.__jstorage_meta = {};
        }
        if (!_storage.__jstorage_meta.PubSub) {
            _storage.__jstorage_meta.PubSub = [];
        }

        _storage.__jstorage_meta.PubSub.unshift([+new Date(), channel, payload]);

        _save();
        _publishChange();
    }


    /**
     * JS Implementation of MurmurHash2
     *
     *  SOURCE: https://github.com/garycourt/murmurhash-js (MIT licensed)
     *
     * @author <a href='mailto:gary.court@gmail.com'>Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href='mailto:aappleby@gmail.com'>Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} str ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    function murmurhash2_32_gc(str, seed) {
        var
            l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
            k =
                ((str.charCodeAt(i) & 0xff)) |
                ((str.charCodeAt(++i) & 0xff) << 8) |
                ((str.charCodeAt(++i) & 0xff) << 16) |
                ((str.charCodeAt(++i) & 0xff) << 24);

            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
            k ^= k >>> 24;
            k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

            l -= 4;
            ++i;
        }

        switch (l) {
            case 3:
                h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
                /* falls through */
            case 2:
                h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
                /* falls through */
            case 1:
                h ^= (str.charCodeAt(i) & 0xff);
                h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        }

        h ^= h >>> 13;
        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        h ^= h >>> 15;

        return h >>> 0;
    }

    ////////////////////////// PUBLIC INTERFACE /////////////////////////

    $.jStorage = {
        /* Version number */
        version: JSTORAGE_VERSION,

        /**
         * Sets a key's value.
         *
         * @param {String} key Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @param {Object} [options] - possible options to use
         * @param {Number} [options.TTL] - optional TTL value, in milliseconds
         * @return {Mixed} the used value
         */
        set: function (key, value, options) {
            _checkKey(key);

            options = options || {};

            // undefined values are deleted automatically
            if (typeof value == 'undefined') {
                this.deleteKey(key);
                return value;
            }

            if (_XMLService.isXML(value)) {
                value = {
                    _is_xml: true,
                    xml: _XMLService.encode(value)
                };
            } else if (typeof value == 'function') {
                return undefined; // functions can't be saved!
            } else if (value && typeof value == 'object') {
                // clone the object before saving to _storage tree
                value = JSON.parse(JSON.stringify(value));
            }

            _storage[key] = value;

            _storage.__jstorage_meta.CRC32[key] = '2.' + murmurhash2_32_gc(JSON.stringify(value), 0x9747b28c);

            this.setTTL(key, options.TTL || 0); // also handles saving and _publishChange

            _fireObservers(key, 'updated');
            return value;
        },

        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @return {Mixed} the key value, default value or null
         */
        get: function (key, def) {
            _checkKey(key);
            if (key in _storage) {
                if (_storage[key] && typeof _storage[key] == 'object' && _storage[key]._is_xml) {
                    return _XMLService.decode(_storage[key].xml);
                } else {
                    return _storage[key];
                }
            }
            return typeof (def) == 'undefined' ? null : def;
        },

        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @return {Boolean} true if key existed or false if it didn't
         */
        deleteKey: function (key) {
            _checkKey(key);
            if (key in _storage) {
                delete _storage[key];
                // remove from TTL list
                if (typeof _storage.__jstorage_meta.TTL == 'object' &&
                    key in _storage.__jstorage_meta.TTL) {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                delete _storage.__jstorage_meta.CRC32[key];

                _save();
                _publishChange();
                _fireObservers(key, 'deleted');
                return true;
            }
            return false;
        },

        /**
         * Sets a TTL for a key, or remove it if ttl value is 0 or below
         *
         * @param {String} key - key to set the TTL for
         * @param {Number} ttl - TTL timeout in milliseconds
         * @return {Boolean} true if key existed or false if it didn't
         */
        setTTL: function (key, ttl) {
            var curtime = +new Date();
            _checkKey(key);
            ttl = Number(ttl) || 0;
            if (key in _storage) {

                if (!_storage.__jstorage_meta.TTL) {
                    _storage.__jstorage_meta.TTL = {};
                }

                // Set TTL value for the key
                if (ttl > 0) {
                    _storage.__jstorage_meta.TTL[key] = curtime + ttl;
                } else {
                    delete _storage.__jstorage_meta.TTL[key];
                }

                _save();

                _handleTTL();

                _publishChange();
                return true;
            }
            return false;
        },

        /**
         * Gets remaining TTL (in milliseconds) for a key or 0 when no TTL has been set
         *
         * @param {String} key Key to check
         * @return {Number} Remaining TTL in milliseconds
         */
        getTTL: function (key) {
            var curtime = +new Date(),
                ttl;
            _checkKey(key);
            if (key in _storage && _storage.__jstorage_meta.TTL && _storage.__jstorage_meta.TTL[key]) {
                ttl = _storage.__jstorage_meta.TTL[key] - curtime;
                return ttl || 0;
            }
            return 0;
        },

        /**
         * Deletes everything in cache.
         *
         * @return {Boolean} Always true
         */
        flush: function () {
            _storage = {
                __jstorage_meta: {
                    CRC32: {}
                }
            };
            _save();
            _publishChange();
            _fireObservers(null, 'flushed');
            return true;
        },

        /**
         * Returns a read-only copy of _storage
         *
         * @return {Object} Read-only copy of _storage
         */
        storageObj: function () {
            function F() { }
            F.prototype = _storage;
            return new F();
        },

        /**
         * Returns an index of all used keys as an array
         * ['key1', 'key2',..'keyN']
         *
         * @return {Array} Used keys
         */
        index: function () {
            var index = [],
                i;
            for (i in _storage) {
                if (_storage.hasOwnProperty(i) && i != '__jstorage_meta') {
                    index.push(i);
                }
            }
            return index;
        },

        /**
         * How much space in bytes does the storage take?
         *
         * @return {Number} Storage size in chars (not the same as in bytes,
         *                  since some chars may take several bytes)
         */
        storageSize: function () {
            return _storage_size;
        },

        /**
         * Which backend is currently in use?
         *
         * @return {String} Backend name
         */
        currentBackend: function () {
            return _backend;
        },

        /**
         * Test if storage is available
         *
         * @return {Boolean} True if storage can be used
         */
        storageAvailable: function () {
            return !!_backend;
        },

        /**
         * Register change listeners
         *
         * @param {String} key Key name
         * @param {Function} callback Function to run when the key changes
         */
        listenKeyChange: function (key, callback) {
            _checkKey(key);
            if (!_observers[key]) {
                _observers[key] = [];
            }
            _observers[key].push(callback);
        },

        /**
         * Remove change listeners
         *
         * @param {String} key Key name to unregister listeners against
         * @param {Function} [callback] If set, unregister the callback, if not - unregister all
         */
        stopListening: function (key, callback) {
            _checkKey(key);

            if (!_observers[key]) {
                return;
            }

            if (!callback) {
                delete _observers[key];
                return;
            }

            for (var i = _observers[key].length - 1; i >= 0; i--) {
                if (_observers[key][i] == callback) {
                    _observers[key].splice(i, 1);
                }
            }
        },

        /**
         * Subscribe to a Publish/Subscribe event stream
         *
         * @param {String} channel Channel name
         * @param {Function} callback Function to run when the something is published to the channel
         */
        subscribe: function (channel, callback) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }
            if (!_pubsub_observers[channel]) {
                _pubsub_observers[channel] = [];
            }
            _pubsub_observers[channel].push(callback);
        },

        /**
         * Publish data to an event stream
         *
         * @param {String} channel Channel name
         * @param {Mixed} payload Payload to deliver
         */
        publish: function (channel, payload) {
            channel = (channel || '').toString();
            if (!channel) {
                throw new TypeError('Channel not defined');
            }

            _publish(channel, payload);
        },

        /**
         * Reloads the data from browser storage
         */
        reInit: function () {
            _reloadData();
        },

        /**
         * Removes reference from global objects and saves it as jStorage
         *
         * @param {Boolean} option if needed to save object as simple 'jStorage' in windows context
         */
        noConflict: function (saveInGlobal) {
            delete window.$.jStorage;

            if (saveInGlobal) {
                window.jStorage = this;
            }

            return this;
        }
    };

    // Initialize jStorage
    _init();

})();
!function (o) { o.fn.viewportChecker = function (e) { var t = { classToAdd: "visible", classToRemove: "invisible", classToAddForFullView: "full-visible", removeClassAfterAnimation: !1, offset: 100, repeat: !1, invertBottomOffset: !0, callbackFunctionBeforeAddClass: function (o) { }, callbackFunction: function (o, e) { }, scrollHorizontal: !1, scrollBox: window }; o.extend(t, e); var a = this, s = { height: o(t.scrollBox).height(), width: o(t.scrollBox).width() }, l = -1 != navigator.userAgent.toLowerCase().indexOf("webkit") || -1 != navigator.userAgent.toLowerCase().indexOf("windows phone") ? "body" : "html"; return this.checkElements = function () { var e, i; t.scrollHorizontal ? (e = o(l).scrollLeft(), i = e + s.width) : (e = o(l).scrollTop(), i = e + s.height), a.each(function () { var a = o(this), l = {}, n = {}; if (a.data("vp-add-class") && (n.classToAdd = a.data("vp-add-class")), a.data("vp-remove-class") && (n.classToRemove = a.data("vp-remove-class")), a.data("vp-add-class-full-view") && (n.classToAddForFullView = a.data("vp-add-class-full-view")), a.data("vp-keep-add-class") && (n.removeClassAfterAnimation = a.data("vp-remove-after-animation")), a.data("vp-offset") && (n.offset = a.data("vp-offset")), a.data("vp-repeat") && (n.repeat = a.data("vp-repeat")), a.data("vp-scrollHorizontal") && (n.scrollHorizontal = a.data("vp-scrollHorizontal")), a.data("vp-invertBottomOffset") && (n.scrollHorizontal = a.data("vp-invertBottomOffset")), o.extend(l, t), o.extend(l, n), !a.data("vp-animated") || l.repeat) { String(l.offset).indexOf("%") > 0 && (l.offset = parseInt(l.offset) / 100 * s.height); var d = l.scrollHorizontal ? a.offset().left : a.offset().top, r = l.scrollHorizontal ? d + a.width() : d + a.height(), c = Math.round(d) + l.offset, f = l.scrollHorizontal ? c + a.width() : c + a.height(); l.invertBottomOffset && (f -= 2 * l.offset), i > c && f > e ? (l.callbackFunctionBeforeAddClass(a), a.removeClass(l.classToRemove), a.addClass(l.classToAdd), l.callbackFunction(a, "add"), i >= r && d >= e ? a.addClass(l.classToAddForFullView) : a.removeClass(l.classToAddForFullView), a.data("vp-animated", !0), l.removeClassAfterAnimation && a.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () { a.removeClass(l.classToAdd) })) : a.hasClass(l.classToAdd) && l.repeat && (a.removeClass(l.classToAdd + " " + l.classToAddForFullView), l.callbackFunction(a, "remove"), a.data("vp-animated", !1)) } }) }, ("ontouchstart" in window || "onmsgesturechange" in window) && o(document).bind("touchmove MSPointerMove pointermove", this.checkElements), o(t.scrollBox).bind("load scroll", this.checkElements), o(window).resize(function (e) { s = { height: o(t.scrollBox).height(), width: o(t.scrollBox).width() }, a.checkElements() }), this.checkElements(), this } }(jQuery);


(function ($) {

    $.fn.jalert = function (options) {

        //holds parent element, all alert html will be appended to this.
        var self = this;

        // setup options
        var defaultOptions = {
            type: 'success',
            useTitles: false
        };

        var tmpl = '<div class="alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span><%= msg %></span></div>';

        var $alert = $('<div class="alert alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span></span></div>'); //holds reference to actual alert object, this is checked if it already exists since the alert dismissal will actually remove the alert.



        var settings = $.extend({}, defaultOptions, options);

        var titles = {
            success: 'Success!',
            error: 'Error!',
            info: 'Info!',
            warning: 'Warning!'
        }


        var setHtml = function (_html) {
            $alert.find('> span').html(_html);
            //now append alert to this wrapper.
            //console.log('self', self);
            //console.log('$alert', $alert);
            //if(self.length)
            self.append($alert);
            //self.find('> span').html(_html);
        };

        var setType = function (_type) {
            //fix for previous versions of template...used to be 'error' class, now 'danger', so just replace error with danger so i can still call 'jalert.error()'
            var type = (_type == 'error') ? 'danger' : _type;

            $alert.addClass('alert-' + type);
            //self.removeClass('alert-danger');

            //self.addClass('alert alert-' + type);
            //self.find('strong').html(titles[_type]);
        };

        this.error = function (_html) {
            setHtml(_html);
            setType('error');
            return self;
        };

        this.success = function (_html) {
            setHtml(_html);
            setType('success');
            return self;
        };

        this.info = function (_html) {
            setHtml(_html);
            setType('info');
            return self;
        };

        this.warning = function (_html) {
            setHtml(_html);
            setType('warning');
            return self;
        };

        this.hide = function (speed) {
            self.slideUp(speed);
            return self;
        }

        this.show = function () {

            self.css('display', 'none');
            self.removeClass('hide fade');
            self.slideDown();
            //self.addClass('in').removeClass('hide');
            return self;
        }

        this.autohide = function (_delay) {
            setTimeout(function () {
                self.slideUp();
            }, (_delay) ? _delay : 5000);
        }

        // PUBLIC functions



        //return jquery object
        return this;
    }
})(jQuery);



(function ($) {

    $.fn.loader = function (options) {



        var el = this;

        // setup options
        var defaultOptions = {
            location: 'in',
            img: '<img src="https://s3.amazonaws.com/mg2.paywall.dev/img/ajax-loading.gif" style="margin: 0 5px" />',
            loaderId: 'loader'
        };

        var settings = $.extend({}, defaultOptions, options);

        var img = $(settings.img).prop('id', settings.loaderId);

        var text;
        var $this;
        this.on = function () {
            try {

                if (el.children('span').length) {
                    $this = el.children('span');
                } else {
                    $this = el;
                }
                text = $this.html();
                $this.attr('data-mg2-submit', '');
                if (settings.location == 'in') {
                    //el.append(img);
                    $this.html(img);

                }
            } catch (e) {
                console.log(e);
            }
        }

        this.off = function () {
            try {
                $this.attr('data-mg2-submit', 'login');
                $this.html(text);
                img.remove();
            } catch (e) {

            }
            
        }

        // PUBLIC functions



        //return jquery object
        return this;



    }
})(jQuery);


var ConnextLogger = function ($) {

    //#region GLOBALS

    var isDebugging = true; //default logLevel is 'debug'

    //#endregion - Globals

    //we have this function so we can turn off debug calls based on the 'debug' setting.  We also add a preface to every call so our calls stand out on client sites.
    //We can't just take the 'logType' and then pass in all other arguments because if we do this we get an array of arguments split, so things don'y look right.
    //we loop through extra arguments and we create an array that we then output as a string so everyting looks pretty in the console.
    var log = function () {
        try {

            //gets arguments in array so we can use 'shift'

            var args = Array.prototype.slice.call(arguments[2]);
            var logType = arguments[0];

            var strPreface = arguments[1];
            //get number of arguments
            var argsLen = args.length;

            var arrStrs = []; //holds array of strings
            var arrObjs = []; //holds array of objects
            //var strOutput = ""; //holds a string output up until an object is detected.

            //we need to loop through the arguments and add each string until we hit an object.
            //once we hit an object we exit loop and create a string of from str array + the object.
            if (argsLen > 0) {
                $.each(args, function (k, v) {
                    if (typeof v == "string") {
                        arrStrs.push(v);
                    } else {
                        arrObjs.push(v);
                    }
                });
            }

            var strOutput = strPreface + arrStrs.join(" => ");
            
            if (arrObjs.length > 0) {
                
                console[logType](strOutput, arrObjs);
            } else {
                console[logType](strOutput);
            }

        } catch (e) {
            //console.log('Connext.Logger.Exception =>', e);
        }

    }

    return {
        debug: function () {
            var args = arguments;
            //only call log if we are debugging
            if (isDebugging) {
                log("log", "Connext >>>> DEBUG <<<<< ", args);
                
            }
        },
        log: function () {
            log("log", "Connext >>>> LOG <<<<< ", arguments);
        },
        info: function () {
            log("info", "Connext >>>> INFO <<<<< ", arguments);
        },
        warn: function () {
            log("warn", "Connext >>>> WARN <<<<< ", arguments);
        },
        error: function () {
            //TODO: For some reason FireBug is outputing the console.log() function along with passed in string, not sure why. It's no big deal since actual error is still shown first, but should look into a fix.
            log("exception", "MG2Connext >>>> ERROR <<<<< ", arguments);
        },
        exception: function () {
            //TODO: For some reason FireBug is outputing the console.log() function along with passed in string, not sure why. It's no big deal since actual error is still shown first, but should look into a fix.
            log("error", "MG2Connext >>>> EXCEPTION <<<<< ", arguments);
        },
        setDebug: function (_isDebugging) {
            isDebugging = _isDebugging;
        }
    };

}//(jQuery);

var ConnextCommon = function () {
    //Holds common objects, enums and lookups.
    return {
        S3RootUrl: {
            dev: 'https://mg2assetsdev.blob.core.windows.net/connext/dev/',
            test: 'https://mg2assetsdev.blob.core.windows.net/connext/test/',
            demo: 'https://mg2assetsdev.blob.core.windows.net/connext/demo/',
            stage: 'https://prodmg2.blob.core.windows.net/connext/stage/',
            test20: 'https://prodmg2.blob.core.windows.net/connext/test20/',
            prod: 'https://prodmg2.blob.core.windows.net/connext/prod/'
        },
        S3LastPublishDatePath: 'data/last_publish/<%= siteCode %>.json',
        CSSPluginUrl: {
            localhost: 'http://localhost:20001/plugin/assets/css/themes/',
            dev: 'https://mg2assetsdev.blob.core.windows.net/connext/dev/1.3/themes/',
            test: 'https://mg2assetsdev.blob.core.windows.net/connext/test/1.3/themes/',
            stage: 'https://mg2assetsdev.blob.core.windows.net/connext/stage/1.3/themes/',
            stage: 'https://mg2assetsdev.blob.core.windows.net/connext/test20/1.6/themes/',
            demo: 'https://mg2assetsdev.blob.core.windows.net/connext/demo/1.3/themes/',
            prod: 'https://cdn.mg2connext.com/prod/1.3/themes/'
        },
        APIUrl: {
            localhost: 'http://localhost:34550/',
            dev: 'https://dev-connext-api.azurewebsites.net/',
            test: 'https://test-connext-api.azurewebsites.net/',
            stage: 'https://stage-connext-api.azurewebsites.net/',
            test20: 'https://test20-connext-api.azurewebsites.net/',
            demo: 'https://demo-connext-api.azurewebsites.net/',
            prod: 'https://api.mg2connext.com/'
        },
        Environments: ['localhost', 'dev', 'test', 'stage', 'demo', 'prod', 'test20'],
        IPInfo: window.location.protocol + '//freegeoip.net/json/',
        StorageKeys: {
            configuration: 'Connext_Configuration',
            userToken: 'Connext_UserToken',
            janrainUserProfile: 'janrainCaptureProfileData',
            accessToken: 'Connext_AccessToken',
            viewedArticles: 'Connext_ViewedArticles', //holds array of viewed articles.
            lastPublishDate: 'Connext_LastPublishDate',
            conversations: { //these storage keys will hold an array conversations (1 for each MeterLevel). 
                current: 'Connext_CurrentConversations', //array of current conversations (1 for each MeterLevel)
                previous: 'Connext_PreviousConversations' //array of previous conversations (1 for each MeterLevel)...not really used, but requested in case the client would want to look up data on previous conversations.
            },
            user: {
                state: 'Connext_UserState',
                zipCodes: 'Connext_UserZipCodes'

            },
            configurationSiteCode: 'Connext_Configuration_SiteCode',
            configurationConfigCode: 'Connext_Configuration_ConfigCode',
            configurationIsCustom: 'Connext_Configuration_isCustom',
            customZip: 'CustomZip',
            repeatablesInConv: 'repeatablesInConv',
            igmRegID: 'igmRegID',
            igmContent: 'igmContent'
        },
        MeterLevels: {
            1: 'Free',
            2: 'Metered',
            3: 'Premium'
        },
        ConversationOptionMap: { //this maps conversation options to this parent name...this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            2: 'Time',
            6: 'Register',
            11: 'CustomAction',
            27: 'UserState',

        },
        ActionOptionMap: { //this maps action option values to this parent name...this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            Who: [11, 12, 5, 6, 14, 16, 17, 18, 19, 21, 23], //ActionOption classes for WHO
            What: [2, 7, 13, 20, 15, 22], //ActionOption classes for WHO
            When: [8,9,10] //ActionOption classes for WHEN
        },
        WhenClassMap: { //this maps the when options based on ClassId....this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            8: 'Time',
            9: 'EOS',
            10: 'Hover'
        },
        DefaultArticleFormat: "MMM Do, YYYY", //holds default Article format if one is not set in DB.
        QualifierMap: { //holds map to qualifiers, action options have different qualifiers (my bad design, so this is the simplest solution until the DB is updated with a single qualifier for each type)
            "==": "==", //map == to == so we don't need an 'if' statment, we just do a simple object lookup.
            "=": "==",
            "Equal": "==",
            "Equals": "==",
            "Not Equals": "!=",
            "More Then": ">",
            "Less Then": ">",
            "More Or Equal Then": ">=",
            "Less Or Equal Then": "<="
        },
        ERROR: {
            NO_CONFIG: {
                code: 600,
                message: "No Configuration Found"
            },
            NO_CONVO_FOUND: {
                code: 601,
                message: "No Conversation found to process."
            }
            
        }
    }
};

var ConnextEvents = function ($) {

    //#region GLOBALS

    var NAME = "Events";

    var OPTIONS;

    //local reference to Connext.Logger
    var LOGGER;
    //not sure if there is a better way to do this, but this holds refernces to functions we should fire on certain events. (since the passed in 'event' on 'fire' is just a string we can't check if that string is a function.
    //NOTE: DEFAULT_FUNCTIONS are only fired when debug=true, since these are mainly used for Logging or updating the Debug Details panel. (This check is handled in the 'fire' function, so we don't need to check this again within any of the default functions).
    var DEFAULT_FUNCTIONS = { 
        "onMeterLevelSet": onMeterLevelSet,
        "onDynamicMeterFound":onDynamicMeterFound,
        "onCampaignFound": onCampaignFound,
        "onConversationDetermined": onConversationDetermined,
        "onHasAccessToken": onHasAccessToken,
        "onHasAccess": onHasAccess,
        "onCriticalError": onCriticalError,
        "onHasUserToken": onHasUserToken,
        "onUserTokenSuccess": onUserTokenSuccess,
        "onAuthorized": onAuthorized,
        "onNotAuthorized": onNotAuthorized,
        "onDebugNote": onDebugNote,
        "onActionShown": onActionShown,
        "onFlittzPaywallShown": onFlittzPaywallShown,
        "onActionClosed": onActionClosed,
        "onFlittzButtonClick": onFlittzButtonClick,
        "onInit": onInit,
        "onButtonClick": onButtonClick
    };

    var NOTES = []; //(only used in debugging) - Holds array of messages from Events fired from the plugin. This array is displayed in the 'Notes' section of the Debug Details. It let's a user know major events and their results without having to dig through the console. Array is parsed using NOTES.join('<BR />') so they are displayed on separate lines within the Notes section (easier and faster than using UL and add LI's).

    //#endregion - Globals

    //#region INIT Functions

    var init = function () {
        /// <summary>Instantite the plugin.</summary>
        /// <param>Nothing</param>
        /// <returns>Nothing</returns>
        var fnName = "Init";
        try {
            LOGGER.debug(NAME, fnName, "Initializing Events...");

        } catch (e) {
            console.error(NAME, fnName, e);
        }

    };
    //#endregion INIT Functions

    //#region PLUGIN EVENTS (These are functions that will be fired on certain events, regardless if the client sets a callback for them (mainly we use these functions to update debugging details based on certain events).

    function onDebugNote(note) {
        /// <summary>This just adds to the NOTES array to show in the debug detail panel</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onCriticalError";
        try {
            //LOGGER.debug('Fire Default onCriticalError function.', e);
            if (Connext.GetOptions().debug) {
                NOTES.push(note);
                $("#ddNote").html(note);
            }
            
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onInit(e) {
        var fnName = "onInit";
        try {
            LOGGER.debug("Fire Default onInit function.", e);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onFlittzPaywallShown(e) {
        var fnName = "onFlittzPaywallShown";
        try {
            if (OPTIONS.integrateFlittz) {
                e.EventData.conversation = Connext.Storage.GetCurrentConverstaion();
                e.EventData.viewCount = Connext.Campaign.GetCurrentConversationViewCount();
                e.EventData.hasFlittz = OPTIONS.integrateFlittz;
                window.Flittz.PushData("Connext-onFlittzPaywallShown", e);
            }
            LOGGER.debug("Flittz paywall shown", e);
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onFlittzButtonClick(e) {
        var fnName = "onFlittzButtonClick";
        try {
            if (OPTIONS.integrateFlittz) {
                e.EventData.conversation = Connext.Storage.GetCurrentConverstaion();
                e.EventData.viewCount = Connext.Campaign.GetCurrentConversationViewCount();
                e.EventData.hasFlittz = OPTIONS.integrateFlittz;
                window.Flittz.PushData("Connext-onFlittzButtonClick", e);
            }
            LOGGER.debug("Click on Flittz button", e);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onCriticalError(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onCriticalError";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onCriticalError function.", e);
                NOTES.push(e.EventData.message);
                $("#ddNote").html(e.EventData.message);
            }
            
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }
    function onDynamicMeterFound(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onDynamicMeterFound";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onDynamicMeterFound function.", e);
                $("#ddMeterSet").html(e.EventData);
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }
    function onMeterLevelSet(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onMeterLevelSet";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onMeterLevelSet function.", e);
                e.EventData.levelName = Connext.Common.MeterLevels[e.EventData.level];
                $("#ddMeterLevel").html(e.EventData.levelName + " (" + e.EventData.method + ")");
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }
    
    function onHasAccessToken(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onHasAccessToken";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onHasAccessToken function.", e);
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(Connext.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onHasAccess(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onHasAccess";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onHasAccess function.", e);
                onDebugNote(e);
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onHasUserToken(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onHasUserToken";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onHasUserToken function.", e);
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(Connext.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }
    
    function onUserTokenSuccess(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onUserTokenSuccess";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onUserTokenSuccess function.", e);
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(Connext.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onAuthorized(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onAuthorized";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onAuthorized function.", e);
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(Connext.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onNotAuthorized(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onNotAuthorized";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onNotAuthorized function.", e);
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(Connext.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onCampaignFound(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onCampaignFound";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onCampaignFound function.", e);
                $("#ddCampaign").html(e.EventData.Name);
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onConversationDetermined(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onConversationDetermined";
        try {
            if (Connext.GetOptions().debug) {
                LOGGER.debug("Fire Default onConversationDetermined function.", e);
                $("#ddCurrentConversation").html(e.EventData.Name);
                var views = Connext.Campaign.GetCurrentConversationViewCount();
                $("#ddCurrentConversationArticleViews").html(views);
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    function onActionShown(e) {
        
        var fnName = "onActionShown";
        try {
            LOGGER.debug("Fire Default onActionShown", e);
            if (e.EventData.actionDom.hasClass("flittz"))
            {
                Connext.Event.fire("onFlittzPaywallShown", e);
            }
            Connext.Action.actionStartTime = Date.now();

        } catch (exc) {
            console.error(NAME, fnName, "EXCEPTION", exc);
        }
    }

    function onActionClosed(e) {
        
        var fnName = "onActionClosed";
        try {
            LOGGER.debug("Fire Default onActionClosed", e);
            if (Connext.GetOptions().debug) {
                Connext.Action.actionEndTime = Date.now();
                var difference = Connext.Action.actionEndTime - Connext.Action.actionStartTime;
                $("#ddViewTime")[0].textContent = difference + "ms";
            }
        } catch (exc) {
            console.error(NAME, fnName, "EXCEPTION", exc);
        }
    }

    function onButtonClick(e) {
        var fnName = "onButtonClick";
        try {
            LOGGER.debug("Fire Default onButtonClick", e);
        } catch (exc) {
            console.error(NAME, fnName, "EXCEPTION", exc);
        }
    }
    
    //#endregion PLUGIN EVENTS

    return {
        //main function to initiate the module
        init: function (options) {
            LOGGER = Connext.Logger; //assign local reference to Connext.Logger
            OPTIONS = (options) ? options : {debug: true}; //if not options set to object that at least has the debug property set to true.
            init();
            //return this;
        },
        fire: function (event, data) {
            var fnName = "fire";
            try {
                //add common data
                var eventResult = {
                    EventData: data
                };

                var currentConversation = Connext.Storage.GetCurrentConverstaion();
                    
                if(currentConversation) {
                    eventResult.Conversation = currentConversation;
                    eventResult.Compaing = currentConversation.Name;
                    eventResult.CampaignId = currentConversation.CampaignId;
                    eventResult.MeterLevel = Connext.Common.MeterLevels[currentConversation.MeterLevelId];
                    eventResult.MeterLevelId = currentConversation.MeterLevelId;
                }

                eventResult.Config = Connext.Storage.GetLocalConfiguration();

                if (_.isFunction(DEFAULT_FUNCTIONS[event])) {
                    //invoke default event function
                    DEFAULT_FUNCTIONS[event](eventResult);

                    if (_.isFunction(OPTIONS[event])) {
                        //invoke custom event function
                        OPTIONS[event](eventResult);
                    }

                    //send native custom event (this uses in wordpress)
                    var customEvent = new CustomEvent(event, { detail: eventResult });
                    document.dispatchEvent(customEvent);
                } else {
                    LOGGER.debug(NAME, fnName, "Event function does not exist");
                }

            } catch (e) {
                console.error(NAME, "on", "EXCEPTION", e);
            }
        }
    };

};

var ConnextUtils = function ($) {

    //region GLOBALS

    var NAME = "Utils"; //base name for logging.

    //create local reference to logger
    var LOGGER;
    var curSite;


    //endregion GLOBALS

    //region FUNCTIONS

    var processConfiguration = function (data) {
        /// <summary>This process a configuration into a friendlier JSON object by grouping conversations by meter level and grouping optionv values by class</summary>
        /// <param name="data" type="Object">Configuration object from API</param>
        /// <returns type="Object">Processed Configuration object</returns>
        var fnName = "processConfiguration";
        try {
            LOGGER.debug(NAME, fnName, "starting to process...");
            curSite = data.Site;
            //create parent config object we will populate.
            var configuration = {};

            //create settings property with only relevant  keys
            configuration["Settings"] = _.pick(data, "AccessRules", "Active", "Code", "DefaultMeterLevel", "CampaignId", "DynamicMeterId", "Name", "LastPublishDate", "Settings");
            Connext.Event.fire("onDynamicMeterFound", data.DynamicMeter.Name);
            //check if we have a LastPublishDate;
            configuration.Settings = checkForLastPublishDate(configuration.Settings);
            configuration.Settings["LoginModal"] = data.Template ? data.Template.Html : "";
            //set 'Site' specific settings, no need to process, just assign entire Site object.
            configuration["Site"] = data.Site;

            //process the campaign data (group/organize all conversations and conversation actions).
            configuration["Campaign"] = processCampaignData(data.Campaign);
            //we don't need to process this object, except to make sure the rules are ordered correctly.
            data.DynamicMeter.Rules = _.sortBy(data.DynamicMeter.Rules, function (obj) {
                return obj.Priority;
            });
            configuration["DynamicMeter"] = processDynamicMeter(data.DynamicMeter);

            LOGGER.debug(NAME, fnName, "done processing configuration", configuration);

            return configuration;
        } catch (e) {
            console.log(NAME, fnName, "EXCEPTION", e);
        }
    };

    var checkForLastPublishDate = function (configurationSettings) {
        /// <summary>This checks if we have a LastPublishDate setting. This should always be set (when a new configuration is saved in the Admin this should be populated with the current datetime), but just in case we check it here. If it is null, we set this to today's date. We do this because this field is required when we check if a configuration is old.</summary>
        /// <param name="configurationSettings" type="Object">configuration.Settings object</param>
        /// <returns type="Object">Returns modified or same configuration.Settings</returns>
        var fnName = "checkForLastPublishDate";
        try {
            //LOGGER.debug(pName, fnName);
            if (!configurationSettings.LastPublishDate) {
                LOGGER.warn(NAME, fnName, "Configuration.Settings.LastPublishDate is null...setting it to todays datetime.");
                configurationSettings.LastPublishDate = new Date().format();
            }

            return configurationSettings;
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return configurationSettings; //even if error, return original configurationSettings no matter what.
        }
    };

    var processCampaignData = function (campaign) {
        /// <summary>Takes the Campaign property from a Configuration and processes it.  This will group coversations by MeterLevel, process Action array and add/set any Conversation properties that are determined here.</summary>
        /// <param name="campaign" type="Object">Campaign object</param>
        /// <returns type="Object">Processed Campaign object</returns>
        var fnName = "processCampaignData";
        try {
            LOGGER.debug(NAME, fnName);

            //for now, at the Campaign level we are only picking the Name and id keys to return
            var processedCampaign = _.pick(campaign, "id", "Name", "Conversations");

            processedCampaign.Conversations = processConversationData(processedCampaign.Conversations);


            LOGGER.debug(NAME, fnName, "processedCampaign", processedCampaign);
            return processedCampaign;

        } catch (e) {
            console.log(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: this should get moved into the API, for time constraints just doing it here in js since its quicker.
    var processConversationData = function (conversations) {
        /// <summary>Takes the conversation object from Configuration.Campaign.Conversations and processes it.  This will group coversations by MeterLevel, process Action array and add/set any Conversation properties that are determined here.</summary>
        /// <param name="conversations" type="Object">Conversation object</param>
        /// <returns type="Object">Processed Conversation object</returns>
        var fnName = "processConversationData";
        try {
            LOGGER.debug(NAME, fnName, "conversations", conversations);

            //create new conversation object we will populate.
            var defaultConversationProps = {
                //views: 0, //current number of views
                paywallLimit: null, //paywall limit (set when we process this conversation actions)
                isExpired: false, //flags this conversation as expired so on next article view we know we need to move this user into another conversation (set below).
                expiredReason: null, //this will be set with the reason this conversation expired (Time, CustomActionName, Registration etc...).
                ////nextConversationId: null, //holds the nextConversation the user should be moved to.  This is populated on page load if it is a Time based expiration or on a 'Custom' action. If it is a custom action we will use this id on next article view.
                Date: { //holds date related info
                    started: null,
                    ended: null,
                    expiration: null //this will be set when the user first enters this conversation. It uses the expiration settings and adds the appropriate amount of time from the current date.
                }
            };

            //loop through conversations and process the conversation options by grouping and renaming properties.

            $.each(conversations, function (key, val) {
                //'val' is a single conversation object.  We use this to group val.options and fix naming conventions.

                LOGGER.debug(NAME, fnName, "conversations.EACH", key, val);

                var groupedOptions = _.groupBy(val.Options, function (obj) {
                    //console.log('obj', obj);
                    return obj.ConversationOption.ParentConversationOptionId;
                });

                var processedGroup = {};

                $.each(groupedOptions, function (key, val) {
                    console.info("GROUPEDOPTIONS.EACH", key, val);
                    var optionObj = {};

                    $.each(val, function (k, v) {
                        optionObj[v.ConversationOption.DisplayName] = v.Value;
                    });

                    processedGroup[Connext.Common.ConversationOptionMap[key]] = optionObj;


                });

                val.Options = { "Expirations": processedGroup };

                val.Props = defaultConversationProps;

                //Process the actions array 
                val.Actions = processConversationActions(val.Actions);

            });


            //group conversations by MeterLevelId
            var groupedConversationsByMeterLevel = _.groupBy(conversations, "MeterLevelId");

            //we grouped by 'MeterLevelId', replace these keys (which are integers) into their string equaliviants (from Connext.Common.MeterLevels).
            groupedConversationsByMeterLevel = _.replaceObjKeysByMap(groupedConversationsByMeterLevel, Connext.Common.MeterLevels);

            //LOGGER.warn(NAME, fnName, 'conversations', conversations);
            //LOGGER.warn(NAME, fnName, 'groupedConversationsByMeterLevel', groupedConversationsByMeterLevel);

            return groupedConversationsByMeterLevel;

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: this should get moved into the API, for time constraints just doing it here in js since its quicker.
    var processConversationActions = function (actions) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "processConversationActions";
        try {
            //LOGGER.debug(NAME, fnName, 'actions', actions);

            //loop through actions to process action option values and group them into 'Who' 'What' and 'When' properties
            $.each(actions, function (key, val) {
                //val is an Action object    
                
                var exceptions = curSite.Client ? curSite.Client.Client_ActionOption_Exceptions : [];
                $.each(exceptions,
                    function (key, value) {
                        val.ActionOptionValues = _.reject(val.ActionOptionValues,
                            function (a) {
                                return a.ActionOptionId == value.ActionOptionId ||
                                    a.ActionOption.ActionOptionParentId == value.ActionOptionId;
                            });
                    });
                var whoOptions = _.filter(val.ActionOptionValues, function (obj) {
                    //console.log('obj', obj, obj.ActionOption.Action_OptionClass.id);
                    return _.contains(Connext.Common.ActionOptionMap.Who, obj.ActionOption.ClassId);
                });

                var whatOptions = _.filter(val.ActionOptionValues, function (obj) {
                    //console.log('obj', obj, obj.ActionOption.Action_OptionClass.id);
                    return _.contains(Connext.Common.ActionOptionMap.What, obj.ActionOption.ClassId);
                });

                var whenOptions = _.filter(val.ActionOptionValues, function (obj) {
                    //console.log('obj', obj, obj.ActionOption.Action_OptionClass.id);
                    return _.contains(Connext.Common.ActionOptionMap.When, obj.ActionOption.ClassId);
                });

                //process who actions and assign returned object to val.Who property
                val.Who = processWhoOptions(whoOptions);

                //process what actions and assign returned object to val.What property
                val.What = processWhatOptions(whatOptions);

                //process what actions and assign returned object to val.What property
                val.When = processWhenOptions(whenOptions);

                //we are done processing optionValues, so remove this key since the data is no longer needed.
                //referencing actions by key since val is a local object, we want to effect parent actions key since that is what is returned.
                actions[key] = _.omit(val, "ActionOptionValues");

            });

            //actions have been processed so sort them by 'Order' property.
            return _.sortBy(actions, "Order");

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhoOptions = function (options) {
        /// <summary>Takes an array of 'WHO' action options and creates a more readable object for processing.</summary>
        /// <param name="options" type="Array">Array of who options for a given action.</param>
        /// <returns type="Object">Proccessed 'Who' object</returns>
        var fnName = "processWhoOptions";
        try {
            //LOGGER.debug(NAME, fnName, 'options', options);

            //group the options by ActionOption.ActionOptionParentId (will group related options like View options and Geo options etc...).
            var groupedOptions = _.groupBy(options, function (obj) {
                return obj.ActionOption.ActionOptionParentId;
            });

            //LOGGER.debug(NAME, fnName, 'groupedOptions', groupedOptions);

            var who = {};

            //loop through grouped Who options
            $.each(groupedOptions, function (key, val) {
                //key is the ActionOptionParentId, val is an array of these grouped options.
                //LOGGER.debug(NAME, fnName, 'groupedOptions.EACH', val);

                var parentOptionId = key;

                //if parentOptionId is 2 then we know these are 'View' options.  Since these options could have 2 groups (Article view >=1 AND view <=5) we need to group them and process them differently then other Who options.
                if (parentOptionId == 2) {

                    //group View options based on Action_OptionClass
                    var groupedViewOptions = _.groupBy(val, function (obj) {
                        return obj.ActionOption.ClassId;
                    });

                    //LOGGER.warn(NAME, fnName, 'groupedViewOptions.EACH', groupedViewOptions);

                    who.Views = [];

                    $.each(groupedViewOptions, function (key, val) {
                        //val is the array of view options. we know this array will have 2 objects, one for 'Qualifier' and one for 'Val' so we can just reference these object by index instead of doing another .each here.

                        //add view object to who.Views array.
                        var viewOptions = {}; //empty object to assign options to based on DisplayName and Value
                        viewOptions[val[0].ActionOption.DisplayName] = val[0].Value;
                        viewOptions[val[1].ActionOption.DisplayName] = val[1].Value;

                        who.Views.push(viewOptions);
                    });

                } else {
                    //not a view article option, so loop through all options in this group. Create a new object based on ClassOption name and assign child properties based on DisplayName and Value.

                    var optionObj = {}; //empty object to assign prop/val based on DisplayName and Value.

                    $.each(val, function (key, val) {
                        //LOGGER.debug(NAME, fnName, 'NON VIEW OPTIONS', 'key', key, 'val', val);
                        optionObj[val.ActionOption.DisplayName] = val.Value;
                    });

                    //set to the who object with the property being the OptionClass name (i.e JavascriptCriteria, GeoCriteria) so all grouped options live under the same property within 'who'
                    who[val[0].ActionOption.Action_OptionClass.Name] = optionObj;

                }



            });

            return who;

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhatOptions = function (options) {
        /// <summary>Takes an array of 'WHAT' action options and creates a more readable object for processing.</summary>
        /// <param name="options" type="Array">Array of what options for a given action.</param>
        /// <returns type="Object">Proccessed 'What' object</returns>
        var fnName = "processWhatOptions";
        try {
            //LOGGER.debug(NAME, fnName, 'options', options);
            var what = {}; //empty object to assign properties to based on options

            $.each(options, function (key, val) {
                //LOGGER.debug(NAME, fnName, '---WHAT OPTIONS -- ..... EACH', val);
                what[val.ActionOption.DisplayName] = val.Value;
            });

            return what;

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhenOptions = function (options) {
        /// <summary>Takes an array of 'WHEN' action options and creates a more readable object for processing.</summary>
        /// <param name="options" type="Array">Array of WHEN options for a given action.</param>
        /// <returns type="Object">Proccessed 'When' object</returns>
        var fnName = "processWhenOptions";
        try {
            //LOGGER.debug(NAME, fnName, 'options', options);

            var when = {}; //empty object to assign properties to based on options
            var whenOptions = {};
            $.each(options, function (key, val) {
                //LOGGER.debug(NAME, fnName, '---WHEN OPTIONS -- ..... EACH', val);
                //set whenOption property name based on this options Display name and assign it's value on the Value property.
                whenOptions[val.ActionOption.DisplayName] = val.Value;

            });
            //since these when 'options' are all the same 'type' we assign the when object with a property based on the WhenClassMap and the first object in the options array OptionClassId (not ideal, needs updated).
            when[Connext.Common.WhenClassMap[options[0].ActionOption.ClassId]] = whenOptions;
            return when;

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var processDynamicMeter = function (dynamicmeter) {
        /// <summary>Segments are already grouped, this is just taking segmentoptionvalues and creating a more user friendly json object.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "processDynamicMeter";
        try {
            LOGGER.debug(NAME, fnName, dynamicmeter);

            //loop through rules.
            $.each(dynamicmeter.Rules, function (key, val) {

                $.each(val.Segments, function (k, v) {
                    //loop through this rules segments....this is the main purpose of this function. We want to take each 'Segment' object and process the SegmentOptionValues array so we have a new clean property called 'options', while maintaining the other properties in this object (id, Name, etc...).

                    //this gets the class name for this segment. We use _.find because some properties might not have a ClassId property, so we grab the first one that is not null.
                    var className = _.find(v.SegmentOptionValues, function (obj) { return obj.SegmentOption.ClassId != null; }).SegmentOption.Segment_OptionClass.Name;
                    ////LOGGER.debug('classname', className);

                    var segmentOptions = {}; //empty object which we'll populate with key/val based on DisplayName and Value
                    var exceptions = curSite.Client ? curSite.Client.Client_SegmentOption_Exceptions : [];
                    var newSegmentOptionValues;
                    $.each(exceptions,
                        function (key, value) {
                            newSegmentOptionValues = _.reject(v.SegmentOptionValues,
                                function (a) {
                                    return a.SegmentOptionId == value.SegmentOptionId ||
                                        a.SegmentOption.SegmentOptionParentId == value.SegmentOptionId;
                                });
                            if (newSegmentOptionValues.length != v.SegmentOptionValues.length) {
                                val.Segments[k] = null;
                            }
                        });
                    if (val.Segments[k] != null) {
                        $.each(v.SegmentOptionValues,
                            function(key, val) {
                                //segmentObject[val.SegmentOption.Segment_OptionClass.Name][val.SegmentOption.DisplayName] = val.Value;
                                segmentOptions[val.SegmentOption.DisplayName] = val.Value;
                            });

                        //create/set new property called Options with newly processed options object
                        v.Options = segmentOptions;

                        //add 'SegmentType' property based on the 'className' we determined.  This will be used when calculating the meter level so we don't have to look into the Options object.
                        v.SegmentType = className;
                        //remove the SegmentOptionValues array (referencing 'val' object by key since 'v' is a local object, we want to effect parent segment key since that is what is returned)
                        val.Segments[k] = _.omit(v, "SegmentOptionValues");
                    }
                });
                val.Segments = _.filter(val.Segments, function (s) { return s != null });

            });

            return dynamicmeter;

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var mergeConfiguration = function (newConfig) {
        var fnName = "mergeConfiguration";
        try {
            LOGGER.debug(NAME, fnName, "newConfig", newConfig);

            //We don't really merge the 'configuration' object, we are actually going to replace the current configuration with the new configuration.  
            //This is because the 'configuration' object doesn't hold any user specific data that is stored for each user besides the conversations, but the configuration.Campaign.Conversations array just holds the data that we use to determine FUTURE conversations/actions.  
            //Any current conversations that are happening are stored in the 'conversations.current' local storage object. So this is what we need merge with the new configuration object.

            //save new configuration to local storage.
            Connext.Storage.SetLocalConfiguration(newConfig);

            ////var mergedConfig = $.extend(true, currentLocalConfig, newConfig);
            //////we extend the currentLocalConfig and the newConfig.



            //get the array of current conversations from local storage.
            var currentConversations = Connext.Storage.GetCurrentConversations();

            LOGGER.debug(NAME, fnName, "CurrentConversations", currentConversations);

            //create empty object to store the new conversations.  
            //we are doing this so we don't have to worry about removing a stored conversation if it no longer exists in the newConfig.Campaign.Conversations array. 
            var newCurrentConversations = {};

            //we now loop through the current (local) conversations and do 2 things A) Check if this conversation still exists in the new configuration, B) update/merge appropriate conversation data based on any changes in the new configuration, but still maintain current 'user related data'.
            $.each(currentConversations, function (key, val) {
                //'key' is the meterlevel name for this conversation (Free, Metered, Premium) and 'val' is the conversation object.
                LOGGER.debug(NAME, fnName, "currentConversations.EACH", key, val);

                //this searches the _Newconfig object to see if this conversation still exists. If it does we update this conversation in the _Newconfig object with stored user data (right now, just views).
                //var foundStoredConvo = _.findByKey(newConfig.Campaign.Conversations[MeterLevelsDict[key]], { id: val.id });

                //search the newConfig.Campaign.Conversations.METERLEVEL array on id and val.id. 
                var foundStoredConvo = _.findByKey(newConfig.Campaign.Conversations[key], { id: val.id });
                LOGGER.debug(NAME, fnName, "currentConversations.EACH", "foundStoredConvo", foundStoredConvo);

                if (foundStoredConvo) {
                    //this stored conversation still exists in the newConfigration.Campaign.Conversations array
                    //so we need to merge all properties from DB to this locally saved version, but keep the entire 'Props' property from the local conversation, since this holds user specific data (like Start/End Date, 'views' etc...) so we want to preserve those.; 

                    //setting newConversations object with the foundStoredConvo based on this MeterLevel (key).
                    //the below statement would equate to newCurrentConversations[Free] or newCurrentConversations[Metered] etc..
                    newCurrentConversations[key] = $.extend({}, foundStoredConvo); //using $.extend because this creates a new object and not a reference.;

                    //the newCurrentConversations[key] object has all the settings from the newConfig object, now we replace the 'Props' key which holds any user specific data that we need to preserve (views, Date.Start, Date.Expiration etc...).
                    console.log("val.Props", val.Props);
                    newCurrentConversations[key].Props = val.Props;
                }

            });

            //we now save the 'newCurrentConversations' Object to local storage.  Since we created a new 'current conversation' object and only added conversations from the 'newConfig' object to this new Object we automatically take care of the scenario that a user is in a conversation that is then deleted from the Admin.  
            //Since this conversation doesn't exist in the 'newConfig' object, we will not add it to the 'newConversation' object, therefore if this user was in a conversation that was deleted they will just move into a new conversation (as if this was there first time visiting, so first conversation in this campaign).
            Connext.Storage.SetCurrentConversations(newCurrentConversations);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var saveConfiguration = function () {
        var siteCode = $("#ConnextSiteCode").val();
        var configCode = $("#ConnextConfigCode").val();
        var isCustomConfiguration = $("#ConnextCustomConfiguration").prop("checked");

        if (isCustomConfiguration) {
            //remove all configuration
            Connext.Storage.ClearConfigSettings();

            Connext.Storage.SetSiteCode(siteCode);
            Connext.Storage.SetConfigCode(configCode);
            Connext.Storage.SetIsCustomConfiguration(isCustomConfiguration);
        }
    };

    var handleDebugDetails = function () {
        /// <summary>This sets up the Debug Details panel and any event listeners for the debug panel.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "handleDebugDetails";
        try {
            try {
                //creates and appends debug details html.
                var html = '<div class="debug_details opened" style="left: 0;"><div class="debug_details_icon">&nbsp;</div><div class="debug_details_content"><h4>Debug Details</h4><ul><li class="debug_details_header hide_on_mobile"><label>Meter Level: <strong id="ddMeterLevel">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Meter Set: <strong id="ddMeterSet">...</strong></label><label>Campaign: <strong id="ddCampaign">...</strong></label><label>Conversation: <strong id="ddCurrentConversation">...</strong></label><label>Article Views: <strong id="ddCurrentConversationArticleViews">...</strong></label><label>Articles Left: <strong id="ddCurrentConversationArticleLeft">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>View Time: <strong id="ddViewTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Current Zip: <strong id="ddZipCode">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Auth Time: <strong id="ddAuthTime">...</strong></label><label>Processing Time: <strong id="ddProcessingTime">...</strong></label><label>Total Time: <strong id="ddTotalProcessingTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Note: <strong id="ddNote">...</strong></label></li><li class="debug_details_header hide_on_mobile"><div id="ConnextCustomConfigurationDiv"><label for="ConnextSiteCode">Site code: </label><input type="text" id="ConnextSiteCode"><label for="ConnextConfigCode">Config code: </label><input type="text" id="ConnextConfigCode"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomConfiguration">Set configuration</a></div><label class="overlay_label check" for="ConnextCustomConfiguration">Use custom configuration: </label> <input type="checkbox" id="ConnextCustomConfiguration"><label class="overlay_label check" for="ConnextCustomConfiguration">Unique Articles Count: </label> <input type="checkbox" id="uniqueArticles"></li><li class="debug_details_header hide_on_mobile"><label for="ConnextCustomTimeChk" class="overlay_label check">Custom Time: </label> <input type="checkbox" id="ConnextCustomTimeChk"><div id="ConnextCustomTimeDiv"><input type="text" id="ConnextCustomTimeTxt" placeholder="MM/DD/YYYY" value="" name="name" class="text_input hint"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomTimeBtn">Set</a></div></li><li class="debug_details_header hide_on_mobile"><a href="#" class="more highlight margin_top_15" id="connextClearAllData">Clear All Data</a></li></ul></div></div>';
                $("body").append(html);
                if ($('#connext_debug_styles').length == 0) {
                    $('head').append(
                        '<link id="connext_debug_styles" rel="stylesheet" type="text/css" href="https://mg2assetsdev.blob.core.windows.net/connext/assets/connext-debug-panels.min.css" />');
                }

                $("#ConnextSetCustomConfiguration").on("click", saveConfiguration);

                //handles when a user clicks the hide/show icon.
                $(".debug_details_icon").on("click", handleDebugDetailsDisplayClick);

                //registers 'clearAllData' button click event.
                $("#connextClearAllData").on("click", clearAllSettings);

                //handle custom time section (call this before we setup event listeners for the time checkbox so we set initial values correctly.
                handleCustomTime();
                handleCustomConfiguration();

                if (Connext.Storage.GetUserZipCodes()) {
                    $("#ddZipCode").html(Connext.Storage.GetUserZipCodes().toString());
                } else {
                    $("#ddZipCode").html($.jStorage.get("CustomZip"));
                }
                if ($.jStorage.get("uniqueArticles")) {
                    $("#uniqueArticles").attr("checked", "checked");
                }

                $("#ConnextCustomConfiguration").on("change", function () {
                    var $this = $(this);
                    if ($this.prop("checked")) {
                        $("#ConnextCustomConfigurationDiv").show();
                    }
                    else {
                        $("#ConnextCustomConfigurationDiv").hide();
                        Connext.Storage.SetIsCustomConfiguration(false);
                    }
                });

                //event listener when checkbox is clicked.
                $("#ConnextCustomTimeChk").on("change", function () {
                    var $this = $(this);
                    if ($this.prop("checked")) {
                        $("#ConnextCustomTimeDiv").show();
                        //set custom time
                    } else {
                        //remove custom time.
                        $("#ConnextCustomTimeDiv").hide();
                        $.jStorage.deleteKey("CustomTime");
                    }
                });

                $("#uniqueArticles").on("change", function () {
                    console.log("uniqueArticles - change");
                    var $this = $(this);
                    $.jStorage.set("uniqueArticles", $this.prop("checked"));
                });

                //event listener when 'Set' button is clicked.
                $("#ConnextSetCustomTimeBtn").on("click", function (e) {
                    e.preventDefault();
                    $.jStorage.set("CustomTime", $("#ConnextCustomTimeTxt").val());
                    // Connext.Storage.SetLocalConfiguration('');
                });

            } catch (err) {
                console.error(NAME, fnName, "CreateDebugDetailPanel");
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion FUNCTIONS

    //#region EVENT LISTENERS


    //#endregion EVENT LISTENERS


    //#region HELPERS

    var handleDebugDetailsDisplayClick = function (e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "handleDebugDetailsDisplayClick";
        try {
            e.preventDefault();
            //get debug details div
            var $panel = $(this).parent("div");
            $panel.toggleClass("opened");
            //console.log($panel);


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var clearAllSettings = function (e) {
        /// <summary>This is mainly used when debugging so we can clear all local storage and cookies in between test.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "clearAllSettings";
        try {
            e.preventDefault();
            LOGGER.debug(NAME, fnName, "clearAllSettings");
            Connext.Storage.ClearConfigSettings();
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var handleCustomConfiguration = function () {
        if (Connext.Storage.GetIsCustomConfiguration()) {
            $("#ConnextCustomConfigurationDiv").show();
        }
        else {
            $("#ConnextCustomConfigurationDiv").hide();
        }
    }

    var handleCustomTime = function () {
        /// <summary>This handles initial custom time settings. Any changes are handled in event listeners set in the above handleDebugDetails function.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "handleCustomTime";
        try {
            //LOGGER.debug(NAME, fnName);

            if ($.jStorage.get("CustomTime")) {
                $("#ConnextCustomTimeChk").prop("checked", true);
                $("#ConnextCustomTimeTxt").val($.jStorage.get("CustomTime"));
                $("#ConnextCustomTimeDiv").show();
            } else {
                $("#ConnextCustomTimeChk").prop("checked", false);
                $("#ConnextCustomTimeDiv").hide();
                $("#ConnextCustomTimeTxt").val(new Date());
            }


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var nextLetter = function (s) {
        return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
            var c = a.charCodeAt(0);
            switch (c) {
                case 90: return "A";
                case 122: return "a";
                default: return String.fromCharCode(++c);
            }
        });
    }

    //#endregion HELPERS



    return {
        init: function () {
            LOGGER = Connext.Logger;
            String.prototype.replaceAt = function (index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
        },
        Now: function () {
            //this returns the current date/time based on either the current real datetime or a datetime set in the debug panel.
            try {
                if ($.jStorage.get("CustomTime")) {
                    return new Date(Date.parse($.jStorage.get("CustomTime")));
                } else {
                    //no custom time set, so return the current moment object.                  
                    return new Date();
                }
            } catch (e) {
                console.error(NAME, "Now", e);
            }
        },
        ProcessConfiguration: function (data) { //typically Utils is reserverd for functions that can be used throughout the App, but we have ProcessConfiguration here because it requires alot of other functions and its cleaner to have that all in here instead of in the main 'Connext.Core' file.
            return processConfiguration(data);
        },
        MergeConfiguration: function (newConfig) {
            mergeConfiguration(newConfig);
        },
        CreateDebugDetailPanel: function () {
            handleDebugDetails();
        },
        AddParameterToURL: function (_url, param) {
            _url += (_url.split("?")[1] ? "&" : "?") + param;
            return _url;
        },
        GetUrlParam: function (paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        ParseCustomDate: function (input, format) {
            format = format || "dd.mm.yyyy"; // some default format'
            if (!input) return new Date();
            var parts = input.match(/(\d+)/g),
                i = 0,
                fmt = {};
            // extract date-part indexes from the format
            format.replace(/(yyyy|dd|mm)/g, function (part) { fmt[part] = i++; });
            return new Date(parts[fmt["yyyy"]], parts[fmt["mm"]] - 1, parts[fmt["dd"]]);
        },
        ParseCustomDates: function (input) {
            var output = input.replace(/(\d+)([a-zA-Z,()\\";?]+)/, "$1 ");
            output = Date.parse(output);
            return new Date(output);
        },
        Diff: function (currDate, articleDate) {
            var diff = +currDate - +articleDate;
            diff = parseInt(diff / 86400000);
            return diff;
        },
        GetUrl: function () {
            return location.protocol + "//" + location.host + location.pathname;
        },
        GetHiddenFormFieldValue: function (selector) { //we take any jquery selector, so it can be a class, id, data atrribute etc...
            try {
                var hidValue = $("#" + selector).val();
                LOGGER.debug(NAME, "GetHiddenFormFieldValue", "hidValue", hidValue);
                return hidValue;//$(selector).val();
            } catch (e) {
                console.error(NAME, "GetHiddenFormFieldValue", e);
                return ""; //we return empty string on error so any checks that call this function can still be evaluated.
            }
        },
        /* GetUserZipcode: function () {
             var fnName = 'Utils.GetUserZipcode';
             //needs to use _CB callback instead of a return so we wait for zip code to be figured out.
             try {
                 //create deferred object
                 var deferred = $.Deferred();
 
                 //we check if we have a saved zipcode, if we do we just return that, otherwise we determine zip by geolocation.
                 if ($.jStorage.get('CustomZip')) {
                     LOGGER.debug(NAME, fnName, 'CustomZip');
                     deferred.resolve($.jStorage.get('CustomZip'))
                     //_CB($.jStorage.get('CustomZip'));
                     //return moment($.jStorage.get('CustomTime'), 'MM/DD/YYYY HH:mm');
                 } else {
                     setTimeout(function () {
                         LOGGER.debug(NAME, fnName, 'DONE SIMULATING GETTING ZIPCODE');
                         //_CB(19123);
                         deferred.resolve(19454);
                     }, 0);
 
                     
                     geolocator.locateByIP(function (location) {
                         getZipFromLocation(location, function (_ZipCode) {
                             _CB(_ZipCode);
                         });
                     }, function (error) {
                         Logger.error(fnName, 'Error getting location by IP', error);
                         _CB(false);
                     }, 0);
                     
                 }
             } catch (e) {
                 LOGGER.exception(NAME, fnName, e);
             }
             //return deferred promise
             return deferred.promise();
         },*/
        JSEvaluate: function (value1, qualifier, value2) { //this calls JS 'eval' to test a javascript condition. We take 2 values and a qualifier and return the result.
            try {
                var label = (arguments[3]) ? arguments[3] + " ---- " : ""; //set label to what we are evaluating (the label is the 4th argument passed in, if one is not passed in we set this to an empty string.  We do this here so we don't need to hanldle debugging tests for each type of evaluation.
                var type = (arguments[4]) ? arguments[4] : "string"; //5th argument is the type of values (for view counts we can't wrap them in a single quote...we default to string, unless passed in).
                var fixedqualifier = Connext.Utils.FixQualifier(qualifier);

                var evalString = (type == "string") ? "'" + value1 + "'" + fixedqualifier + "'" + value2 + "'" : "" + value1 + "" + fixedqualifier + "" + value2 + "";
                //LOGGER.debug(NAME, 'JSEvaluate', 'evalString', evalString);
                if (eval(evalString)) {
                    LOGGER.debug(NAME, "JSEvalute --- <<<<< " + evalString, " >>>>> ---- PASSES");
                    return true;
                } else {
                    LOGGER.debug(NAME, label + "JSEvalute --- <<<<< " + evalString, " >>>>> ---- FAILS");
                    return false;
                }
            } catch (e) {
                console.error(NAME, "JSEvaluate", e);
                return false;//if there is an error we return false since we don't know the true determination of this evaluation.
            }

        },
        AddReturnUrlParamToLink: function (link) {
            //add clearUserState parameter to clear user state from cash to get fresh user state after redirect back
            var resultLink = link;
            if (link.indexOf('returnUrl=') == -1) {
                var returnUrl = Connext.Utils.AddParameterToURL(window.location.href.split('?')[0], 'clearUserState=true');
                resultLink = Connext.Utils.AddParameterToURL(link, 'returnUrl=' + returnUrl);
            }
            return resultLink;
        },
        GetNextLetter: function (a) {
            return nextLetter(a);
        },
        FixQualifier: function (qualifier) {
            try {
                //LOGGER.debug(NAME, fnName);
                var fixedQualifier = Connext.Common.QualifierMap[qualifier];
                if (fixedQualifier) {
                    return fixedQualifier;
                } else {
                    return qualifier; //we don't have a fix for this qualifier, so just return the original.
                }

            } catch (e) {
                console.error(NAME, null, "EXCEPTION", e);
                return qualifier; //if we fail, return original qualifier.
            }
        },
        getFileName: function () {
            //gets file name including extension.  If an argument is passed in then we use that otherwise we use the current location.href
            var url = (arguments[0]) ? arguments[0] : window.location.href;
            return url.substring(url.lastIndexOf("/") + 1);
        },
        getCurPageName: function () {
            return location.pathname.substring(1);
        },
        getParam: function (paramName) {
            //returns value of param if it exists, if not we return null.
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        hasParam: function (paramName) {
            //just return true/false depending if we have that param (does not return value).
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&"), test;

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    test = unescape(val[1]);
                    return (test.length > 0 && typeof test == "string") ? true : false;
                }
            }
            return false;
        },
        GetUserZipcode: function () {

            var fnName = "Utils.GetUserZipcode";

            LOGGER.debug(NAME, fnName, "CustomZip");

            //return deferred promise
            return $.jStorage.get("CustomZip");
        },
        EncryptAccessToken: function () {
            //TODO: Right now this isn't really encrypting anything. It is just returning a random string, but we set it up with a masterId argument so when we do implement this, we don't need to change any functions that are calling this.
            var len = 64;
            var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var randomString = "";
            for (var i = 0; i < len; i++) {
                var randomPoz = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPoz, randomPoz + 1);
            }
            return randomString;
        },
        getScreenSize: function () {

            var screenWidth = $(window).width();
            //var screenHeight = $(window).height();

            if (window.screen) {
                screenWidth = window.screen.width;
                //screenHeight = window.screen.height;
            }

            //return Math.min(screenWidth, screenHeight);

            return screenWidth;
        },
        getDeviceType: function () {
            var device,
                find,
                userAgent;

            device = {};

            // The client user agent string.
            // Lowercase, so we can use the more efficient indexOf(), instead of Regex
            userAgent = window.navigator.userAgent.toLowerCase();

            // Main functions
            // --------------

            device.ios = function () {
                return device.iphone() || device.ipod() || device.ipad();
            };

            device.iphone = function () {
                return !device.windows() && find("iphone");
            };

            device.ipod = function () {
                return find("ipod");
            };

            device.ipad = function () {
                return find("ipad");
            };

            device.android = function () {
                return !device.windows() && find("android");
            };

            device.androidPhone = function () {
                return device.android() && find("mobile");
            };

            device.androidTablet = function () {
                return device.android() && !find("mobile");
            };

            device.blackberry = function () {
                return find("blackberry") || find("bb10") || find("rim");
            };

            device.blackberryPhone = function () {
                return device.blackberry() && !find("tablet");
            };

            device.blackberryTablet = function () {
                return device.blackberry() && find("tablet");
            };

            device.windows = function () {
                return find("windows");
            };

            device.windowsPhone = function () {
                return device.windows() && find("phone");
            };

            device.windowsTablet = function () {
                return device.windows() && (find("touch") && !device.windowsPhone());
            };

            device.fxos = function () {
                return (find("(mobile;") || find("(tablet;")) && find("; rv:");
            };

            device.fxosPhone = function () {
                return device.fxos() && find("mobile");
            };

            device.fxosTablet = function () {
                return device.fxos() && find("tablet");
            };

            device.meego = function () {
                return find("meego");
            };

            device.cordova = function () {
                return window.cordova && location.protocol === "file:";
            };

            device.nodeWebkit = function () {
                return typeof window.process === "object";
            };

            device.mobile = function () {
                return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
            };

            device.tablet = function () {
                return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
            };

            device.desktop = function () {
                return !device.tablet() && !device.mobile();
            };


            // Simple UA string search
            find = function (needle) {
                return userAgent.indexOf(needle) !== -1;
            };

            if (device.mobile()) {
                return "Mobile";
            } else if (device.tablet()) {
                return "Tablet";
            } else if (device.desktop()) {
                return "Desktop";
            }
        },
        DetectEnvironment: function () {
            var environment = "prod";

            if (~location.hostname.indexOf("localhost")) { 
                environment = "localhost";
            } else if (~location.hostname.indexOf("dev.")) {
                environment = "dev";
            } else if (~location.hostname.indexOf("test.")) {
                environment = "test";
            } else if (~location.hostname.indexOf("test20.")) {
                environment = "test20";
            } else if (~location.hostname.indexOf("demo.")) {
                environment = "demo";
            } else if (~location.hostname.indexOf("stage.")) {
                environment = "stage";
            } else if (~location.hostname.indexOf("preprod.")) {
                environment = "preprod";
            }

            return environment;
        },
        GetViewedArticlesCookiesName: function (conversationId) {
            // depend on sitecode, environment, configcode, conversationId
            var config = Connext.Storage.GetLocalConfiguration();

            return Connext.Common.StorageKeys.viewedArticles
                + "_site=" + config.Site.SiteCode
                + "_environment=" + Connext.Utils.DetectEnvironment()
                + "_config=" + config.Settings.Code
                + "_conversation=" + conversationId;
        },
        AddParameterToURL: function (_url, param) {
            _url += (_url.split("?")[1] ? "&" : "?") + param;
            return _url;
        },
        getUrlParam: function (urlParam) {

            var paramValue = "";
            var url = document.location.search.substr(1);
            var paramArray = url.split("&");
            paramArray.every(function (elem) {
                var arr = elem.split("=");
                if (arr[0] == urlParam) {
                    paramValue = arr[1];
                    return false;
                }
                else {
                    return true;
                }
            });
            return paramValue;
        },
        getSubdomains: function () {

            var array = document.location.origin.split(".");
            //remove domain name .com
            array.pop();
            //domain 
            array.pop();

            if (array.length) {
                var str = array[0].substring(array[0].lastIndexOf("/") + 1);
                if (str === "www") {
                    array.shift();
                }
                else {
                    array[0] = str;
                }
            }

            return array;
        },
        getMetaTagsWithKeywords: function () {

            return $("meta[name=keywords]");
        },
        detectAdBlock: function () {
            var adBlockEnabled = false;
            var testAd = document.getElementById("TestAdBlock");

            if (testAd.offsetHeight === 0) {
                adBlockEnabled = true;
            }

            return adBlockEnabled;
        },
        getQueryParamByName: function (name, url) {
            if (!url) {
                url = window.location.href;
            }

            name = name.replace(/[\[\]]/g, "\\$&");

            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);

            if (!results) {
                return null;
            }

            if (!results[2]) {
                return "";
            }

            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
    };

};

var ConnextStorage = function ($) {

    //#region GLOBALS

    var name = "STORAGE";

    //create local reference to Connext.Logger
    var logger;

    //#endregion GLOBALS

    //#region LOCAL STORAGE FUNCTIONS

    var getLocalStorage = function (key) {
        // <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getLocalStorage";
        try {
            logger.debug(name, fnName);
            return $.jStorage.get(Connext.Common.StorageKeys[key]);
        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };

    var setLocalStorage = function (key, val) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "setLocalStorage";
        try {
            logger.debug(name, fnName);
            return $.jStorage.set(Connext.Common.StorageKeys[key], val);
        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };
    var getCookie = function (key) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getCookie";
        try {
            logger.debug(name, fnName, key, "Connext.Common.StorageKeys[key] || key", Connext.Common.StorageKeys[key] || key);
            return Cookies.get(Connext.Common.StorageKeys[key] || key);
        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };
    var storageRegistry = [];

    // ask local storage every second 
    var listenStorageChange = function (storageName, callback) {
        storageRegistry[storageName] = localStorage.getItem(storageName);
        setInterval(function () {
            if (localStorage.getItem(storageName) != storageRegistry[storageName]) {
                // update registry so we dont get triggered again
                storageRegistry[storageName] = localStorage.getItem(storageName);
                return callback();
            }
        },
            1000);
    }

    var addListners = function () {
        listenStorageChange("janrainCaptureToken",
          function () {
              Connext.Storage.SetUserState(null);
              Connext.Storage.SetUserZipCodes(null);
              Connext.Run();
          });
        //listenCookieChange('igmRegID',
        //function () {
        //    Connext.Storage.SetUserState(null);
        //    Connext.Storage.SetUserZipCodes(null);
        //    Connext.Run();
        //});

    };

    var setCookie = function (key, data, expiration, useRootDomain) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "setCookie";
        try {
            logger.debug(name, fnName);
            var domains = window.location.host.split('.');
            var curdomain = window.location.host;
            if (curdomain.indexOf('localhost') > -1) {
                curdomain = 'localhost';
            }

            if (useRootDomain && domains.length >= 2) {
                curdomain = '.' + domains[domains.length - 2] + '.' + domains[domains.length - 1];
            }
            if (expiration) {
                //will be an expiration. 
                logger.debug(name, fnName, 'HasExpiration', 'key', key, 'expiration', expiration);
                return Cookies.set(Connext.Common.StorageKeys[key] || key, data, { expires: expiration, domain: curdomain });
            } else {
                //this is a session cookie.
                return Cookies.set(Connext.Common.StorageKeys[key] || key, data, { domain: curdomain });
            }
        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };

    var removeCookie = function (key) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "removeCookie";
        try {
            logger.debug(name, fnName);

            var domains = window.location.host.split(".");
            var curdomain = window.location.host;
            if (domains.length >= 2) {
                curdomain = "." + domains[domains.length - 2] + "." + domains[domains.length - 1];
            }
            //we don't have a 3rd argument, so don't use one (this means this is a session cookie).
            return Cookies.set(Connext.Common.StorageKeys[key] || key, 'null', { domain: curdomain, expires: -1 });

        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };
    //#endregion LOCAL STORAGE FUNCTIONS

    return {
        init: function () {
            logger = Connext.Logger; //assign local reference to Connext.Logger
            logger.debug(name, "Init");
            addListners();
        },
        GetLocalConfiguration: function () {
            return getLocalStorage("configuration");
        },
        SetLocalConfiguration: function (data) {
            return setLocalStorage("configuration", data);
        },
        GetUserState: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.user.state);
        },
        SetUserState: function (state) {
            return $.jStorage.set(Connext.Common.StorageKeys.user.state, state);
        },
        GetUserZipCodes: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.user.zipCodes);
        },
        SetUserZipCodes: function (codes) {
            return $.jStorage.set(Connext.Common.StorageKeys.user.zipCodes, codes);
        },
        GetLastPublishDate: function () {
            return getCookie("lastPublishDate");
        },
        SetLastPublishDate: function (data, expired) {
            return setCookie("lastPublishDate", data, expired);
        },
        GetCurrentConversations: function () {
            var currentConvos = $.jStorage.get(Connext.Common.StorageKeys.conversations.current);
            console.log("GetCurrentConversations", currentConvos);
            return (currentConvos) ? currentConvos : {}; //if we don't have any stored conversation object then return an empty one so we don't get an error trying to set properties.
        },
        SetCurrentConversations: function (curConvos) {
            //sets CurrentConversations array (will be set after we merge exisitng 
            return $.jStorage.set(Connext.Common.StorageKeys.conversations.current, curConvos);
        },
        GetCampaignData: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.configuration).Campaign;
        },
        GetViewedArticles: function (conversationId) {
            var fnName = "GetViewedArticles";

            try {
                var cookiesName = Connext.Utils.GetViewedArticlesCookiesName(conversationId);

                console.log("GetViewedArticles!!!!!", "--- cookiesName: " + cookiesName, Cookies.get(cookiesName));
                var articles = Cookies.get(cookiesName);
                if (articles) {
                    articles = JSON.parse(articles);
                } else {
                    articles = [];
                }
                
                return articles;
            } catch (ex) {
                console.error(name, fnName, "EXCEPTION", ex);
                return [];
            }
        },
        SetViewedArticles: function (articles, conversationId) {
            var cookiesName = Connext.Utils.GetViewedArticlesCookiesName(conversationId);

            console.log("SetViewedArticles!!!!!", "--- cookiesName: " + cookiesName, articles);

            //todo make this big date as a standard constant for infinite cookies
            setCookie(cookiesName, articles, new Date('31 Dec 9999 23:59:59 GMT'));
        },
        SetAccountDataExpirationCookie: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 1);
            return Cookies.set('Connext_AccountDataExpirationCookie', value, { expires: expire });
        },
        GetAccountDataExpirationCookie: function () {
            return Cookies.get("Connext_AccountDataExpirationCookie");
        },
        UpdateViewedArticles: function (conversationId) {
            console.log("UpdateViewedArticles", conversationId);
            //this is in this function because we don't care which configuration/conversation we are in. We hold viewed articles as a separate object and this is just updating that array with the current url.
            var viewedArticles = Connext.Storage.GetViewedArticles(conversationId),
                articleUrl = Connext.Utils.GetUrl(),
                options = Connext.GetOptions(),
                articleHash;

            if (options.articlesCounter && options.articlesCounter.params && options.articlesCounter.params.length) {
                var params = options.articlesCounter.params,
                    domain = location.hostname,
                    indicatorOfTheArticle = domain + "_";
                
                params.forEach(function (param) {
                    var paramValue = Connext.Utils.getQueryParamByName(param);

                    if (paramValue) {
                        indicatorOfTheArticle += (param + "=" + paramValue);
                    }
                });

                articleHash = MD5(indicatorOfTheArticle);
                viewedArticles.push(articleHash);
            } else {
                articleHash = MD5(articleUrl);
                viewedArticles.push(articleHash);
            }

            Connext.Storage.SetViewedArticles(viewedArticles, conversationId);
        },

        GetRepeatablesInConv: function (actionId) {
            if (!$.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv)) {
                $.jStorage.set(Connext.Common.StorageKeys.repeatablesInConv, {});
            }

            var obj = $.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv);
            if (!$.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv)[actionId]) {
                obj[actionId] = 0;
                $.jStorage.set(Connext.Common.StorageKeys.repeatablesInConv, obj);
            }
            return $.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv)[actionId];


        },
        UpdateRepeatablesInConv: function (actionId) {
            if (!$.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv)) {
                $.jStorage.set(Connext.Common.StorageKeys.repeatablesInConv, {});
            }
            var obj = $.jStorage.get(Connext.Common.StorageKeys.repeatablesInConv);
            obj[actionId] = obj[actionId] + 1;
            $.jStorage.set(Connext.Common.StorageKeys.repeatablesInConv, obj);
        },

        ClearConfigSettings: function () {
            try {
                Connext.Storage.SetViewedArticles([], Connext.Storage.GetCurrentConverstaion().id);
            }
            catch (e) { }

            $.jStorage.deleteKey(Connext.Common.StorageKeys.conversations.current);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.conversations.previous);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.viewedArticles);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.configuration);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.configurationSiteCode);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.configurationConfigCode);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.configurationIsCustom);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.user.state);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.user.zipCodes);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.customZip);
            $.jStorage.deleteKey(Connext.Common.StorageKeys.repeatablesInConv);

            Connext.Storage.ClearAllCookies();
        },
        ClearAllCookies: function () {
            var cookies = document.cookie.split(";");

            cookies.forEach(function (cookie) {
                document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        },
        ClearUser: function () {
            //this clears all user related  cookies
            Cookies.remove(Connext.Common.StorageKeys.userToken);
            Cookies.remove(Connext.Common.StorageKeys.accessToken);
            Cookies.remove("userToken");
            Cookies.remove("userMasterId");
            localStorage.removeItem("janrainCaptureProfileData");
            localStorage.removeItem("janrainCaptureReturnExperienceData");
            $.jStorage.deleteKey(Connext.Common.StorageKeys.user.zipCodes);
            removeCookie(Connext.Common.StorageKeys.igmRegID);
            removeCookie(Connext.Common.StorageKeys.igmContent);
        },
        SetAccessToken: function (token) {
            //TODO: Use some sort of encryption to encrypte access token and then use that to decode.
            return setCookie("accessToken", token); //set AccessToken with an expiration of 1 day.
        },
        GetAccessToken: function () {
            //TODO: Use some sort of encryption to encrypte access token and then use that to decode.
            logger.debug(name, "GetAccessToken", Connext.Common.StorageKeys.accessToken);
            return getCookie("accessToken");
        },
        GetCurrentConverstaion: function () {
            return $.jStorage.get("CurrentConversation");
        },
        SetCurrentConverstaion: function (e) {
            $.jStorage.set("CurrentConversation", e);
        },
        SetUserToken: function (token) {
            return setCookie("userToken", token, 365); //set AccessToken with an expiration of 1 day.
        },
        GetUserToken: function () {
            return getCookie("userToken");
        },
        GetigmRegID: function () {
            return Cookies.get("igmRegID");
        },
        SetIgmContent: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie("igmContent", value, expire, true);
        },
        SetigmRegID: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie('igmRegID', value, expire, true);
        },
        GetIgmContent: function (value) {
            return getCookie("igmContent");
        },
        SetUserRegId: function (token) {
            return setCookie("userMasterId", token, 365); //set AccessToken with an expiration of 1 day.
        },
        GetUserRegId: function () {
            return getCookie("userMasterId");
        },
        GetJanrainUser: function () {
            return localStorage.getItem(Connext.Common.StorageKeys.janrainUserProfile);
        },
        //to my mind need refactor this code & create single get/set that works with localStorage & another for work with cookie
        //like setLocalStorageItem (key, data) { setLocalStorage (key, data)}
        //this architecture has problems with scalability
        SetSiteCode: function (data) {
            $.jStorage.set(Connext.Common.StorageKeys.configurationSiteCode, data);
        },
        GetSiteCode: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.configurationSiteCode);
        },
        SetConfigCode: function (data) {
            $.jStorage.set(Connext.Common.StorageKeys.configurationConfigCode, data);
        },
        GetConfigCode: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.configurationConfigCode);
        },
        SetIsCustomConfiguration: function (data) {
            $.jStorage.set(Connext.Common.StorageKeys.configurationIsCustom, data);
        },
        GetIsCustomConfiguration: function () {
            return $.jStorage.get(Connext.Common.StorageKeys.configurationIsCustom);
        }
    }
};

var ConnextAPI = function ($) {

    //#region GLOBALS

    var NAME = "API";

    //create local reference to Connext.LOGGER
    var LOGGER;

    var OPTIONS; //global Options variable. This will be merge/extended between default options and passed in options.

    var API_URL;
    var BASE_API_ROUTE = "api/";

    
    var ROUTES = { //this holds the routes for the different api calls.  We use this in the universal 'Get' method and use the 'args' parameters to set the full api URL.
        GetConfiguration: _.template("configuration/siteCode/<%= siteCode %>/configCode/<%= configCode %>"),
        GetUserByEmailAndPassword: _.template("user/email/<%= email %>/password/<%= password %>"),
        GetUserByMasterId: _.template("user/id/<%= id %>"),
        GetUserByToken: _.template("user/token/<%= token %>"),
        CheckAccess: _.template("checkAccess/<%= masterId %>"),
        GetUserByEncryptedMasterId: _.template("user/encryptedMasterId?encryptedMasterId=<%= encryptedMasterId %>")
    };
    

    //#endregion GLOBALS

    //region API CALLS

    var Get = function (args) {
        /// <summary>Universal call to API. Handles parsing returned data and calling provided callbacks.</summary>
        /// <param name="" type=""></param>
        /// <returns>Deferred $.ajax</returns>
        var fnName = "Get";
        try {

            //creates url based on the passed method option from routes object and then calls this function with the payload passed in (the routes object is an underscore template so the passed in payload will be parsed to create the correct url
            var url = API_URL + ROUTES[args.method](args.options.payload);
            LOGGER.debug(NAME, fnName, "calling...", url, "OPTIONS", OPTIONS);

            //return $.ajax object in case we want to use this as a deferred object. We still process any callbacks in the opts argument in case we don't use the $.deferred object.
            //TODO: THIS IS VERY IMPORTANT....
            //      Right now we are adding in the 'siteCode' as a header and on the API we are disabling the AuthenticationHandler filter to check if the SiteCode and API-Key match the ones in the API web.config.  
            //      We need to find a way to enable this Authentication when calling the API via Postman or 3rd party source, but not require the API-Key when calling from the Connext Plugin since we do not want to store Token values in JS.
            //      I would think we would need some sort of checking based on the source header and if that domain matches a list of domains/tokens.
            return $.ajax({
                //crossDomain: true,
                //contentType: "application/json; charset=utf-8",
                headers: { 'Site-Code': OPTIONS.siteCode, 'x-test': "test", 'Access-Control-Allow-Origin': "*", 'Environment': Connext.GetOptions().environment, 'settingsKey': Connext.GetOptions().settingsKey, 'attr': Connext.GetOptions().attr },
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data, "xhr", xhr);
                    try {

                        if (!data || xhr.status == 204) {
                            //empty results or returned a 204 'No Content', call onNull
                            if (_.isFunction(args.options.onNull)) {
                                args.options.onNull();
                            }
                        } else {
                            //we have a return object
                            if (_.isFunction(args.options.onSuccess)) {
                                args.options.onSuccess(data);
                            }
                        }
                    } catch (e) {
                        LOGGER.exception(fnName, e);
                    };
                },
                error: function (err) {
                    LOGGER.error(fnName, "Ajax.Error", err);
                    if (_.isFunction(args.options.onError)) {
                        args.options.onError(err); //for now just calling, since we probably don't need any data with this since it will be handled in either success or error callbacks above.
                    }
                },
                complete: function () {
                    if (_.isFunction(args.options.onComplete)) {
                        args.options.onComplete(); //for now just calling, since we probably don't need any data with this since it will be handled in either success or error callbacks above.
                    }
                }
            });
        } catch (e) {
            console.log(NAME, fnName, "EXCEPTION", e);
            if (_.isFunction(args.options.onError)) {
                args.options.onError(); //for now just calling, since we probably don't need any data with this since it will be handled in either success or error callbacks above.
            }
        }
    };

    //#endregion API CALLS
    
    return {
        init: function (options) {
            LOGGER = Connext.Logger; //assign local reference to Connext.LOGGER
            OPTIONS = options; //set global OPIONS variable (need this for siteCode and api setting (but passing in entire options object in case we need other things in the future).
            API_URL = OPTIONS.api + BASE_API_ROUTE; //set the API_URL (which is the api from options plus the BASE_API_ROUTE set here).
            //LOGGER.debug(NAME, "Init", "_Url", _Url);
            //ApiUrl = _Url + BaseRoute; //create full base api url based on base url from Core and BaseRoute.
        },
        GetConfiguration: function (opts) {
            return Get({ method: "GetConfiguration", options: opts });
        },
        GetUserByEmailAndPassword: function (opts) {
            return Get({ method: "GetUserByEmailAndPassword", options: opts });
        },
        CheckAccess: function (opts) {
            return Get({ method: "CheckAccess", options: opts });
        },
        GetUserByToken: function (opts) {
            return Get({ method: "GetUserByToken", options: opts });
        },
        GetUserByMasterId: function (opts) {
            return Get({ method: "GetUserByMasterId", options: opts });
        },
        GetUserByEncryptedMasterId: function (opts) {
            return Get({ method: "GetUserByEncryptedMasterId", options: opts });
        },
        GetLastPublishDateS3: function () {
            var fnName = "GetLastPublishDateS3";
            try {

                var JsonUrl = Connext.Common.S3RootUrl[OPTIONS.environment] + "data/last_publish/" + OPTIONS.siteCode + ".json?_=" + new Date().getTime();
                LOGGER.debug(NAME, fnName, "jsonURL", JsonUrl);

                //return $.ajax since it is a deferred object and we use that in the calling Connext.Core function.
                return $.ajax({
                    crossDomain: true,
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    url: JsonUrl,
                    success: function (data) {
                        LOGGER.debug(NAME, fnName, "success", data);
                        //console.log(pName, fnName, 'GetLastPublish.Sucess', $.parseJSON(data));

                        //var isConfigDataOld = isConfigDataOldByLastPublishDate($.parseJSON(data), _ConfigSettings);
                        //console.log(pName, fnName, 'GetLastPublish.Sucess', 'isConfigDataOld', isConfigDataOld);
                        //deferred.resolve(isConfigDataOld);
                    },
                    error: function (a, b, c) {
                        LOGGER.debug(NAME, fnName, "error", "a, b, c", a, b, c);
                        //console.error(pName, fnName, 'Error Getting Last Publish Date', a);
                        //there was an error so we should return the saved ConfigSettings.

                        //if (a.status == 403) {
                        //    deferred.reject("JSON file does not exist in AWS");
                        //} else {
                        //    deferred.reject("Error Getting last_published JSON file");
                        //}

                    }
                });
            } catch (e) {
                console.error(NAME, fnName, "<<EXCEPTION>>", e);
                //there was an error so we should return the saved ConfigSettings.
                //deferred.reject(e);
            }
        }
        /*
        ,
        GET: function (opts) {
            var fnName = 'GET';
            LOGGER.debug(NAME, fnName, 'opts', opts);
        },
        POST: function (opts) {
            LOGGER.debug(NAME, fnName, 'opts', opts);

        }*/
    }
};

var ConnextUser = function ($) {

    //#region GLOBALS

    var NAME = "User";

    //local reference to Connext.Logger
    var LOGGER;

    //global vars
    var OPTIONS; //holds options from Connext funciton.
    var AUTH_TYPE = {}; //will be set to auth type (MG2, Janrain or GUP)
    var IS_LOGGED_IN = false; //this is updated as user is logged in or out. It's public via User.IsLoggedIn (is used to determine which action to take when a user clicks a data-mg2-action=login element).
    var AUTH_TIMING = {};// this holds timeing tests for authentication. We set start/end times when we call 3rd party authentications to use in the 'Debug Details' panel.  This let's us show why/if we have long processing times (if they are caused by waiting on the authentication from a 3rd party).
    var FORM_SUBMIT_LOADER, FORM_ALERT; //references to the login loader and alert.
    var JANRAIN_LOADED; //var that is checked/updated when janrain is loaded.
    var USER_STATES = {
        NotLoggedIn: "Logged Out",
        LoggedIn: "Logged In",
        Subscribed: "Subscribed"
    };
    var GUP_SETTINGS;
    var USER_STATE = USER_STATES.NotLoggedIn;
    var TIMEOUT;

  
    var incorrectCreditsMessage = "Please try again or click on the Forgot/Reset Password link to update your password";

    var NOTIFICATION = { //this handles hiding and showing notifications (green/red/blue alert boxes).
        show: function (notification) {
            try {
                //TODO: for now just use passed in notification text, need to change to lookup of Notifications array after API is updated
                FORM_ALERT.info(notification).show();
            } catch (e) {

            }
        },
        hide: function () {
            try {
                FORM_ALERT.hide();
            } catch (e) {

            }
        },
        showAndHide: function (notification, delay) {
            try {
                FORM_ALERT.info(notification);
                TIMEOUT = setTimeout(function() {
                        FORM_ALERT.find(".alert").remove();
                    },
                    delay);
            } catch (e) {

            }
        }
    };

    var UI = { //this holds UI related jquery selectors. We set them here and reference them throughout the site, if we need to change them its one change.
        LoginButton: "[data-mg2-submit=login]:visible",
        LoginAlert: "[data-mg2-alert=login]:visible",
        JanrainLoginBtn :"[data-mg2-submit=janrainLogin]:visible",
        InputUsername: "[data-mg2-alert=login] [data-mg2-input=Email]",
        InputPassword: "[data-mg2-alert=login] [data-mg2-input=Password]",
        ActionShowLogin: "[data-mg2-action=login]",
        LogoutButton: "[data-mg2-action=logout]",
        SubscribeButton: '[data-mg2-action="submit"]',
        SubmitZipCode: '[data-mg2-action="Zipcode"]',
        LoginModal: '<div data-mg2-alert="login" data-template-id="23" data-display-type="modal" data-width="400" id="mg2-login-modal"  tabindex="-1" class="Mg2-connext modal fade in"><div class="modal-body picker-bg"><i class="fa fa-times closebtn" data-dismiss="modal" aria-label="Close" aria-hidden="true"></i><form><h1 class="x-editable-text text-center h3">LOGIN</h1><p class="x-editable-text text-center m-b-2" >to save access to articles or get newsletters, allerts or recomendations — all for free</p><label class="textColor4 x-editable-text" >E-mail</label><input type="email" data-mg2-input="Email" class="text" name="email" value=""   data-mg2-input="Email" /><label class="textColor4 x-editable-text">Password</label><input type="password" data-mg2-input="Password" class="text" name="password" value=""  data-mg2-input="Password" /><a href="" data-mg2-submit="login" class="input submit x-editable-text" title="Login">Login</a></form></div></div>',
        CheckAccessPopup: '<div class="Mg2-connext modal fade in" id="CheckAccessPopup" data-display-type="modal" data-width="300" tabindex="-1"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body">We noticed that your access status has changed. Page will be reloaded based on your new access permissions</div><div class="modal-footer text-center"><button type="button" id="ConnextRunBtn" class="btn btn-default" data-dismiss="modal">OK</button></div></div></div></div>'
    }

    //#endregion - Globals

    //#region INIT Functions

    var init = function () {
        /// <summary>Instantite the plugin.</summary>
        /// <param>Nothing</param>
        /// <returns>Nothing</returns>
        var fnName = "Init";
        try {
            LOGGER.debug(NAME, fnName, "Initializing User...");
            UI.LoginModal = OPTIONS.LoginModal;
            setAuthType();
            $("body").on("click", UI.LogoutButton, function (e) {
                e.preventDefault();
                var fnName = UI.LogoutButton + ".CLICK";
                LOGGER.debug(NAME, fnName);
                logoutUser();
            });
            $("body").on("click", '[data-dismiss="alert"]', function () {
                FORM_ALERT.find(".alert").remove();
                clearTimeout(TIMEOUT);
            });
            $("body").on("click", UI.SubscribeButton, function (e) {
                e.preventDefault();
                var fnName = UI.SubscribeButton + ".CLICK";
                LOGGER.debug(NAME, fnName);
                try {

                    var $this = $(this),
                        href = $this.attr("href"),
                        email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();

                    href = Connext.Utils.AddParameterToURL(href, "email=" + email);
                    $this.attr("href", href);
                    window.location.href = href;
                   
                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }
            });

            $("body").on("click", UI.SubmitZipCode, function (e) {
                e.preventDefault();
                var fnName = UI.SubmitZipCode + ".CLICK";
                LOGGER.debug(NAME, fnName);
                try {

                    var $this = $(this),
                        href = $this.attr("href"),
                        zip = $this.parents(".Mg2-connext").find('[data-mg2-input="Zipcode"]').val();

                    href = Connext.Utils.AddParameterToURL(href, "zipcode=" + zip);
                    $this.attr("href", href);
                    window.location.href = href;
                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }
            });

            $("body").on("click", ".Mg2-btn-forgot", function (e) {
                e.preventDefault();
                var fnName = "Forgot password btn" + ".CLICK";
                LOGGER.debug(NAME, fnName);
                try {

                    var $this = $(this),
                        href = $this.attr("href"),
                        email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();
                    href = Connext.Utils.AddParameterToURL(href, "returnUrl=" + window.location.href);
                    href = Connext.Utils.AddParameterToURL(href, "email=" + email);
                    $this.attr("href", href);
                    if ($this[0].hasAttribute("target")) {
                        window.open(href,"_blank");
                    } else {
                        window.location.href = href;
                    }
                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }
            });

            //Any element with a data-mg2-submit= 'login' will fire this event.  This will attempt to submit the form this button belongs to.
            $("body").on("click dblclick", UI.LoginButton, function (e) {
                e.preventDefault();
                var fnName = UI.LoginButton + ".CLICK";
                LOGGER.debug(NAME, fnName);

                try {

                    FORM_SUBMIT_LOADER = $(UI.LoginButton).loader();
                    FORM_ALERT = $(UI.LoginAlert).jalert();

                    //start loader animation for login button.
                    FORM_SUBMIT_LOADER.on();

                    if (AUTH_TYPE.MG2) {
                        var userName = $(UI.InputUsername + ":visible").val();
                        var Password = $(UI.InputPassword + ":visible").val();
                        //we use ':visible' because we could have multiple inputs with the same data-mg2-input values (dedicated modals, multiple actions with login forms etc...).  So we want to only grab the value of the one that is visible.
                        Mg2Authenticate(userName, Password);
                    } else {
                        JanrainAuthenticate($("[data-mg2-input=Username]:visible").val(), $("[data-mg2-input=Password]:visible").val());
                    }
                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }

            });


            $("body").on("click", UI.JanrainLoginBtn, function (e) {
                e.preventDefault();
                var fnName = UI.JanrainLoginBtn + ".CLICK";
                LOGGER.debug(NAME, fnName);

                try {
                    if(window.janrain){
                    var email = $("[data-mg2-input=Email]:visible").val(),
                        password = $("[data-mg2-input=Password]:visible").val();

                    janrain.capture.ui.modal.open();
                    $('#capture_signIn_traditionalSignIn_emailAddress').val(email);
                    $('#capture_signIn_traditionalSignIn_password').val(password);
                    $('#capture_signIn_traditionalSignIn_signInButton').click();

                    } else console.error("No janrain global object found...");


                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }

            });

            //Any element with a data-mg2-action= 'login' will fire this event.  This allows the client to set this data attribute to any element on their page and the appropriate login html will show based on the OPTIONS.Site.RegistrationTypeId.
            $("body").on("click", UI.ActionShowLogin, function (e) {
                e.preventDefault();
                var fnName = UI.ActionShowLogin + ".Click";
                try {
                    //LOGGER.debug(NAME, fnName);

                    LOGGER.debug(NAME, fnName, "IS_LOGGED_IN", IS_LOGGED_IN)

                    if (AUTH_TYPE.MG2) {
                        //this is MG2 Auth type, show MG2 Login Modal.
                        $(UI.LoginModal).addClass("in");
                        $(UI.LoginModal).attr("id", "mg2-login-modal");
                        $(UI.LoginModal).connextmodal({ backdrop: "true" });
                        $(UI.LoginModal).css("display", "block");
                        $("[data-display-type=modal]").resize();


                        ////FOR TESTING, auto add values.
                        //$(UI.InputUsername).val('rmsmola+2222@gmail.com');
                        //$(UI.InputPassword).val('testing123');

                    } else if (AUTH_TYPE.GUP) {
                        //this is a GUP AuthType, so show GUP popup modal
                        executePopupLoginFlow(window);
                    } else if (AUTH_TYPE.Janrain) {
                        if (window.janrain) {
                            janrain.capture.ui.modal.open();
                        } else console.error("No janrain global object found...");
                    }
                } catch (e) {
                    console.error(NAME, fnName, "Exception", e);
                }
            });

        } catch (e) {
            console.error(NAME, fnName, e);
        }

    };

    var setAuthType = function () {
        /// <summary>Sets AUTH_TYPE object.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "setAuthType";
        try {
            LOGGER.debug(NAME, fnName, "OPTIONS", OPTIONS);



            if (OPTIONS.Site.RegistrationTypeId == 1) {
                LOGGER.debug(NAME, fnName, "IsMG2Auth");
                AUTH_TYPE["MG2"] = true;
            } else if (OPTIONS.Site.RegistrationTypeId == 2) {
                LOGGER.debug(NAME, fnName, "IsJanrainAuth");
                AUTH_TYPE["Janrain"] = true;

                //////by default setting this here in case of janrain modal login. (the same function for Authentication is called regardless if user used connext form for janrain or native janrain form.
                FORM_SUBMIT_LOADER = $(UI.LoginButton).loader();
                FORM_ALERT = $(UI.LoginAlert).jalert();

            } else if (OPTIONS.Site.RegistrationTypeId == 3) {
                AUTH_TYPE["GUP"] = true;

            } else {
                throw "Unknown Registration Type";
            }
            registerEventlisteners();

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };


    //#endregion INIT Functions

    //#region ACCESS Functions

    var checkAccess = function () {
        /// <summary>This is a deferred function that is called in the main 'Connext' function.  So any return needs to be a 'resolve' for successful access or 'reject' for a failed access.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "checkAccess";

        var deferred = $.Deferred();
        USER_STATE = Connext.Storage.GetUserState();

        if (!Connext.Storage.GetAccountDataExpirationCookie()) {
            Connext.Storage.SetUserState(null);
            USER_STATE = null;
        }
        clearUserStateIfWasRedirect();

        if (Connext.Storage.GetigmRegID()) {
            if (USER_STATE == USER_STATES.NotLoggedIn && AUTH_TYPE.MG2) {
                USER_STATE = null;
            }
        } else {
            if (AUTH_TYPE.MG2) {
                USER_STATE = USER_STATES.NotLoggedIn;
                Connext.Storage.SetUserState(USER_STATE);
            }
        }
        if (USER_STATE != null && USER_STATE != undefined) {

            if (AUTH_TYPE.Janrain) {
                if (!window.localStorage.getItem("janrainCaptureToken")) {
                    USER_STATE = USER_STATES.NotLoggedIn;
                    Connext.Storage.SetUserState(USER_STATE);
                }
            }

            if (USER_STATE == USER_STATES.NotLoggedIn) {
                Connext.Event.fire("onNotAuthorized", USER_STATE);
                Connext.Storage.ClearUser();
                deferred.reject("onNotAuthorized");

            } else {
                $(UI.ActionShowLogin).hide();
                $(UI.LogoutButton).show();
                if (USER_STATE == USER_STATES.LoggedIn) {
                    Connext.Event.fire("onAuthorized", USER_STATE);
                    deferred.reject("onAuthorized");

                } else if (USER_STATE == USER_STATES.Subscribed) {
                    Connext.Event.fire("onHasAccess", USER_STATE);
                    deferred.reject("onHasAccess");

                }
            }
        }


        if (USER_STATE == null || USER_STATE == undefined || AUTH_TYPE.GUP) {
            try {
                console.log(NAME, fnName, "AUTH_TYPE", AUTH_TYPE);
                //this is called on page load to check if the user has access. Depending the the AUTH_TYPE we will use different methods to determing if this user currently has access.
                AUTH_TIMING.Start = new Date(); //set start time for determining access (used for Debug Details Panel)
                USER_STATE = USER_STATES.NotLoggedIn;
                Connext.Storage.SetUserState(USER_STATE);
                getUserData()
                    .done(function (result) {
                        LOGGER.debug(NAME, fnName, "getUserData.done -- result", result);
                        if (!result) {
                            throw "No User Data Result";
                        }
                        if (AUTH_TYPE.MG2) {
                            Connext.API.GetUserByEncryptedMasterId({
                                payload: { encryptedMasterId: result },
                                onSuccess: function (data) {
                                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                                    processSuccessfulLogin("MasterId", data);
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.resolve(true);
                                    $(UI.ActionShowLogin).hide();
                                    $(UI.LogoutButton).show();

                                },
                                onNull: function () {
                                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.reject("GetUserByMasterId.onNull");
                                    Connext.Event.fire("onNotAuthorized", USER_STATE);
                                },
                                onError: function (err) {
                                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.reject("GetUserMasterId.onError");
                                    Connext.Event.fire("onNotAuthorized", USER_STATE);
                                }
                            });
                        } else if (AUTH_TYPE.Janrain) {
                            Connext.API.GetUserByMasterId({
                                payload: { id: result },
                                onSuccess: function (data) {
                                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                                    processSuccessfulLogin("Token", data);
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.resolve(true);
                                },
                                onNull: function () {
                                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.reject("GetUserByToken.onNull");
                                },
                                onError: function (err) {
                                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                                    AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                    deferred.reject("GetUserByToken.onError");
                                }

                            });

                        } else if (AUTH_TYPE.GUP) {
                            //GUP Auth
                            var gupUserHasAccess = AuthenticateGupUser(result);
                            AUTH_TIMING.Done = new Date();
                            LOGGER.debug(NAME, fnName, "getUserData.done -- gupUserHasAccess", gupUserHasAccess);
                            deferred.resolve(true);
                            LOGGER.debug(NAME, fnName, "getUserData.done", "Has GUP Data", result);
                        } else {
                            Connext.Event.fire("onCriticalError",
                                { 'function': "getUserData.done", 'error': "Unknown Registration Type" });
                        }
                    })
                    .fail(function (err) {
                        LOGGER.debug(NAME, fnName, "getUserData.fail -- err", err);
                        AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                        deferred.reject(err);
                    });
            } catch (e) {
                console.error(NAME, fnName, "EXCEPTION", e);
                AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                deferred.reject();
            }
        }
        return deferred.promise();
    };

    var processSuccessfulLogin = function (type, data) {
        /// <summary>This is called when a user is successfully logged in (authenticated). This doesn't mean they have Premium access, this is what this function will determine. It also calls any UI related functions based on the result of checking access.</summary>
        /// <param name="type" type="String">This is the type of authentication method was used (will either be 'Form' or 'Token'</param>
        /// <param name="data" type="Object">The data returned from whatever was used to determine authentication (we'll use AUTH_TYPE to handle this object in the appropriate way).</param>
        /// <returns>None</returns>
        var fnName = "processSuccessfulLogin";
        try {
            Connext.Storage.SetAccountDataExpirationCookie(true);
            USER_STATE = USER_STATES.LoggedIn;
            LOGGER.debug(NAME, fnName, "type", type, "data", data);
            HandleUiLoggedInStatus(true);
            if (!data.Subscriptions || data.Subscriptions == null) {
                NOTIFICATION.show("NoSubscriptionData");
                Connext.Event.fire("onNotAuthorized", USER_STATE);
            } else {
                //we have a data.Subscriptions that is not an object, so parse it.
                if (!_.isObject(data.Subscriptions)) {
                    data.Subscriptions = $.parseJSON(data.Subscriptions);
                }
                var zipCodes = _.map(data.Subscriptions, function (s) { return s.PostalCode });
                Connext.Storage.SetUserZipCodes(zipCodes);
                $("#ddZipCode").html(zipCodes.toString());
            }
            //we fire onUserTokenSuccess here because we need to parse the data.Subscriptions. This event is fired regardless if we have access, just that we got data back from GetSubscriptionsByUserToken.
            if (type == "Token") {
                Connext.Event.fire("onUserTokenSuccess", USER_STATE);
            }
            //handle any AUTH_TYPE specific actions below.
            if (AUTH_TYPE.MG2) {
                if (data.IgmRegID) {
                    Connext.Storage.SetigmRegID(data.IgmRegID);
                }
                if (data.IgmContent) {
                    Connext.Storage.SetIgmContent(data.IgmContent);
                }
                //MG2 Auth
            } else if (AUTH_TYPE.Janrain) {
                //Janrain Auth
            } else if (AUTH_TYPE.GUP) {
                //GUP Auth
            } else {
                //unknown AUTH_TYPE, fire critical event and .reject();
                Connext.Event.fire("onCriticalError", { 'function': "processAuthentication", 'error': "Unknown Registration Type" });
            }

            //After AUTH_TYPE specific actions we handle any universal actions below.

            var hasAccess = checkSubscriptionsForAccess(type, data);

            //call this regardless of AuthType, this check is handled in this function.
            //TO DO: This will need updated when we allow logins without premium access, since this will only update html if you have access.

            if (hasAccess) {
                LOGGER.debug(NAME, "hasAccess");
                USER_STATE = USER_STATES.Subscribed;
                Connext.Event.fire("onHasAccess", USER_STATE);

                //We use bootstrap modalManager to check if we have any open modals (either Login modals or any 'Action' modals).
                //if we do then we need to update the alert section so it says we have access and then we need to hide this modal.

                var modalManager = $("body").data("modalmanager");
                //we have a modalmanager (means a modal has at least been injected into dom. This will be false/undefined if this is from a background call to authenticate by user token.

                if (modalManager) {
                    var openModals = modalManager.getOpenModals();
                    LOGGER.debug(NAME, fnName, "openModals", openModals);

                    if (openModals.length > 0) {
                        if (openModals[0].isShown) {
                            //modal is shown, this is from one of our modals, show alert message and after slight delay, hide the modal and show content.
                            NOTIFICATION.show("AuthSuccess");
                            setTimeout(function () {
                                openModals[0].$element.modal("hide");
                            }, 1500);
                        }
                    }
                }
            } else {
                Connext.Event.fire("onNotAuthorized", USER_STATE);
            }
            Connext.Storage.SetUserState(USER_STATE);
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var checkSubscriptionsForAccess = function (authSrc, data) {
        /// <summary>This checks the array of subscriptions from the data object and checks that at least one of them has access based on the AccessRules from the configuration.</summary>
        /// <param name="authSrc" type="String">This is the source of authentication either 'Form' or 'Token'. This lets us know where the auth came from.</param>
        /// <param name="data" type="Object">This is the entire 'User' data object returned from account services. data.Subscriptions will be used to check assess but other properties are needed for Events.</param>
        /// <returns>None</returns>
        var fnName = "checkSubscriptionsForAccess";
        try {
            LOGGER.debug(NAME, fnName, "OPTIONS", OPTIONS, "data", data);
            if (data.Subscriptions.length == 0) {
                LOGGER.debug(NAME, fnName, "user has not subscriptions", null);
                return false;
            }

            if (_.isString(OPTIONS.AccessRules)) {
                //if the AccessRules are a string, we need to parse them into JSON.
                OPTIONS.AccessRules = $.parseJSON(OPTIONS.AccessRules);
            }
            if (data.DigitalAccess) {
                return _.where([data.DigitalAccess], OPTIONS.AccessRules).length > 0;
            }
            var allowedAccts = _.where(data.Subscriptions, OPTIONS.AccessRules);

            LOGGER.debug(NAME, fnName, "allowedAccts", allowedAccts);

            //create universal event object that will be used in the Event for either onAuthorized or onNotAuthorized.
            var eventObj = { type: authSrc, uid: data.MasterId, user: (data.User) ? data.User : null, subscriptions: data.Subscriptions, accessRules: OPTIONS.AccessRules };

            if (allowedAccts.length > 0) {
                //add authorizeSubscriptions to eventObj
                eventObj["authorizedSubscriptions"] = allowedAccts;
                Connext.Event.fire("onAuthorized", eventObj);
                return true;
            } else {
                Connext.Event.fire("onNotAuthorized", eventObj);
                return false;
            }


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return false;
        }
    };

    //#endregion ACCESS Functions

    //#region USER Functions (handles attempting to try and determine a user based on any previous info).

    var getUserData = function () {
        /// <summary>This gets user data regardless of the AUTH_TYPE. This will use the appropraite method to getting UserData depending on AUTH_TYPE, since some AUTH_TYPES require ajax calls we use a deferred object for all responses.</summary>
        /// <param name="" type=""></param>
        /// <returns type="Object">Returns object with 2 props (type=AUTH_TYPE and value AUTH_TYPE related value.)</returns>
        var fnName = "getUserData";
        var deferred = $.Deferred();
        try {

            //NOTE: if we get successful userData we are calling 'resolve' and passing in this data. The function calling this one handles the type of data returned (for MG2 it is a userToken, for Janrain it is a UUID etc...)

            if (AUTH_TYPE.MG2) {
                var encryptedMasterId = Connext.Storage.GetigmRegID();
                if (encryptedMasterId) {
                    deferred.resolve(encryptedMasterId);
                } else {
                    deferred.reject("No MG2 UserToken");
                }
            } else if (AUTH_TYPE.Janrain) {
                if (window.JANRAIN) {
                    if (!window.localStorage.getItem("janrainCaptureToken")) {
                        USER_STATE = USER_STATES.NotLoggedIn;
                        Connext.Storage.SetUserState(USER_STATE);
                        deferred.reject("Janrain Logged out User");
                    } else {
                        LOGGER.debug(NAME, fnName, "Janrain Loaded");

                        var janrainProfile = getJanrainProfileData();
                        LOGGER.debug(NAME, fnName, "janrainProfile", janrainProfile);

                        if (janrainProfile.uuid) {
                            USER_STATE = USER_STATES.LoggedIn;
                            deferred.resolve(janrainProfile.uuid);
                            //deferred.resolve({ type: 'janrain', value: janrainProfile.uuid });
                        } else {
                            deferred.reject("No Janrain Profile Data");
                        }
                    }
                }
                else {
                    USER_STATE = USER_STATES.NotLoggedIn;
                    Connext.Storage.SetUserState(USER_STATE);
                    deferred.reject("Janrain object is exist");
                }

            } else if (AUTH_TYPE.GUP) {
                //Call GUP to get user data.

                GetCurrentGupUser().then(function (data) {
                    LOGGER.debug(NAME, fnName, "getCurrentGUPUser.then (data)", data);
                    if (data) {
                        //we have a return from GUP, call .resolve and return this data.
                        deferred.resolve(data);
                    }

                }).fail(function (error) {
                    //we failed to get GUP user data.
                    LOGGER.debug(NAME, fnName, "getCurrentGUPUser.fail (error)", error);
                    deferred.reject();

                });


            } else {
                //unknown AUTH_TYPE, fire critical event and .reject();
                Connext.Event.fire("onCriticalError", { 'function': "getUserData", 'error': "Unknown Registration Type" });
                deferred.reject("Unknown Registration Type");
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
        return deferred.promise();
    };

    var logoutUser = function () {
        /// <summary>This logs out the user out whatever AUTH system we are using.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "logoutUser";
        try {
            LOGGER.debug(NAME, fnName);

            if (AUTH_TYPE.MG2 || AUTH_TYPE.Janrain) {
                HandleUiLoggedInStatus(false);
            } else if (AUTH_TYPE.GUP) {
                //this is gup.
                //logoutGUPUser returns a deferred object ($.ajax call), so we need to wait for the result.
                LogoutGupUser().then(function (data) {
                    if (data) {
                        LOGGER.debug(NAME, fnName, "logoutGUPUser.then", data);
                        USER_STATE = USER_STATES.NotLoggedIn;
                        Connext.Storage.SetUserState(USER_STATE);
                        Connext.Event.fire("onNotAuthorized", USER_STATE);
                    }
                }).fail(function (error) {
                    console.error(NAME, fnName, "Exception", error);
                    //return response;
                });
            }
            Connext.Storage.SetUserState(USER_STATES.NotLoggedIn);
            Connext.Run();
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion USER Functions

    //#region MG2 Functions -- mg2 only functions

    //#endregion MG2 Functions

    //#region Janrain Functions -- janrain only functions

    var getJanrainProfileData = function () {
        /// <summary>Gets Janrain profile from local storage (this is where janrain is stored).</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getJanrainProfileData";
        try {
            //console.log(pName, fnName);
            var profileData = window.localStorage.getItem("janrainCaptureProfileData");
            if (profileData == null)
            { profileData = window.localStorage.getItem("janrainCaptureReturnExperienceData"); }
            if (profileData) {
                return $.parseJSON(profileData);
            } else {
                return false;
            }
        } catch (e) {
            console.log(NAME, fnName, "EXCEPTION", e);
            return false;
        }
    };

    var clearUserStateIfWasRedirect = function () {
        var fnName = 'clearUserStateIfWasRedirect';
        try {
            LOGGER.debug('User', fnName);
            if (Connext.Utils.getUrlParam('clearUserState')) {
                Connext.Storage.SetUserState(null);
                USER_STATE = null;
            }
        } catch (e) {
            console.error(NAME, fnName, 'EXCEPTION', e);
        }
    };

    var janrainAuthenticationCallback = function (result) {
        /// <summary>This is the callback that is fired when a user is successfully logged into Janrain. This is not triggered when logging in via a form or modal and when logging in via SSO for the first time. (repeated SSO logins is handled in the 'getUserData' function above.</summary>
        /// <param name="result" type="Object">Result object returned from Janrain.</param>
        /// <returns>None</returns>
        var fnName = "janrainAuthenticationCallback";
        try {
            LOGGER.debug(NAME, fnName, result);
            if (!result.userData.uuid) {
                throw "No userData UUID";
            }
            Connext.API.GetUserByMasterId({
                payload: { id: result.userData.uuid },
                onSuccess: function (data) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    processSuccessfulLogin("Form", data);
                },
                onNull: function () {
                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                },
                onError: function (err) {
                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                }

            });

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion Janrain Functions

    //#region GUP Functions -- GUP only functions

    var executePopupLoginFlow = function () {

        var popupWidth = 500,
            popupHeight = 600,
            popupPositionLeft = (screen.width / 2) - (popupWidth / 2),
            popupPositionTop = (screen.height / 2) - (popupHeight / 2);
        var loginTab =  window.open(
                GUP_SETTINGS.LoginServiceBasePath  + "authenticate/?window-mode=popup",
                "_blank",
                "toolbar=no, scrollbars=yes, resizable=no, " +
                "width=" + popupWidth + ", " +
                "height=" + popupHeight + ", " +
                "top=" + popupPositionTop + ", " +
                "left=" + popupPositionLeft
            );
        loginTab.onunload = function(e) {
            LOGGER.debug(NAME, "<< GUP >>", e);
        }
        return;
    };

    var GetCurrentGupUser = function () {
        LOGGER.debug("User", "getCurrentGUPUser");
        return $.ajax({
            type: "POST",
            url: GUP_SETTINGS.UserServiceBasePath+ "user/?callback=?", //need to update based on ADMIN settings.
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true
        });
    };

    var AuthenticateGupUser = function (data) {
        /// <summary>Takes the data object returned from the 'getCurrentGUPUser' call and checks if it has access.  This is a simple check since GUP handles authentication, but we have this seperate function since it will be called behind the scenes on page load and when a user logs in through GUP (all we have is a callback when the login form closes, so we need to process all login form changes here). NOTE: this is the equivalent for 'checkSubscriptionsForAccess' for MG2 and Janrain Auths. </summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "authenticateGUPUser";
        try {
            LOGGER.debug(NAME, fnName);

            if (!data.meta.isAnonymous && data.response.user) {
                //user is not anonymous and we have a response.user object, this means this user is logged in.
                //just because they are logged in, does not mean they get access...check access property.
                if (data.response.user.hasMarketAccess) {
                    //this user has marketAccess so fire deferred.resolve(true).
                    LOGGER.debug(NAME, fnName, "GUP User <<IS>> LOGGED IN, AND has market access");
                    USER_STATE = USER_STATES.Subscribed;
                    Connext.Storage.SetUserState(USER_STATE);
                    Connext.Event.fire("onAuthorized", USER_STATE);
                    return true;
                } else {
                    //even though this user is logged in, they don't have access, so fire deferred.reject().
                    LOGGER.debug(NAME, fnName, "GUP User <<IS>> LOGGED IN, but doesnt have marketAccess");
                    USER_STATE = USER_STATES.LoggedIn;
                    Connext.Storage.SetUserState(USER_STATE);
                    Connext.Event.fire("onNotAuthorized", USER_STATE);
                    ////deferred.reject();
                    return false;
                }
                //whether they have marketAccess or not, set logged in to true (so on login/logout click events we know logged in state and don't have to call GetUser again.;
                ////IS_LOGGED_IN = true;
            } else {
                //user is not logged into GUP.
                LOGGER.debug(NAME, fnName, "GUP User <<NOT>> LOGGED IN");
                USER_STATE = USER_STATES.NotLoggedIn;
                Connext.Storage.SetUserState(USER_STATE);
                Connext.Event.fire("onNotAuthorized", USER_STATE);
                return false;
                ////IS_LOGGED_IN = false;
                ////deferred.reject();
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            USER_STATE = USER_STATES.NotLoggedIn;
            Connext.Storage.SetUserState(USER_STATE);
            return false;
        }
    };

    //#endregion GUP Functions

    //#region EVENT LISTENERS

    var registerEventlisteners = function () {
        /// <summary>This registers any event listeners needed (for now just for GUP, but want to put it inside a function so we don't set an event listener for GUP on other AUTH_TYPES</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "registerEventlisteners";
        try {
            //LOGGER.debug(pName, fnName);
            if (AUTH_TYPE.GUP) {
                //this is required for GUP, when the user closes the popup login modal (regardless of successful login, if they click 'cancel' or just close the popup modal.
                window.jQuery(window)
                    .on("focus.gup_login_popup",
                    function () {
                        //GUP does not have a callback for successful login, because of this and what i mentioned above about not knowing why the modal was closed, we need to call the GetUserStatus call again, 
                        //to see if they are now logged in. (This is not ideal, but this is actually according to the GUP documentation).
                        //refresh();
                        LOGGER.debug("focus.gup_login_popup");
                        //checkAccess();
                    });
            }


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };





    //#region UI Functions

    var HandleUiLoggedInStatus = function (isLoggedIn) {
        /// <summary>This changes any UI related text based on the logged in status.  This called after we determine the LoggedInStatus on pageload or after a user has changed the login status (from logging in or logging out).</summary>
        /// <param name="isLoggedIn" type="Boolean">Logged in status.</param>
        /// <returns>None</returns>
        var fnName = "handleUILoggedInStatus";
        try {
            //LOGGER.debug(pName, fnName);

            var $el = $(UI.ActionShowLogin); //gets all the elements that have the selector for UI.ActionShowLogin. We will change their status based on 'isLoggedIn' argument.

            //set global status here (this is important since we use this var to determine the appropriate action when a user clicks the UI.ActionShowLogin element (should we show modal or log them out).
            IS_LOGGED_IN = isLoggedIn;
            if (isLoggedIn) {
                USER_STATE = USER_STATES.LoggedIn;
            } else {
                USER_STATE = USER_STATES.NotLoggedIn;
            }
            //right now we only do MG2 stuff, but we might need to do things for GUP (not sure yet). Janrain is handled by the client, so we don't do anything for that registration type.
            if (AUTH_TYPE.MG2 || AUTH_TYPE.Janrain) {
                if (IS_LOGGED_IN) {
                    $(UI.LogoutButton).show();
                    $(UI.ActionShowLogin).hide();
                    //is logged in.
                    //sets the html to the data property for 'mg2-logged-in'. This lets the client to set this on their site and we will update accordingly (i.e Logout or Log Out or Sign Out etc..).
                    $el.html($el.data("mg2-logged-in"));
                    Connext.Event.fire("onAuthorized", null);
                } else {
                    //not logged in.
                    $el.html($el.data("mg2-logged-out"));
                    Connext.Storage.ClearUser();
                    $(UI.LogoutButton).hide();
                    $(UI.ActionShowLogin).show();
                    Connext.Event.fire("onNotAuthorized", null);
                    $("#ddZipCode").html($.jStorage.get("CustomZip"));
                }
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion UI Functions

    //#region STORAGE QUERIES

    //#endregion STORAGE QUERIES

    //#region API CALLS

    var Mg2Authenticate = function (email, password) {
        /// <summary>Authenticates an MG2 user by email and password.  Calls GetUserByEmailAndPassword (calls api/authentication in account services)</summary>
        /// <param name="email" type="string"></param>
        /// <param name="password" type="string"></param>
        /// <returns>None</returns>
        var fnName = "MG2Authenticate";
        try {
            if (!email) {
                FORM_ALERT.find(".alert").remove();
                NOTIFICATION.showAndHide("Please enter email", 10000);
                FORM_SUBMIT_LOADER.off();
                return false;
            }
            if (!password) {
                FORM_ALERT.find(".alert").remove();
                NOTIFICATION.showAndHide("Please enter password", 10000);
                FORM_SUBMIT_LOADER.off();
                return false;
            }
            LOGGER.debug(NAME, fnName);
            Connext.API.GetUserByEmailAndPassword({
                payload: { email: email, password: password },
                onSuccess: function (data) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    processSuccessfulLogin("Form", data);
                    $(UI.ActionShowLogin).hide();
                    $(UI.LogoutButton).show();
                    Connext.Run();
                },
                onNull: function () {
                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                    NOTIFICATION.show("NotAuthenticated");
                },
                onError: function (err) {
                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                    var errorMessage = "GenericAuthFailed";
                    if (err.responseJSON || err.responseText) {
                        try {
                            LOGGER.debug(NAME, fnName, "try parse error response");
                            if (!err.responseJSON && err.responseText) {
                                var respText = JSON.parse(err.responseText);
                                if (respText.Message) {
                                    var message = JSON.parse(respText.Message);
                                    errorMessage = message.Message;
                                    if (errorMessage == "UserName or Password invalid.") {
                                        errorMessage += " " + incorrectCreditsMessage;
                                    }
                                }

                            } else {
                                errorMessage = err.responseJSON.Message;
                                var json = JSON.parse(err.responseJSON.Message);
                                if (json.Message) {
                                    errorMessage = json.Message;
                                    if (errorMessage == "UserName or Password invalid.") {
                                        errorMessage += " " + incorrectCreditsMessage;
                                    }
                                }
                            }
                        }
                        catch (e) {
                            LOGGER.debug(NAME, fnName, "Error of parse response JSON");
                        }
                    }
                    FORM_ALERT.find(".alert").remove();
                    NOTIFICATION.showAndHide(errorMessage, 10000);
                },
                onComplete: function () {
                    
                    FORM_SUBMIT_LOADER.off();
                }
            });


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion API CALLS

    //#region AJAX CALLS

    var LogoutGupUser = function () {
        LOGGER.debug("User", "logoutGUPUser");
        return $.ajax({
            type: "POST",
            url: GUP_SETTINGS.UserServiceBasePath +
                "user/logout/?callback=?", //need to update based on ADMIN settings.
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true
        });
    };

    //#endregion AJAX CALLS

    return {
        //main function to initiate the module
        init: function (options) {
            LOGGER = Connext.Logger;
            OPTIONS = (options) ? options : {}; //if not options set to blank object
            init();
            //TODO: MOVE GUP SETTINGS TO ADMIN.
            GUP_SETTINGS = {
                'UserServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountService : "",
                'LoginServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountLoginUrl : ""
            };
            //return this;
        },
        CheckAccess: function () {
            return checkAccess();
        },
        GetAuthTiming: function () {
            return AUTH_TIMING;
        },
        JanrainLoaded: function () {
            JANRAIN_LOADED = true;
            LOGGER.debug(NAME, "JanrainLoaded");
        },
        onLoginSuccess: function (result) {
            //this is only called when logging in via native janrain modal or from mg2 form calling janrain.capture.ui.postCaptureForm
            //we handle janrain SSO logins in the checkAccess -> getUserToken call. 
            LOGGER.debug(NAME, "onLoginSuccess", result);
            janrainAuthenticationCallback(result);
        },
        getUserState: function () {
            return Connext.Storage.GetUserState();
        },
        onLogout: function () {
            LOGGER.debug(NAME, "onLogout");
            IS_LOGGED_IN = false;
            Connext.Storage.ClearUser();
            //Cookies.remove(Options.storageKeys.userRegId);
            //Cookies.remove(Options.storageKeys.userToken);
            //Cookies.remove(Options.storageKeys.accessToken);
        }
    };

};

var ConnextMeterCalculation = function ($) {

    //region GLOBALS

    var NAME = "MeterCalculation"; //base name for logging.

    //create local reference to logger
    var LOGGER;

    //holds references to the testing functions. This way when we loop through segments we don't need a bunch of 'if' statements or a long list of switch cases.
    var SEGMENT_TEST_FUNCTIONS = {
        "ArticleAge": evalArticleAge,
        "HiddenField": evalHiddenField,
        "Subdomain": evalSubdomain,
        "Geo": evalGeo,
        "Url": evalUrlParam,
        "JSVar": evalJsVar,
        "Meta": evalMeta,
        "UserState": evalUserState,
        "AdBlock": evalAdBlock
    }

    //this will hold the cached results when we are determing segment values.  Once a 'Segment Type' is determined we set it's value here, then on subsqeunt checks to this type we will return the cached value instead of determining this value again.
    //i.e - once we determine an ArticleAge we set the value so we don't need to keep looking this up.
    //NOTE: not all segment-type test results will be cached (things like UrlParam, which can have different values to test against).
    var CACHED_RESULTS = {};


    //endregion GLOBALS


    //region FUNCTIONS

    var calculateMeterLevel = function (rules) {
        /// <summary>Processes the Rules object and handles any business rules based on this data.</summary>
        /// <param name="rules" type="Array">Rules to process</param>
        /// <returns type="DeferredObject">Jquery deferred object</returns>
        var fnName = "calculateMeterLevel";

        //create deferred object
        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "calculating meter level....");
            //LOGGER.debug(NAME, fnName, 'rules', rules);

            //holds variable if this rule is passed. We will set this in the 'rules.each'. We use this in the rules.each so we don't process any other rules when this is set to true (we can't exit out of a $.each, so we need to just skip processing)
            var rulePassed = false;

            $.each(rules, function (key, rule) {
                //loop through rules. (val is a rule object)
                LOGGER.debug(NAME, fnName, "rules.each", key, rule);

                if (!rulePassed) { //we only loop through this rules segments if we have not already determined a rule to use.

                    var allSegmentsPass = true; //set this to true by default. If a segment fails we set this to false so we know at least one segment failed which means this rule failed, so we'll skip testing other segments in this rule.
                    ////var segmentFailed = false; //set this to false by default. If a segment fails we set this to true so we know the previous segment failed, so we should skip checking the other segments in this rule. This will be reset for each rule.

                    $.each(rule.Segments, function (key, segment) {
                        //loop through segments for this rule
                        LOGGER.debug(NAME, fnName, "segments.each", key, segment);

                        if (allSegmentsPass) {
                            //previous segment (or this is first segment) has not failed, so we should test this.

                            SEGMENT_TEST_FUNCTIONS[segment.SegmentType](segment)
                                .done(function() {
                                    //.done means this segment passed, we really don't need to do anything here, since we only care if a segment fails.
                                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- PASSED");
                                })
                                .fail(function() {
                                    //.fail means this segment failed, so set allSegmentsPass to false.
                                    allSegmentsPass = false;
                                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- FAILED");
                                });
                        } else {
                            //previous segment in this rule failed, so skip checking this segment.
                            LOGGER.debug(NAME, fnName, "Previous Segment Failed, Not processing rest of segments.");
                        }
                    }); // each rule.Segment loop.

                    //we've finished looping through this rules 'Segment' array. Check if all allSegmentsPass is true, if it is then we know this rule passed and is the one we should use.
                    if (allSegmentsPass) {
                        LOGGER.debug(NAME, fnName, "All Segments Passed, Using [" + rule.Name + "] Rule ");

                        //we set rulePassed to true, so we skip checking any other rules.
                        rulePassed = true;

                        //we can call deferred.resolve and pass in this rules meterLevel
                        deferred.resolve(rule);

                    }

                } else {
                    //rulePassed is true, so we already determined a rule to use, so not testing any other rules (can't exit out of this $.each so just don't process it's segments 
                    LOGGER.debug(NAME, fnName, "Rule Already Set...Skipping this rule.");
                }// !rulePassed


            });

            if (!rulePassed) {
                //a rule didn't pass so we call deferred.reject
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            deferred.reject(e);
        }

        return deferred.promise();
    };

    //#endregion FUNCTIONS

    //#region SEGMENT TESTS

    function evalArticleAge(segment) {
        /// <summary>This checks article age based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalArticleAge";

        //create deferred object
        var deferred = $.Deferred();

        try {

            LOGGER.debug(NAME, fnName, "-- Testing ---");

            var articleAge = getArticleAge(segment.Options);

            //fixes qualifier so if it is an equal sign we set qualifier as ==
            var qualifier = (segment.Options.Qualifier == "=") ? "==" : segment.Options.Qualifier;


            if (eval(articleAge + qualifier + segment.Options.Val)) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            deferred.reject(false);
        }

        //return deferred promise
        return deferred.promise();

    }

    function evalUrlParam(segment) {
        /// <summary>This checks based on a Url parameter.</summary>
        /// <param type="Array" name="_SegmentOptions">Holds array of segment options</param>
        /// <returns type="Boolean">Boolean if segment passed.</returns>
        var fnName = "evalUrlParam";

        //create deferred object
        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "-- Testing ---");

            //gets the value of the url param. (this will be null if this url param does not exist
            var paramValue = Connext.Utils.GetUrlParam(segment.Options.ParamName);
            var qualifier = Connext.Common.QualifierMap[segment.Options.Qualifier];
            if (paramValue != null) {


                if (eval("'" + paramValue.toUpperCase() + "'" + qualifier + "'" + segment.Options.Val.toUpperCase() + "'")) {
                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- Passed");
                    deferred.resolve();
                } else {
                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- FAILED");
                    deferred.reject();
                }

            } else {
                if (qualifier == "==") {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalHiddenField(segment) {
        /// <summary>This checks hidden field value based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalHiddenField";

        //create deferred object
        var deferred = $.Deferred();

        try {

            LOGGER.debug(NAME, fnName, "-- Testing ---");

            var isPassed = false;
            var $hiddenField = segment.Options.Selector.trim() ? $(segment.Options.Selector + "[type='hidden']") : null;

            if ($hiddenField && $hiddenField.length > 0) {

                var hiddenFieldVal = $($hiddenField[0]).val();
                var qualifier = Connext.Common.QualifierMap[segment.Options.Qualifier];

                isPassed = eval("'" + hiddenFieldVal.toUpperCase() + "'" + qualifier + "'" + segment.Options.Val.toUpperCase() + "'");
            }

            if (isPassed) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            deferred.reject(false);
        }

        //return deferred promise
        return deferred.promise();
    }

    function evalSubdomain(segment) {
        /// <summary>This checks subdomain in domain based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalSubdomain";

        //create deferred object
        var deferred = $.Deferred();

        try {

            LOGGER.debug(NAME, fnName, "-- Testing ---");

            var searchingVal = segment.Options.Val.toUpperCase();
            var sourceVal = window.location.hostname.toUpperCase(); // root domain won't be included
            var qualifier = segment.Options.Qualifier.toUpperCase();

            if (!((qualifier == "IN") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1))) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            deferred.reject(false);
        }

        //return deferred promise
        return deferred.promise();
    }

    function evalGeo(segment) {
        /// <summary>This checks the current user zip code</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var isPassed = false;
        //create deferred object
        var deferred = $.Deferred();
        try {
            //We have a 'HiddenField' criteria and 'actionPassed' is still true so we need to check this.
            if (Connext.Storage.GetUserZipCodes()) {
                $.each(Connext.Storage.GetUserZipCodes(),
                    function (key, code) {
                        if (segment.Options.Zipcodes.indexOf(code) >= 0) {
                            isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                            return false;
                        } else {
                            isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                        }
                    });
            } else {
                if (segment.Options.Zipcodes.indexOf(Connext.Utils.GetUserZipcode()) >= 0) {
                    isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                } else {
                    isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                }
            }
        } catch (e) {
            isPassed = false;
        }
        if (isPassed) {
            console.log("PASSES");
            deferred.resolve();
        } else {
            console.log("NOT PASSED");
            deferred.reject();
        }
        return deferred.promise();
    }

    function evalJsVar(segment) {
        /// <summary>This checks JS variable value based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalJSVar";

        //create deferred object
        var deferred = $.Deferred();

        try {

            LOGGER.debug(NAME, fnName, "-- Testing ---");

            var isPassed = true;
            var varValue = segment.Options.VarName;

            var jsValue = eval(varValue);
            if (Object.prototype.toString.call(jsValue) == "[object Array]") {
                jsValue = jsValue.map(function (item) {
                    return item.trim().toLowerCase();
                });
                if (segment.Options.Qualifier == "Contains" ||
                    segment.Options.Qualifier == "Doesn't contain") {
                    if (jsValue.indexOf(segment.Options.Val.toLowerCase()) >= 0) {
                        isPassed = segment.Options.Qualifier == "Contains";
                    } else {
                        isPassed = segment.Options.Qualifier == "Doesn't contain";
                    }
                } else {
                    isPassed = segment.Options.Qualifier == "Equals";
                }
            } else {
                jsValue = jsValue.toString().toLowerCase();

                if (segment.Options.Qualifier == "Contains" ||
                    segment.Options.Qualifier == "Doesn't contain") {
                    if (jsValue == undefined) {
                        isPassed = segment.Options.Qualifier == "Doesn't contain";
                    } else {
                        var array = jsValue.split(/[,;]/g);
                        if (array.indexOf(segment.Options.Val.toLowerCase()) >= 0) {
                            isPassed = segment.Options.Qualifier == "Contains";
                        } else {
                            isPassed = segment.Options.Qualifier == "Doesn't contain";
                        }
                    }
                } else {
                    if (Connext.Utils
                        .JSEvaluate(jsValue,
                            segment.Options.Qualifier,
                            segment.Options.Val.toLowerCase(),
                            "JavascriptCriteria")) {
                        //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                    } else {
                        //this failed, so set actionPassed to false;
                        isPassed = false;
                    }
                }
            }
            if (isPassed) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            //return false;
            //_CB(false);
            deferred.reject();
        }

        //return deferred promise
        return deferred.promise();
    }

    function evalUserState(segment) {
        /// <summary>This checks evalUserState presence based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalUserState";

        //create deferred object
        var deferred = $.Deferred();

        try {
            var userState = Connext.User.getUserState();
            if (userState == null)
                userState = "Logged Out";
            var isPassed = userState == segment.Options["User State"];
            if (isPassed) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            //return false;
            //_CB(false);
            deferred.reject(false);
        }
        //return deferred promise
        return deferred.promise();
    }

    function evalAdBlock(segment) {
        /// <summary>This checks evalAdBlock presence based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalAdBlock";

        var deferred = $.Deferred();
        try {
            var adBlockDetected = Connext.Utils.detectAdBlock();
            var qualifier = segment.Options["Ad Block"].toUpperCase();
            if (!((qualifier == "DETECTED") ^ adBlockDetected)) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject(false);
            }
        } catch (e) {
            console.error(NAME, fnName, e);
            deferred.reject(false);
        }


        return deferred.promise();
    }

    function evalMeta(segment) {


        /// <summary>This checks Meta keyword presence based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="segment">Segment object to test against.</param>
        /// <returns type="DeferredPromise"></returns>
        var fnName = "evalMeta";

        //create deferred object
        var deferred = $.Deferred();

        try {

            LOGGER.debug(NAME, fnName, "-- Testing ---");

            var isPassed = false,
                metaArray = Connext.Utils.getMetaTagsWithKeywords(),
                regExpStr = "\\b" + segment.Options.Val + "\\b",
                regExp = new RegExp(regExpStr);

            for (var i = 0; i < metaArray.length; i++) {
                if (regExp.test(metaArray[i].content)) {
                    LOGGER.debug(NAME, fnName, "Found keyword", segment.Options.Val);
                    isPassed = true;
                    break;
                }
            }

            if (isPassed && segment.Options.Qualifier == "Not Equal") {
                isPassed = false;
            }

            if (!isPassed && segment.Options.Qualifier == "Not Equal") {
                isPassed = true;
            }

            if (isPassed) {
                console.log("PASSES");
                deferred.resolve();
            } else {
                console.log("NOT PASSED");
                deferred.reject();
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            //return false;
            //_CB(false);
            deferred.reject(false);
        }

        //return deferred promise
        return deferred.promise();




    }
    //#endregion SEGMENT TESTS




    //#region EVALUATE SEGMENTS

    function getArticleAge(options) {
        /// <summary>This checks article age based on qualifier and value of a segment.</summary>
        /// <param type="Object" name="options">Segment object to test against.</param>
        /// <returns type="Int|Null">Returns the age of the article. If it can't be determined we return null.</returns>
        var fnName = "getArticleAge";

        try {
            LOGGER.debug(NAME, fnName, options);

            if (_.isNumber(CACHED_RESULTS.articleAge) && !isNaN(CACHED_RESULTS.articleAge)) {
                //we have a cached age from previous segment check, so return this so we don't process the article age again.
                LOGGER.debug(NAME, fnName, "Article Age Already Deterimed...using Cached value");
                return CACHED_RESULTS.articleAge;
            } else {

                //set format for article check to DB value or if it does not exist or is set to empty string then use default value in Connext.Common.
                var format = (_.isNothing(options.Format) ? Connext.Common.DefaultArticleFormat : options.Format);
                LOGGER.info(NAME, fnName, "Using Format: ", format);
                var articleDateData;
                //get the article text based on the selector
                if (options.Selector.indexOf("$") > -1) {
                    articleDateData = eval(options.Selector);
                } else {
                    articleDateData = $(options.Selector).text();
                }

                LOGGER.info(NAME, fnName, "articleDateData", articleDateData);

                var articleDate = Connext.Utils.ParseCustomDates(articleDateData, format);

                var now = Connext.Utils.Now();

                var articleAgeInDays = Connext.Utils.Diff(now, articleDate);

                LOGGER.debug(NAME, fnName, "Date Used for Compare: " + articleDateData, "Article Age In Days:: (" + articleAgeInDays + ")");

                //set cached value so we don't process this again for other checks.
                CACHED_RESULTS.articleAge = articleAgeInDays;
                return CACHED_RESULTS.articleAge;
            }

        } catch (e) {
            console.error(NAME, fnName, e);
            return false;
        }
    }

    //#endregion EVALUATE SEGMENTS




    //#region HELPERS

    //#endregion HELPERS

    return {
        init: function () {
            LOGGER = Connext.Logger;
            LOGGER.debug(NAME, "MeterCalculation.Init");
        },
        CalculateMeterLevel: function (rules) {
            return calculateMeterLevel(rules);
        }
    };

};

var ConnextCampaign = function ($) {

    //#region GLOBALS

    var NAME = "Campaign"; //base name for logging.
    var ArticleLeftString = "{{ArticleLeft}}";
    //create local reference to logger
    var LOGGER;

    var CURRENT_CONVERSATION; //holds the current conversation once it was determined. We set a global reference so we can use this in Events that might be fired after a Campaign has been processed (i.e. Custom Actions, Login Events etc...).
    var METER_LEVEL; //We set a global reference so we can use this in Events that might be fired after a Campaign has been processed (i.e. Custom Actions, Login Events etc...).

    var CONFIG_SETTINGS; //holds Configuration settings which are set on the init of this function. We have this here so we don't need to keep looking up this data in local storage.

    //#endregion GLOBALS

    //#region CAMPAIGN FUNCTIONS

    var processCampaign = function (meterLevel, campaignData) {
        /// <summary>This kicks off the entire process of processing a campaign.</summary>
        /// <param name="meterLevel" type="Int">This is the meter level for this article and it used to determine which conversation we should process</param>
        /// <param name="campaign" type="Object">Campaign object which holds all conversations and actions, regardless of meterlevel.</param>
        /// <returns>None</returns>
        var fnName = "processCampaign";
        try {
            LOGGER.debug(NAME, fnName, meterLevel);

            //just for sanity check required arguments.
            if (!meterLevel) {
                throw "No Meter Level Set";
            }

            if (!campaignData) {
                throw "No Campaign Data.";
            }

            //set global meter level
            METER_LEVEL = meterLevel;

            CURRENT_CONVERSATION = getCurrentConversation(meterLevel);
            if (!CURRENT_CONVERSATION) {

                //TODO: maybe add event firing here so we can update the 'Note' section on the debug panel letting user know that now conversation was found.
                //throw "No Conversation Found To Process"
                throw Connext.Common.ERROR.NO_CONVO_FOUND;

            } else {
                LOGGER.debug(NAME, fnName, "Conversation To Process", CURRENT_CONVERSATION);

                processConversation();

            }


        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            Connext.Event.fire("onCriticalError", e);
        }

    };

    //#endregion CAMPAIGN FUNCTIONS

    //#region CONVERSATION FUNCTIONS

    var processConversation = function () {
        /// <summary>We have done all our checks and have a valid conversation, so process it.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "processConversation";
        try {
            LOGGER.debug(NAME, fnName);

            //before we determine conversation actions we need to update the article view count (since new conversations have this set to 0 and under certain options we won't duplicate this count).
            handleArticleView();

            //we have a current conversation (either stored or a new conversation). Fire onConversationDetermined event and Proccess it.
            Connext.Storage.SetCurrentConverstaion(CURRENT_CONVERSATION);

            //we fire onConversationDetermined after the handleArticleView function because this even will update our Demo Debug details 'view' html.
            Connext.Event.fire("onConversationDetermined", CURRENT_CONVERSATION);

            //we now need to determine which actions within this conversation should be fired.
            //calculateArticleLeft();
            var actions = determineConversationActions(),
                validActions = determineConversationActions(true);

            if (actions.length > 0) {
                //we have at least one action to execute.
                LOGGER.debug(NAME, fnName, "ACTIONS DETERMINGED ---> ", actions);

                calculateArticleLeft(validActions);

                Connext.Action.ProcessActions(actions);

            } else {
                LOGGER.warn(NAME, fnName, "No 'Actions' to execute.");
            }

            $(".dev_article_left").html(CURRENT_CONVERSATION.Props.ArticleLeft);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var calculateArticleLeft = function (validActions) {
        var lastArticleNumber = 99999;
        var fnName = "getCurrentConversation";
        LOGGER.debug(NAME, fnName, "Try to find paywalls");
        var paywalls = _.where(validActions, { ActionTypeId: 3 });
        if (paywalls.length > 0) {
            LOGGER.debug(NAME, "paywalls found", paywalls);
            $.each(paywalls,
                function (key, paywall) {
                    var paywallView = -1;
                    if (paywall.Who.Views) {
                        $.each(paywall.Who.Views,
                            function (key, view) {
                                if (view.Qualifier == "==" || view.Qualifier == ">=") {
                                    paywallView = view.Val > paywallView ? view.Val : paywallView;
                                } else if (view.Qualifier == ">") {
                                    paywallView = parseInt(view.Val) + 1 > paywallView ? parseInt(view.Val) + 1 : paywallView;
                                }
                            });
                    }
                    if (lastArticleNumber > paywallView) {
                        lastArticleNumber = paywallView;
                    }
                });
            if (lastArticleNumber == -1) lastArticleNumber = 99999;
            CURRENT_CONVERSATION.Props.ArticleLeft = lastArticleNumber == 99999
                ? "unlimited"
                : lastArticleNumber - getCurrentConversationViewCount();
            if (CURRENT_CONVERSATION.Props.ArticleLeft < 0)
                CURRENT_CONVERSATION.Props.ArticleLeft = 0;
            $.each(validActions,
                function (key, val) {
                    if (val.What.Html) {
                        val.What.Html = val.What.Html
                            .split(ArticleLeftString).join('<span class="dev_article_left"></span>');
                    }
                });

        } else {
            CURRENT_CONVERSATION.Props.ArticleLeft = "unlimited";
        }
        $("#ddCurrentConversationArticleLeft").html(CURRENT_CONVERSATION.Props.ArticleLeft);

    }


    var getCurrentConversation = function () {
        /// <summary>This will get the conversation that we should use. This handles checking for stored conversations, validating them and handling any conversation expirations</summary>
        /// <param name="" type=""></param>
        /// <returns type="Object">Conversation object to process.</returns>
        var fnName = "getCurrentConversation";
        try {
            //console.log(pName, fnName);

            //we check if we a user is already in a conversation based on this meter level.
            var storedConversation = getStoredConversationByMeterLevel(METER_LEVEL);

            if (storedConversation) {
                LOGGER.debug(NAME, fnName, "Found Stored Conversation", storedConversation);

                //we have a stored conversation, so set global object.
                CURRENT_CONVERSATION = storedConversation;
                //since this is a stored conversation so we need to make sure it is still valid.
                if (isConversationValid()) {
                    //current conversation is valid, so use it.
                    LOGGER.debug(NAME, fnName, "Found Stored Conversation --- IS VALID");

                    //since it is valid, return the current conversation.
                    return CURRENT_CONVERSATION;

                } else {
                    //current conversation is not valid, so try and get the next conversation.
                    LOGGER.debug(NAME, fnName, "Found Stored Conversation --- NOT VALID");

                    CURRENT_CONVERSATION = getNextConversation();
                    if (CURRENT_CONVERSATION) {
                        setDefaultConversationProps();
                        CURRENT_CONVERSATION.Props.views = 0;
                        Connext.Storage.SetViewedArticles([], CURRENT_CONVERSATION.id);
                        return CURRENT_CONVERSATION;
                    }

                    Connext.Event.fire("onDebugNote", "Conversation Expire: " + CURRENT_CONVERSATION.Props.expiredReason);
                }

            } else {
                //no stored conversation so we need to use the first conversation in the configuration.Campaign object (with this meter level).


                var allConversations = getAllConversationsByMeterLevel(METER_LEVEL);
                //var currentConversations = Connext.Storage.GetCampaignData().Conversations[METER_LEVEL];
                if (allConversations) {

                    //set global conversation object to this conversation.
                    CURRENT_CONVERSATION = allConversations[0];
                    setDefaultConversationProps();

                    LOGGER.debug(NAME, fnName, "No Current Conversation Stored....Using first conversation in campaign", CURRENT_CONVERSATION);
                    if (isConversationValid()) {
                        //current conversation is valid, so use it.

                        //since it is valid, return the current conversation.
                        return CURRENT_CONVERSATION;

                    } else {
                        //current conversation is not valid, so try and get the next conversation.
                        LOGGER.debug(NAME, fnName, "Found Stored Conversation --- NOT VALID");
                    
                        CURRENT_CONVERSATION = getNextConversation();
                        if (CURRENT_CONVERSATION) {
                            CURRENT_CONVERSATION.Props.views = 0;
                            Connext.Storage.SetViewedArticles([], CURRENT_CONVERSATION.id);
                            return CURRENT_CONVERSATION;
                        }
                    }

                    //since we know this is a new conversation, set some values (like Date started, Expirate Date ect...). We also don't need to verify this conversation since this it is new.
                    return CURRENT_CONVERSATION;

                } else {
                    LOGGER.debug(NAME, fnName, "No Conversation for this meter level");
                }
                /////



            }


            //in case other returns weren't called with a valid convo we just return false here as a catch all.
            LOGGER.debug(NAME, fnName, "NO RETURN FIRED, USING CATCH ALL");
            return false;
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return false;
        }
    };

    var isConversationValid = function () {
        /// <summary>Validates the current conversation.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "isConversationValid";
        try {
            //LOGGER.debug(pName, fnName);
            //first we check we this was flagged for expiration from an USER_ACTION on a previous page load
            if (CURRENT_CONVERSATION.Props.isExpired) {
                //this was previously flagged to expire.
                LOGGER.debug(NAME, fnName, "Current conversation was previously set to expired.");
                return false;
            } else {
                //this was not flagged to expire, but we need to check that it is still valid based on the expiration date.
                if (CURRENT_CONVERSATION.Options.Expirations.Time) {
                    //we have a 'Time' expiration type, so check against it.
                    var now = Connext.Utils.Now();

                    var momentConvEndDate = new Date(Date.parse(CURRENT_CONVERSATION.Props.Date.expiration)); //gets momentized object of expiration date.

                    var isExpired = now >= momentConvEndDate; //if now is after the expiration date this conversation has expired.

                    if (isExpired) {
                        LOGGER.debug(NAME, fnName, "Current conversation has expired base on date...");
                        //this is expired based on date, so we will set isExpired and expirationReason. (we set them because this function is just returning true/false. If it is false we will determine the next conversation based on expirationReason in the calling function.
                        CURRENT_CONVERSATION.Props.isExpired = true;
                        CURRENT_CONVERSATION.Props.expiredReason = "Time";

                        return false;
                    }


                } else {
                    LOGGER.debug(NAME, fnName, "No expiration time set for this conversation.");
                }
                if (CURRENT_CONVERSATION.Options.Expirations.UserState) {
                    var stateExpiration = CURRENT_CONVERSATION.Options.Expirations.UserState;
                    if (stateExpiration["User State"] == Connext.User.getUserState()) {
                        CURRENT_CONVERSATION.Props.expiredReason = "UserState";
                        return false;
                    }
                    if (stateExpiration["User State"] == "Logged In" && Connext.User.getUserState() == "Subscribed") {
                        CURRENT_CONVERSATION.Props.expiredReason = "UserState";
                        return false;
                    }
                }
            }
            //just as a catch all return true so we process this conversation (any reasons for expiration will call return false, so this will only be called if it is valid).
            return true;
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return true;
        }
    };

    var getNextConversation = function () {
        /// <summary>This is called when the current Conversation is expired. We use the 'expiredReason' to try and determine the next conversation.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getNextConversation";
        try {
            //LOGGER.debug(pName, fnName);
            var expiredReason = CURRENT_CONVERSATION.Props.expiredReason;
            var nextConvoId = CURRENT_CONVERSATION.Options.Expirations[expiredReason].nextConversation;
            LOGGER.debug(NAME, fnName, "ExpirationReason", expiredReason, nextConvoId, getAllConversationsByMeterLevel(METER_LEVEL));
            CURRENT_CONVERSATION = _.findByKey(getAllConversationsByMeterLevel(METER_LEVEL), { id: nextConvoId });

            //for now return false.
            return CURRENT_CONVERSATION;
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion CONVERSATION FUNCTIONS

    //#region ACTION FUNCTIONS

    var determineConversationActions = function (ignoreViewsFlag) {
        /// <summary>Takes current conversation and loops through each action to determine if it should be executed. This creates an array of action objects that are passed to the 'Action' function, which handles execution.</summary>
        /// <param name="" type=""></param>
        /// <returns type="Array">Array of Action objects to be executed.</returns>
        var fnName = "determineConversationActions";

        try {
            LOGGER.debug(NAME, fnName, CURRENT_CONVERSATION.Actions);

            var actions = []; //this will hold any actions that should be executed.
            var paywallActionFound = false; //we set this to true when we find an action that passes and is a 'Paywall' type. We only allow 1 'Paywall' type, so once we have one we ignore the others.

            //create local reference to current view count so we don't keep calling this function for each action view check (since all actions will check against this).
            var viewCount = getCurrentConversationViewCount();

            //loop through conversation actions
            $.each(CURRENT_CONVERSATION.Actions, function (key, val) {

                LOGGER.debug(NAME, fnName, "Actions.EACH", val);

                if (val.ActionTypeId == 3 && !CURRENT_CONVERSATION.Props.paywallLimit) {
                    //this is a 'Paywall' action type and this conversation does not have a paywallLimit set yet. We don't care if this passes it's criteria yet, we st the paywallLimit to this value.
                    CURRENT_CONVERSATION.Props.paywallLimit = val.Who.Views[0].Val;
                    saveCurrentConversation();
                }

                if (val.ActionTypeId == 3 && paywallActionFound) {
                    //This action is a 'Paywall' and we have already added a 'Paywall' type to the 'actions' array, so do nothing.
                } else {
                    var actionPassed = true;

                    try {
                        // we set this to true for each 'Action' we check against.  As soon as an 'Action' criteria fails we set this to false, so we don't process other criteria within this action (this way if an action has 3 different criteria and the first one fails, we don't bother checking the other 2 since all criteria must pass for this action to be used).
                        var who = val.Who; //set var to the Who object

                        if (who.Views && !ignoreViewsFlag) {
                            //even though 'Views' option is not optional, we still make sure this is set.

                            //who.Views is an array since we could have 2 criteria to check against.
                            $.each(who.Views, function (key, val) {
                                LOGGER.debug(NAME,
                                    fnName,
                                    "Who.Views.EACH",
                                    'ViewCriteria:: viewCount="' +
                                    viewCount +
                                    '" -- Qualifier="' +
                                    val.Qualifier +
                                    '" -- Value="' +
                                    val.Val +
                                    '"');

                                if (Connext.Utils.JSEvaluate(parseInt(viewCount),
                                        val.Qualifier,
                                        parseInt(val.Val),
                                        "ArticleView",
                                        "integer")) {
                                    //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                    LOGGER.debug(NAME,
                                        fnName,
                                        "Who.Views.EACH",
                                        "ViewCriteria:: " +
                                        val.Qualifier +
                                        " " +
                                        parseInt(val.Val) +
                                        " ---------------------- View Criteria PASSED");
                                } else {
                                    //this failed, so set actionPassed to false;
                                    actionPassed = false;

                                    LOGGER.debug(NAME,
                                        fnName,
                                        "Who.Views.EACH",
                                        "ViewCriteria:: " +
                                        val.Qualifier +
                                        " " +
                                        parseInt(val.Val) +
                                        " ---------------------- View Criteria FAILED");
                                }
                            });

                        } else if (who.Views && ignoreViewsFlag) {
                            actionPassed = true;
                        }

                        if (who.HiddenFieldCriteria && actionPassed == true) {
                            //We have a 'HiddenField' criteria and 'actionPassed' is still true so we need to check this.
                            LOGGER.debug(NAME, fnName, "Checking Hidden Field", who.HiddenFieldCriteria);

                            if (Connext.Utils
                                .JSEvaluate(Connext.Utils.GetHiddenFormFieldValue(who.HiddenFieldCriteria.Id),
                                    who.HiddenFieldCriteria.Qualifier,
                                    who.HiddenFieldCriteria.Val,
                                    "HiddenFormField")) {
                                //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                            } else {
                                //this failed, so set actionPassed to false;
                                actionPassed = false;
                            }
                        }
                        var e;
                        if (who.GeoCriteria && actionPassed == true) {
                            try {
                                //We have a 'HiddenField' criteria and 'actionPassed' is still true so we need to check this.
                                LOGGER.debug(NAME, fnName, "Checking GeoCriteria Field", who.GeoCriteria);

                                if (Connext.Storage.GetUserZipCodes()) {
                                    _.each(Connext.Storage.GetUserZipCodes(), function (code) {
                                        if (who.GeoCriteria.Zip.indexOf(code) >= 0) {
                                            actionPassed = who.GeoCriteria.Type == "In";
                                        } else {
                                            actionPassed = who.GeoCriteria.Type != "In";
                                        }
                                    });
                                } else {
                                    if (who.GeoCriteria.Zip.indexOf(Connext.Utils.GetUserZipcode()) >= 0) {
                                        actionPassed = who.GeoCriteria.Type == "In";
                                    } else {
                                        actionPassed = who.GeoCriteria.Type != "In";
                                    }

                                    if (who.GeoCriteria.Type == undefined) {
                                        actionPassed = true;
                                    }
                                }
                            } catch (e) {
                                actionPassed = false;
                            }
                        }

                        if (who.JavascriptCriteria && actionPassed == true) {
                            //We have a 'Javascript' criteria and 'actionPassed' is still true so we need to check this.
                            LOGGER.debug(NAME, fnName, "Checking Javscript");
                            try {
                                var varValue = who.JavascriptCriteria.Eval;
                                var jsValue = eval(varValue);
                                if (Object.prototype.toString.call(jsValue) == "[object Array]") {
                                    jsValue = jsValue.map(function (item) {
                                        return item.trim().toLowerCase();
                                    });
                                    if (who.JavascriptCriteria.Qualifier == "In" ||
                                        who.JavascriptCriteria.Qualifier == "NotIn") {
                                        if (jsValue.indexOf(who.JavascriptCriteria.Val.toLowerCase()) >= 0) {
                                            actionPassed = who.JavascriptCriteria.Qualifier == "In";
                                        } else {
                                            actionPassed = who.JavascriptCriteria.Qualifier == "NotIn";
                                        }
                                    } else {
                                        actionPassed = who.JavascriptCriteria.Qualifier == "==";
                                    }
                                } else {
                                    if (jsValue != undefined && jsValue != "") {
                                        jsValue = jsValue.toString().toLowerCase();
                                    }

                                    if (who.JavascriptCriteria.Qualifier == "In" ||
                                        who.JavascriptCriteria.Qualifier == "NotIn") {
                                        if (jsValue == undefined) {
                                            actionPassed = who.JavascriptCriteria.Qualifier == "NotIn";
                                        } else {
                                            var array = jsValue.split(/[,;]/g);
                                            if (array.indexOf(who.JavascriptCriteria.Val.toLowerCase()) >= 0) {
                                                actionPassed = who.JavascriptCriteria.Qualifier == "In";
                                            } else {
                                                actionPassed = who.JavascriptCriteria.Qualifier == "NotIn";
                                            }
                                        }
                                    } else {
                                        if (Connext.Utils
                                            .JSEvaluate(jsValue,
                                                who.JavascriptCriteria.Qualifier,
                                                who.JavascriptCriteria.Val.toLowerCase(),
                                                "JavascriptCriteria")) {
                                            //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                        } else {
                                            //this failed, so set actionPassed to false;
                                            actionPassed = false;
                                        }
                                    }
                                }
                            } catch (e) {
                                LOGGER.debug(NAME, fnName, "Error evaluating javascript criteria.");
                                actionPassed = false; //the eval through an exception so this action doesn't pass.
                            }
                        }

                        if (who.ScreenSizeCriteria && actionPassed == true) {
                            //We have a 'ScreenSize' criteria and 'actionPassed' is still true so we need to check this.
                            LOGGER.debug(NAME, fnName, "Checking Screen Size", who.ScreenSizeCriteria);

                            if (Connext.Utils.JSEvaluate(Connext.Utils.getDeviceType(),
                                    who.ScreenSizeCriteria.Qualifier,
                                    who.ScreenSizeCriteria.Value,
                                    "ScreenSizeCriteria",
                                    "string")) {
                                //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                            } else {
                                //this failed, so set actionPassed to false;
                                actionPassed = false;
                            }
                        }

                        if (who.UrlCriteria && actionPassed == true) {
                            LOGGER.debug(NAME, fnName, "Checking Url params", who.UrlCriteria);

                            if (Connext.Utils.JSEvaluate(Connext.Utils.getUrlParam(who.UrlCriteria.Eval),
                                    who.UrlCriteria.Qualifier,
                                    who.UrlCriteria.Value,
                                    "UrlCriteria")) {
                                //keep actionPassed in true state
                            } else {
                                //this failed, so set actionPassed to false;
                                actionPassed = false;
                            }
                        }

                        if (who.SubDomainCriteria && actionPassed == true) {
                            LOGGER.debug(NAME, fnName, "Checking Sub-domain", who.SubDomainCriteria);

                            var searchingVal = who.SubDomainCriteria.Value.toUpperCase();
                            var sourceVal = window.location.hostname.toUpperCase();
                            // root domain won't be included
                            var qualifier = who.SubDomainCriteria.Qualifier.toUpperCase();
                            if ((qualifier == "==") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1)) {
                                actionPassed = false;
                            }
                        }

                        if (who.MetaKeywordCriteria && actionPassed == true) {
                            LOGGER.debug(NAME, fnName, "Checking meta keyword", who.MetaKeywordCriteria);

                            var metaArray = Connext.Utils.getMetaTagsWithKeywords();
                            var evalResult = false;
                            var regExpStr = "\\b" + who.MetaKeywordCriteria.Value + "\\b";
                            var regExp = new RegExp(regExpStr);

                            for (var i = 0; i < metaArray.length; i++) {
                                if (regExp.test(metaArray[i].content)) {
                                    LOGGER.debug(NAME, fnName, "Found keyword", who.MetaKeywordCriteria.Value);
                                    evalResult = true;
                                    break;
                                }
                            }

                            if (evalResult && who.MetaKeywordCriteria.Qualifier == "!=") {
                                actionPassed = false;
                            }

                            if (!evalResult) {
                                actionPassed = who.MetaKeywordCriteria.Qualifier == "!=" ? true : false;
                            }
                        }

                        if (who.UserStateCriteria && actionPassed == true) {
                            LOGGER.debug(NAME, fnName, "Checking user state", who.UserStateCriteria);

                            var userState = Connext.User.getUserState();
                            if (!userState) {
                                userState = "Logged Out";
                            }
                            if (!Connext.Utils.JSEvaluate(userState, "==", who.UserStateCriteria.Value)) {
                                actionPassed = false;
                            }
                        }
                            if (who.AdBlockCriteria && actionPassed == true) {
                                LOGGER.debug(NAME, fnName, "Checking ad block state", who.AdBlockCriteria);
                                console.log("AdBlockCriteria", who.AdBlockCriteria)

                                var hasAdBlock = Connext.Utils.detectAdBlock();

                                if (hasAdBlock && who.AdBlockCriteria.Value == "Detected") {
                                    actionPassed = true;
                                } else if (!hasAdBlock && who.AdBlockCriteria.Value == "Not Detected") {
                                    actionPassed = true;
                                } else {
                                    actionPassed = false;
                                }
                            }
                        

                    } catch (ex) {
                        actionPassed = false;
                        console.error(NAME, fnName, "EXCEPTION", ex);
                    }

                    //we are done with this action check
                    if (actionPassed) {
                        //if 'actionPassed' is still true, then we should execute this action.
                        LOGGER.debug(NAME, fnName, "===== ACTION PASSED =====", val);

                        if (val.ActionTypeId == 3) {
                            //this is a paywall action, so set 'paywallActionFound' to true, so future action checks will skip paywalls.
                            paywallActionFound = true;
                        }

                        actions.push(val); //this action has passed all criteria, so add it to the actions array.

                    } else {
                        LOGGER.debug(NAME, fnName, "%%%%% ACTION FAILED %%%%%", val);
                    }
                }
  
                
                    //This sets the paywall limit for this conversation. We don't care if this action actually passed all criteria, we only care if this conversation does not have a paywallLimit set yet.
            
            });
                

            return actions;
            

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };
    //#endregion ACTION FUNCTIONS

    //#region STORAGE FUNCTIONS

    var getStoredConversationByMeterLevel = function (meterlevel) {
        /// <summary>Checks if we have a stored conversation based on this meter level.</summary>
        /// <param name="meterlevel" type="Int">MeterLevel</param>
        /// <returns type="Object|Null">Conversation Object or Null if no convo is found</returns>
        var fnName = "getStoredConversationByMeterLevel";
        try {
            LOGGER.debug(NAME, fnName, "meterLevel", meterlevel);

            var foundConvo = null; //set default to null, since we return this variable regardless of the checks below.

            var currentConversations = Connext.Storage.GetCurrentConversations();
            LOGGER.debug(NAME, fnName, "currentConversations", currentConversations);


            if (currentConversations) {
                //we have stored conversations, check if we have one at this meterLevel
                foundConvo = currentConversations[meterlevel];
            } else {
                //we already set default to null, so do nothing
            }

            return foundConvo;

            //var allConversations = Connext.Storage.GetLocalConfiguration().Campaign.Conversations;
            //LOGGER.debug(NAME, fnName, 'allConversations', allConversations);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return false;
        }
    };

    var getAllConversationsByMeterLevel = function (meterlevel) {
        /// <summary>This returns all conversations by MeterLevel stored in the configuration setting (this is different than any stored current conversations).</summary>
        /// <param name="meterlevel" type="Int">MeterLevel</param>
        /// <returns type="Object|Null">Conversation Object or Null if no convo is found</returns>
        var fnName = "getAllConversationsMeterLevel";
        try {
            LOGGER.debug(NAME, fnName, "meterLevel", meterlevel);
            return Connext.Storage.GetCampaignData().Conversations[meterlevel];
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return false;
        }
    };

    var saveCurrentConversation = function () {
        /// <summary>This uses the global variables to save this current conversation into the correct local storage object. This should get called anytime we change the CURRENT_CONVERSATION so on next page load we have this new data.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "saveCurrentConversation";
        try {
            //LOGGER.debug(pName, fnName);
            //get all current conversations
            var allcurrentConversations = Connext.Storage.GetCurrentConversations();
            //set the object with this meterlevel to the current conversation.
            allcurrentConversations[METER_LEVEL] = CURRENT_CONVERSATION;
            //re-set the entire conversations.current object back to local storage.
            $.jStorage.set(Connext.Common.StorageKeys.conversations.current, allcurrentConversations);
            //Connext.Storage.GetCurrentConversations()[METER_LEVEL];
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion STORAGE FUNCTIONS

    //#region HELPERS

    var setDefaultConversationProps = function () {
        /// <summary>This sets default props for a new conversation</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "setDefaultConversationProps";
        try {
            //LOGGER.debug(pName, fnName);
            var now = Connext.Utils.Now(); //this sets current date/time (based on if we are debugging/manually setting time or using the real time.

            //set the date started.
            CURRENT_CONVERSATION.Props.Date.started = now;

            if (CURRENT_CONVERSATION.Options.Expirations.Time) {
                switch (CURRENT_CONVERSATION.Options.Expirations.Time.key) {
                    case "m": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setMinutes(now.getMinutes() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "h": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setHours(now.getHours() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "d": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setDate(now.getDate() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "w": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setDate(now.getDate() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val)*7)); break;
                    case "M": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setMonth(now.getMonth() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "y": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setFullYear(now.getFullYear() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                }
            } else {
                LOGGER.debug(fnName, "No expiration time set for this conversation.");
            }

            //we've updated necessary properties, save this conversation
            saveCurrentConversation();
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var handleArticleView = function () {
        /// <summary>This is called before we determine conversation actions. It's main function is to update the 'view' count for this conversation as well as add this article to the array of viewed articles.</summary>
        /// <param name="" type=""></param>
        /// <returns>Nothing, this is just updating info in the CURRENT_CONVERSATION object.</returns>
        var fnName = "handleArticleView";
        try {
            LOGGER.debug(NAME, fnName);

            if ($.jStorage.get("uniqueArticles") || !Connext.GetOptions().debug) {
                //we are enforcing unique articles. So we need to check if this article has already been viewed for this user.

                //this function will check if this article has been viewed. If it has not it will handle adding this article to the viewed article array as well as updating this conversations view count.
                hasArticleBeenViewed();
            } else {
                //we are not enforicing unique article counts, so we just add to the view count, no need to add this article to the viewed article array.
                Connext.Storage.UpdateViewedArticles(CURRENT_CONVERSATION.id);
                updateArticleViewCount();
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var hasArticleBeenViewed = function () {
        /// <summary>This checks if this article has already been viewed by this user.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "hasArticleBeenViewed";
        try {
            //LOGGER.debug(pName, fnName);

            //Get all the stored viewed articles 
            if (_.contains(Connext.Storage.GetViewedArticles(CURRENT_CONVERSATION.id), Connext.Utils.GetUrl())) {
                //we have already viewed this article.
                LOGGER.debug(NAME, fnName, "Article already viewed");
            } else {
                //article has not been viewed.
                LOGGER.debug(NAME, fnName, "Article HAS NOT been viewed");

                //update viewed article array with this url.
                Connext.Storage.UpdateViewedArticles(CURRENT_CONVERSATION.id);
                updateArticleViewCount();
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var updateArticleViewCount = function (count) {
        /// <summary>This will update the current conversations viewed count.</summary>
        /// <param name="count" type="Integer">Optional: If this is set we set the number of views to this, if not we just increment current value</param>
        /// <returns>None</returns>
        var fnName = "updateArticleViewCount";

        try {
            LOGGER.debug(NAME, fnName);
            if (_.isNumber(arguments[0])) {
                //we have an argument so we should set to this number
                CURRENT_CONVERSATION.Props.views = count;

            } else {
                //else we should increment view by 1

                CURRENT_CONVERSATION.Props.views = getCurrentConversationViewCount();
            }
            //save changes.
            saveCurrentConversation();
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var getCurrentConversationViewCount = function () {
        var fnName = "getCurrentConversationViewCount";
        try {
            if ($.jStorage.get("uniqueArticles") || !Connext.GetOptions().debug) {
                var uniqueArticles = _.uniq(Connext.Storage.GetViewedArticles(CURRENT_CONVERSATION.id));
                return uniqueArticles.length;
            } else {
                return Connext.Storage.GetViewedArticles(CURRENT_CONVERSATION.id).length;
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //#endregion HELPERS

    return {
        init: function (configSettings) {
            LOGGER = Connext.Logger;
            CONFIG_SETTINGS = configSettings;
            LOGGER.debug(NAME, "Campaign.Init");
        },
        ProcessCampaign: function (meterLevel, campaign) {
            return processCampaign(meterLevel, campaign);
        },
        GetCurrentConversationProps: function () { //returns the current conversations Props object
            try {
                return CURRENT_CONVERSATION.Props;
            } catch (e) {
                console.error(NAME, "GetCurrentConversationProps.Exception", e);
                return null;
            }
            //return getCurrentConversationViewCount();
        },
        GetCurrentConversation: function () {
            return CURRENT_CONVERSATION;
        },
        GetCurrentConversationViewCount: function () {
            return getCurrentConversationViewCount();
        },
        EventCompleted: function () {
            var fnName = "EventCompleted";
            try {
                //LOGGER.debug(NAME, fnName, 'event', event);

            } catch (e) {
                console.error(NAME, fnName, "<<EXCEPTION>>", e);
            }

        }
        //,
        //SaveCurrentConversation: function () {
        //    saveCurrentConversation();
        //}
    };

};

/// <reference path="Action.js" />
var ConnextAction = function ($) {

    //region GLOBALS

    var NAME = "Action"; //base name for logging.
    //create local reference to logger
    var LOGGER;
    var DEFAULT_ACTION_ID = "ConneXt_Action_Id-";
    var CONTENT_SELECTOR; //holds reference to the selector used to hide the content (when it is hidden because of the paywall, so this is not set until we hide the content).  This is so we can call our public method 'ShowContent', allowing the client to show the content.
    var MASKING_METHOD; //holds refernce to the method we used to hide the content. This is so the public 'ShowContent' method can reveal the content the same way it was hidden.
    var CLOSE_CASES = {
        CloseButton: "closeButton",
        CloseSpan: "closeSpan",
        ClickOutside: "clickOutside",
        EscButton: "escButton"
    };
    var FlittzButton = "[data-fz-btn=smartAuth]";
    var ORIGINAL_CONTENT;
    //endregion GLOBALS

    //#region FUNCTIONS

    var processActions = function (actions) {
        var fnName = "processActions";
        try {
            LOGGER.debug(NAME, fnName, actions);
            $.each(actions, function (key, action) {
                LOGGER.debug(NAME, fnName, "Actions.EACH", key, action);
                if (action.What.Html) {
                    setupAction(action);
                } else {
                    LOGGER.debug(NAME, fnName, "ACTION has no html");
                }
            });

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };


    var setupAction = function (action) {
        /// <summary>handles setting up the action based on type (adds to DOM, configures etc....)</summary>
        /// <param name="_Action" type="Object">action object which holds all info needed to either show or execute this action.</param>
        /// <returns>None</returns>
        var fnName = "handleAction";
        try {
            LOGGER.debug(NAME, fnName, "action", action);

            var actionHtml = action.What.Html.trim(); //set html from action.What.Html prop.
            actionHtml = handleDynamicHtml(actionHtml);
            actionHtml = $(actionHtml).prop("id", DEFAULT_ACTION_ID + action.id);
            console.info("ACTION HTML", actionHtml);
            $(actionHtml).addClass("hide");
            $("body").append(actionHtml);

            registerActionEvents(action);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var executeAction = function (action) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "executeAction";
        var e;
        try {
            LOGGER.debug(NAME, fnName, action);
            var $action = $("#" + DEFAULT_ACTION_ID + action.id);
            $action.removeClass("hide");
            //gets the jqueried html for this action (the action, regardless of type was already added to the DOM in the 'setupAction' function, so we are grabbing the html for this action since we need to 'execute' it (show it).

            if (action.What.Type == "1") {
                //var $banner = $('#' + DEFAULT_ACTION_ID + action.id);

                //set bannerLocation to stored value if it exists, if not set it to top (we do this in case there are template not stored correctly...really just needed since templates were created before option to place them was introduced in Admin).
                var bannerLocation = (action.What.Location) ? action.What.Location : "top";

                //add .affix class just in case it is not stored in template and then add appropriate class for location
                if (action.What.Stickyness === "sticky") {
                    $action.addClass("affix sticky-" + bannerLocation + " banner-sticky");
                } else {
                    $action.addClass("affix sticky-" + bannerLocation).affix({
                        offset: 15
                    });
                }

                var animation = {};
                animation[bannerLocation] = "0px";

                //we need to set the intial location to a big negative and then remove the hide class.  
                //this will allow us to determine the actual height of the banner (calling height() or outerHeight() will return 0 if element is hidden).
                $action.css(bannerLocation, "-2500px").removeClass("hide");

                var height = $action.outerHeight();

                //we can now animate the banner in (notice we set the location to a negative of the height we just figured out. This will allow for a smooth animation for all banner heights.
                $action.css(bannerLocation, "-" + height + "px").animate(animation, function () {
                    //console.log('animation finished');
                });
            }

            if (action.What.Type === "2") {
                $action.addClass("in");
                $action.connextmodal({ backdrop: "true" });
                $action.resize();
                $action.css("display", "block");
                if (action.What["Transparent backdrop"] == "True" || action.What["Transparent backdrop"] == "true") {
                    $(".modal-backdrop.fade.in").addClass("transparent");
                } else {
                    $(".modal-backdrop.fade.in").removeClass("transparent");
                }
                $($action)
                    .on("hidden",
                    function () {
                        if (action.closeEvent === null || action.closeEvent === undefined) {
                            action.closeEvent = CLOSE_CASES.EscButton;
                            action.actionDom = $action;
                            window.Connext.Event.fire("onActionClosed", action);
                        }
                    });
                //$(actionHtml).prop('id', DEFAULT_ACTION_ID + action.id);
            }
            var parentWidth;
            var selectorFragment;
            if (action.What.Type === "3") { //this is a 'Paywall'
                //a paywall can be either a 'modal' or 'inline', check the data-display-type property.
                var displayType = $action.data("display-type");
                LOGGER.debug(NAME, fnName, "displayType", displayType);

                if (displayType == "inline") { //this is an inline paywall.
                    //we first hide the content (since hideContent will handle storing full HTML and trims content (preview text).
                    hideContent(action);

                    //now that the content is hidden, we can append the inline html.
                    //var $html = $($action.wrapAll('<div>').parent().html()); //since we append all action html to the 'body', we need to grab wrap it in a blank div and then grab the parent html (since we wrapped it in a blank div when we call parent.html we are getting the full div from the database with all it's properties (if we just called $action.html() we would only get the content html).
                    //console.log('html', $html);

                    //we now need to remove the original $action html from the DOM since it was added to the end of the body and a 'copy' of it has been placed in the appropriate location.
                    $action.remove();
                    parentWidth = $(CONTENT_SELECTOR).width();
                    selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00"; // take just first digit of width value and add '00' to get 600 from 654px for example 
                    $action.addClass("Mg2-inline-scale-" + selectorFragment); // now we add class depending on parent width, for example Mg2-inline-600 if parent width is between 600 and 700px


                    //we append the inline html to the 'CONTENT_SELECTOR'. Since 'hideContent' handles any preview text and we use 'append' our inline paywall will appear after any 'preview' settings in the admin.
                    $(CONTENT_SELECTOR).append($action);

                    //finally remove the 'hide' class from the html so it is visible to the user.
                    //$html.removeClass('hide');

                    $(window, CONTENT_SELECTOR).resize(function () {

                        var parentWidth = $(CONTENT_SELECTOR).width(),
                            selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                            classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");
                        $action.attr("class", classList);
                        $action.addClass("Mg2-inline-scale-" + selectorFragment);

                    });


                } else if (displayType == "modal") {
                    //this is a modal, show it and hide the content.
                    //$action.addClass("in");
                    var isNotClosable = $action.hasClass('not-closable');
                    if (isNotClosable) {
                        $action.find('i.closebtn').remove();
                        $action.connextmodal({
                            backdrop: 'static',
                            keyboard: false
                        });
                    } else {
                        $action.connextmodal({ backdrop: "true" });
                    }

                    $action.resize();
                    $action.css("display", "block");
                    hideContent(action);
                    if (action.What["Transparent_backdrop_paywall"] == "True" || action.What["Transparent_backdrop_paywall"] == "true") {
                        $(".modal-backdrop.fade.in").addClass("transparent");
                    } else {
                        $(".modal-backdrop.fade.in").removeClass("transparent");
                    }
                    $($action)
                        .on("hidden",
                        function () {
                            if (action.closeEvent == null || action.closeEvent == undefined) {
                                action.closeEvent = CLOSE_CASES.EscButton;
                                action.actionDom = $action;
                                window.Connext.Event.fire("onActionClosed", action);
                            }
                        });
                } else if (displayType == "banner") {
                    //this is a banner, show it and hide the content.
                    hideContent(action);
                    //var $banner = $('#' + DEFAULT_ACTION_ID + action.id);

                    //set bannerLocation to stored value if it exists, if not set it to top (we do this in case there are template not stored correctly...really just needed since templates were created before option to place them was introduced in Admin).
                    var bannerLocation = "bottom";

                    var animation = {};
                    animation[bannerLocation] = "0px";

                    //we need to set the intial location to a big negative and then remove the hide class.  
                    //this will allow us to determine the actual height of the banner (calling height() or outerHeight() will return 0 if element is hidden).
                    $action.css(bannerLocation, "-2500px").removeClass("hide");

                    var height = $action.outerHeight();

                    //we can now animate the banner in (notice we set the location to a negative of the height we just figured out. This will allow for a smooth animation for all banner heights.
                    $action.css(bannerLocation, "-" + height + "px").animate(animation, function () {
                        //console.log('animation finished');
                    });



                } else {
                    //the action html didn't have the data-display-type property, so do nothing, just Log it.
                    LOGGER.warn(NAME, fnName, "Can't determine display type.");
                }
                $("#ConneXt_Action_Id-" + action.id)
                    .find(FlittzButton)
                    .click(function (e) {
                        action.Conversation = window.Connext.Campaign.GetCurrentConversation();
                        action.Conversation.Campaign = window.Connext.Storage.GetCampaignData();
                        action.ButtonArgs = e;
                        action.ActionDom = $action;
                        window.Connext.Event.fire("onFlittzButtonClick", action);
                    });
            }

            if (action.What.Type == "4") {
                CONTENT_SELECTOR = action.What.Selector;
                //now that the content is hidden, we can append the inline html.
                parentWidth = $(CONTENT_SELECTOR).width();
                selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00"; // take just first digit of width value and add '00' to get 600 from 654px for example 
                $action.addClass("Mg2-inline-scale-" + selectorFragment); // now we add class depending on parent width, for example Mg2-inline-600 if parent width is between 600 and 700px

                //we append the inline html to the 'CONTENT_SELECTOR'. Since 'hideContent' handles any preview text and we use 'append' our inline paywall will appear after any 'preview' settings in the admin.
                $(CONTENT_SELECTOR).append($action);

                $(window, CONTENT_SELECTOR).resize(function () {
                    var parentWidth = $(CONTENT_SELECTOR).width(),
                        selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                        classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");
                    $action.attr("class", classList);
                    $action.addClass("Mg2-inline-scale-" + selectorFragment);

                });
            }

            if (action.What.Type == "6") {//this is a 'Small Info Box'
                //a Small Info Box can be either a 'rounded' or 'squared'
                $action.removeClass("hide");
                //$action.modal({ 'backdrop': false });
                //$('.modal-scrollable').removeClass('modal-scrollable');
                //$('body').removeClass('modal-open');
            }
            if (action.What.Type == "7") {//this is a 'JS call'
                $("#ConneXt_Action_Id-" + action.id).remove();
                try {
                    if (action.What.Javascript != undefined) {
                        eval(action.What.Javascript);
                    }
                }
                catch (e) {
                    console.error(NAME, fnName, "Custom JS Call exception", e);
                }
            }
            var id = $action.attr("id");
            $("#" + id + " [data-dismiss=info-box], #" + id + " [data-dismiss=inline], #" + id + "  [data-dismiss=modal]").on("click", function () {
                console.log("mg2-connext-info-box.CLICK");
                var $btn = $(this);

                if ($btn.hasClass("closebtn")) {
                    action.closeEvent = CLOSE_CASES.CloseButton;
                }
                else if ($btn.hasClass("closeSpan")) {
                    action.closeEvent = CLOSE_CASES.CloseSpan;
                }

                $btn.closest(".Mg2-connext").addClass("hide");
                //fire close event & calculate total show time
                action.actionDom = $action;
                window.Connext.Event.fire("onActionClosed", action);
            });

            var parent = $action[0].parentNode;
            var result = false;
            for (var i = 0; i < parent.classList.length; i++) {
                if (parent.classList[i] == "modal-scrollable") {
                    result = true;
                    break;
                }
            }
            action.actionDom = $action;
            //found modal window
            if (result) {
                $(parent).on("click.modal", targetIsSelf(function () {
                    //$action.addClass("hide");
                    action.closeEvent = CLOSE_CASES.ClickOutside;
                    window.Connext.Event.fire("onActionClosed", action);
                }));
            }
            //fire show event & save start time
            window.Connext.Event.fire("onActionShown", action);
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var targetIsSelf = function (callback) {
        return function (e) {
            if (e && this === e.target) {
                return callback.apply(this, arguments);
            }
            return callback.apply(this, arguments);
        };
    };
    //#endregion FUNCTIONS



    //#region ACTION TRIGGER FUNCTIONS

    var registerActionEvents = function (action) {
        /// <summary>This takes an action object and registers any user event listeners based on this action options.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "registerActionEvents";
        try {
            LOGGER.debug(NAME, fnName, "action", action);

            if (!action.When) {
                action.When = {
                    Time: {
                        Delay: 0
                    }
                };
            }

            if (action.When && action.When.Time) {
                setTimedAction(action);
            } else if (action.When && action.When.Hover) {
                setHoverEvent(action);
            } else if (action.When && action.When.EOS) {
                SetEosEvent(action);
            } else {
                console.log(NAME, fnName, "NO ACTION TO REGISTER", action);
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var setTimedAction = function (action) {
        /// <summary>Sets action based on a time delay.</summary>
        /// <param name="action" type="Object">Action object.</param>
        /// <returns>None</returns>
        var fnName = "setTimedAction";
        try {
            //LOGGER.debug(pName, fnName);
            setTimeout(function () { //set execute action function with this action delay.
                executeAction(action);
            }, action.When.Time.Delay);
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var SetEosEvent = function (action) {
        /// <summary>Sets action based on an element on the screen.</summary>
        /// <param name="action" type="Object">Action object.</param>
        /// <returns>None</returns>
        var fnName = "setTimedAction";
        try {

            action.count = 0;

            var actionElem = "#ConneXt_Action_Id-" + action.id;
            //LOGGER.debug(NAME, fnName);
            setTimeout(function () { //set timeout before we register listening for an element on the screen based on the .Time.Delay property.
                //LOGGER.debug(NAME, fnName, 'EOS Delay Expired, listening for trigger.');
                //executeAction(action);
                $(action.When.EOS.Selector).viewportChecker({
                    // The offset of the elements (let them appear earlier or later)
                    offset: 10,
                    classToAdd: "visible-" + action.id,

                    callbackFunctionBeforeAddClass: function (elem) {
                        if (elem.hasClass("visible-" + action.id)) {
                            return;
                        }
                        var repeatable = window.Connext.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).hasClass("hide")) {
                            if (action.When.EOS.Repeatable > action.count && action.When.EOS.RepeatableConv > repeatable) {
                                if (!action.inProggress) {
                                    action.inProggress = true;
                                    executeAction(action);
                                    action.count++;
                                    action.inProggress = false;
                                    window.Connext.Storage.UpdateRepeatablesInConv(action.id);

                                }
                            }
                        }
                    },
                    callbackFunction: function (elem) {
                        $(elem).removeClass("visible" + action.id);
                    },
                    repeat: true,
                    // Set to true if your website scrolls horizontal instead of vertical.
                    scrollHorizontal: false
                });
            }, action.When.EOS.Delay);
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    //TODO: Move hover event to a seprate function so we call the same function for parent/child hover events
    //      Everything currently works, but when we start tracking hover events per-conversation it would be easier if they are separated.
    var setHoverEvent = function (action) {
        /// <summary>Sets action based on a hover.</summary>
        /// <param name="action" type="Object">Action object.</param>
        /// <returns>None</returns>
        var fnName = "setTimedAction";
        try {
            //LOGGER.debug(pName, fnName);

            var delay = (action.When.Hover.Delay) ? (action.When.Hover.Delay) : 0;

            setTimeout(function () { //set execute action function with this action delay.

                var numShown = 0,
                    actionElem = "#ConneXt_Action_Id-" + action.id;

                $(action.When.Hover.Selector).on("mouseenter", function (e) {
                    e.stopPropagation();
                    //LOGGER.info(NAME, fnName, 'onMouseOver', e, $(this));


                    //LOGGER.debug(fnName, 'Mouse Event', valid, action.When.Hover.Repeatable);
                    //since this is valid and the default is true, we check if the next run should be valid. this way we don't keep checking 
                    if (_.isNumber(parseInt(action.When.Hover.Repeatable)) && _.isNumber(parseInt(action.When.Hover.RepeatableConv))) {
                        var repeatable = Connext.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).hasClass("hide")) {
                            if (numShown < action.When.Hover.Repeatable && action.When.Hover.RepeatableConv > repeatable) {
                                executeAction(action);
                                numShown++;
                                window.Connext.Storage.UpdateRepeatablesInConv(action.id);
                            }
                        } else {
                            return false;
                        }
                    }
                    return false;
                }).children().mouseover(function () {
                    //we capturing any child hover events here. 
                    //If the hover event was from a child it will call this code first, before the parent code above.
                    //If we return false then it will cancel the parent hover event
                    if (action.When.Hover.IncludeChildren == "False") {
                        return false;
                    }
                    return false;
                });


            }, delay);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };
    //#endregion ACTION TRIGGER FUNCTIONS




    //#region HELPERS

    var hideContent = function (action) {
        /// <summary>Hides the content because we've hit the paywall. </summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "hideContent";
        try {
            //LOGGER.debug(NAME, fnName);

            MASKING_METHOD = action.What.Effect; //set the masking method.
            CONTENT_SELECTOR = action.What.Selector; //set the content we are hiding.
            var TERMINATOR = action.What.Terminator; //set the terminate string

            var allowedCharactersCount = action.What.PrevChars;
            var currentCharacterPosition = 0;
            var parent = $(CONTENT_SELECTOR)[0];
            var childs = parent.childNodes;
            ORIGINAL_CONTENT = parent.innerHTML;
            if (MASKING_METHOD) {
                calculateTagText(parent, childs);
            }
            //for flittz
            $(".flittz").removeClass("blurry-text");
            $(".flittz").removeClass("trimmed-text");
            $(".trimmed-text").remove();

            function calculateTagText(parent, childs) {

                var regExp = new RegExp(/script|style|meta/i);

                for (var i = 0; i < childs.length; i++) {
                    var child = childs[i];

                    if (currentCharacterPosition > allowedCharactersCount) {
                        var span;
                        if (MASKING_METHOD == "blur") {
                            //text element didn't have classes
                            if (!child.classList) {
                                span = document.createElement("span");
                                span.innerHTML = child.textContent;
                                span.classList.add("blurry-text");
                                mixContent(span);

                                child.parentNode.insertBefore(span, child);
                                parent.removeChild(child);
                            }
                            else {
                                child.classList.add("blurry-text");
                                mixContent(child);
                            }
                        }
                        else {
                            if (!child.classList) {
                                span = document.createElement("span");
                                span.innerHTML = child.textContent;
                                span.classList.add("trimmed-text");

                                child.parentNode.insertBefore(span, child);
                                parent.removeChild(child);
                            }
                            else {
                                child.classList.add("trimmed-text");
                            }
                        }
                    } else {

                        if (child.tagName) {

                            if (!regExp.test(child.tagName)) {
                                calculateTagText(child, child.childNodes);
                            }
                            //else just go to another child tag
                        }
                        else {
                            currentCharacterPosition += child.length;
                            if (allowedCharactersCount <= currentCharacterPosition) {

                                var excess = currentCharacterPosition - allowedCharactersCount;
                                var trimmedText = child.textContent.substr(0, child.textContent.length - excess);
                                var cutPosition = Math.min(trimmedText.length, trimmedText.lastIndexOf(" "));
                                var excludedText;
                                if (cutPosition != -1) {
                                    trimmedText = trimmedText.substr(0, cutPosition) + TERMINATOR;
                                    excludedText = child.textContent.substr(cutPosition);
                                }
                                else {
                                    excludedText = child.textContent.substr(trimmedText.length);
                                    trimmedText += TERMINATOR;
                                }
                                child.textContent = trimmedText;
                                var spanWithBlurredText = document.createElement("span");
                                spanWithBlurredText.innerHTML = excludedText;
                                spanWithBlurredText.classList.add(MASKING_METHOD == "blur" ? "blurry-text" : "trimmed-text");
                                mixContent(spanWithBlurredText);
                                parent.insertBefore(spanWithBlurredText, childs[i + 1]);

                                for (var j = i + 1; j < childs.length; j++) {
                                    child = childs[j];
                                    if (child.classList) {
                                        if (!regExp.test(child.tagName)) {
                                            child.classList
                                                .add(MASKING_METHOD == "blur" ? "blurry-text" : "trimmed-text");
                                            mixContent(child);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }
        catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var mixContent = function (item) {
        if ($(item).children().length == 0) {
            var txt = $(item).text();
            if (txt) {
                for (var i = 0; i < txt.length; i++) {
                    txt = txt.replaceAt(i, window.Connext.Utils.GetNextLetter(txt[i]));
                }
            }
            $(item).text(txt);
        } else {
            $.each($(item).children(),
                function (key, val) {
                    mixContent(val);
                });
        }
    };
    var integrateProduct = function () {
        /// <summary>Shows the previously hidden content.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "showContent";
        try {
            if (LOGGER) {
                LOGGER.debug(NAME, fnName);
            }

            $(CONTENT_SELECTOR).html(ORIGINAL_CONTENT);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };
    var getDaysToExpire = function (currentConv) {
        var now = Connext.Utils.Now(),
            daysToExpire = currentConv.Props.Date.expiration,
            diff;
        if (currentConv.Options.Expirations.Time.key == "d" || currentConv.Options.Expirations.Time.key == "w" || currentConv.Options.Expirations.Time.key == "m" || currentConv.Options.Expirations.Time.key == "y") {
            diff = parseInt((daysToExpire - now) / 86400000) + 1; //get diff in days by dividing on milliseconds
        } else diff = parseInt((daysToExpire - now) / 86400000);

        return (diff <= 0) ? 'less than 1' : diff;
    };
    var handleDynamicHtml = function (html) {
        /// <summary>Takes html and replaces any dynamic {{ }} templating with appropriate values. </summary>
        /// <param name="html" type="String">html string to process templating against.</param>
        /// <returns type="String">Html string regardless if it has been processed for dynamic content.</returns>
        var fnName = "handleDynamicHtml";
        try {
            //LOGGER.debug(pName, fnName);


            var regEx = /{{(.*?)}}/g;

            //this gets the current conversation props. We'll need some of these values to determine dynamic values below. Better to make one call here then multiple calls withing the .replace call below.
            var currentConversationProps = window.Connext.Campaign.GetCurrentConversationProps(),
                currentConversation = window.Connext.Campaign.GetCurrentConversation();

            var FixedHtml = html.replace(regEx, function (match) {
                //Right now we are only handling the FreeViewsLeft template, need to add additional template types (PaywallLimitTerm - (Day, Week, Month etc...)...)
                switch (match) {
                    case "{{FreeViewsLeft}}":
                        var viewsLeft = eval(currentConversationProps.paywallLimit - currentConversationProps.views);
                        if (parseInt(viewsLeft) < 0) { //if we are negative (passed our limit) set this to 0, instead of the - number
                            viewsLeft = 0;
                        }
                        return viewsLeft;
                    case "{{CurrentViewCount}}":
                        return currentConversationProps.views;
                    case "{{ExpireTimeLeft}}":
                        return getDaysToExpire(currentConversation);
                }
            });
            var $html = $(FixedHtml);
            var hrefs = $html.find("[href]");
            $.each(hrefs,
                function (key, value) {
                    var href = $(value).attr("href");
                    href = Connext.Utils.AddReturnUrlParamToLink(href);
                    $(value).attr("href", href);
                });
            return $html[0].outerHTML; // returning html regardless.
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return html; // returning html regardless.
        }
    };


    var initListeners = function () {

        $("body")
            .on("click",
            "[data-mg2-action=click],[data-mg2-action=login],[data-mg2-action=submit], [data-mg2-action=Zipcode]",
            function (e) {
                window.Connext.Event.fire("onButtonClick", e);
            });

    };

    //#endregion HELPERS

    return {
        init: function () {
            LOGGER = Connext.Logger;
            LOGGER.debug(NAME, "Action.Init");
            initListeners();
        },
        ProcessActions: function (actions) {
            return processActions(actions);
        },
        IntegrateProduct: function () {
            integrateProduct();
        }
    };

};

var Connext = function ($) {
    var VERSION = "1.6.2";
    var CONFIGURATION = null;
    var NAME = "Core";
    var LOGGER; //local reference to Connext.LOGGER
    var PROCESSTIME = {}; //holds properties for testing application speed.
    var isProcessed = false;
    var OPTIONS; //global OPTIONS variable. This will be merge/extended between default options and passed in options.
    var DEFAULT_OPTIONS = {
        debug: true,
        silentmode: false,
        integrateFlittz: false,
        environment: null, //this is used for the base s3 bucket, defaults to production, which means we need to set in all text/dev environments.
        settingsKey: null, //we'll get system settigs from db by this key in API project. For example: different accout URLs for Bang and Lang
        paperCode: null, //we'll get system settigs from db by this key in API project. For example: different accout URLs for Bang and Lang
        configSettings: { //these are config level settings which should be merged with config settings from DB, used as backup.
            AccessRules: { SubscriberStatus: "L" },
            EnforceUniqueArticles: false ///THIS IS NOT A DB Setting, but putting it here so it will get merged with the Configuration object and saved. This way i can look for this instead of a cookie setting. It also provides the option to put this in the Admin as an option in the future without updating the code.
        },
        loadType: "ajax" //this is how a new article is loaded. If this is set to 'ajax' then we need to remove all html that this plugin added to the dom so there isn't duplicates.       
    };

    var init = function () {
        /// <summary>Instantite the plugin.</summary>
        /// <param>Nothing</param>
        /// <returns>Nothing</returns>
        try {
            var fnName = "init";
            PROCESSTIME.PluginStartTime = new Date();
            LOGGER = Connext.Logger;
            LOGGER.debug(fnName, "Initializing Connext...");
            initAdBlockElement();
            getZipCode(checkRequirements);
        } catch (e) {
            console.log("Core.Init <<EXCEPTION>>", e);
        }

    };

    function initAdBlockElement() {
        var testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox";
        testAd.id = "TestAdBlock";
        testAd.style.position = "absolute";
        testAd.style.bottom = "-100px";
        testAd.style.zIndex = "-1";
        document.body.appendChild(testAd);
    }

    var closeAllTemplates = function (callback) {
        var fnName = "closeAllTemplates";
        LOGGER.debug(fnName, "Close all Connext Templates");
        $(".Mg2-connext[data-display-type=inline]").addClass("hide");  //close inlines
        $(".Mg2-connext[data-display-type=info-box]").addClass("hide");    //close inlines
        $(".Mg2-connext[data-display-type=banner]").addClass("hide");  //close inlines

        var modals = $(".Mg2-connext.modal:visible");
        var listeners = modals.length;
        console.log("numbers of the modals", modals.length);

        if (modals.length > 0) {

            modals.each(function (index, element) {
                $(element).on("hidden.bs.modal", function () {
                    $(this).off("hidden.bs.modal");

                    listeners--;

                    if (callback && listeners === 0) {
                        callback();
                    }
                });

                $(element).connextmodal("hide");
            });

        } else {
            if (callback) {
                callback();
            }
        }
    };

    var IntegrateProduct = function () {
        var fnName = "IntegrateProduct";
        LOGGER.debug(fnName, "Show article content");
        $(".blurry-text").removeClass("blurry-text");  //delete blur class
        $(".trimmed-text").removeClass("trimmed-text");     //show trimmed text
        Connext.Action.IntegrateProduct();
    };

    var getZipCode = function (callback) {
        var fnName = "getZipCode";
        function setZipCode(zipCode) {
            $.jStorage.set("CustomZip", zipCode);
        }
        try {
            LOGGER.debug(NAME, fnName);
            if ($.jStorage.get("CustomZip")) {
                if (callback) callback();
            } else {
                $.ajax({
                    url: Connext.Common.IPInfo,
                    type: "GET",
                    success: function (data) {

                        if (data.zip_code) {
                            setZipCode(data.zip_code);
                        } else {
                            setZipCode("00000");
                        }
                        if (callback) callback();
                    },
                    error: function () {
                        console.log("ZIPERROR, SETTING DEFAULT ZIP");
                        setZipCode("00000");
                        if (callback) callback();
                    }
                });
            }
        } catch (e) {
            LOGGER.exception(NAME, fnName, e);
        }
    };
    var checkRequirements = function () {
        /// <summary>Checks for required user init settings as well as any required libraries.</summary>
        /// <param>None</param>
        /// <returns>None</returns>
        var fnName = "checkRequirements";
        try {
            LOGGER.debug(NAME, fnName);

            //check if we have jquery.
            if (!window.jQuery) {
                throw "Jquery not loaded";
            }

            //we have jquery so extend options.
            OPTIONS = $.extend(true, DEFAULT_OPTIONS, OPTIONS);

            //set loglevel
            LOGGER.setDebug(OPTIONS.debug);

            //init Utils
            Connext.Utils.init();

            if (OPTIONS.loadType == "ajax") {
                $("body").find(".mg2-Connext").remove();
                $("body").find(".debug_details").remove();
            }

            //if we are debugging then create debug panel, we do this here before checking other requirements because we can use the 'onCriticalError' event to populate the note section of this panel so the user knows of any errors.
            if (OPTIONS.debug) {
                //we are debugging, so add the debug details panel

                Connext.Utils.CreateDebugDetailPanel();

                var siteCode = Connext.Storage.GetSiteCode();
                var configCode = Connext.Storage.GetConfigCode();
                var isCustomConfiguration = Connext.Storage.GetIsCustomConfiguration();
                $("#ConnextSiteCode").val(siteCode);
                $("#ConnextConfigCode").val(configCode);
                $("#ConnextCustomConfiguration").prop("checked", isCustomConfiguration);

                if (isCustomConfiguration) {
                    //use values from localStorage
                    OPTIONS.siteCode = siteCode;
                    OPTIONS.configCode = configCode;
                }
            }


            //check if we have a SiteCode
            if (!OPTIONS.siteCode) {
                throw "No Site Code"
            }

            if (!OPTIONS.configCode) {
                throw "No Config Code"
            }
            if (!OPTIONS.silentmode) {
                //setDefaults
                setDefaults();
            }

        } catch (e) {
            LOGGER.exception(NAME, fnName, e);
        }
    };

    var reInit = function () {
        Connext.CloseTemplates(function () {
            Connext.IntegrateProduct();
            if (isProcessed) {
                processConfiguration(Connext.Storage.GetLocalConfiguration());
            } else {
                setDefaults();
            }
        });

    };
    var setDefaults = function () {
        /// <summary>Set default options based on specific attributes/properties.</summary>
        /// <param>None</param>
        /// <returns>None</returns>
        var fnName = "setDefaults";
        try {
            LOGGER.debug(NAME, fnName);
            if (OPTIONS.environment == null) {
                var hostname = location.hostname;
                for (var i = 0; i < Connext.Common.Environments.length; i++) {
                    if (hostname.indexOf(Connext.Common.Environments[i]) >= 0) {
                        OPTIONS.environment = Connext.Common.Environments[i];
                        break;
                    }
                }
            }
            if (OPTIONS.environment == null) {
                OPTIONS.environment = "prod";
            }

            //set API server options based on Common.APIUrl object.
            OPTIONS.api = Connext.Common.APIUrl[OPTIONS.environment];


            //init API
            Connext.API.init(OPTIONS);

            //init Storage
            Connext.Storage.init();

            //init Events
            Connext.Event.init(OPTIONS);

            //init MeterCalculation
            Connext.MeterCalculation.init();

            LOGGER.debug("OPTIONS.API", OPTIONS.api);

            //getConfigSettings (will check for local settings first and if none exist will attempt to get settings from database).
            //we use deferred object since we might be making an async ajax call to get data and we need to wait for that to finish.
            getConfiguration()
            .done(function (configuration) {
                //this returns ConfigSettings regardless if it is from server or from local settings.
                var fnName = "setDefaults.getConfiguration() <<DONE>>";
                LOGGER.debug(NAME, fnName, "configuration", configuration);
                if (configuration) {
                    LOGGER.debug(NAME, fnName, "CONFIGURATION FOUND", configuration);
                    //merge configuration settings with default settings (in case any required options are for some reason not set in DB)
                    configuration.Settings = $.extend(true, OPTIONS.configSettings, configuration.Settings);
                    //add the configuration.Site object to a Settings.Site object. (Site object will have things like 'RegistrationTypeId', CSSTheme (not used now, but could be used to dynamically load CSS file based on theme).
                    configuration.Settings.Site = configuration.Site;
                    CONFIGURATION = configuration;
                    //we have a configuration, init User, Campaign and Action functions with the merged configuration settings.
                    if (configuration.Settings.Active) {
                        Connext.User.init(configuration.Settings);
                        Connext.Campaign.init(configuration.Settings);
                        Connext.Action.init(configuration.Settings);
                        processConfiguration(configuration);
                    }
                } else {
                    LOGGER.error(NAME, fnName, "No Config Settings Found");
                    Connext.Event.fire("onNoConfigSettingFound", "No Config Settings Found");
                }
            })
            .fail(function (err) {
                //console.error(NAME, fnName, 'getConfigSettings.Fail', msg);
                LOGGER.error(NAME, fnName, "No Config Settings Found", "Error getting Config Settings", err);
                Connext.Event.fire("onNoConfigSettingFound", "No Config Settings Found", err);
            });

        } catch (e) {
            LOGGER.exception(NAME, fnName, e);
        }
    };

    var getConfiguration = function () {
        /// <summary>Gets the current configuration. This handles checking for locally stored settings and/or getting settings from API. Either way if config settings are avaiable they will be returned. </summary>
        /// <param>None</param>
        /// <returns>deferred object based on response.</returns>
        var fnName = "getConfiguration";

        //create deferred object
        var deferred = $.Deferred();
        //IMPORTANT: All success paths to getting configuration settings should call deferred.resolve and pass in the configSettings, regardless of how we got them.
        try {

            //gets locally stored ConfigSettings
            //var configuration = Connext.Storage.GetLocalConfiguration();
            var configuration = Connext.Storage.GetLocalConfiguration();
            var expired = new Date();
            expired.setDate(expired.getDate() + 1);
            expired = new Date(expired);
            LOGGER.debug(NAME, fnName, "localConfiguration", configuration);

            if (configuration) {
                //we have a locally stored configuration object
                LOGGER.debug(NAME, fnName, "Found Local Configuration", configuration);

                //we need to check if we have a 'LastPublishDate' cookie.
                var storedLastPublishDate = Connext.Storage.GetLastPublishDate(), customTime = Connext.Utils.ParseCustomDate($.jStorage.get("CustomTime")), normalizedLastPubDate = new Date(storedLastPublishDate);

                if (customTime) {
                    //if we set Custom Time date in Debug Panel, we need to check date of lastPublishDate and compare it with our configuration.Settings.LastPublishDate

                    //we don't have a 'storedLastPublishDate' cookie or its expired (in 24 hours period), so we need to get the LastPublishDate from S3
                    LOGGER.debug(NAME, fnName, "No 'storedLastPublishDate', getting LastPublishDate from S3");

                    Connext.API.GetLastPublishDateS3()
                        .done(function (data) {
                            LOGGER.debug(NAME, fnName, "Connext.API.GetLastPublishDateS3.Done", data);
                            //we got data back from S3. This data will be a json string with key/vals of ConfigCode: 'LastPublishDate'.
                            //we must first parse this into a json object (the 'data' arg is really just a json string).

                            try {
                                var s3data = $.parseJSON(data);
                                var s3DataConfigLastPublishDate = s3data[OPTIONS.configCode];

                                var isConfigOld = isConfigurationOld(s3data, configuration.Settings.LastPublishDate);

                                if (isConfigOld) {
                                    //config data is old, so we need to get new data from the DB

                                    //fire note for debug panel
                                    Connext.Event.fire("onDebugNote", "Current config is old.");

                                    //TODO: this is bad because we call this function here and below when we don't have a localStorage config. There are small differences, but we should create one function that handles both scenarios.
                                    getConfigurationFromServer()
                                        .done(function (newConfiguration) {
                                            LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", newConfiguration)

                                            //we now have a new (processed) configuration object.  We need to merge the current locally stored configuration with the one from the server.
                                            //this will take the newConfiguration and save it locally and merge any existing saved conversations with new data from the newConfiguration Object, while preserving appropriate data.
                                            Connext.Utils.MergeConfiguration(newConfiguration);
                                            ////this is handled in 'MergeConfiguration', might want to move it out of there and do it here
                                            Connext.Storage.SetLastPublishDate(newConfiguration.Settings.LastPublishDate, expired);
                                            if (_.isObject(s3DataConfigLastPublishDate)) {
                                                if (s3DataConfigLastPublishDate.Reset) {
                                                    Connext.Storage.ClearAllCookies();
                                                }
                                            }
                                            //resolve with configuration object.
                                            deferred.resolve(newConfiguration);

                                        }).fail(function (err) {
                                            console.error(NAME, fnName, "getConfigurationFromServer", "<<FAILS>>", err);

                                            //reject with err object.
                                            deferred.reject(err);
                                        });

                                } else {
                                    //configData is not old, so we set the lastPublishDate cookie, so we no longer check if config data is old (for this session).
                                    Connext.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);
                                    //we resolve with the locally stored configuration.
                                    deferred.resolve(configuration);
                                }

                                LOGGER.debug(NAME, fnName, "isConfigOld", isConfigOld);
                            } catch (e) {
                                console.error(NAME, fnName, "Connext.API.GetLastPublishDateS3.Done => parseJSON <<EXCEPTION>>", e);
                                //we had a problem parsing the returned data from S3, but we should still set a lastPublishDate session cookie (so we don't keep calling S3, since we know there is a problem with the {siteCode}.json file. We'll check again next session in case it was just a timeout or data problem);
                                Connext.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired); //we're just setting this to the LastPublishDate from the configuration, since we don't know the real LastPublishDate from S3.
                                //resolve deferred object with the locally stored configuration (even though we don't know if it is old or not) so we will at least still process ConneXt with the current locally stored data.
                                deferred.resolve(configuration);
                            }



                        })
                        .fail(function (data) {
                            LOGGER.debug(NAME, fnName, "Connext.API.GetLastPublishDateS3.Fail", data);
                            //Its failed but we need to get config anyway to prevent plugin crashing. So we go to DB.  TEMPORARY DO IT HERE!
                            var configuration = Connext.Storage.GetLocalConfiguration();
                            if (configuration) {
                                deferred.resolve(configuration);
                            }
                            $.jStorage.deleteKey(Connext.Common.StorageKeys.conversations.current);
                            getConfigurationFromServer()
                                .done(function (configuration) {
                                    LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", configuration)

                                    //since we just got a new configuration from the server (and it has already been processed in the getConfigurationFromServer function, we need to store this configuration locally.
                                    Connext.Storage.SetLocalConfiguration(configuration);


                                    ///////////////.... look into moving this somewhere else so it is only called once
                                    //set LastPublishDate cookie.
                                    Connext.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);

                                    //resolve with configuration object.
                                    deferred.resolve(configuration);

                                }).fail(function (err) {
                                    console.error(NAME, fnName, "getConfigurationFromServer", "<<FAILS>>", err);

                                    //reject with err object.
                                    deferred.reject(err);
                                });
                        })
                } else {
                    //config is obsolete, fetching new config from DB

                    //TODO: this is bad because we call this function here and above when we have a localStorage config, but it is old. There are small differences, but we should create one function that handles both scenarios.
                    getConfigurationFromServer()
                        .done(function (configuration) {
                            LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", configuration);

                            //we clear it to process conversations again 
                            $.jStorage.deleteKey(Connext.Common.StorageKeys.conversations.current);

                            //since we just got a new configuration from the server (and it has already been processed in the getConfigurationFromServer function, we need to store this configuration locally.
                            Connext.Storage.SetLocalConfiguration(configuration);

                            ///////////////.... look into moving this somewhere else so it is only called once
                            //set LastPublishDate cookie.
                            Connext.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);

                            //resolve with configuration object.
                            deferred.resolve(configuration);

                        }).fail(function (err) {
                            console.error(NAME, fnName, "getConfigurationFromServer", "<<FAILS>>", err);

                            //reject with err object.
                            deferred.reject(err);
                        });
                }
            }
            else {
                getConfigurationFromServer()
                  .done(function (configuration) {
                      LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", configuration);

                      //we clear it to process conversations again 
                      $.jStorage.deleteKey(Connext.Common.StorageKeys.conversations.current);

                      //since we just got a new configuration from the server (and it has already been processed in the getConfigurationFromServer function, we need to store this configuration locally.
                      Connext.Storage.SetLocalConfiguration(configuration);

                      ///////////////.... look into moving this somewhere else so it is only called once
                      //set LastPublishDate cookie.
                      Connext.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);

                      //resolve with configuration object.
                      deferred.resolve(configuration);

                  }).fail(function (err) {
                      console.error(NAME, fnName, "getConfigurationFromServer", "<<FAILS>>", err);

                      //reject with err object.
                      deferred.reject(err);
                  });
            }

        } catch (e) {
            //LOGGER.exception(NAME, fnName, e);
            console.error(NAME, fnName, "EXCEPTION", e);
            deferred.reject(e);
        }
        //return promise;
        return deferred.promise();
    };

    //#endregion INIT Functions

    //#region MAIN FUNCTIONS
    var processConfiguration = function (configuration) {
        /// <summary>Processes this configuration. This will determine meter level, conversation and all actions.</summary>
        /// <param name="configuration", type="Object">configuration object</param>
        /// <returns>Nothing</returns>
        try {
            isProcessed = true;
            var fnName = "processConfiguration";
            LOGGER.debug(NAME, fnName);
            if (!configuration) {
                configuration = CONFIGURATION;
            }
            PROCESSTIME.StartProcessingTime = new Date(); //sets start time for processing info (not dependent on getting data from API).
            //PROCESSTIME.PluginStartTime

            if (configuration.Site.SiteTheme.ThemeUrl && (configuration.Site.SiteTheme.ThemeUrl !== "default")) {
                var env = Connext.Common.CSSPluginUrl[OPTIONS.environment];
                if ($("#themeLink").length == 0) {


                    if ($("body link").length == 0)
                        $("body").append('<link href="" id ="themeLink" rel="stylesheet" type="text/css">');
                    else {
                        $('<link href="" id ="themeLink" rel="stylesheet" type="text/css">').insertAfter($("body link").last());
                    }
                }
                $("#themeLink").attr("href", env + configuration.Site.SiteTheme.ThemeUrl);
            } else if (configuration.Site.SiteTheme.ThemeUrl && configuration.Site.SiteTheme.ThemeUrl == "default") {
                $("#themeLink").remove();
            }
            Connext.Event.fire("onDynamicMeterFound", configuration.DynamicMeter.Name);
            //fireEvent that Campaign was found.
            Connext.Event.fire("onCampaignFound", configuration.Campaign);

            var meterLevel; //this is set in done or fail call below, so we can use it in the 'always' call.


            Connext.User.CheckAccess()
                       .done(function (data) {
                           LOGGER.debug(NAME, fnName, "User.CheckAccess.Done", data);
                       })
                       .fail(function () {
                           LOGGER.debug(NAME, fnName, "User.CheckAccess.Fail");
                       }).always(function () { //this is always fired, regardless if the user was authenticated. For now we only use this for the 'UserAuthTiming', but could use this for other things.
                           Connext.MeterCalculation.CalculateMeterLevel(configuration.DynamicMeter.Rules)
                                .done(function (rule) {
                                    LOGGER.debug(NAME, fnName, "Determined meter level", rule);
                                    meterLevel = rule.MeterLevelId;
                                    Connext.Event.fire("onMeterLevelSet", { method: "Dynamic", level: meterLevel, rule: rule });
                                })
                                .fail(function () {
                                    LOGGER.warn(NAME, fnName, "Failed to determined Meter Level...using default");
                                    meterLevel = configuration.Settings.DefaultMeterLevel;
                                    Connext.Event.fire("onMeterLevelSet", { method: "Default", level: meterLevel });
                                }).always(function () { //this will always be called, so this is where we check if a User has access and if we should process a campaign (we only process a campaign if a user does not have access...this will change in v1.1)
                                    LOGGER.info(NAME, fnName, "METER CALCULATION --- ALWAYS CALLED", meterLevel);
                                    Connext.Campaign.ProcessCampaign(Connext.Common.MeterLevels[meterLevel], configuration.Campaign);
                                });
                           var UserAuthTime = Connext.User.GetAuthTiming();
                           LOGGER.debug(NAME, fnName, "User.CheckAccess.Always", "UserAuthTime", UserAuthTime);

                           var EndTime = new Date().getMilliseconds();
                           var ProcessingTime = EndTime - PROCESSTIME.StartProcessingTime.getMilliseconds();
                           var TotalTime = EndTime - PROCESSTIME.PluginStartTime.getMilliseconds();
                           $("#ddProcessingTime").html(ProcessingTime + "ms");
                           $("#ddTotalProcessingTime").html(TotalTime + "ms");
                           Connext.Event.fire("onInit", null);
                       });

        } catch (e) {
            console.log("Core.Init <<EXCEPTION>>", e);
        }


    };

    //#endregion MAIN FUNCTIONS

    //#region EVENT LISTENERS


    //#endregion EVENT LISTENERS

    //#region WEBSERVICE CALLS

    var getConfigurationFromServer = function (opts) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getConfigurationFromServer";

        //create deferred object
        var deferred = $.Deferred();

        try {
            console.log(NAME, fnName);

            Connext.API.GetConfiguration({
                payload: { siteCode: OPTIONS.siteCode, configCode: OPTIONS.configCode },
                onSuccess: function (data) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    //we got results from the server, we need to process them to create a friendlier json object.
                    var processedConfiguration = Connext.Utils.ProcessConfiguration(data);
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "processedConfiguration", processedConfiguration);
                    deferred.resolve(processedConfiguration);
                },
                onNull: function () {
                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                    deferred.reject("Configuration Not Found");
                },
                onError: function (err) {
                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                    deferred.reject("Error Getting Configuration Data");
                }
            });

        } catch (e) {
            console.error(NAME, fnName, "<<EXCEPTION>>", e);
        }
        return deferred.promise();
    };

    //#endregion WEBSERVICE CALLS

    //#region HELPER FUNCTIONS

    var isConfigurationOld = function (s3Data, configurationLastPublishDate) {
        /// <summary>This checks if a configuration is old, based on a S3 .json object and the current configuration object.</summary>
        /// <param name="s3Data" type="Object">Object from S3 that has key/val of ConfigCode:LastPublishDate.</param>
        /// <param name="configurationSettings" type="String">LastPublishDate string from configuration</param>
        /// <returns type="Boolean">Returns bool depending if LastPublishDate from configuration is older or newer than the s3Data date with the current ConfigCode.</returns>
        var fnName = "isConfigurationOld";
        try {
            //LOGGER.debug(pName, fnName);

            //make sure s3Data is an object
            if (_.isObject(s3Data)) {
                //is an object, check if we have a property in this Object for the current 'configCode'

                LOGGER.debug(NAME, fnName, "s3Data", s3Data, "OPTIONS.configCode", OPTIONS.configCode);

                //gets the last publish date from s3Data based on the current OPTIONS.configCode (we'll check if this actually exists below).
                var s3DataConfigLastPublishDate = s3Data[OPTIONS.configCode];

                if (s3DataConfigLastPublishDate) {
                    var serverLastPublishDate,
                        localLastPublishDate;
                    if (_.isObject(s3DataConfigLastPublishDate)) {
                        LOGGER.log(NAME, fnName, '.json file has a configCode property and its an object', s3DataConfigLastPublishDate);
                        //we have a property from s3Data based on the currentConfigCode, so we need to handle Reset property to reset Article views.

                        //set 'moment' object so we can compare with moment
                        serverLastPublishDate = new Date(Date.parse(s3DataConfigLastPublishDate.Date));
                        serverLastPublishDate.setSeconds(serverLastPublishDate.getSeconds() - 10);
                        //set 'moment' object so we can compare with moment
                        localLastPublishDate = new Date(Date.parse(configurationLastPublishDate));

                        //we use moment 'isAfter' function to check if serverLastPublishDate is after the local date.
                        if (serverLastPublishDate > localLastPublishDate) {
                            LOGGER.debug(NAME, fnName, 'Server date is << AFTER >>');
                            return true;
                        } else {
                            LOGGER.debug(NAME, fnName, 'Server date is << NOT AFTER >>');
                            //server date is not after, which means this configuration is not old, so return false (since this function is asking if 'isConfigurationOld').
                            return false;
                        }
                    } else {
                        LOGGER.log(NAME, fnName, '.json file has a property same as this configCode', s3DataConfigLastPublishDate);
                        //we have a property from s3Data based on the currentConfigCode, so we need to test it against the current configurationLastPublishDate.

                        //set 'moment' object so we can compare with moment
                        serverLastPublishDate = new Date(Date.parse(s3DataConfigLastPublishDate));
                        serverLastPublishDate.setSeconds(serverLastPublishDate.getSeconds() - 10);
                        //set 'moment' object so we can compare with moment
                        localLastPublishDate = new Date(Date.parse(configurationLastPublishDate));

                        //we use moment 'isAfter' function to check if serverLastPublishDate is after the local date.
                        if (serverLastPublishDate > localLastPublishDate) {
                            LOGGER.debug(NAME, fnName, 'Server date is << AFTER >>');
                            return true;
                        } else {
                            LOGGER.debug(NAME, fnName, 'Server date is << NOT AFTER >>');
                            //server date is not after, which means this configuration is not old, so return false (since this function is asking if 'isConfigurationOld').
                            return false;
                        }
                        LOGGER.debug(NAME, fnName, 'Server date is << NOT AFTER >>');
                        //server date is not after, which means this configuration is not old, so return false (since this function is asking if 'isConfigurationOld').
                        return false;
                    }
                    

                } else {
                    throw "s3Data does not have the current configCode as a key";
                }

            } else {
                throw "s3Data is not an object";
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            //for all error we return true, which means the current data is old. This will force us getting new data from the server (we will still do a merge of this data, but it's safer to get new data and merge it when we have an error. Otherwise if this is because of a bug, we might never get new configuration data from the DB).
            return true;
        }
    };


    var isConfigOld = function (customTime, configurationLastPublishDate) {
        /// <summary>This checks if a configuration is old, based on a customTime on Debug Panel and the current configuration object.</summary>
        /// <param name="customTime" type="String">CustomTime date</param>
        /// <param name="configurationSettings" type="String">LastPublishDate string from configuration</param>
        /// <returns type="Boolean">Returns bool depending if LastPublishDate from configuration is older or newer than CustomTime.</returns>
        var fnName = "isConfigurationOld";
        try {
            //LOGGER.debug(pName, fnName);

            //make sure we have customTime object (typeof Date)
            if (customTime) {

                //set 'moment' object so we can compare with configurationLastPublishDate
                var customPublishDate = new Date(Date.parse(customTime));

                //set 'moment' object so we can compare with customTime
                var localLastPublishDate = new Date(Date.parse(configurationLastPublishDate));

                //we use moment 'isAfter' function to check if serverLastPublishDate is after the local config date.
                if (customPublishDate > localLastPublishDate) {
                    LOGGER.debug(NAME, fnName, "Server date is << AFTER >>");
                    return true;
                } else {
                    LOGGER.debug(NAME, fnName, "Server date is << NOT AFTER >>");
                    //server date is not after, which means this configuration is not old, so return false (since this function is asking if 'isConfigurationOld').
                    return false;
                }
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            //for all error we return true, which means the current data is old. This will force us getting new data from the server (we will still do a merge of this data, but it's safer to get new data and merge it when we have an error. Otherwise if this is because of a bug, we might never get new configuration data from the DB).
            return true;
        }
    };
    //#endregion HELPER FUNCTIONS

    return {
        //main function to initiate the module
        init: function (options) {
            OPTIONS = (options) ? options : {}; //if not options set to blank object

            init();

            return this;
        },

        ////set all other javascript classes within Connext object so we don't pollute the global scope with all of our js objects (all our js will be under Connext.)
        //most of these will pass in the jQuery $ variable. We do this because Connext passes in (jQuery) into this function which is then set to $, therefore $ is a local jQuery object and not the global one. This is necessary in case the client has set $.noConflict(true), which removes $ from the global scope.  If they do then the global $ is not available within this plugin. (CMG-Atlanta actually does this, which is how we found this out)
        Logger: ConnextLogger($), //pass in $ object for no-conflict
        MeterCalculation: ConnextMeterCalculation($),
        Campaign: ConnextCampaign($),
        Action: ConnextAction($),
        Common: ConnextCommon(),
        Utils: ConnextUtils($), //pass in $ object for no-conflict
        API: ConnextAPI($), //pass in $ object for no-conflict
        Event: ConnextEvents($), //pass in $ object for no-conflict
        Storage: ConnextStorage($),
        User: ConnextUser($),
        CloseTemplates: closeAllTemplates,
        IntegrateProduct: IntegrateProduct,
        Run: reInit,
        ReInit: reInit,
        GetOptions: function () { return OPTIONS; },
        //
        //Below are the main public methods the client will be calling, they simply route to the appropriate js class/method.
        //
        ShowContent: function () { //let's client show the hidden article text.
            Connext.Action.ShowContent();
        },
        fire: function (evt, data) {
            console.log("Connext.fire", evt, data);
            //this is the main public method the client will use to fire events inside of ConneXt.  
            //the 'evt' param will route to an appropriate method inside of ConneXt and pass in the 'data' param.
            //for example, a client would call mg2Connext.fire('onLogin', {uuid: 1234, fname: 'aaa', lname: 'bbb'}); And we would process the logging in of a user with the passed in data object.
        },
        EventCompleted: function (event) {
            Connext.Campaign.EventCompleted(event);
        },
        GetVersion: function() {
            return VERSION;
        }

        //Utils: Utils
    };

}(jQuery);

//mg2Connext.