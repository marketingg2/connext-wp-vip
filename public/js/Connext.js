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
		backdropTemplate: '<div class="connext-modal-backdrop" />'
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
					$baseBackdrop = $('<div class="connext-modal-backdrop hide" />').appendTo('body');

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
		backdropTemplate: '<div class="connext-modal-backdrop" />'
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
                if (key != 'igmRegID' && key!='igmContent') {
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
/*
    The MIT License (MIT)
    Copyright (c) 2014 Dirk Groenen
    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
*/

(function($){
    $.fn.viewportChecker = function(useroptions){
        // Define options and extend with user
        var options = {
            classToAdd: 'visible',
            classToRemove : 'invisible',
            classToAddForFullView : 'full-visible',
            removeClassAfterAnimation: false,
            offset: 100,
            repeat: false,
            invertBottomOffset: true,
            callbackFunction: function(elem, action){},
            scrollHorizontal: false,
            callbackFunctionBeforeAddClass : null,
            scrollBox: window
        };
        $.extend(options, useroptions);

        // Cache the given element and height of the browser
        var $elem = this,
            boxSize = {height: $(options.scrollBox).height(), width: $(options.scrollBox).width()};

        /*
         * Main method that checks the elements and adds or removes the class(es)
         */
        this.checkElements = function(){
            var viewportStart, viewportEnd;

            // Set some vars to check with
            if (!options.scrollHorizontal){
                viewportStart = Math.max(
                    $('html').scrollTop(),
                    $('body').scrollTop(),
                    $(window).scrollTop()
                );
                viewportEnd = (viewportStart + boxSize.height);
            }
            else{
                viewportStart = Math.max(
                    $('html').scrollLeft(),
                    $('body').scrollLeft(),
                    $(window).scrollLeft()
                );
                viewportEnd = (viewportStart + boxSize.width);
            }

            // Loop through all given dom elements
            $elem.each(function(){
                var $obj = $(this),
                    objOptions = {},
                    attrOptions = {};

                //  Get any individual attribution data
                if ($obj.data('vp-add-class'))
                    attrOptions.classToAdd = $obj.data('vp-add-class');
                if ($obj.data('vp-remove-class'))
                    attrOptions.classToRemove = $obj.data('vp-remove-class');
                if ($obj.data('vp-add-class-full-view'))
                    attrOptions.classToAddForFullView = $obj.data('vp-add-class-full-view');
                if ($obj.data('vp-keep-add-class'))
                    attrOptions.removeClassAfterAnimation = $obj.data('vp-remove-after-animation');
                if ($obj.data('vp-offset'))
                    attrOptions.offset = $obj.data('vp-offset');
                if ($obj.data('vp-repeat'))
                    attrOptions.repeat = $obj.data('vp-repeat');
                if ($obj.data('vp-scrollHorizontal'))
                    attrOptions.scrollHorizontal = $obj.data('vp-scrollHorizontal');
                if ($obj.data('vp-invertBottomOffset'))
                    attrOptions.scrollHorizontal = $obj.data('vp-invertBottomOffset');

                // Extend objOptions with data attributes and default options
                $.extend(objOptions, options);
                $.extend(objOptions, attrOptions);

                // If class already exists; quit
                if ($obj.data('vp-animated') && !objOptions.repeat){
                    return;
                }

                // Check if the offset is percentage based
                if (String(objOptions.offset).indexOf("%") > 0)
                    objOptions.offset = (parseInt(objOptions.offset) / 100) * boxSize.height;

                // Get the raw start and end positions
                var rawStart = (!objOptions.scrollHorizontal) ? $obj.offset().top : $obj.offset().left,
                    rawEnd = (!objOptions.scrollHorizontal) ? rawStart + $obj.height() : rawStart + $obj.width();

                // Add the defined offset
                var elemStart = Math.round( rawStart ) + objOptions.offset,
                    elemEnd = (!objOptions.scrollHorizontal) ? elemStart + $obj.height() : elemStart + $obj.width();

                if (objOptions.invertBottomOffset)
                    elemEnd -= (objOptions.offset * 2);

                // Add class if in viewport
                if ((elemStart < viewportEnd) && (elemEnd > viewportStart)) {
                    options.callbackFunctionBeforeAddClass($obj);
                    // Remove class
                    $obj.removeClass(objOptions.classToRemove);
                    $obj.addClass(objOptions.classToAdd);

                    // Do the callback function. Callback wil send the jQuery object as parameter
                    objOptions.callbackFunction($obj, "add");

                    // Check if full element is in view
                    if (rawEnd <= viewportEnd && rawStart >= viewportStart)
                        $obj.addClass(objOptions.classToAddForFullView);
                    else
                        $obj.removeClass(objOptions.classToAddForFullView);

                    // Set element as already animated
                    $obj.data('vp-animated', true);

                    if (objOptions.removeClassAfterAnimation) {
                        $obj.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                            $obj.removeClass(objOptions.classToAdd);
                        });
                    }

                    // Remove class if not in viewport and repeat is true
                } else if ($obj.hasClass(objOptions.classToAdd) && (objOptions.repeat)){
                    $obj.removeClass(objOptions.classToAdd + " " + objOptions.classToAddForFullView);

                    // Do the callback function.
                    objOptions.callbackFunction($obj, "remove");

                    // Remove already-animated-flag
                    $obj.data('vp-animated', false);
                }
            });

        };

        /**
         * Binding the correct event listener is still a tricky thing.
         * People have expierenced sloppy scrolling when both scroll and touch
         * events are added, but to make sure devices with both scroll and touch
         * are handles too we always have to add the window.scroll event
         *
         * @see  https://github.com/dirkgroenen/jQuery-viewport-checker/issues/25
         * @see  https://github.com/dirkgroenen/jQuery-viewport-checker/issues/27
         */

        // Select the correct events
        if( 'ontouchstart' in window || 'onmsgesturechange' in window ){
            // Device with touchscreen
            $(document).bind("touchmove MSPointerMove pointermove", this.checkElements);
        }

        // Always load on window load
        $(options.scrollBox).bind("load scroll", this.checkElements);

        // On resize change the height var
        $(window).resize(function(e){
            boxSize = {height: $(options.scrollBox).height(), width: $(options.scrollBox).width()};
            $elem.checkElements();
        });

        // trigger inital check if elements already visible
        this.checkElements();

        // Default jquery plugin behaviour
        return this;
    };
})(jQuery);

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
            img: '<img src="https://s3.amazonaws.com/mg2.paywall.dev/img/ajax-loading.gif" style="margin: 7px auto" />',
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

                if ($this[0].hasAttribute('data-mg2-submit')) {
                    $this.attr('data-mg2-submit', '');
                }
                
                if (settings.location == 'in') {
                    $this.html(img);
                }
            } catch (e) {
              
            }
        }

        this.off = function () {
            try {
                if ($this[0].hasAttribute('data-mg2-submit')) {
                    $this.attr('data-mg2-submit', 'login');
                }
               
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

!function (e, t, i) { "use strict"; "function" == typeof define && define.amd ? define(i) : "undefined" != typeof module && module.exports ? module.exports = i() : t.exports ? t.exports = i() : t[e] = i() }("Fingerprint2", this, function () {
    "use strict"; var e = function (t) { if (!(this instanceof e)) return new e(t); var i = { swfContainerId: "fingerprintjs2", swfPath: "flash/compiled/FontList.swf", detectScreenOrientation: !0, sortPluginsFor: [/palemoon/i], userDefinedFonts: [] }; this.options = this.extend(t, i), this.nativeForEach = Array.prototype.forEach, this.nativeMap = Array.prototype.map }; return e.prototype = {
        extend: function (e, t) { if (null == e) return t; for (var i in e) null != e[i] && t[i] !== e[i] && (t[i] = e[i]); return t }, get: function (e) { var t = this, i = { data: [], push: function (e) { var i = e.key, a = e.value; "function" == typeof t.options.preprocessor && (a = t.options.preprocessor(i, a)), this.data.push({ key: i, value: a }) } }; i = this.userAgentKey(i), i = this.languageKey(i), i = this.colorDepthKey(i), i = this.pixelRatioKey(i), i = this.hardwareConcurrencyKey(i), i = this.screenResolutionKey(i), i = this.availableScreenResolutionKey(i), i = this.timezoneOffsetKey(i), i = this.sessionStorageKey(i), i = this.localStorageKey(i), i = this.indexedDbKey(i), i = this.addBehaviorKey(i), i = this.openDatabaseKey(i), i = this.cpuClassKey(i), i = this.platformKey(i), i = this.doNotTrackKey(i), i = this.pluginsKey(i), i = this.canvasKey(i), i = this.webglKey(i), i = this.adBlockKey(i), i = this.hasLiedLanguagesKey(i), i = this.hasLiedResolutionKey(i), i = this.hasLiedOsKey(i), i = this.hasLiedBrowserKey(i), i = this.touchSupportKey(i), i = this.customEntropyFunction(i), this.fontsKey(i, function (i) { var a = []; t.each(i.data, function (e) { var t = e.value; "undefined" != typeof e.value.join && (t = e.value.join(";")), a.push(t) }); var r = t.x64hash128(a.join("~~~"), 31); return e(r, i.data) }) }, customEntropyFunction: function (e) { return "function" == typeof this.options.customFunction && e.push({ key: "custom", value: this.options.customFunction() }), e }, userAgentKey: function (e) { return this.options.excludeUserAgent || e.push({ key: "user_agent", value: this.getUserAgent() }), e }, getUserAgent: function () { return navigator.userAgent }, languageKey: function (e) { return this.options.excludeLanguage || e.push({ key: "language", value: navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage || "" }), e }, colorDepthKey: function (e) { return this.options.excludeColorDepth || e.push({ key: "color_depth", value: screen.colorDepth || -1 }), e }, pixelRatioKey: function (e) { return this.options.excludePixelRatio || e.push({ key: "pixel_ratio", value: this.getPixelRatio() }), e }, getPixelRatio: function () { return window.devicePixelRatio || "" }, screenResolutionKey: function (e) { return this.options.excludeScreenResolution ? e : this.getScreenResolution(e) }, getScreenResolution: function (e) { var t; return t = this.options.detectScreenOrientation && screen.height > screen.width ? [screen.height, screen.width] : [screen.width, screen.height], "undefined" != typeof t && e.push({ key: "resolution", value: t }), e }, availableScreenResolutionKey: function (e) { return this.options.excludeAvailableScreenResolution ? e : this.getAvailableScreenResolution(e) }, getAvailableScreenResolution: function (e) { var t; return screen.availWidth && screen.availHeight && (t = this.options.detectScreenOrientation ? screen.availHeight > screen.availWidth ? [screen.availHeight, screen.availWidth] : [screen.availWidth, screen.availHeight] : [screen.availHeight, screen.availWidth]), "undefined" != typeof t && e.push({ key: "available_resolution", value: t }), e }, timezoneOffsetKey: function (e) { return this.options.excludeTimezoneOffset || e.push({ key: "timezone_offset", value: (new Date).getTimezoneOffset() }), e }, sessionStorageKey: function (e) { return !this.options.excludeSessionStorage && this.hasSessionStorage() && e.push({ key: "session_storage", value: 1 }), e }, localStorageKey: function (e) { return !this.options.excludeSessionStorage && this.hasLocalStorage() && e.push({ key: "local_storage", value: 1 }), e }, indexedDbKey: function (e) { return !this.options.excludeIndexedDB && this.hasIndexedDB() && e.push({ key: "indexed_db", value: 1 }), e }, addBehaviorKey: function (e) { return document.body && !this.options.excludeAddBehavior && document.body.addBehavior && e.push({ key: "add_behavior", value: 1 }), e }, openDatabaseKey: function (e) { return !this.options.excludeOpenDatabase && window.openDatabase && e.push({ key: "open_database", value: 1 }), e }, cpuClassKey: function (e) { return this.options.excludeCpuClass || e.push({ key: "cpu_class", value: this.getNavigatorCpuClass() }), e }, platformKey: function (e) { return this.options.excludePlatform || e.push({ key: "navigator_platform", value: this.getNavigatorPlatform() }), e }, doNotTrackKey: function (e) { return this.options.excludeDoNotTrack || e.push({ key: "do_not_track", value: this.getDoNotTrack() }), e }, canvasKey: function (e) { return !this.options.excludeCanvas && this.isCanvasSupported() && e.push({ key: "canvas", value: this.getCanvasFp() }), e }, webglKey: function (e) { return this.options.excludeWebGL ? e : this.isWebGlSupported() ? (e.push({ key: "webgl", value: this.getWebglFp() }), e) : e }, adBlockKey: function (e) { return this.options.excludeAdBlock || e.push({ key: "adblock", value: this.getAdBlock() }), e }, hasLiedLanguagesKey: function (e) { return this.options.excludeHasLiedLanguages || e.push({ key: "has_lied_languages", value: this.getHasLiedLanguages() }), e }, hasLiedResolutionKey: function (e) { return this.options.excludeHasLiedResolution || e.push({ key: "has_lied_resolution", value: this.getHasLiedResolution() }), e }, hasLiedOsKey: function (e) { return this.options.excludeHasLiedOs || e.push({ key: "has_lied_os", value: this.getHasLiedOs() }), e }, hasLiedBrowserKey: function (e) { return this.options.excludeHasLiedBrowser || e.push({ key: "has_lied_browser", value: this.getHasLiedBrowser() }), e }, fontsKey: function (e, t) { return this.options.excludeJsFonts ? this.flashFontsKey(e, t) : this.jsFontsKey(e, t) }, flashFontsKey: function (e, t) { return this.options.excludeFlashFonts ? t(e) : this.hasSwfObjectLoaded() && this.hasMinFlashInstalled() ? "undefined" == typeof this.options.swfPath ? t(e) : void this.loadSwfAndDetectFonts(function (i) { e.push({ key: "swf_fonts", value: i.join(";") }), t(e) }) : t(e) }, jsFontsKey: function (e, t) { var i = this; return setTimeout(function () { var a = ["monospace", "sans-serif", "serif"], r = ["Andale Mono", "Arial", "Arial Black", "Arial Hebrew", "Arial MT", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Bitstream Vera Sans Mono", "Book Antiqua", "Bookman Old Style", "Calibri", "Cambria", "Cambria Math", "Century", "Century Gothic", "Century Schoolbook", "Comic Sans", "Comic Sans MS", "Consolas", "Courier", "Courier New", "Garamond", "Geneva", "Georgia", "Helvetica", "Helvetica Neue", "Impact", "Lucida Bright", "Lucida Calligraphy", "Lucida Console", "Lucida Fax", "LUCIDA GRANDE", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Typewriter", "Lucida Sans Unicode", "Microsoft Sans Serif", "Monaco", "Monotype Corsiva", "MS Gothic", "MS Outlook", "MS PGothic", "MS Reference Sans Serif", "MS Sans Serif", "MS Serif", "MYRIAD", "MYRIAD PRO", "Palatino", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", "Segoe UI Symbol", "Tahoma", "Times", "Times New Roman", "Times New Roman PS", "Trebuchet MS", "Verdana", "Wingdings", "Wingdings 2", "Wingdings 3"], n = ["Abadi MT Condensed Light", "Academy Engraved LET", "ADOBE CASLON PRO", "Adobe Garamond", "ADOBE GARAMOND PRO", "Agency FB", "Aharoni", "Albertus Extra Bold", "Albertus Medium", "Algerian", "Amazone BT", "American Typewriter", "American Typewriter Condensed", "AmerType Md BT", "Andalus", "Angsana New", "AngsanaUPC", "Antique Olive", "Aparajita", "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Arabic Typesetting", "ARCHER", "ARNO PRO", "Arrus BT", "Aurora Cn BT", "AvantGarde Bk BT", "AvantGarde Md BT", "AVENIR", "Ayuthaya", "Bandy", "Bangla Sangam MN", "Bank Gothic", "BankGothic Md BT", "Baskerville", "Baskerville Old Face", "Batang", "BatangChe", "Bauer Bodoni", "Bauhaus 93", "Bazooka", "Bell MT", "Bembo", "Benguiat Bk BT", "Berlin Sans FB", "Berlin Sans FB Demi", "Bernard MT Condensed", "BernhardFashion BT", "BernhardMod BT", "Big Caslon", "BinnerD", "Blackadder ITC", "BlairMdITC TT", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bodoni MT", "Bodoni MT Black", "Bodoni MT Condensed", "Bodoni MT Poster Compressed", "Bookshelf Symbol 7", "Boulder", "Bradley Hand", "Bradley Hand ITC", "Bremen Bd BT", "Britannic Bold", "Broadway", "Browallia New", "BrowalliaUPC", "Brush Script MT", "Californian FB", "Calisto MT", "Calligrapher", "Candara", "CaslonOpnface BT", "Castellar", "Centaur", "Cezanne", "CG Omega", "CG Times", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charlesworth", "Charter Bd BT", "Charter BT", "Chaucer", "ChelthmITC Bk BT", "Chiller", "Clarendon", "Clarendon Condensed", "CloisterBlack BT", "Cochin", "Colonna MT", "Constantia", "Cooper Black", "Copperplate", "Copperplate Gothic", "Copperplate Gothic Bold", "Copperplate Gothic Light", "CopperplGoth Bd BT", "Corbel", "Cordia New", "CordiaUPC", "Cornerstone", "Coronet", "Cuckoo", "Curlz MT", "DaunPenh", "Dauphin", "David", "DB LCD Temp", "DELICIOUS", "Denmark", "DFKai-SB", "Didot", "DilleniaUPC", "DIN", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Elephant", "English 111 Vivace BT", "Engravers MT", "EngraversGothic BT", "Eras Bold ITC", "Eras Demi ITC", "Eras Light ITC", "Eras Medium ITC", "EucrosiaUPC", "Euphemia", "Euphemia UCAS", "EUROSTILE", "Exotc350 Bd BT", "FangSong", "Felix Titling", "Fixedsys", "FONTIN", "Footlight MT Light", "Forte", "FrankRuehl", "Fransiscan", "Freefrm721 Blk BT", "FreesiaUPC", "Freestyle Script", "French Script MT", "FrnkGothITC Bk BT", "Fruitger", "FRUTIGER", "Futura", "Futura Bk BT", "Futura Lt BT", "Futura Md BT", "Futura ZBlk BT", "FuturaBlack BT", "Gabriola", "Galliard BT", "Gautami", "Geeza Pro", "Geometr231 BT", "Geometr231 Hv BT", "Geometr231 Lt BT", "GeoSlab 703 Lt BT", "GeoSlab 703 XBd BT", "Gigi", "Gill Sans", "Gill Sans MT", "Gill Sans MT Condensed", "Gill Sans MT Ext Condensed Bold", "Gill Sans Ultra Bold", "Gill Sans Ultra Bold Condensed", "Gisha", "Gloucester MT Extra Condensed", "GOTHAM", "GOTHAM BOLD", "Goudy Old Style", "Goudy Stout", "GoudyHandtooled BT", "GoudyOLSt BT", "Gujarati Sangam MN", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Gurmukhi MN", "Haettenschweiler", "Harlow Solid Italic", "Harrington", "Heather", "Heiti SC", "Heiti TC", "HELV", "Herald", "High Tower Text", "Hiragino Kaku Gothic ProN", "Hiragino Mincho ProN", "Hoefler Text", "Humanst 521 Cn BT", "Humanst521 BT", "Humanst521 Lt BT", "Imprint MT Shadow", "Incised901 Bd BT", "Incised901 BT", "Incised901 Lt BT", "INCONSOLATA", "Informal Roman", "Informal011 BT", "INTERSTATE", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jazz LET", "Jenson", "Jester", "Jokerman", "Juice ITC", "Kabel Bk BT", "Kabel Ult BT", "Kailasa", "KaiTi", "Kalinga", "Kannada Sangam MN", "Kartika", "Kaufmann Bd BT", "Kaufmann BT", "Khmer UI", "KodchiangUPC", "Kokila", "Korinna BT", "Kristen ITC", "Krungthep", "Kunstler Script", "Lao UI", "Latha", "Leelawadee", "Letter Gothic", "Levenim MT", "LilyUPC", "Lithograph", "Lithograph Light", "Long Island", "Lydian BT", "Magneto", "Maiandra GD", "Malayalam Sangam MN", "Malgun Gothic", "Mangal", "Marigold", "Marion", "Marker Felt", "Market", "Marlett", "Matisse ITC", "Matura MT Script Capitals", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Minion", "Minion Pro", "Miriam", "Miriam Fixed", "Mistral", "Modern", "Modern No. 20", "Mona Lisa Solid ITC TT", "Mongolian Baiti", "MONO", "MoolBoran", "Mrs Eaves", "MS LineDraw", "MS Mincho", "MS PMincho", "MS Reference Specialty", "MS UI Gothic", "MT Extra", "MUSEO", "MV Boli", "Nadeem", "Narkisim", "NEVIS", "News Gothic", "News GothicMT", "NewsGoth BT", "Niagara Engraved", "Niagara Solid", "Noteworthy", "NSimSun", "Nyala", "OCR A Extended", "Old Century", "Old English Text MT", "Onyx", "Onyx BT", "OPTIMA", "Oriya Sangam MN", "OSAKA", "OzHandicraft BT", "Palace Script MT", "Papyrus", "Parchment", "Party LET", "Pegasus", "Perpetua", "Perpetua Titling MT", "PetitaBold", "Pickwick", "Plantagenet Cherokee", "Playbill", "PMingLiU", "PMingLiU-ExtB", "Poor Richard", "Poster", "PosterBodoni BT", "PRINCETOWN LET", "Pristina", "PTBarnum BT", "Pythagoras", "Raavi", "Rage Italic", "Ravie", "Ribbon131 Bd BT", "Rockwell", "Rockwell Condensed", "Rockwell Extra Bold", "Rod", "Roman", "Sakkal Majalla", "Santa Fe LET", "Savoye LET", "Sceptre", "Script", "Script MT Bold", "SCRIPTINA", "Serifa", "Serifa BT", "Serifa Th BT", "ShelleyVolante BT", "Sherwood", "Shonar Bangla", "Showcard Gothic", "Shruti", "Signboard", "SILKSCREEN", "SimHei", "Simplified Arabic", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Sinhala Sangam MN", "Sketch Rockwell", "Skia", "Small Fonts", "Snap ITC", "Snell Roundhand", "Socket", "Souvenir Lt BT", "Staccato222 BT", "Steamer", "Stencil", "Storybook", "Styllo", "Subway", "Swis721 BlkEx BT", "Swiss911 XCm BT", "Sylfaen", "Synchro LET", "System", "Tamil Sangam MN", "Technical", "Teletype", "Telugu Sangam MN", "Tempus Sans ITC", "Terminal", "Thonburi", "Traditional Arabic", "Trajan", "TRAJAN PRO", "Tristan", "Tubular", "Tunga", "Tw Cen MT", "Tw Cen MT Condensed", "Tw Cen MT Condensed Extra Bold", "TypoUpright BT", "Unicorn", "Univers", "Univers CE 55 Medium", "Univers Condensed", "Utsaah", "Vagabond", "Vani", "Vijaya", "Viner Hand ITC", "VisualUI", "Vivaldi", "Vladimir Script", "Vrinda", "Westminster", "WHITNEY", "Wide Latin", "ZapfEllipt BT", "ZapfHumnst BT", "ZapfHumnst Dm BT", "Zapfino", "Zurich BlkEx BT", "Zurich Ex BT", "ZWAdobeF"]; i.options.extendedJsFonts && (r = r.concat(n)), r = r.concat(i.options.userDefinedFonts); var o = "mmmmmmmmmmlli", s = "72px", l = document.getElementsByTagName("body")[0], h = document.createElement("div"), u = document.createElement("div"), c = {}, d = {}, g = function () { var e = document.createElement("span"); return e.style.position = "absolute", e.style.left = "-9999px", e.style.fontSize = s, e.style.lineHeight = "normal", e.innerHTML = o, e }, p = function (e, t) { var i = g(); return i.style.fontFamily = "'" + e + "'," + t, i }, f = function () { for (var e = [], t = 0, i = a.length; t < i; t++) { var r = g(); r.style.fontFamily = a[t], h.appendChild(r), e.push(r) } return e }, m = function () { for (var e = {}, t = 0, i = r.length; t < i; t++) { for (var n = [], o = 0, s = a.length; o < s; o++) { var l = p(r[t], a[o]); u.appendChild(l), n.push(l) } e[r[t]] = n } return e }, T = function (e) { for (var t = !1, i = 0; i < a.length; i++)if (t = e[i].offsetWidth !== c[a[i]] || e[i].offsetHeight !== d[a[i]]) return t; return t }, S = f(); l.appendChild(h); for (var x = 0, v = a.length; x < v; x++)c[a[x]] = S[x].offsetWidth, d[a[x]] = S[x].offsetHeight; var E = m(); l.appendChild(u); for (var M = [], A = 0, y = r.length; A < y; A++)T(E[r[A]]) && M.push(r[A]); l.removeChild(u), l.removeChild(h), e.push({ key: "js_fonts", value: M }), t(e) }, 1) }, pluginsKey: function (e) { return this.options.excludePlugins || (this.isIE() ? this.options.excludeIEPlugins || e.push({ key: "ie_plugins", value: this.getIEPlugins() }) : e.push({ key: "regular_plugins", value: this.getRegularPlugins() })), e }, getRegularPlugins: function () { for (var e = [], t = 0, i = navigator.plugins.length; t < i; t++)e.push(navigator.plugins[t]); return this.pluginsShouldBeSorted() && (e = e.sort(function (e, t) { return e.name > t.name ? 1 : e.name < t.name ? -1 : 0 })), this.map(e, function (e) { var t = this.map(e, function (e) { return [e.type, e.suffixes].join("~") }).join(","); return [e.name, e.description, t].join("::") }, this) }, getIEPlugins: function () { var e = []; if (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject") || "ActiveXObject" in window) { var t = ["AcroPDF.PDF", "Adodb.Stream", "AgControl.AgControl", "DevalVRXCtrl.DevalVRXCtrl.1", "MacromediaFlashPaper.MacromediaFlashPaper", "Msxml2.DOMDocument", "Msxml2.XMLHTTP", "PDF.PdfCtrl", "QuickTime.QuickTime", "QuickTimeCheckObject.QuickTimeCheck.1", "RealPlayer", "RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)", "RealVideo.RealVideo(tm) ActiveX Control (32-bit)", "Scripting.Dictionary", "SWCtl.SWCtl", "Shell.UIHelper", "ShockwaveFlash.ShockwaveFlash", "Skype.Detection", "TDCCtl.TDCCtl", "WMPlayer.OCX", "rmocx.RealPlayer G2 Control", "rmocx.RealPlayer G2 Control.1"]; e = this.map(t, function (e) { try { return new ActiveXObject(e), e } catch (t) { return null } }) } return navigator.plugins && (e = e.concat(this.getRegularPlugins())), e }, pluginsShouldBeSorted: function () { for (var e = !1, t = 0, i = this.options.sortPluginsFor.length; t < i; t++) { var a = this.options.sortPluginsFor[t]; if (navigator.userAgent.match(a)) { e = !0; break } } return e }, touchSupportKey: function (e) { return this.options.excludeTouchSupport || e.push({ key: "touch_support", value: this.getTouchSupport() }), e }, hardwareConcurrencyKey: function (e) { return this.options.excludeHardwareConcurrency || e.push({ key: "hardware_concurrency", value: this.getHardwareConcurrency() }), e }, hasSessionStorage: function () { try { return !!window.sessionStorage } catch (e) { return !0 } }, hasLocalStorage: function () { try { return !!window.localStorage } catch (e) { return !0 } }, hasIndexedDB: function () { try { return !!window.indexedDB } catch (e) { return !0 } }, getHardwareConcurrency: function () { return navigator.hardwareConcurrency ? navigator.hardwareConcurrency : "unknown" }, getNavigatorCpuClass: function () { return navigator.cpuClass ? navigator.cpuClass : "unknown" }, getNavigatorPlatform: function () { return navigator.platform ? navigator.platform : "unknown" }, getDoNotTrack: function () { return navigator.doNotTrack ? navigator.doNotTrack : navigator.msDoNotTrack ? navigator.msDoNotTrack : window.doNotTrack ? window.doNotTrack : "unknown" }, getTouchSupport: function () { var e = 0, t = !1; "undefined" != typeof navigator.maxTouchPoints ? e = navigator.maxTouchPoints : "undefined" != typeof navigator.msMaxTouchPoints && (e = navigator.msMaxTouchPoints); try { document.createEvent("TouchEvent"), t = !0 } catch (i) { } var a = "ontouchstart" in window; return [e, t, a] }, getCanvasFp: function () { var e = [], t = document.createElement("canvas"); t.width = 2e3, t.height = 200, t.style.display = "inline"; var i = t.getContext("2d"); return i.rect(0, 0, 10, 10), i.rect(2, 2, 6, 6), e.push("canvas winding:" + (i.isPointInPath(5, 5, "evenodd") === !1 ? "yes" : "no")), i.textBaseline = "alphabetic", i.fillStyle = "#f60", i.fillRect(125, 1, 62, 20), i.fillStyle = "#069", this.options.dontUseFakeFontInCanvas ? i.font = "11pt Arial" : i.font = "11pt no-real-font-123", i.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15), i.fillStyle = "rgba(102, 204, 0, 0.2)", i.font = "18pt Arial", i.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45), i.globalCompositeOperation = "multiply", i.fillStyle = "rgb(255,0,255)", i.beginPath(), i.arc(50, 50, 50, 0, 2 * Math.PI, !0), i.closePath(), i.fill(), i.fillStyle = "rgb(0,255,255)", i.beginPath(), i.arc(100, 50, 50, 0, 2 * Math.PI, !0), i.closePath(), i.fill(), i.fillStyle = "rgb(255,255,0)", i.beginPath(), i.arc(75, 100, 50, 0, 2 * Math.PI, !0), i.closePath(), i.fill(), i.fillStyle = "rgb(255,0,255)", i.arc(75, 75, 75, 0, 2 * Math.PI, !0), i.arc(75, 75, 25, 0, 2 * Math.PI, !0), i.fill("evenodd"), e.push("canvas fp:" + t.toDataURL()), e.join("~") }, getWebglFp: function () { var e, t = function (t) { return e.clearColor(0, 0, 0, 1), e.enable(e.DEPTH_TEST), e.depthFunc(e.LEQUAL), e.clear(e.COLOR_BUFFER_BIT | e.DEPTH_BUFFER_BIT), "[" + t[0] + ", " + t[1] + "]" }, i = function (e) { var t, i = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic"); return i ? (t = e.getParameter(i.MAX_TEXTURE_MAX_ANISOTROPY_EXT), 0 === t && (t = 2), t) : null }; if (e = this.getWebglCanvas(), !e) return null; var a = [], r = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}", n = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}", o = e.createBuffer(); e.bindBuffer(e.ARRAY_BUFFER, o); var s = new Float32Array([-.2, -.9, 0, .4, -.26, 0, 0, .732134444, 0]); e.bufferData(e.ARRAY_BUFFER, s, e.STATIC_DRAW), o.itemSize = 3, o.numItems = 3; var l = e.createProgram(), h = e.createShader(e.VERTEX_SHADER); e.shaderSource(h, r), e.compileShader(h); var u = e.createShader(e.FRAGMENT_SHADER); e.shaderSource(u, n), e.compileShader(u), e.attachShader(l, h), e.attachShader(l, u), e.linkProgram(l), e.useProgram(l), l.vertexPosAttrib = e.getAttribLocation(l, "attrVertex"), l.offsetUniform = e.getUniformLocation(l, "uniformOffset"), e.enableVertexAttribArray(l.vertexPosArray), e.vertexAttribPointer(l.vertexPosAttrib, o.itemSize, e.FLOAT, !1, 0, 0), e.uniform2f(l.offsetUniform, 1, 1), e.drawArrays(e.TRIANGLE_STRIP, 0, o.numItems), null != e.canvas && a.push(e.canvas.toDataURL()), a.push("extensions:" + e.getSupportedExtensions().join(";")), a.push("webgl aliased line width range:" + t(e.getParameter(e.ALIASED_LINE_WIDTH_RANGE))), a.push("webgl aliased point size range:" + t(e.getParameter(e.ALIASED_POINT_SIZE_RANGE))), a.push("webgl alpha bits:" + e.getParameter(e.ALPHA_BITS)), a.push("webgl antialiasing:" + (e.getContextAttributes().antialias ? "yes" : "no")), a.push("webgl blue bits:" + e.getParameter(e.BLUE_BITS)), a.push("webgl depth bits:" + e.getParameter(e.DEPTH_BITS)), a.push("webgl green bits:" + e.getParameter(e.GREEN_BITS)), a.push("webgl max anisotropy:" + i(e)), a.push("webgl max combined texture image units:" + e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS)), a.push("webgl max cube map texture size:" + e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE)), a.push("webgl max fragment uniform vectors:" + e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS)), a.push("webgl max render buffer size:" + e.getParameter(e.MAX_RENDERBUFFER_SIZE)), a.push("webgl max texture image units:" + e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS)), a.push("webgl max texture size:" + e.getParameter(e.MAX_TEXTURE_SIZE)), a.push("webgl max varying vectors:" + e.getParameter(e.MAX_VARYING_VECTORS)), a.push("webgl max vertex attribs:" + e.getParameter(e.MAX_VERTEX_ATTRIBS)), a.push("webgl max vertex texture image units:" + e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS)), a.push("webgl max vertex uniform vectors:" + e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS)), a.push("webgl max viewport dims:" + t(e.getParameter(e.MAX_VIEWPORT_DIMS))), a.push("webgl red bits:" + e.getParameter(e.RED_BITS)), a.push("webgl renderer:" + e.getParameter(e.RENDERER)), a.push("webgl shading language version:" + e.getParameter(e.SHADING_LANGUAGE_VERSION)), a.push("webgl stencil bits:" + e.getParameter(e.STENCIL_BITS)), a.push("webgl vendor:" + e.getParameter(e.VENDOR)), a.push("webgl version:" + e.getParameter(e.VERSION)); try { var c = e.getExtension("WEBGL_debug_renderer_info"); c && (a.push("webgl unmasked vendor:" + e.getParameter(c.UNMASKED_VENDOR_WEBGL)), a.push("webgl unmasked renderer:" + e.getParameter(c.UNMASKED_RENDERER_WEBGL))) } catch (d) { } return e.getShaderPrecisionFormat ? (a.push("webgl vertex shader high float precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision), a.push("webgl vertex shader high float precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).rangeMin), a.push("webgl vertex shader high float precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).rangeMax), a.push("webgl vertex shader medium float precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision), a.push("webgl vertex shader medium float precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).rangeMin), a.push("webgl vertex shader medium float precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).rangeMax), a.push("webgl vertex shader low float precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_FLOAT).precision), a.push("webgl vertex shader low float precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_FLOAT).rangeMin), a.push("webgl vertex shader low float precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_FLOAT).rangeMax), a.push("webgl fragment shader high float precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision), a.push("webgl fragment shader high float precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).rangeMin), a.push("webgl fragment shader high float precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).rangeMax), a.push("webgl fragment shader medium float precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision), a.push("webgl fragment shader medium float precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).rangeMin), a.push("webgl fragment shader medium float precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).rangeMax), a.push("webgl fragment shader low float precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_FLOAT).precision), a.push("webgl fragment shader low float precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_FLOAT).rangeMin), a.push("webgl fragment shader low float precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_FLOAT).rangeMax), a.push("webgl vertex shader high int precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_INT).precision), a.push("webgl vertex shader high int precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_INT).rangeMin), a.push("webgl vertex shader high int precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_INT).rangeMax), a.push("webgl vertex shader medium int precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_INT).precision), a.push("webgl vertex shader medium int precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_INT).rangeMin), a.push("webgl vertex shader medium int precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_INT).rangeMax), a.push("webgl vertex shader low int precision:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_INT).precision), a.push("webgl vertex shader low int precision rangeMin:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_INT).rangeMin), a.push("webgl vertex shader low int precision rangeMax:" + e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.LOW_INT).rangeMax), a.push("webgl fragment shader high int precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_INT).precision), a.push("webgl fragment shader high int precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_INT).rangeMin), a.push("webgl fragment shader high int precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_INT).rangeMax), a.push("webgl fragment shader medium int precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_INT).precision), a.push("webgl fragment shader medium int precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_INT).rangeMin), a.push("webgl fragment shader medium int precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_INT).rangeMax), a.push("webgl fragment shader low int precision:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_INT).precision), a.push("webgl fragment shader low int precision rangeMin:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_INT).rangeMin), a.push("webgl fragment shader low int precision rangeMax:" + e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.LOW_INT).rangeMax), a.join("~")) : a.join("~") }, getAdBlock: function () { var e = document.createElement("div"); e.innerHTML = "&nbsp;", e.className = "adsbox"; var t = !1; try { document.body.appendChild(e), t = 0 === document.getElementsByClassName("adsbox")[0].offsetHeight, document.body.removeChild(e) } catch (i) { t = !1 } return t }, getHasLiedLanguages: function () { if ("undefined" != typeof navigator.languages) try { var e = navigator.languages[0].substr(0, 2); if (e !== navigator.language.substr(0, 2)) return !0 } catch (t) { return !0 } return !1 }, getHasLiedResolution: function () { return screen.width < screen.availWidth || screen.height < screen.availHeight }, getHasLiedOs: function () { var e, t = navigator.userAgent.toLowerCase(), i = navigator.oscpu, a = navigator.platform.toLowerCase(); e = t.indexOf("windows phone") >= 0 ? "Windows Phone" : t.indexOf("win") >= 0 ? "Windows" : t.indexOf("android") >= 0 ? "Android" : t.indexOf("linux") >= 0 ? "Linux" : t.indexOf("iphone") >= 0 || t.indexOf("ipad") >= 0 ? "iOS" : t.indexOf("mac") >= 0 ? "Mac" : "Other"; var r; if (r = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0, r && "Windows Phone" !== e && "Android" !== e && "iOS" !== e && "Other" !== e) return !0; if ("undefined" != typeof i) { if (i = i.toLowerCase(), i.indexOf("win") >= 0 && "Windows" !== e && "Windows Phone" !== e) return !0; if (i.indexOf("linux") >= 0 && "Linux" !== e && "Android" !== e) return !0; if (i.indexOf("mac") >= 0 && "Mac" !== e && "iOS" !== e) return !0; if (0 === i.indexOf("win") && 0 === i.indexOf("linux") && i.indexOf("mac") >= 0 && "other" !== e) return !0 } return a.indexOf("win") >= 0 && "Windows" !== e && "Windows Phone" !== e || ((a.indexOf("linux") >= 0 || a.indexOf("android") >= 0 || a.indexOf("pike") >= 0) && "Linux" !== e && "Android" !== e || ((a.indexOf("mac") >= 0 || a.indexOf("ipad") >= 0 || a.indexOf("ipod") >= 0 || a.indexOf("iphone") >= 0) && "Mac" !== e && "iOS" !== e || (0 === a.indexOf("win") && 0 === a.indexOf("linux") && a.indexOf("mac") >= 0 && "other" !== e || "undefined" == typeof navigator.plugins && "Windows" !== e && "Windows Phone" !== e))) }, getHasLiedBrowser: function () { var e, t = navigator.userAgent.toLowerCase(), i = navigator.productSub; if (e = t.indexOf("firefox") >= 0 ? "Firefox" : t.indexOf("opera") >= 0 || t.indexOf("opr") >= 0 ? "Opera" : t.indexOf("chrome") >= 0 ? "Chrome" : t.indexOf("safari") >= 0 ? "Safari" : t.indexOf("trident") >= 0 ? "Internet Explorer" : "Other", ("Chrome" === e || "Safari" === e || "Opera" === e) && "20030107" !== i) return !0; var a = eval.toString().length; if (37 === a && "Safari" !== e && "Firefox" !== e && "Other" !== e) return !0; if (39 === a && "Internet Explorer" !== e && "Other" !== e) return !0; if (33 === a && "Chrome" !== e && "Opera" !== e && "Other" !== e) return !0; var r; try { throw "a" } catch (n) { try { n.toSource(), r = !0 } catch (o) { r = !1 } } return !(!r || "Firefox" === e || "Other" === e) }, isCanvasSupported: function () { var e = document.createElement("canvas"); return !(!e.getContext || !e.getContext("2d")) }, isWebGlSupported: function () { if (!this.isCanvasSupported()) return !1; var e, t = document.createElement("canvas"); try { e = t.getContext && (t.getContext("webgl") || t.getContext("experimental-webgl")) } catch (i) { e = !1 } return !!window.WebGLRenderingContext && !!e }, isIE: function () { return "Microsoft Internet Explorer" === navigator.appName || !("Netscape" !== navigator.appName || !/Trident/.test(navigator.userAgent)) }, hasSwfObjectLoaded: function () { return "undefined" != typeof window.swfobject }, hasMinFlashInstalled: function () { return swfobject.hasFlashPlayerVersion("9.0.0") }, addFlashDivNode: function () { var e = document.createElement("div"); e.setAttribute("id", this.options.swfContainerId), document.body.appendChild(e) }, loadSwfAndDetectFonts: function (e) { var t = "___fp_swf_loaded"; window[t] = function (t) { e(t) }; var i = this.options.swfContainerId; this.addFlashDivNode(); var a = { onReady: t }, r = { allowScriptAccess: "always", menu: "false" }; swfobject.embedSWF(this.options.swfPath, i, "1", "1", "9.0.0", !1, a, r, {}) }, getWebglCanvas: function () { var e = document.createElement("canvas"), t = null; try { t = e.getContext("webgl") || e.getContext("experimental-webgl") } catch (i) { } return t || (t = null), t }, each: function (e, t, i) { if (null !== e) if (this.nativeForEach && e.forEach === this.nativeForEach) e.forEach(t, i); else if (e.length === +e.length) { for (var a = 0, r = e.length; a < r; a++)if (t.call(i, e[a], a, e) === {}) return } else for (var n in e) if (e.hasOwnProperty(n) && t.call(i, e[n], n, e) === {}) return }, map: function (e, t, i) { var a = []; return null == e ? a : this.nativeMap && e.map === this.nativeMap ? e.map(t, i) : (this.each(e, function (e, r, n) { a[a.length] = t.call(i, e, r, n) }), a) }, x64Add: function (e, t) { e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]], t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]]; var i = [0, 0, 0, 0]; return i[3] += e[3] + t[3], i[2] += i[3] >>> 16, i[3] &= 65535, i[2] += e[2] + t[2], i[1] += i[2] >>> 16, i[2] &= 65535, i[1] += e[1] + t[1], i[0] += i[1] >>> 16, i[1] &= 65535, i[0] += e[0] + t[0], i[0] &= 65535, [i[0] << 16 | i[1], i[2] << 16 | i[3]] }, x64Multiply: function (e, t) { e = [e[0] >>> 16, 65535 & e[0], e[1] >>> 16, 65535 & e[1]], t = [t[0] >>> 16, 65535 & t[0], t[1] >>> 16, 65535 & t[1]]; var i = [0, 0, 0, 0]; return i[3] += e[3] * t[3], i[2] += i[3] >>> 16, i[3] &= 65535, i[2] += e[2] * t[3], i[1] += i[2] >>> 16, i[2] &= 65535, i[2] += e[3] * t[2], i[1] += i[2] >>> 16, i[2] &= 65535, i[1] += e[1] * t[3], i[0] += i[1] >>> 16, i[1] &= 65535, i[1] += e[2] * t[2], i[0] += i[1] >>> 16, i[1] &= 65535, i[1] += e[3] * t[1], i[0] += i[1] >>> 16, i[1] &= 65535, i[0] += e[0] * t[3] + e[1] * t[2] + e[2] * t[1] + e[3] * t[0], i[0] &= 65535, [i[0] << 16 | i[1], i[2] << 16 | i[3]] }, x64Rotl: function (e, t) { return t %= 64, 32 === t ? [e[1], e[0]] : t < 32 ? [e[0] << t | e[1] >>> 32 - t, e[1] << t | e[0] >>> 32 - t] : (t -= 32, [e[1] << t | e[0] >>> 32 - t, e[0] << t | e[1] >>> 32 - t]) }, x64LeftShift: function (e, t) { return t %= 64, 0 === t ? e : t < 32 ? [e[0] << t | e[1] >>> 32 - t, e[1] << t] : [e[1] << t - 32, 0] }, x64Xor: function (e, t) { return [e[0] ^ t[0], e[1] ^ t[1]] }, x64Fmix: function (e) { return e = this.x64Xor(e, [0, e[0] >>> 1]), e = this.x64Multiply(e, [4283543511, 3981806797]), e = this.x64Xor(e, [0, e[0] >>> 1]), e = this.x64Multiply(e, [3301882366, 444984403]), e = this.x64Xor(e, [0, e[0] >>> 1]) }, x64hash128: function (e, t) {
            e = e || "", t = t || 0; for (var i = e.length % 16, a = e.length - i, r = [0, t], n = [0, t], o = [0, 0], s = [0, 0], l = [2277735313, 289559509], h = [1291169091, 658871167], u = 0; u < a; u += 16)o = [255 & e.charCodeAt(u + 4) | (255 & e.charCodeAt(u + 5)) << 8 | (255 & e.charCodeAt(u + 6)) << 16 | (255 & e.charCodeAt(u + 7)) << 24, 255 & e.charCodeAt(u) | (255 & e.charCodeAt(u + 1)) << 8 | (255 & e.charCodeAt(u + 2)) << 16 | (255 & e.charCodeAt(u + 3)) << 24], s = [255 & e.charCodeAt(u + 12) | (255 & e.charCodeAt(u + 13)) << 8 | (255 & e.charCodeAt(u + 14)) << 16 | (255 & e.charCodeAt(u + 15)) << 24, 255 & e.charCodeAt(u + 8) | (255 & e.charCodeAt(u + 9)) << 8 | (255 & e.charCodeAt(u + 10)) << 16 | (255 & e.charCodeAt(u + 11)) << 24], o = this.x64Multiply(o, l), o = this.x64Rotl(o, 31), o = this.x64Multiply(o, h), r = this.x64Xor(r, o), r = this.x64Rotl(r, 27), r = this.x64Add(r, n), r = this.x64Add(this.x64Multiply(r, [0, 5]), [0, 1390208809]), s = this.x64Multiply(s, h), s = this.x64Rotl(s, 33), s = this.x64Multiply(s, l), n = this.x64Xor(n, s), n = this.x64Rotl(n, 31), n = this.x64Add(n, r), n = this.x64Add(this.x64Multiply(n, [0, 5]), [0, 944331445]); switch (o = [0, 0], s = [0, 0], i) { case 15: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 14)], 48)); case 14: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 13)], 40)); case 13: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 12)], 32)); case 12: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 11)], 24)); case 11: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 10)], 16)); case 10: s = this.x64Xor(s, this.x64LeftShift([0, e.charCodeAt(u + 9)], 8)); case 9: s = this.x64Xor(s, [0, e.charCodeAt(u + 8)]), s = this.x64Multiply(s, h), s = this.x64Rotl(s, 33), s = this.x64Multiply(s, l), n = this.x64Xor(n, s); case 8: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 7)], 56)); case 7: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 6)], 48)); case 6: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 5)], 40)); case 5: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 4)], 32)); case 4: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 3)], 24)); case 3: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 2)], 16)); case 2: o = this.x64Xor(o, this.x64LeftShift([0, e.charCodeAt(u + 1)], 8)); case 1: o = this.x64Xor(o, [0, e.charCodeAt(u)]), o = this.x64Multiply(o, l), o = this.x64Rotl(o, 31), o = this.x64Multiply(o, h), r = this.x64Xor(r, o) }return r = this.x64Xor(r, [0, e.length]), n = this.x64Xor(n, [0, e.length]), r = this.x64Add(r, n), n = this.x64Add(n, r), r = this.x64Fmix(r), n = this.x64Fmix(n), r = this.x64Add(r, n), n = this.x64Add(n, r), ("00000000" + (r[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (r[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (n[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (n[1] >>> 0).toString(16)).slice(-8)
        }
    }, e.VERSION = "1.5.1", e
});


// ReSharper disable once UnusedLocals
var Fprinting = function ($) {
    var removeVersionFromUserAgent = function (userAgent) {
        return userAgent.replace(/\/[0-9.]{1,}/g, '');
    }
    var defaultSettings = {
        cookieName: 'anonDeviceId',
        expireDays: 36500,
        //optionsToSkip: ['language', 'resolution', 'adblock', 'do_not_track', 'indexed_db'],
        optionsWithCustomLogic : {
            user_agent: removeVersionFromUserAgent
        }
    }

    function init () {
        var deferred = jQuery.Deferred();
        var id = getCookie(defaultSettings.cookieName);

        if (id == null || id == "") {
            if (detectDeviceType().Desktop) {
                new Fingerprint2({
                    excludeIndexedDB: true,
                    excludeLanguage: true,
                    excludeScreenResolution: true,
                    excludeAdBlock: true,
                    excludeDoNotTrack : true,
                    preprocessor: function (key, value) {
                        //if (defaultSettings.optionsToSkip.indexOf(key) > -1) {
                        //    return 'skiped';
                        //}
                        if (defaultSettings.optionsWithCustomLogic[key] != undefined) {
                            return defaultSettings.optionsWithCustomLogic[key](value);
                        }
                        return value;
                    }
                }).get(function (result, components) {
                    saveId(result);
                    deferred.resolve(result);
                });
            } else {
                var guid = generateGuid();

                saveId(guid);
                deferred.resolve(guid);
            }
        } else {
            deferred.resolve(id);
        }

        return deferred.promise();
    };

    function setCookie(cname, cvalue) {
        var d = new Date();
        d.setTime(d.getTime() + (defaultSettings.expireDays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    function saveId (id) {
        setCookie(defaultSettings.cookieName, id);
    };

    function detectDeviceType() {
        var userAgent = window.navigator.userAgent.toLowerCase(),
            device = {};

        function find(needle) {
            return userAgent.indexOf(needle) !== -1;
        };

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

        return {
            Mobile: device.mobile(),
            Tablet: device.tablet(),
            Desktop: device.desktop()
        }
    } 

    function generateGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    }

    return {
        init: init,
        getDeviceId: function () {
            return getCookie(defaultSettings.cookieName);
        }
    }
}


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
            //console.log('CnnXt.Logger.Exception =>', e);
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
            localhost: "https://mg2assetsdev.blob.core.windows.net/connext/dev/",
            dev: "https://mg2assetsdev.blob.core.windows.net/connext/dev/",
            test: "https://mg2assetsdev.blob.core.windows.net/connext/test/",
            demo: "https://prodmg2.blob.core.windows.net/connext/demo/",
            stage: "https://prodmg2.blob.core.windows.net/connext/stage/",
            test20: "https://prodmg2.blob.core.windows.net/connext/test20/",
            prod: "https://prodmg2.blob.core.windows.net/connext/prod/",
            preprod: "https://prodmg2.blob.core.windows.net/connext/preprod/"
            //test20: 'https://s3.amazonaws.com/connext.test/'
        },
        S3LastPublishDatePath: "data/last_publish/<%= siteCode %>.json",
        CSSPluginUrl: {
            localhost: "http://localhost:20001/plugin/assets/css/themes/",
            dev: "https://mg2assetsdev.blob.core.windows.net/connext/dev/1.7/themes/",
            test: "https://mg2assetsdev.blob.core.windows.net/connext/test/1.7/themes/",
            stage: "https://prodmg2.blob.core.windows.net/connext/stage/1.7/themes/",
            demo: "https://prodmg2.blob.core.windows.net/connext/demo/1.7/themes/",
            test20: 'https://prodmg2.blob.core.windows.net/connext/test20/1.7/themes/',
            prod: "https://cdn.mg2connext.com/prod/1.6/themes/",
            preprod: "https://cdn.mg2connext.com/preprod/1.6/themes/"
        },
        APIUrl: {
            localhost: "http://localhost:34550/",
            //localhost: "https://dev-connext-api.azurewebsites.net/",
            dev: "https://dev-connext-api.azurewebsites.net/",
            test: "https://test-connext-api.azurewebsites.net/",
            //stage: "http://localhost:34550/",
            stage: 'https://stage-connext-api.azurewebsites.net/',
            test20: 'https://test20-connext-api.azurewebsites.net/',
            demo: 'https://demo-connext-api.azurewebsites.net/',
            preprod: 'https://preprod-connext-api.azurewebsites.net/',
            prod: 'https://api.mg2connext.com/'
        },
        APPInsightKeys: {
            localhost: "a57959cf-5e4d-4ab3-8a3e-d17f7e2a8bf8",
            dev: "a57959cf-5e4d-4ab3-8a3e-d17f7e2a8bf8",
            test: "c35138a3-3d28-4543-9a47-b693ce4d744e",
            stage: "17780e8e-a865-44bd-a20d-4f50f5f38ddb",
            test20: "adbc9fed-bb63-4105-8904-61ade12b2006",
            preprod: "34e4d18d-cb50-44e5-88bc-f26520e5d4c3",
            demo: "e336d95f-e0ab-48a9-956e-1d79f6fd5fe8",
            prod: "1819964f-57a2-45c2-b878-c270d7e5d1d9"
        },
        Environments: ['localhost', 'dev', 'test', 'stage', 'demo', 'prod', 'test20'],
        IPInfo: window.location.protocol + '//freegeoip.net/json/',
        StorageKeys: {
            configuration: "Connext_Configuration",
            userToken: "Connext_UserToken",
            janrainUserProfile: "janrainCaptureProfileData",
            accessToken: "Connext_AccessToken",
            viewedArticles: "Connext_ViewedArticles", //holds array of viewed articles.
            lastPublishDate: "Connext_LastPublishDate",
            conversations: { //these storage keys will hold an array conversations (1 for each MeterLevel). 
                current: "Connext_CurrentConversations", //array of current conversations (1 for each MeterLevel)
                previous:
                "Connext_PreviousConversations" //array of previous conversations (1 for each MeterLevel)...not really used, but requested in case the client would want to look up data on previous conversations.
            },
            user: {
                state: "Connext_UserState",
                zipCodes: "Connext_UserZipCodes",
                data: "Connext_userData"

            },
            configurationSiteCode: 'Connext_Configuration_SiteCode',
            configurationConfigCode: 'Connext_Configuration_ConfigCode',
            configurationIsCustom: 'Connext_Configuration_isCustom',
            customZip: 'CustomZip',
            repeatablesInConv: 'repeatablesInConv',
            igmRegID: 'igmRegID',
            igmContent: 'igmContent',
            connext_user_Id: 'connext_anonymousUserId',
            WhitelistSetId: "WhitelistSetId",
            WhitelistInfobox: "WhitelistInfobox",
            connext_user_profile: "connext_user_profile",
            connext_user_data: "connext_user_data",
            connext_paywallFired: "connext_paywallFired",
            connext_auth_type: 'connext_auth_type',
            connext_viewstructure: 'connext_viewstructure',
            connext_userLastUpdateDate: 'connext_userLastUpdateDate',
            device_postfix: '_device'
        },
        MeterLevels: {
            1: "Free",
            2: "Metered",
            3: "Premium"
        },
        ConversationOptionMap: { //this maps conversation options to this parent name...this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            2: "Time",
            6: "Register",
            11: "CustomAction",
            27: "UserState",
            32: "JSVar"

        },
        ActionOptionMap: { //this maps action option values to this parent name...this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            Who: [5, 6, 14, 16, 17, 18, 19, 21, 23, 24, 25, 12], //ActionOption classes for WHO
            What: [2, 7, 13, 20, 15, 22, 26], //ActionOption classes for WHO
            When: [8, 9, 10] //ActionOption classes for WHEN
        },
        WhenClassMap: { //this maps the when options based on ClassId....this is a temp fix until we get EF in the API to return the parentOptionName instead of just the ID.
            8: "Time",
            9: "EOS",
            10: "Hover"
        },
        DefaultArticleFormat: "MMM Do, YYYY", //holds default Article format if one is not set in DB.
        QualifierMap: { //holds map to qualifiers, action options have different qualifiers (my bad design, so this is the simplest solution until the DB is updated with a single qualifier for each type)
            "==": "==", //map == to == so we don't need an 'if' statment, we just do a simple object lookup.
            "=": "==",
            "Equal": "==",
            "Equals": "==",
            "Not Equal": "!=",
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

        },
        DownloadConfigReasons: {
            noLocalConfig: "localStorage config not found",
            noLocalPublishDate: "localStorage config found, no publishDate found",
            getPublishFailed: "localStorage config found, error getting server publishFile",
            parsePublishFailed: "localStorage config found, server publishFile downloaded, error parsing",
            noConfigCodeinPublish: "localStorage config found, server publishFile downloaded and parsed, configCode not found",
            oldConfig: "localStorage config found, server publishFile downloaded and parsed, configCode found, local config is old"
        },
        AppInsightEvents: {
            APICall: 'APICall',
            LoadConnext: "LoadConnext"
        },
        RegistrationTypes: {
            1: 'MG2',
            2: 'Janrain',
            3: 'GUP',
            4: 'Auth0'
        },
        DigitalAccessLevels: {
            Premium: 'PREMIUM',
            Upgrade: 'UPGRADE',
            Purchase: 'PURCHASE'
        },
        DisplayName: 'ConneXt',
        InfinityDate: '9999-01-01',
        CookieExpireDate: '2018-02-28'
    }
};

var ConnextEvents = function ($) {

    //#region GLOBALS
    var NAME = "Events";

    var OPTIONS;

    //local reference to CnnXt.Logger
    var LOGGER;
    var MG2ACCOUNTDATA;

    //not sure if there is a better way to do this, but this holds refernces to functions we should fire on certain events. (since the passed in 'event' on 'fire' is just a string we can't check if that string is a function.
    //NOTE: DEFAULT_FUNCTIONS are only fired when debug=true, since these are mainly used for Logging or updating the Debug Details panel. (This check is handled in the 'fire' function, so we don't need to check this again within any of the default functions).
    var DEFAULT_FUNCTIONS = {
        "onMeterLevelSet": onMeterLevelSet,
        "onDynamicMeterFound": onDynamicMeterFound,
        "onCampaignFound": onCampaignFound,
        "onConversationDetermined": onConversationDetermined,
        //"onHasAccessToken": onHasAccessToken,
        "onHasAccess": onHasAccess,
        "onHasAccessNotEntitled": onHasAccessNotEntitled,
        "onHasNoActiveSubscription": onHasNoActiveSubscription,
        "onCriticalError": onCriticalError,
        //"onHasUserToken": onHasUserToken,
        //"onUserTokenSuccess": onUserTokenSuccess,
        "onAuthorized": onAuthorized,
        "onLoggedIn": onLoggedIn,
        "onNotAuthorized": onNotAuthorized,
        "onDebugNote": onDebugNote,
        "onActionShown": onActionShown,
        "onActionClosed": onActionClosed,
        "onInit": onInit,
        "onButtonClick": onButtonClick,
        "onAccessTemplateShown": onAccessTemplateShown,
        "onAccessTemplateClosed": onAccessTemplateClosed,
        "onRun": onRun,
        "onFinish": onFinish,

        //FLITTZ
        "onFlittzPaywallShown": onFlittzPaywallShown,
        "onFlittzPaywallClosed": onFlittzPaywallClosed,
        "onFlittzButtonClick": onFlittzButtonClick

    };

    var NOTES = []; //(only used in debugging) - Holds array of messages from Events fired from the plugin. This array is displayed in the 'Notes' section of the Debug Details. It let's a user know major events and their results without having to dig through the console. Array is parsed using NOTES.join('<BR />') so they are displayed on separate lines within the Notes section (easier and faster than using UL and add LI's).

    //#endregion - Globals

    //#region INIT Functions

    var init = function () {
        var fnName = "Init";

        try {
            LOGGER.debug(NAME, fnName, "Initializing Events...");

        } catch (ex) {
            console.error(fnName, ex);
        }
    }
    //#endregion INIT Functions

    //#region PLUGIN EVENTS (These are functions that will be fired on certain events, regardless if the client sets a callback for them (mainly we use these functions to update debugging details based on certain events).

    function onDebugNote(note) {
        var fnName = "onDebugNote";

        try {
            NOTES.push(note);
            $("#ddNote").html(note);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onInit(e) {
        var fnName = "onInit";

        try {
            LOGGER.debug("Fire Default onInit function.", e);

        } catch (e) {
            console.error(fnName, 'EXCEPTION', e);
        }
    }

    function onFlittzPaywallShown(e) {
        var fnName = "onFlittzPaywallShown";

        try {
            e.EventData.conversation = CnnXt.Storage.GetCurrentConverstaion();
            e.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
            e.EventData.hasFlittz = OPTIONS.integrateFlittz;

            window.CommonFz.PushData("Connext-onFlittzPaywallShown", e);

            LOGGER.debug("Flittz paywall shown", e);
        } catch (ex) {
            console.error(NAME, fnName, "EXCEPTION", ex);
        }
    }

    function onFlittzPaywallClosed(e) {
        var fnName = "onFlittzPaywallClosed";

        try {
            e.EventData.conversation = CnnXt.Storage.GetCurrentConverstaion();
            e.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
            e.EventData.hasFlittz = OPTIONS.integrateFlittz;

            window.CommonFz.PushData("Connext-onFlittzPaywallClosed", e);

            LOGGER.debug("Flittz paywall closed", e);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onFlittzButtonClick(e) {
        var fnName = "onFlittzButtonClick";

        try {
            e.EventData.conversation = CnnXt.Storage.GetCurrentConverstaion();
            e.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
            e.EventData.hasFlittz = OPTIONS.integrateFlittz;

            window.CommonFz.PushData("Connext-onFlittzButtonClick", e);

            LOGGER.debug("Click on Flittz button", e);

        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onCriticalError(e) {
        var fnName = "onCriticalError";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onCriticalError function.', e);
                NOTES.push(e.EventData.message);
                $('#ddNote').html(e.EventData.message);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onDynamicMeterFound(e) {
        var fnName = "onDynamicMeterFound";

        try {
            LOGGER.debug("Fire Default onDynamicMeterFound function.", e);
            $("#ddMeterSet").html(e.EventData);
        } catch (ex) {
            console.error(NAME, fnName, "EXCEPTION", ex);
        }
    }

    function onMeterLevelSet(e) {
        var fnName = "onMeterLevelSet";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onMeterLevelSet function.', e);
                $('#ddMeterLevel').html(CnnXt.Common.MeterLevels[e.EventData.level] + ' (' + e.EventData.method + ')');                           
            }

            CnnXt.Storage.SetMeter(e.EventData);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onHasAccessToken(e) {
        var fnName = "onHasAccessToken";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onHasAccessToken function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onLoggedIn(e) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "onLoggedIn";
        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onLoggedIn function.', e);
                //$('.account-toggler').find('span').text('UPDATED');
                onDebugNote(e);
            }
            //$('#ddMeterLevel').html(CnnXt.Common.MeterLevels[e.level] + ' (' + e.method + ')');
        } catch (e) {
            console.error(fnName, 'EXCEPTION', e);
        }
    }

    function onHasAccess(e) {
        var fnName = "onHasAccess";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onHasAccess function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onHasAccessNotEntitled(e)
    {
        var fnName = "onHasAccessNotEntitled";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onHasAccessNotEntitled function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onHasNoActiveSubscription(e) {
        var fnName = "onHasNoActiveSubscription";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onHasNoActiveSubscription function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onAuthorized(e) {
        var fnName = "onAuthorized";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onAuthorized function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onNotAuthorized(e) {
        var fnName = "onNotAuthorized";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onNotAuthorized function.', e);
                onDebugNote(e.EventData);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onCampaignFound(e) {
        var fnName = "onCampaignFound";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onCampaignFound function.', e);
                $('#ddCampaign').html(e.EventData.Name);
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onConversationDetermined(e) {
        var fnName = "onConversationDetermined";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onConversationDetermined function.', e);

                $('#ddCurrentConversation').html(e.EventData.Name);

                if ($.jStorage.get('uniqueArticles')) {
                    $('#ddCurrentConversationArticleViews').html(CnnXt.Storage.GetViewedArticles(e.EventData.id).length);
                } else {
                    $('#ddCurrentConversationArticleViews').html(e.EventData.Props.views);
                }
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onActionShown(e) {
        var fnName = "onActionShown";

        try {
            LOGGER.debug("Fire Default onActionShown", e);

            if (e && e.EventData && e.EventData.actionDom && e.EventData.actionDom.hasClass("flittz") && OPTIONS.integrateFlittz) {
                CnnXt.Event.fire("onFlittzPaywallShown", e.EventData);
            }

            //JUST PER PHILLY
            // IF IT IS PAYWALL
            if (e && e.EventData.ActionTypeId == 3) {
                CnnXt.Storage.SetConnextPaywallCookie(true);
            }

            CnnXt.Action.actionStartTime = Date.now();

        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onActionClosed(e) {
        var fnName = "onActionClosed";

        try {
            if (CnnXt.GetOptions().debug) {
                LOGGER.debug('Fire Default onActionClosed', e);
                CnnXt.Action.actionEndTime = Date.now();
                var difference = CnnXt.Action.actionEndTime - CnnXt.Action.actionStartTime;
                $("#ddViewTime")[0].textContent = difference + 'ms';
            }
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onButtonClick(e) {
        var fnName = "onButtonClick";

        try {

            LOGGER.debug("Fire Default onButtonClick", e);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onAccessTemplateShown(event) {
        var fnName = "onAccessTemplateShown";

        try {
            LOGGER.debug("Fire Default onAccessTemplateShown", event);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onAccessTemplateClosed(event) {
        var fnName = "onAccessTemplateClosed";

        try {
            LOGGER.debug("Fire Default onAccessTemplateClosed", event);
        } catch (ex) {
            console.error(fnName, 'EXCEPTION', ex);
        }
    }

    function onRun() {
        LOGGER.debug("Fire Default onRun", event);
    }


    function onFinish() {
        LOGGER.debug("Fire Default onRun", event);
    }

    //#endregion PLUGIN EVENTS

    return {
        //main function to initiate the module
        init: function (options) {
            LOGGER = CnnXt.Logger; //assign local reference to CnnXt.Logger
            OPTIONS = (options) ? options : { debug: true }; //if not options set to object that at least has the debug property set to true.
            init();
        },
        fire: function (event, data) {
            var fnName = "fire";
            try {
                //add common data
                var eventResult = {
                    EventData: data
                };


                var registrationTypeId = null;
                var AUTHSYSTEM = null;
                if (Connext.Storage.GetLocalConfiguration()) {
                    registrationTypeId = Connext.Storage.GetLocalConfiguration().Site.RegistrationTypeId;
                    AUTHSYSTEM = CnnXt.Common.RegistrationTypes[registrationTypeId];
                }
               
                eventResult.AuthSystem = AUTHSYSTEM;
                eventResult.AuthProfile = CnnXt.Storage.GetUserProfile();
                eventResult.MG2AccountData = Connext.Storage.GetUserData();

                var action;

                var currentConversation = CnnXt.Storage.GetCurrentConverstaion();

                if (currentConversation) {
                    if (data && (data.actionId || data.id)) {
                        action = (data.actionId) ? _.findWhere(currentConversation.Actions, { id: data.actionId })
                                                 : _.findWhere(currentConversation.Actions, { id: data.id });
                    }
                    eventResult.Config = CnnXt.Storage.GetLocalConfiguration();
                    eventResult.Action = action;
                    eventResult.Conversation = currentConversation;
                    eventResult.CampaignName = eventResult.Config.Campaign.Name;
                    eventResult.CampaignId = currentConversation.CampaignId;
                    eventResult.MeterLevel = CnnXt.Common.MeterLevels[currentConversation.MeterLevelId];
                    eventResult.MeterLevelId = currentConversation.MeterLevelId;
                }

                if (_.isObject(eventResult.EventData)) {
                    if (event == 'onActionShown' || event == 'onActionClosed') {
                        eventResult.EventData.ArticlesLeft = currentConversation.Props.ArticleLeft;
                        eventResult.EventData.ArticlesViewed = currentConversation.Props.views;
                        eventResult.EventData.ZipCodes = CnnXt.Storage.GetActualZipCodes();
                    }

                    if (event == 'onButtonClick'){
                        eventResult.EventData = {
                            DOMEvent: eventResult.EventData,
                            ButtonHTML: CnnXt.Utils.GetElementHTML(eventResult.EventData.target),
                            UserDefinedDataAttr: $(eventResult.EventData.target).attr('data-connext-userdefined'),
                            ZipCodes: CnnXt.Storage.GetActualZipCodes(),
                            ArticlesLeft: (currentConversation) ? currentConversation.Props.ArticleLeft : undefined,
                            ArticlesViewed: (currentConversation) ? currentConversation.Props.views : undefined
                        }
                    }

                    if (data && data.What) {
                        eventResult.EventData.UserDefinedData = (data.What.UserDefinedData) ? data.What.UserDefinedData : null;
                    }
                }

                eventResult.Config = CnnXt.Storage.GetLocalConfiguration();

                if (_.isFunction(DEFAULT_FUNCTIONS[event])) {
                    //invoke default event function
                    DEFAULT_FUNCTIONS[event](eventResult);
                    try {
                        if (_.isFunction(OPTIONS[event])) {
                            //invoke custom event function
                            OPTIONS[event](eventResult);
                        }
                    } catch (e) {
                        console.error(fnName, 'on', 'EXCEPTION', e);
                    }
                    //send native custom event (this uses in wordpress)
                    var customEvent = new CustomEvent(event, { detail: eventResult });
                    document.dispatchEvent(customEvent);

                    if(event !== 'onDebugNote'){
                        CnnXt.AppInsights.trackEvent(event, eventResult);
                    }

                } else {
                    LOGGER.debug(fnName, event, 'Event function does not exist');
                }

            } catch (e) {
                LOGGER.warn(fnName, 'on', 'EXCEPTION');
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
    var userMeta = {};
    var device;
    var IP;
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
            configuration["Settings"] = _.pick(data, "AccessRules", "Active", "Code", "DefaultMeterLevel", "CampaignId", "DynamicMeterId", "Name", "LastPublishDate", "Settings", "UseParentDomain");
            CnnXt.Event.fire("onDynamicMeterFound", data.DynamicMeter.Name);
            //check if we have a LastPublishDate;
            if (configuration.Settings) {
                configuration.Settings = checkForLastPublishDate(configuration.Settings);
                configuration.Settings["LoginModal"] = data.Template ? data.Template.Html : "";
            }
            //set 'Site' specific settings, no need to process, just assign entire Site object.
            configuration["Site"] = data.Site;

            //process the campaign data (group/organize all conversations and conversation actions).
            configuration["Campaign"] = processCampaignData(data.Campaign);
            //we don't need to process this object, except to make sure the rules are ordered correctly.
            data.DynamicMeter.Rules = _.sortBy(data.DynamicMeter.Rules, function (obj) {
                return obj.Priority;
            });
            configuration["DynamicMeter"] = processDynamicMeter(data.DynamicMeter);

            configuration["WhitelistSets"] = data["WhitelistSets"];

            LOGGER.debug(NAME, fnName, "done processing configuration", configuration);
            //configuration["Views"] = data["Views"];       

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
                    return obj.ConversationOption.ParentConversationOptionId;
                });

                var processedGroup = {};

                $.each(groupedOptions, function (key, val) {
                    console.info("GROUPEDOPTIONS.EACH", key, val);
                    var optionObj = {};

                    $.each(val, function (k, v) {
                        optionObj[v.ConversationOption.DisplayName] = v.Value;
                    });

                    processedGroup[CnnXt.Common.ConversationOptionMap[key]] = optionObj;


                });

                val.Options = { "Expirations": processedGroup };

                val.Props = defaultConversationProps;

                //Process the actions array 
                val.Actions = processConversationActions(val.Actions);

            });


            //group conversations by MeterLevelId
            var groupedConversationsByMeterLevel = _.groupBy(conversations, "MeterLevelId");

            //we grouped by 'MeterLevelId', replace these keys (which are integers) into their string equaliviants (from CnnXt.Common.MeterLevels).
            groupedConversationsByMeterLevel = _.replaceObjKeysByMap(groupedConversationsByMeterLevel, CnnXt.Common.MeterLevels);

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
                var exceptions = curSite.Client.Client_ActionOption_Exceptions;

                $.each(exceptions, function (key, value) {
                    val.ActionOptionValues = _.reject(val.ActionOptionValues, function (a) {
                        return a.ActionOptionId == value.ActionOptionId ||
                            a.ActionOption.ActionOptionParentId == value.ActionOptionId;
                    });
                });

                var whoOptions = _.filter(val.ActionOptionValues, function (obj) {
                    return _.contains(CnnXt.Common.ActionOptionMap.Who, obj.ActionOption.ClassId);
                });

                var whatOptions = _.filter(val.ActionOptionValues, function (obj) {
                    return _.contains(CnnXt.Common.ActionOptionMap.What, obj.ActionOption.ClassId);
                });

                var whenOptions = _.filter(val.ActionOptionValues, function (obj) {
                    return _.contains(CnnXt.Common.ActionOptionMap.When, obj.ActionOption.ClassId);
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
            var who = {},
                allCriterias = [];

            //group the options by ActionOption.ActionOptionParentId (will group related options like View options and Geo options etc...).
            var groupedOptions = _.groupBy(options, function (obj) {
                return obj.ActionOption.ActionOptionParentId;
            });

            $.each(groupedOptions, function (key, value) {
                var criteriaInstances = _.groupBy(groupedOptions[key], 'CriteriaInstanceNumber');

                $.each(criteriaInstances, function (instanceNumber) {
                    allCriterias.push(criteriaInstances[instanceNumber]);
                });

            });

            allCriterias.forEach(function (criteria) {
                var criteriaFields = {};
                var criteriaClassName = criteria[0].ActionOption.Action_OptionClass.Name;

                criteria.forEach(function (option) {
                    var dn = option.ActionOption.DisplayName;
                    dn = dn.replace(option.ActionOption.ActionOptionParentId, '');
                    criteriaFields[dn] = option.Value;
                });

                if (who[criteriaClassName] && who[criteriaClassName].length) {
                    who[criteriaClassName].push(criteriaFields);
                } else {
                    who[criteriaClassName] = [criteriaFields];
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
            when[CnnXt.Common.WhenClassMap[options[0].ActionOption.ClassId]] = whenOptions;
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
                    var exceptions = curSite.Client.Client_SegmentOption_Exceptions;
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
                            function (key, val) {
                                //segmentObject[val.SegmentOption.Segment_OptionClass.Name][val.SegmentOption.DisplayName] = val.Value;
                                var dn = val.SegmentOption.DisplayName;
                                dn = dn.replace(val.SegmentOption.SegmentOptionParentId, '');
                                segmentOptions[dn] = val.Value;
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
            CnnXt.Storage.SetLocalConfiguration(newConfig);

            ////var mergedConfig = $.extend(true, currentLocalConfig, newConfig);
            //////we extend the currentLocalConfig and the newConfig.



            //get the array of current conversations from local storage.
            var currentConversations = CnnXt.Storage.GetCurrentConversations();

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
                    newCurrentConversations[key].Props = val.Props;
                }

            });

            //we now save the 'newCurrentConversations' Object to local storage.  Since we created a new 'current conversation' object and only added conversations from the 'newConfig' object to this new Object we automatically take care of the scenario that a user is in a conversation that is then deleted from the Admin.  
            //Since this conversation doesn't exist in the 'newConfig' object, we will not add it to the 'newConversation' object, therefore if this user was in a conversation that was deleted they will just move into a new conversation (as if this was there first time visiting, so first conversation in this campaign).
            CnnXt.Storage.SetCurrentConversations(newCurrentConversations);

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
            CnnXt.Storage.ClearConfigSettings();

            CnnXt.Storage.SetSiteCode(siteCode);
            CnnXt.Storage.SetConfigCode(configCode.toUpperCase());
            CnnXt.Storage.SetIsCustomConfiguration(isCustomConfiguration);
        }
    };

    var handleDebugDetails = function () {
        /// <summary>This sets up the Debug Details panel and any event listeners for the debug panel.</summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "handleDebugDetails";
        try {
            try {
                // append debug css
                var cssLink = $("<link>");
                $("head").append(cssLink); //IE hack: append before setting href

                cssLink.attr({
                    rel: "stylesheet",
                    type: "text/css",
                    href: 'https://mg2assetsdev.blob.core.windows.net/connext/assets/connext-debug-panels.min.css'
                });

                //creates and appends debug details html.
                var html = '<div class="debug_details opened" style="left: 0;"><div class="debug_details_icon">&nbsp;</div><div class="debug_details_content"><h4>Debug Details</h4><ul>' +
                    '<li class="debug_details_header hide_on_mobile"><label>Meter Level: <strong id="ddMeterLevel">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Meter Set: <strong id="ddMeterSet">...</strong></label><label>Campaign: <strong id="ddCampaign">...</strong></label><label>Conversation: <strong id="ddCurrentConversation">...</strong></label><label>Article Views: <strong id="ddCurrentConversationArticleViews">...</strong></label><label>Articles Left: <strong id="ddCurrentConversationArticleLeft">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>View Time: <strong id="ddViewTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Current Zip: <strong id="ddZipCode">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Auth Time: <strong id="ddAuthTime">...</strong></label><label>Processing Time: <strong id="ddProcessingTime">...</strong></label><label>Total Time: <strong id="ddTotalProcessingTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Note: <strong id="ddNote">...</strong></label></li><li class="debug_details_header hide_on_mobile"><div id="ConnextCustomConfigurationDiv"><label for="ConnextSiteCode">Site code: </label><input type="text" id="ConnextSiteCode"><label for="ConnextConfigCode">Config code: </label><input type="text" id="ConnextConfigCode"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomConfiguration">Set configuration</a></div><label class="overlay_label check" for="ConnextCustomConfiguration">Use custom configuration: </label> <input type="checkbox" id="ConnextCustomConfiguration"><label class="overlay_label check" for="ConnextCustomConfiguration">Unique Articles Count: </label> <input type="checkbox" id="uniqueArticles"></li>' +
                    '<li class="debug_details_header" > <label class="overlay_label check">AnonymousId: </label> <input type="text" id="connext_anonymousId" style="\r\n    width: 47px; */\r\n    padding:;\r\n    padding: 5px 1px;\r\n"><a href="#" class="more highlight margin_top_15" id="connext_anonymousIdApplyBtn" style="\r\n    padding: 4px 13px;\r\n    width: 35px;\r\n    margin-left: 10px;\r\n    display: inline;\r\n">Set</a></li>' +
                    '<li class="debug_details_header hide_on_mobile"><label for="ConnextCustomTimeChk" class="overlay_label check">Custom Time: </label> <input type="checkbox" id="ConnextCustomTimeChk"><div id="ConnextCustomTimeDiv"><input type="text" id="ConnextCustomTimeTxt" placeholder="MM/DD/YYYY" value="" name="name" class="text_input hint"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomTimeBtn">Set</a></div></li><li class="debug_details_header hide_on_mobile"><a href="#" class="more highlight margin_top_15" id="connextClearAllData">Clear All Data</a></li></ul></div></div>';
                $("body").append(html);

                $("#ConnextSetCustomConfiguration").on("click", saveConfiguration);

                //handles when a user clicks the hide/show icon.
                $(".debug_details_icon").on("click", handleDebugDetailsDisplayClick);

                //registers 'clearAllData' button click event.
                $("#connextClearAllData").on("click", clearAllSettings);

                //handle custom time section (call this before we setup event listeners for the time checkbox so we set initial values correctly.
                handleCustomTime();
                handleCustomConfiguration();

                $("#ddZipCode").html(CnnXt.Storage.GetActualZipCodes());

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
                        CnnXt.Storage.SetIsCustomConfiguration(false);
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
                    var $this = $(this);
                    $.jStorage.set("uniqueArticles", $this.prop("checked"));
                });

                //event listener when 'Set' button is clicked.
                $("#ConnextSetCustomTimeBtn").on("click", function (e) {
                    e.preventDefault();
                    $.jStorage.set("CustomTime", $("#ConnextCustomTimeTxt").val());
                    // CnnXt.Storage.SetLocalConfiguration('');
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
            CnnXt.Storage.ClearConfigSettings();
            CnnXt.API.ClearServerCache();
            CnnXt.Storage.ResetConversationViews(CnnXt.Storage.GetCurrentConverstaion());
            CnnXt.API.DeleteViewsByUserId();
            CnnXt.Storage.SetRegistrationType({});
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var handleCustomConfiguration = function () {
        if (CnnXt.Storage.GetIsCustomConfiguration()) {
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


    var fillUserMeta = function () {
        var find,
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
            userMeta.deviceType = "Mobile";
        } else if (device.tablet()) {
            userMeta.deviceType = "Tablet";
        } else if (device.desktop()) {
            userMeta.deviceType = "Desktop";
        }

        if (device.ios()) {
            userMeta.OS = "IOS";
        } else if (device.windows()) {
            userMeta.OS = "windows";
        } else if (device.android()) {
            userMeta.OS = "android";
        } else if (device.blackberry()) {
            userMeta.OS = "blackberry";
        } else if (device.fxos()) {
            userMeta.OS = "fxos";
        }
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            userMeta.Browser = "Opera";
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            userMeta.Browser = "Chrome";
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            userMeta.Browser = "Safari";
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            userMeta.Browser = "Firefox";
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            userMeta.Browser = "IE";
        }
        else {
            userMeta.Browser = "unknown";
        }
        userMeta.URL = window.location.href;
    }

    //#endregion HELPERS


    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            fillUserMeta();
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
        ProcessConfiguration:
        function (data) { //typically Utils is reserverd for functions that can be used throughout the App, but we have ProcessConfiguration here because it requires alot of other functions and its cleaner to have that all in here instead of in the main 'CnnXt.Core' file.
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
                i,
                val,
                params = searchString.split("&");

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
            var output = null;

            if (_.isString(input)) {
                output = input.replace(/(\d+)([a-zA-Z,()\\";?]+)/, "$1 ");
                output = Date.parse(output);
            }

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
                return hidValue; //$(selector).val();
            } catch (e) {
                console.error(NAME, "GetHiddenFormFieldValue", e);
                return ""; //we return empty string on error so any checks that call this function can still be evaluated.
            }
        },
        JSEvaluate: function (value1, qualifier, value2) { //this calls JS 'eval' to test a javascript condition. We take 2 values and a qualifier and return the result.
            try {
                var label = (arguments[3])
                    ? arguments[3] + " ---- "
                    : ""; //set label to what we are evaluating (the label is the 4th argument passed in, if one is not passed in we set this to an empty string.  We do this here so we don't need to hanldle debugging tests for each type of evaluation.
                var type = (arguments[4])
                    ? arguments[4]
                    : "string"; //5th argument is the type of values (for view counts we can't wrap them in a single quote...we default to string, unless passed in).
                var fixedqualifier = CnnXt.Utils.FixQualifier(qualifier);

                var evalString = (type == "string")
                    ? "'" + value1 + "'" + fixedqualifier + "'" + value2 + "'"
                    : "" + value1 + "" + fixedqualifier + "" + value2 + "";
                //LOGGER.debug(NAME, 'JSEvaluate', 'evalString', evalString);
                if (eval(evalString)) {
                    LOGGER.debug(NAME, "JSEvalute --- <<<<< " + evalString, " >>>>> ---- PASSES");
                    return true;
                } else {
                    LOGGER.debug(NAME, label + "JSEvalute --- <<<<< " + evalString, " >>>>> ---- FAILS");
                    return false;
                }
            } catch (e) {
                LOGGER.warn(NAME, "JSEvaluate", e);
                return false; //if there is an error we return false since we don't know the true determination of this evaluation.
            }

        },
        GetNextLetter: function (a) {
            return nextLetter(a);
        },
        FixQualifier: function (qualifier) {
            try {
                //LOGGER.debug(NAME, fnName);
                var fixedQualifier = CnnXt.Common.QualifierMap[qualifier];
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
        HangleMatherTool: function () {
            var $input = $('#connext_anonymousId');
            var $bttn = $('#connext_anonymousIdApplyBtn');

            if (localStorage._matherAnonId) {
                $input.val(localStorage._matherAnonId);
            }

            $bttn.on('click',
                function () {
                    var id = $input.val();
                    if (id) {
                        localStorage._matherAnonId = id;
                    }
                });

        },
        getParam: function (paramName) {
            //returns value of param if it exists, if not we return null.
            var searchString = window.location.search.substring(1),
                i,
                val,
                params = searchString.split("&");

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
                i,
                val,
                params = searchString.split("&"),
                test;

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    test = unescape(val[1]);
                    return (test.length > 0 && typeof test == "string") ? true : false;
                }
            }
            return false;
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
            return userMeta.deviceType;
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
        GetViewedArticlesCookiesName: function () {
            var config = CnnXt.Storage.GetLocalConfiguration();
            var name = CnnXt.Common.StorageKeys.connext_viewstructure +
                "_" +
                config.Site.SiteCode.toUpperCase() +
                "_" +
                config.Settings.Code.toUpperCase() +
                "_" +
                CnnXt.GetOptions().environment.toUpperCase();
            if (!config.Settings.UseParentDomain) {
                name = 'sub_' + name;
            }
            return name;
        },
        GetCookieName: function (name) {
            var config = CnnXt.Storage.GetLocalConfiguration();
            name = name + "_" +
                config.Site.SiteCode.toUpperCase() +
                "_" +
                config.Settings.Code.toUpperCase() +
                "_" +
                CnnXt.GetOptions().environment.toUpperCase();
            if (!config.Settings.UseParentDomain) {
                name = 'sub_' + name;
            }
            return name;
        },
        GetViewedArticlesCookiesOLDName: function () {
            var config = CnnXt.Storage.GetLocalConfiguration();
            var name = CnnXt.Common.StorageKeys.connext_viewstructure;
            if (!config.Settings.UseParentDomain) {
                name = 'sub_' + name;
            }
            return name;
        },
        GetLocalStorageNamePrefix: function () {
            var name = CnnXt.GetOptions().siteCode +
                '_' +
                CnnXt.GetOptions().environment +
                '_' +
                CnnXt.GetOptions().configCode;
            if (CnnXt.GetOptions().attr) {
                name += "_" + CnnXt.GetOptions().attr;
            }
            if (CnnXt.GetOptions().settingsKey) {
                name += "_" + CnnXt.GetOptions().settingsKey;
            }
            return name;
        },
        AddParameterToURL: function (_url, param) {
            _url = _url.replace(/#$/, '');
            _url += (_url.split("?")[1] ? "&" : "?") + param;
            return _url;
        },
        AddReturnUrlParamToLink: function (link) {
            //add clearUserState parameter to clear user state from cash to get fresh user state after redirect back
            var resultLink = link;
            if (link.indexOf('returnUrl=') == -1) {
                var returnUrl = CnnXt.Utils.AddParameterToURL(window.location.href.split('?')[0], 'clearUserState=true');
                resultLink = CnnXt.Utils.AddParameterToURL(link, 'returnUrl=' + returnUrl);
            }
            return resultLink;
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
                } else {
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
                } else {
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

        },
        GetUserMeta: function () {
            return userMeta;
        },
        GenerateGuid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                s4() +
                s4();
        },
        ConvertObjectKeysToUpperCase: function (obj) {
            $.each(obj,
                function (index, val) {
                    delete obj[index];
                    obj[index.toUpperCase()] = val;
                });
            return obj;
        },
        GetIP: function () {
            if (IP) {
                return IP;
            } else return localStorage.ConnextIP;
        },
        SetIP: function (ip) {
            localStorage.ConnextIP = ip;
            IP = ip;
        },

        GetElementHTML: function (element) {
            return $('<div>').append($(element).clone()).html();
        },

        ShapeUserData: function (data) {
            if (!data)
                return {};
            if (data.DigitalAccess && _.isString(data.DigitalAccess.AccessLevel)) {
                data.DigitalAccess.AccessLevel = {
                    IsPremium: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Premium,
                    IsUpgrade: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Upgrade,
                    IsPurchase: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Purchase
                }
            }
            if (data.EncryptedCustomerRegistrationId) {
                data.IgmRegID = EncryptedCustomerRegistrationId;
            }

            if (data.CookieContent && _.isArray(data.CookieContent)) {
                var igmContentCookie = _.findWhere(data.CookieContent, { Name: "igmContent" });
                if (igmContentCookie) {
                    data.IgmContent = igmContentCookie.Content;
                }

                var igmRegIdCookie = _.findWhere(data.CookieContent, { Name: "igmRegId" });
                if (igmRegIdCookie) {
                    data.IgmRegID = igmRegIdCookie.Content;
                }
            }

            return data;
        }
    };

};

var ConnextStorage = function ($) {

    //#region GLOBALS
    var name = "STORAGE";

    //create local reference to CnnXt.Logger
    var logger;

    var METER;

    //#endregion GLOBALS

    //#region LOCAL STORAGE FUNCTIONS

    var getLocalStorage = function (key) {
        // <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getLocalStorage";
        try {
            var storageKey = key;
            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }
            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;
            return $.jStorage.get(fullKey);
        } catch (e) {
            console.log(name, fnName, 'EXCEPTION', e);
            if (key == 'configuration') {
                CnnXt.Api.meta.storageException = e;
            }
        }
    };

    var setLocalStorage = function (key, val) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "setLocalStorage";
        try {
            var storageKey = key;
            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }
            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;
            return $.jStorage.set(fullKey, val);
        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };

    var removeLocalStorage = function (key) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "removeLocalStorage";
        try {
            var storageKey = key;
            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }
            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;
            return $.jStorage.deleteKey(fullKey);
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
            logger.debug(name, fnName, key, "CnnXt.Common.StorageKeys[key] || key", CnnXt.Common.StorageKeys[key] || key);
            return Cookies.get(CnnXt.Common.StorageKeys[key] || key);
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
                CnnXt.Storage.SetUserState(null);
                CnnXt.Storage.SetUserZipCodes(null);
                CnnXt.Run();
            });
    };

    var setCookie = function (key, data, expiration, useWholeDomain) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = 'setCookie';
        try {
            logger.debug(name, fnName);
            var domains = window.location.host.split('.');
            var curdomain = window.location.host;
            if (curdomain.indexOf('localhost') > -1) {
                curdomain = 'localhost';
            }
            if (!useWholeDomain && domains.length >= 2) {
                curdomain = '.' + domains[domains.length - 2] + '.' + domains[domains.length - 1];
            }
            if (expiration) {
                //will be an expiration. 
                logger.debug(name, fnName, 'HasExpiration', 'key', key, 'expiration', expiration);
                return Cookies.set(CnnXt.Common.StorageKeys[key] || key, data, { expires: expiration, domain: curdomain });
            } else {
                //this is a session cookie.
                return Cookies.set(CnnXt.Common.StorageKeys[key] || key, data, { domain: curdomain });
            }
        } catch (e) {
            console.log(name, fnName, 'EXCEPTION', e);
        }
    };

    var removeCookie = function (key, useWholeDomain) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "removeCookie";
        try {
            logger.debug(name, fnName);

            var domains = window.location.host.split(".");
            var curdomain = window.location.host;
            if (curdomain.indexOf('localhost') > -1) {
                curdomain = 'localhost';
            }
            if (!useWholeDomain && domains.length >= 2) {
                curdomain = '.' + domains[domains.length - 2] + '.' + domains[domains.length - 1];
            }
            //we don't have a 3rd argument, so don't use one (this means this is a session cookie).
            return Cookies.set(CnnXt.Common.StorageKeys[key] || key, 'null', { domain: curdomain, expires: -1 });

        } catch (e) {
            console.log(name, fnName, "EXCEPTION", e);
        }
    };


    var getCookies = function () {
        var pairs = document.cookie.split(";");
        var cookies = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            cookies[pair[0]] = unescape(pair[1]);
        }
        return cookies;
    };


    //#region VIEWS INNER FUNCTIONS
    var incrementView = function (convId) {
        var userCurDomain = !CnnXt.GetOptions().configSettings.UseParentDomain;
        var cookieName = CnnXt.Utils.GetViewedArticlesCookiesName();
        var articleCookie = getCookie(cookieName);
        if (articleCookie) {
            try {
                var parsedViews = JSON.parse(articleCookie);
                parsedViews[convId] = parsedViews[convId] ? parsedViews[convId] + 1 : 1;
                parsedViews[convId + CnnXt.Common.StorageKeys.device_postfix] = parsedViews[convId + CnnXt.Common.StorageKeys.device_postfix] ?
                    parsedViews[convId + CnnXt.Common.StorageKeys.device_postfix] + 1 : 1;

                setCookie(cookieName, JSON.stringify(parsedViews), new Date(CnnXt.Common.InfinityDate), userCurDomain);
            } catch (ex) {
            }
        } else {
            var views = {};
            views[convId] = 1;
            setCookie(cookieName, JSON.stringify(views), new Date(CnnXt.Common.InfinityDate), userCurDomain);
        }
    };

    var checkViewsCookie = function () {
        var data = getViewsData();
        var parsedViews = data.parsedViews;
        var deferred = $.Deferred();

        if (!parsedViews) {
            CnnXt.API.GetViewData()
                .done(function (successData) {
                    if (successData) {
                        //var viewData = successData.ViewData;
                        var views = JSON.parse(successData).filter(function (item) {
                            return item.ViewCount;
                        });
                        parsedViews = {};
                        if (views.length) {
                            views.forEach(function (item) {
                                parsedViews[item.Id] = item.ViewCount;
                                parsedViews[item.Id + CnnXt.Common.StorageKeys.device_postfix] = item.DeviceViewCount;
                            });
                        }
                        setCookie(data.cookieName,
                            JSON.stringify(parsedViews),
                            new Date(CnnXt.Common.InfinityDate),
                            data.userCurDomain);
                        var configuration = getLocalStorage("configuration");
                        var conversations = configuration.Campaign.Conversations;
                        for (key in conversations) {
                            conversations[key].forEach(function (conversation) {
                                var item = _.findWhere(views, { Id: conversation.id });
                                if (item) {
                                    conversation.Props.views = item.ViewCount;
                                    conversation.Props.Date.started = item.StartDate;
                                }
                            });
                        }
                        CnnXt.Storage.SetLocalConfiguration(configuration);
                    }
                    deferred.resolve();
                }).fail(function (error) {
                    deferred.resolve();
                    console.log(error.error());
                });
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    };

    var getViewsData = function () {
        var userCurDomain = !CnnXt.GetOptions().configSettings.UseParentDomain;
        var cookieName = CnnXt.Utils.GetViewedArticlesCookiesName();
        var oldCookieName = CnnXt.Utils.GetViewedArticlesCookiesOLDName();
        var parsedViews;

        var articleCookie = getCookie(cookieName);
        var oldCookie = getCookie(oldCookieName);
        if (oldCookie) {
            parsedViews = JSON.parse(oldCookie);
            //expire old cookie in 2 month
            setCookie(oldCookieName, JSON.stringify(parsedViews), new Date(CnnXt.Common.CookieExpireDate), userCurDomain);
        }

        if (articleCookie || articleCookie == "{}") {
            parsedViews = JSON.parse(articleCookie);
        } else {
            if (oldCookie) {
                //copy data to new cookie
                setCookie(cookieName, JSON.stringify(parsedViews), new Date(CnnXt.Common.InfinityDate), userCurDomain);
            }
        }


        var data = {
            parsedViews: parsedViews,
            cookieName: cookieName,
            userCurDomain: userCurDomain
        };
        return data;
    };

    var getArticleCookie = function (convId) {
        var data = getViewsData();
        var parsedViews = data.parsedViews;
        for (key in parsedViews) {
            if (key == convId) {
                return parsedViews[key];
            }
        }
    };

    var resetViews = function (convId, useRootDomain) {
        var userCurDomain = !useRootDomain;
        var cookieName = CnnXt.Utils.GetViewedArticlesCookiesName();
        var articleCookie = getCookie(cookieName);
        if (convId) {
            if (articleCookie) {
                try {
                    var parsedViews = JSON.parse(articleCookie);
                    parsedViews[convId] = 0;
                    parsedViews[convId + CnnXt.Common.StorageKeys.device_postfix] = 0;
                    removeCookie(cookieName);
                    setCookie(cookieName, JSON.stringify(parsedViews), new Date(CnnXt.Common.InfinityDate), userCurDomain);
                    var key = CnnXt.Common.StorageKeys.viewedArticles + "_" + convId;
                    setLocalStorage(key, []);
                } catch (ex) {
                }
            }
        } else {
            var empty = {};
            removeCookie(cookieName, !userCurDomain);
            setCookie(cookieName, JSON.stringify(empty), new Date(CnnXt.Common.InfinityDate), userCurDomain);
        }
    };


    var updateViewedArticles = function (conversationId) {
        var viewedArticles = CnnXt.Storage.GetViewedArticles(conversationId),
            articleUrl = CnnXt.Utils.GetUrl(),
            options = CnnXt.GetOptions(),
            articleHash;
        if (viewedArticles == null)
            viewedArticles = [];
        if (options.articlesCounter && options.articlesCounter.params && options.articlesCounter.params.length) {
            var params = options.articlesCounter.params,
                domain = location.hostname,
                indicatorOfTheArticle = domain + "_";

            params.forEach(function (param) {
                var paramValue = CnnXt.Utils.getQueryParamByName(param);

                if (paramValue) {
                    indicatorOfTheArticle += (param + "=" + paramValue);
                }
            });

            articleHash = MD5(indicatorOfTheArticle);
        } else {
            articleHash = MD5(articleUrl);
        }
        if (viewedArticles.indexOf(articleHash) > -1) {
            if (!$.jStorage.get("uniqueArticles") && CnnXt.GetOptions().debug) {
                incrementView(conversationId);
            }
        } else {
            viewedArticles.push(articleHash);
            incrementView(conversationId);
            CnnXt.Storage.SetViewedArticles(viewedArticles, conversationId);
        }
    };

    var getCurrentConversationViewCount = function (id) {
        if (!CnnXt.Storage.GetCurrentConverstaion())
            return null;
        var convoId = id;
        if (convoId == null) {
            convoId = CnnXt.Storage.GetCurrentConverstaion().id;
        }
        var cookieName = CnnXt.Utils.GetViewedArticlesCookiesName();
        var articleCookie = getCookie(cookieName);
        if (articleCookie) {
            try {
                var parsedViews = JSON.parse(articleCookie);
                if (parsedViews[convoId]) {
                    return parsedViews[convoId];
                }
            } catch (ex) {
                return 0;
            }
        }
        return 0;
    };

    var getViewedArticles = function (conversationId) {
        var key = CnnXt.Common.StorageKeys.viewedArticles;
        var viewsObj = getLocalStorage(key);
        if (viewsObj)
            return viewsObj[conversationId];
    };

    var setViewedArticles = function (articles, conversationId) {
        var key = CnnXt.Common.StorageKeys.viewedArticles;
        var viewsObj = getLocalStorage(key);
        if (viewsObj == null) {
            viewsObj = {};
        }
        viewsObj[conversationId] = articles;
        setLocalStorage(key, viewsObj);
    };

    var resetConversationViews = function (conversation, useParentDomain) {
        if (conversation) {
            conversation.Props.views = 0;
            CnnXt.Storage.SetViewedArticles([], conversation.id);
            resetViews(conversation.id, useParentDomain);
        } else {
            setLocalStorage(CnnXt.Common.StorageKeys.viewedArticles, {});
            resetViews(null, useParentDomain);
        }
    };
    //#endregion



    var clearUserStorage = function () {
        Cookies.remove(CnnXt.Common.StorageKeys.userToken);
        Cookies.remove(CnnXt.Common.StorageKeys.accessToken);
        Cookies.remove("userToken");
        Cookies.remove("userMasterId");
        localStorage.removeItem("janrainCaptureProfileData");
        localStorage.removeItem("janrainCaptureReturnExperienceData");
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.zipCodes);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.state);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.data);
        //removeCookie(CnnXt.Common.StorageKeys.igmRegID);
        //removeCookie(CnnXt.Common.StorageKeys.IgmContent);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_profile);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_data);
        //$.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.state);
        CnnXt.Storage.SetUserState("Logged Out");
        removeCookie('ExternalUserId');
        removeCookie('connext_user_profile');
        removeCookie('connext_user_data');
    }


    //#endregion LOCAL STORAGE FUNCTIONS

    return {
        init: function () {
            logger = CnnXt.Logger; //assign local reference to CnnXt.Logger
            logger.debug(name, "Init");
            addListners();
        },
        GetLocalConfiguration: function () {
            return getLocalStorage("configuration");
        },
        SetLocalConfiguration: function (data) {
            localStorage.setItem("IsLocalConfig", true);
            return setLocalStorage('configuration', data);
        },
        GetUserState: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.user.state);
        },
        SetUserState: function (state) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.user.state, state);
        },
        GetUserZipCodes: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes);
        },
        SetUserZipCodes: function (codes) {
            return setLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes, codes);
        },
        GetActualZipCodes: function () {
            var userZipCodes;

            if (CnnXt.User.isUserHasHighState()) {
                userZipCodes = getLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes) || [];
            } else {
                userZipCodes = [$.jStorage.get(CnnXt.Common.StorageKeys.customZip)];
            }

            return userZipCodes;
        },
        GetLastPublishDate: function () {
            return getCookie(CnnXt.Utils.GetCookieName("lastPublishDate"));
        },  
        SetLastPublishDate: function (data, expired) {
            var userCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            return setCookie(CnnXt.Utils.GetCookieName("lastPublishDate"), data, expired, userCurDomain);
        },
        GetCurrentConversations: function () {
            var currentConvos = getLocalStorage(CnnXt.Common.StorageKeys.conversations.current);
            return (currentConvos) ? currentConvos : {}; //if we don't have any stored conversation object then return an empty one so we don't get an error trying to set properties.
        },
        SetCurrentConversations: function (curConvos) {
            //sets CurrentConversations array (will be set after we merge exisitng 
            return setLocalStorage(CnnXt.Common.StorageKeys.conversations.current, curConvos);
        },
        GetCampaignData: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configuration).Campaign;
        },
        GetCurrentConversationViewCount: getCurrentConversationViewCount,
        GetViewedArticles: getViewedArticles,
        SetViewedArticles: setViewedArticles,
        UpdateViewedArticles: updateViewedArticles,
        ResetConversationViews: resetConversationViews,

        GetRepeatablesInConv: function (actionId) {
            if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)) {
                setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, {});
            }

            var obj = getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
            if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)[actionId]) {
                obj[actionId] = 0;
                setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, obj);
            }
            return getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)[actionId];


        },
        UpdateRepeatablesInConv: function (actionId) {
            if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)) {
                setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, {});
            }
            var obj = getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
            obj[actionId] = obj[actionId] + 1;
            setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, obj);
        },

        ClearConfigSettings: function () {
            try {
                CnnXt.Storage.SetViewedArticles([], CnnXt.Storage.GetCurrentConverstaion().id);
            }
            catch (e) { }

            removeLocalStorage(CnnXt.Common.StorageKeys.conversations.current);
            removeLocalStorage(CnnXt.Common.StorageKeys.conversations.previous);
            removeLocalStorage(CnnXt.Common.StorageKeys.viewedArticles);
            removeLocalStorage(CnnXt.Common.StorageKeys.configuration);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.state);
            removeLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_profile);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_data);
            removeLocalStorage(CnnXt.Common.StorageKeys.customZip);
            removeLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
            localStorage.removeItem('_matherAnonId');
        },
        ClearUser: function () {
            //this clears all user related  cookies
            clearUserStorage();
        },
        Logout: function () {
            clearUserStorage();
            removeCookie(CnnXt.Common.StorageKeys.igmRegID);
            removeCookie(CnnXt.Common.StorageKeys.IgmContent);
        },
        ClearOldCookies: function () {
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.indexOf(searchString, position) === position;
                };
            }
            $.each(getCookies(), function (item) {
                var str = item.toString();
                if (str.startsWith(' '))
                { str = str.trim(); }
                str = decodeURIComponent(str);
                if (str.startsWith('Connext_ViewedArticles') || str.startsWith('sub_Connext_ViewedArticles')) {
                    Cookies.remove(str);
                    var domainArr = location.host.split('.');
                    var rootDomain = '.' + domainArr[(domainArr.length - 2)] + '.' + domainArr[(domainArr.length - 1)];
                    Cookies.remove(str, { domain: rootDomain });
                }
            });
        },
        SetAccessToken: function (token) {
            //TODO: Use some sort of encryption to encrypte access token and then use that to decode.
            return setCookie("accessToken", token); //set AccessToken with an expiration of 1 day.
        },
        GetAccessToken: function () {
            //TODO: Use some sort of encryption to encrypte access token and then use that to decode.
            logger.debug(name, "GetAccessToken", CnnXt.Common.StorageKeys.accessToken);
            return getCookie("accessToken");
        },
        GetCurrentConverstaion: function () {
            return getLocalStorage("CurrentConversation");
        },
        SetCurrentConverstaion: function (e) {
            setLocalStorage("CurrentConversation", e);
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
        GetIgmContent: function () {
            return getCookie("igmContent");
        },
        SetIgmContent: function (value) {
            var expire = new Date();
            //value = decodeURIComponent(value);
            expire.setDate(expire.getDate() + 30);
            return setCookie("igmContent", value, expire);
        },
        SetigmRegID: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie('igmRegID', value, expire);
        },
        SetExternalUserId: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie('ExternalUserId', value, expire);
        },
        GetExternalUserId: function () {
            return Cookies.get("ExternalUserId");
        },
        SetUserRegId: function (token) {
            return setCookie("userMasterId", token, 365); //set AccessToken with an expiration of 1 day.
        },
        GetUserRegId: function () {
            return getCookie("userMasterId");
        },
        GetWhitelistInfoboxCookie: function () {
            return getCookie("WhitelistInfobox");
        },
        SetWhitelistInfoboxCookie: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie("WhitelistInfobox", value, expire);
        },
        GetNeedHidePinTemplateCookie: function () {
            return getCookie("NeedHidePinTemplate");
        },
        SetNeedHidePinTemplateCookie: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 1);
            return setCookie("NeedHidePinTemplate", value, expire);
        },
        GetWhitelistSetIdCookie: function () {
            return getCookie("WhitelistSetId");
        },
        SetWhitelistSetIdCookie: function (value, expiration) {
            return setCookie("WhitelistSetId", value, expiration);
        },
        GetJanrainUser: function () {
            var profileData = localStorage.getItem(CnnXt.Common.StorageKeys.janrainUserProfile);

            try {
                return $.parseJSON(profileData);
            } catch (ex) {
                return null;
            }
        },
        //to my mind need refactor this code & create single get/set that works with localStorage & another for work with cookie
        //like setLocalStorageItem (key, data) { setLocalStorage (key, data)}
        //this architecture has problems with scalability
        SetSiteCode: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode, data);
        },
        GetSiteCode: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode);
        },
        SetConfigCode: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode, data);
        },
        GetConfigCode: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode);
        },
        SetIsCustomConfiguration: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom, data);
        },
        SetUserLastUpdateDate: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.connext_userLastUpdateDate, data);
        },
        GetUserLastUpdateDate: function () {
            return setLocalStorage(CnnXt.Common.StorageKeys.connext_userLastUpdateDate);
        },
        GetIsCustomConfiguration: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom);
        },
        GetGuid: function () {
            return getCookie(CnnXt.Common.StorageKeys.connext_user_Id);
        },
        SetGuid: function (value) {
            return setCookie(CnnXt.Common.StorageKeys.connext_user_Id, value);
        },
        GetUserData: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.connext_user_data);
        },
        SetUserData: function (value) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.connext_user_data, value);
        },
        GetUserProfile: function () {
            var data = $.jStorage.get(CnnXt.Common.StorageKeys.connext_user_profile);
            if (data) {
                try {
                    return data;
                } catch (e) {
                    return null;
                }
            }
            return null;
        },
        SetUserProfile: function (value) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.connext_user_profile, value);
        },
        GetConnextPaywallCookie: function () {
            return getCookie(CnnXt.Common.StorageKeys.connext_paywallFired);
        },
        SetConnextPaywallCookie: function (value) {
            var userCurDomain = !CnnXt.GetOptions().configSettings.UseParentDomain;
            return setCookie(CnnXt.Common.StorageKeys.connext_paywallFired, value, null, userCurDomain);
        },
        SetAccountDataExpirationCookie: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 1);
            return Cookies.set('Connext_AccountDataExpirationCookie', value, { expires: expire });
        },
        GetAccountDataExpirationCookie: function () {
            return Cookies.get("Connext_AccountDataExpirationCookie");
        },
        WrongPin: function () {
            var value = CnnXt.Storage.GetPinAttempts();
            if (value) {
                value++;
            } else {
                value = 1;
            }
            var expire = new Date();
            expire.setMinutes(expire.getMinutes() + 15);
            return setCookie("PinAttempts", value, expire);
        },
        GetPinAttempts: function () {
            return getCookie('PinAttempts');
        },
        SetRegistrationType: function (data) {
            $.jStorage.set(CnnXt.Common.StorageKeys.connext_auth_type, data);
        },
        GetRegistrationType: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.connext_auth_type) || {};
        },
        GetDeviceViews: function (convId) {
            return getArticleCookie(convId + CnnXt.Common.StorageKeys.device_postfix);
        },
        GetViews: function (convId) {
            return getArticleCookie(convId);
        },
        CheckCookie: function () {
            return checkViewsCookie();
        },
        GetViewsData: function () {
            return getViewsData();
        },
        SetMeter: function (meter) {
            METER = meter;
        },
        GetMeter: function () {
            return METER;
        }
    }
};

var ConnextAPI = function ($) {

    //#region GLOBALS
    var NAME = "API";

    //create local reference to CnnXt.LOGGER
    var LOGGER;

    var OPTIONS; //global Options variable. This will be merge/extended between default options and passed in options.

    var API_URL;
    var BASE_API_ROUTE = "api/";

    
    var ROUTES = { //this holds the routes for the different api calls.  We use this in the universal 'Get' method and use the 'args' parameters to set the full api URL.
        GetConfiguration: _.template("configuration/siteCode/<%= siteCode %>/configCode/<%= configCode %>"),
        GetUserByEmailAndPassword: _.template("user/email/<%= email %>/password/<%= password %>"),
        GetUserByMasterId: _.template("user/id/<%= id %>"),
        GetUserByToken: _.template("user/token/<%= token %>"),
        EmailPreferences: "user/emailPreference",
        GetUserLastUpdateDate: _.template("user/getLastUpdateDate?masterId=<%=masterId%>"),
        CheckAccess: _.template("checkAccess/<%= masterId %>"),
        GetUserByEncryptedMasterId: _.template("user/encryptedMasterId?encryptedMasterId=<%= encryptedMasterId %>"),
        ClearServerCache: _.template("clear/siteCode/<%=siteCode%>/configCode/<%=siteCode%>"),
        viewsData: "views",
        DeleteViewsByUserId: _.template("views/user/delete?siteCode=<%=SiteCode%>&configCode=<%=ConfigCode%>&userId=<%=UserId%>&masterId=<%=MasterId%>&settingsKey=<%=SettingsKey%>")
    };


    var Meta = {
        publishFile: {
            url: "",
            responceCode: "",
            publishDate: "",
            ex: ""
        },
        config: {
            isExistsInLocalStorage: "",
            localPublishDate: ""
        },
        clientUrl: "",
        reason: ""
    }

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
            LOGGER.debug(NAME, fnName, 'calling...', url, 'OPTIONS', OPTIONS);
            var stringMeta = "";
            if (args.options.meta)
            {
                stringMeta = JSON.stringify(args.options.meta);
            }
            CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: url, ApiPayload: args.options.payload });

            //return $.ajax object in case we want to use this as a deferred object. We still process any callbacks in the opts argument in case we don't use the $.deferred object.
            //TODO: THIS IS VERY IMPORTANT....
            //      Right now we are adding in the 'siteCode' as a header and on the API we are disabling the AuthenticationHandler filter to check if the SiteCode and API-Key match the ones in the API web.config.  
            //      We need to find a way to enable this Authentication when calling the API via Postman or 3rd party source, but not require the API-Key when calling from the Connext Plugin since we do not want to store Token values in JS.
            //      I would think we would need some sort of checking based on the source header and if that domain matches a list of domains/tokens.
            return $.ajax({
                //crossDomain: true,
                //contentType: "application/json; charset=utf-8",
                headers: { 'Site-Code': OPTIONS.siteCode, 'x-test': 'test', 'Access-Control-Allow-Origin': '*', 'Environment': CnnXt.GetOptions().environment, 'settingsKey': CnnXt.GetOptions().settingsKey, 'attr': CnnXt.GetOptions().attr, 'metaData': stringMeta, 'Version': CnnXt.GetVersion(), 'Source-System': 'Plugin' },
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

    var GetNewsletters = function (args) {
        /// <summary>Universal call to API. Handles parsing returned data and calling provided callbacks.</summary>
        /// <param name="" type=""></param>
        /// <returns>Deferred $.ajax</returns>
        var fnName = "GetNewsletters";
        try {

            //creates url based on the passed method option from routes object and then calls this function with the payload passed in (the routes object is an underscore template so the passed in payload will be parsed to create the correct url
            var url = API_URL + ROUTES.EmailPreferences;
            url += "?email=" + args.options.email + "&emailPreferenceId=" + args.options.id;
            LOGGER.debug(NAME, fnName, 'calling...', url, 'OPTIONS', OPTIONS);

            CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: url, ApiPayload: args.options });

            //return $.ajax object in case we want to use this as a deferred object. We still process any callbacks in the opts argument in case we don't use the $.deferred object.
            //TODO: THIS IS VERY IMPORTANT....
            //      Right now we are adding in the 'siteCode' as a header and on the API we are disabling the AuthenticationHandler filter to check if the SiteCode and API-Key match the ones in the API web.config.
            //      We need to find a way to enable this Authentication when calling the API via Postman or 3rd party source, but not require the API-Key when calling from the Connext Plugin since we do not want to store Token values in JS.
            //      I would think we would need some sort of checking based on the source header and if that domain matches a list of domains/tokens.
            return $.ajax({
                headers: { 'Site-Code': 'MNG', 'Access-Control-Allow-Origin': '*', 'Environment': CnnXt.GetOptions().environment, 'settingsKey': 'lang', 'Version': CnnXt.GetVersion(), 'Source-System': 'Plugin' },
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    LOGGER.debug('data:', data);
                    try {

                        if (!data || xhr.status == 204) {
                            //empty results or returned a 204 'No Content', call onNull
                            if (_.isFunction(args.options.onNull)) {
                                args.options.onNull();
                            }
                        } else {
                            //we have a return object
                            if (_.isFunction(args.options.onSuccess)) {
                                args.options.onSuccess();
                            }
                        }
                    } catch (e) {
                        LOGGER.exception(fnName, e);
                    }
                },
                error: function (err) {
                    //var errorObject = JSON.parse(err.responseJSON.Message) || err;
                    LOGGER.debug('error', err);
                    if (_.isFunction(args.options.onError)) {
                        args.options.onError(err);
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

    var clearServerCache = function () {
        var fnName = 'clearServerCache';
        var payload = {
            siteCode: CnnXt.GetOptions().siteCode,
            configCode: CnnXt.GetOptions().configCode
        };
        var url = API_URL + ROUTES["ClearServerCache"](payload);

        CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: url, ApiPayload: payload });

        return $.ajax({
            //crossDomain: true,
            //contentType: "application/json; charset=utf-8",
            headers: { 'attr': CnnXt.GetOptions().attr },
            url: url,
            type: "POST",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data, "xhr", xhr);
            },
            error: function (err) {
                LOGGER.error(fnName, "Ajax.Error", err);
            }
        });

    }

    //#endregion API CALLS
    
    return {
        init: function (options) {
            LOGGER = CnnXt.Logger; //assign local reference to CnnXt.LOGGER
            OPTIONS = options; //set global OPIONS variable (need this for siteCode and api setting (but passing in entire options object in case we need other things in the future).
            API_URL = OPTIONS.api + BASE_API_ROUTE; //set the API_URL (which is the api from options plus the BASE_API_ROUTE set here).
            //LOGGER.debug(NAME, "Init", "_Url", _Url);
            //ApiUrl = _Url + BaseRoute; //create full base api url based on base url from Core and BaseRoute.
        },
        GetConfiguration: function (opts) {
            Meta.clientUrl = document.location.href;
            Meta.userAgent = navigator.userAgent;
            Meta.guid = CnnXt.Storage.GetGuid();
            Meta.localConfig = localStorage.getItem("IsLocalConfig");
            opts.meta = Meta;
            return Get({ method: 'GetConfiguration', options: opts });
        },
        GetUserByEmailAndPassword: function (opts) {
            return Get({ method: "GetUserByEmailAndPassword", options: opts });
        },
        ClearServerCache: function() {
            clearServerCache();
        },
        CheckAccess: function (opts) {
            return Get({ method: "CheckAccess", options: opts });
        },
        GetUserByMasterId: function (opts) {
            return Get({ method: "GetUserByMasterId", options: opts });
        },
        GetUserLastUpdateDate: function(opts) {
            return Get({ method: "GetUserLastUpdateDate", options: opts });
        },
        GetUserByEncryptedMasterId: function (opts) {
            return Get({ method: "GetUserByEncryptedMasterId", options: opts });
        },
        /*SendViewData: function() {
            var userData = {
                    UserId: CnnXt.AppInsights.getUserId(),
                    ConfigCode: CnnXt.GetOptions().configCode,
                    SiteCode: CnnXt.GetOptions().siteCode,
                    SettingsKey: CnnXt.GetOptions().settingsKey,
                    URL: CnnXt.Utils.GetUrl(),
                    URLHash: MD5(CnnXt.Utils.GetUrl()),
                    DeviceType: CnnXt.Utils.getDeviceType(),
                    IP: CnnXt.Utils.GetIP(),
                    ZipCodes: CnnXt.Storage.GetActualZipCodes().join(','),
                    CurrentViewCount: CnnXt.Campaign.GetCurrentConversationViewCount(),
                    MeterLevel: CnnXt.Storage.GetCurrentConverstaion().MeterLevelId,
                    PluginVersion: CnnXt.GetVersion(),
                    ConversationName: CnnXt.Storage.GetCurrentConverstaion().Name,
                    ConversationId: CnnXt.Storage.GetCurrentConverstaion().id,
                    DynamicMeterName: CnnXt.Storage.GetLocalConfiguration().DynamicMeter.Name,
                    DynamicMeterId: CnnXt.Storage.GetLocalConfiguration().DynamicMeter.id,
                    CampaignName: CnnXt.Storage.GetLocalConfiguration().Campaign.Name,
                    CampaignId: CnnXt.Storage.GetLocalConfiguration().Campaign.id,
                    OS: CnnXt.Utils.GetUserMeta().OS,
                    Browser: CnnXt.Utils.GetUserMeta().Browser,
                    ConnextUserState: CnnXt.User.getUserState(),
                    //masterId: CnnXt.User.getMasterId()
            }
            var data = {
                userData: userData,
                masterId: 'qwerty'
            }

            return $.ajax({
                url: API_URL + 'collectdata',
                type: "POST",
                //contentType: 'application/json; charset=utf-8',
                data: data,
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    LOGGER.debug(NAME, "<< SUCCESS >>", "textStatus", textStatus, "data", data, "xhr", xhr);
                },
                error: function (err) {
                },
                complete: function () {
                }
            });
        },*/
        SendViewData: function() {
            var fnName = 'SendViewData';

            try {

                var conversationData = [];
                var conversations = CnnXt.Storage.GetLocalConfiguration().Campaign.Conversations;
                for (key in conversations) {
                    conversations[key].forEach(function(conversation) {
                        var views = CnnXt.Storage.GetDeviceViews(conversation.id);
                        conversationData.push({
                            Id: conversation.id,
                            ViewCount: views,
                            StartDate: conversation.Props.Date.started
                        });
                    });
                }
                var data = {
                    UserId: CnnXt.GetOptions().deviceId,
                    ConfigCode: CnnXt.GetOptions().configCode,
                    SiteCode: CnnXt.GetOptions().siteCode,
                    SettingsKey: CnnXt.GetOptions().settingsKey,
                    ViewData: JSON.stringify(conversationData)
                };
                if (CnnXt.User.getMasterId()) {
                    var id = CnnXt.User.getMasterId();
                    id = decodeURIComponent(id);
                    data.masterId = id;
                }

                CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall,
                    { ApiUrl: API_URL + ROUTES.viewsData, ApiPayload: data });

                return $.ajax({
                    url: API_URL + ROUTES.viewsData,
                    type: "POST",
                    data: data,
                    dataType: "json",
                    success: function(data, textStatus, xhr) {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data, "xhr", xhr);
                    },
                    error: function(err) {
                        LOGGER.error(fnName, "Ajax.Error", err);
                    },
                    complete: function() {
                    }
                });
            } catch (e) {
                console.error(NAME, fnName, "EXCEPTION", e);
            }
        },
        GetViewData: function() {
            var data = {
                UserId: CnnXt.GetOptions().deviceId,
                ConfigCode: CnnXt.GetOptions().configCode,
                SiteCode: CnnXt.GetOptions().siteCode,
                SettingsKey: CnnXt.GetOptions().settingsKey
            };

            CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: API_URL + ROUTES.viewsData });

            return $.ajax({
                url: API_URL + ROUTES.viewsData,
                type: "GET",
                data: data
            });
        },
        DeleteViewsByUserId: function() {
            var data = {
                UserId: CnnXt.GetOptions().deviceId,
                MasterId: CnnXt.User.getMasterId(),
                ConfigCode: CnnXt.GetOptions().configCode,
                SiteCode: CnnXt.GetOptions().siteCode,
                SettingsKey: CnnXt.GetOptions().settingsKey
            };

            CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: API_URL + ROUTES.DeleteViewsByUserId });

            return $.ajax({
                url: API_URL + ROUTES.DeleteViewsByUserId(data),
                type: "GET",
                data: data
            });
        },
        meta: Meta,
        GetLastPublishDateS3: function () {
            var fnName = "GetLastPublishDateS3";
            try {

                var jsonURL = CnnXt.Common.S3RootUrl[OPTIONS.environment] + 'data/last_publish/' + OPTIONS.siteCode + '.json?_=' + new Date().getTime();
                LOGGER.debug(NAME, fnName, 'jsonURL', jsonURL);
                Meta.publishFile.url = jsonURL;
                //return $.ajax since it is a deferred object and we use that in the calling CnnXt.Core function.

                CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.APICall, { ApiUrl: jsonURL });

                return $.ajax({
                    crossDomain: true,
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    url: jsonURL,
                    success: function (data) {
                        LOGGER.debug(NAME, fnName, 'success', data);
                        Meta.publishFile.responceCode = 200;
                    },
                    error: function (a, b, c) {
                        LOGGER.debug(NAME, fnName, 'error', 'a, b, c', a, b, c);
                        Meta.publishFile.responceCode = a.status;
                        Meta.reason = CnnXt.Common.DownloadConfigReasons.getPublishFailed;
                        //if (a.status == 403) {
                        //    deferred.reject("JSON file does not exist in AWS");
                        //} else {
                        //    deferred.reject("Error Getting last_published JSON file");
                        //}

                    }
                });
            } catch (e) {
                console.error(NAME, fnName, '<<EXCEPTION>>', e);
                Meta.reason = CnnXt.Common.DownloadConfigReasons.getPublishFailed;
                Meta.publishFile.ex = e;
                //deferred.reject(e);
            }
        },
        NewsletterSubscribe: function (opts) {
            return GetNewsletters({ method: "NewsletterSubscribe", options: opts });
        }
    }
};

var ConnextUser = function ($) {

    //#region GLOBALS
    var NAME = "User";

    //local reference to CnnXt.Logger
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
        NoActiveSubscription: "No Active Subscription",
        SubscribedNotEntitled: "Subscribed Not Entitled",
        Subscribed: "Subscribed"
    };
    var GUP_SETTINGS;
    var USER_STATE = USER_STATES.NotLoggedIn;
    var TIMEOUT;
    var lock;
    var masterId;
    var USER_DATA = {};
    var incorrectCreditsMessage = "UserName or Password invalid. Please try again or click on the Forgot/Reset Password link to update your password, or create an account if you have never registered an email address with us.";

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
                TIMEOUT = setTimeout(function () {
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
        JanrainLoginBtn: "[data-mg2-submit=janrainLogin]:visible",
        InputUsername: "[data-mg2-alert=login] [data-mg2-input=Email]",
        InputPassword: "[data-mg2-alert=login] [data-mg2-input=Password]",
        ActionShowLogin: "[data-mg2-action=login]",
        LogoutButton: "[data-mg2-action=logout]",
        SubscribeButton: '[data-mg2-action="submit"]',
        SubmitZipCode: '[data-mg2-action="Zipcode"]',
        OpenNewsletterWidget: '[data-mg2-action="openNewsletterWidget"]',
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

                    href = CnnXt.Utils.AddParameterToURL(href, "email=" + email);
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

                    href = CnnXt.Utils.AddParameterToURL(href, "zipcode=" + zip);
                    $this.attr("href", href);
                    if ($this[0].hasAttribute("target")) {
                        window.open(href, "_blank");
                    } else {
                        window.location.href = href;
                    }
                } catch (e) {
                    console.error(NAME, fnName, "<<EXCEPTION>>", e);
                }
            });

            $("body").on("click", UI.OpenNewsletterWidget, function (e) {
                e.preventDefault();
                var fnName = UI.OpenNewsletterWidget + ".CLICK";
                LOGGER.debug(NAME, fnName);
                try {
                    var $this = $(this);
                    var params = {};

                    if ($this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val() != undefined &&
                        $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val() !== "") {
                        params.email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();
                    }
                    if ($this.data('category-ids-list') != undefined) {
                        params.categoryIdsList = $this.data('category-ids-list').toString()
                            .split(',').map(function (item) {
                                return parseInt(item, 10);
                            });
                    }
                    if ($this.data('newsletter-ids-list') != undefined) {
                        params.newsletterIdsList = $this.data('newsletter-ids-list').toString()
                            .split(',').map(function (item) {
                                return parseInt(item, 10);
                            });
                    }
                    if ($this.data('view-mode') != undefined) {
                        params.viewMode = $this.data('view-mode');
                    }

                    mg2WidgetAPI.openNewsletter(params);
                } catch (ex) {
                    console.error(Name, fnName, "<<EXCEPTION>>", e);
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
                    href = CnnXt.Utils.AddReturnUrlParamToLink(href);
                    href = CnnXt.Utils.AddParameterToURL(href, "email=" + email);
                    $this.attr("href", href);
                    if ($this[0].hasAttribute("target")) {
                        window.open(href, "_blank");
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
                    if (window.janrain) {
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

                    LOGGER.debug(NAME, fnName, "IS_LOGGED_IN", IS_LOGGED_IN);

                    if (AUTH_TYPE.MG2) {
                        //this is MG2 Auth type, show MG2 Login Modal.
                        $(UI.LoginModal).addClass("in");
                        $(UI.LoginModal).attr("id", "mg2-login-modal");
                        var loginModal = $(UI.LoginModal).connextmodal({ backdrop: "true" });
                        $(UI.LoginModal).css("display", "block");
                        $("[data-display-type=modal]").resize();
                        $(loginModal).on('hidden.bs.modal', function (e) {
                            window.CnnXt.Event.fire("onActionClosed", e);
                        });

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
                    else if (AUTH_TYPE.Auth0) {
                        if (Auth0Lock) {
                            showAuth0Login();
                        } else console.error("No Auth0 global object found...");
                    }
                    window.CnnXt.Event.fire("onActionShown", e);
                } catch (err) {
                    console.error(NAME, fnName, "Exception", err);
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

            } else if (OPTIONS.Site.RegistrationTypeId == 4) {
                AUTH_TYPE["Auth0"] = true;
                var lock = CnnXt.GetOptions().authSettings.auth0Lock;
                lock.on("authenticated", function (authResult) {
                    lock.getUserInfo(authResult.accessToken, function (error, profile) {
                        if (error) {
                            console.error('showAuth0Login', '', "<<EXCEPTION>>", error);
                            CnnXt.Storage.SetUserProfile('');
                            return;
                        }
                        CnnXt.Storage.SetUserProfile(profile);
                        CnnXt.Run();
                    });
                });

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
        var lastUpdateDateDeferred = $.Deferred();

        if (USER_DATA && USER_DATA.MasterId) {
            CnnXt.API.GetUserLastUpdateDate({
                payload: { masterId: USER_DATA.MasterId },
                onSuccess: function (data) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    if (CnnXt.Storage.GetUserLastUpdateDate() == null ||
                        new Date(CnnXt.Storage.GetUserLastUpdateDate()) < new Date(data)) {
                        CnnXt.Storage.SetUserState(null);
                        CnnXt.Storage.SetUserData(null);
                        CnnXt.Storage.SetUserLastUpdateDate(data);
                    }
                    lastUpdateDateDeferred.resolve();
                },
                onNull: function () {
                    LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                    lastUpdateDateDeferred.resolve();
                },
                onError: function (err) {
                    LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                    lastUpdateDateDeferred.resolve();
                }
            });
        } else {
            lastUpdateDateDeferred.resolve();
        }

        lastUpdateDateDeferred.promise().then(function () {
            clearUserStateIfWasRedirect();

            if (!CnnXt.Storage.GetAccountDataExpirationCookie()) {
                CnnXt.Storage.SetUserState(null);
                CnnXt.Storage.SetUserData(null);
            }

            USER_STATE = CnnXt.Storage.GetUserState();

            if (AUTH_TYPE.MG2) {
                if (CnnXt.Storage.GetigmRegID()) {
                    if (USER_STATE == USER_STATES.NotLoggedIn) {
                        USER_STATE = null;
                    }
                } else {
                    USER_STATE = USER_STATES.NotLoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                }
            }

            if (USER_STATE != null && USER_STATE != undefined && !AUTH_TYPE.Auth0) {

                if (AUTH_TYPE.Janrain) {
                    if (!window.localStorage.getItem("janrainCaptureToken")) {
                        USER_STATE = USER_STATES.NotLoggedIn;
                        CnnXt.Storage.SetUserState(USER_STATE);
                    }
                }

                if (USER_STATE == USER_STATES.NotLoggedIn) {
                    CnnXt.Storage.ClearUser();
                    CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                } else {
                    USER_DATA = CnnXt.Storage.GetUserData();
                    $(UI.ActionShowLogin).hide();
                    $(UI.LogoutButton).show();
                    if (USER_STATE == USER_STATES.LoggedIn) {
                        deferred.reject("onAuthorized");
                    } else if (isUserHasHighState()) {
                        var eventName = getEventNameForHighUserState();
                        deferred.reject(eventName);
                    }
                }

                if (USER_STATE != null) {
                    deferred.resolve(true);
                }
            }

            if (USER_STATE == null || USER_STATE == undefined || AUTH_TYPE.GUP || AUTH_TYPE.Auth0) {
                try {
                    //this is called on page load to check if the user has access. Depending the the AUTH_TYPE we will use different methods to determing if this user currently has access.
                    AUTH_TIMING.Start = new Date(); //set start time for determining access (used for Debug Details Panel)
                    USER_STATE = USER_STATES.NotLoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    CnnXt.Storage.SetAccountDataExpirationCookie(true);
                    getUserData()
                        .done(function (result) {
                            LOGGER.debug(NAME, fnName, "getUserData.done -- result", result);
                            if (!result) {
                                throw "No User Data Result";
                            }
                            masterId = result;
                            if (AUTH_TYPE.MG2) {
                                CnnXt.API.GetUserByEncryptedMasterId({
                                    payload: { encryptedMasterId: result },
                                    onSuccess: function (data) {
                                        data.MasterId = masterId;
                                        if (AUTH_TYPE.Auth0) {
                                            data.AuthSystem = "Auth0";
                                        } else if (AUTH_TYPE.GUP) {
                                            data.AuthSystem = "GUP";
                                        }

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
                                        //CnnXt.Event.fire("onAuthorized", USER_STATE);
                                    },
                                    onError: function (err) {
                                        LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                                        AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                        deferred.reject("GetUserMasterId.onError");
                                        //CnnXt.Event.fire("onAuthorized", USER_STATE);
                                    }
                                });
                            } else if (AUTH_TYPE.Janrain) {
                                CnnXt.API.GetUserByMasterId({
                                    payload: { id: result },
                                    onSuccess: function (data) {
                                        LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);

                                        data.AuthSystem = "Janrain";

                                        processSuccessfulLogin("externalId", data);
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
                            }
                            else if (AUTH_TYPE.Auth0) {
                                USER_STATE = USER_STATES.LoggedIn;
                                CnnXt.Storage.SetUserState(USER_STATE);
                                if (CnnXt.Storage.GetUserData()) {
                                    processSuccessfulLogin("externalId", CnnXt.Storage.GetUserData());
                                    deferred.resolve(true);
                                } else {
                                    CnnXt.API.GetUserByMasterId({
                                        payload: { id: result },
                                        onSuccess: function (data) {

                                            data.AuthSystem = "Auth0";

                                            LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                                            processSuccessfulLogin("externalId", data);
                                            AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                            deferred.resolve(true);
                                        },
                                        onNull: function () {
                                            LOGGER.debug(NAME, fnName, "<< NO RESULTS >>");
                                            AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                            deferred.reject("GetUserByExternalId.onNull");
                                        },
                                        onError: function (err) {
                                            LOGGER.debug(NAME, fnName, "<< ERROR >>", "err", err);
                                            AUTH_TIMING.Done = new Date(); //set Done for performance testing.
                                            deferred.reject("GetUserByExternalId.onError");
                                        }
                                    });
                                }
                            } else if (AUTH_TYPE.GUP) {
                                //GUP Auth
                                var gupUserHasAccess = AuthenticateGupUser(result);
                                AUTH_TIMING.Done = new Date();
                                LOGGER.debug(NAME, fnName, "getUserData.done -- gupUserHasAccess", gupUserHasAccess);
                                deferred.resolve(true);
                                LOGGER.debug(NAME, fnName, "getUserData.done", "Has GUP Data", result);
                            } else {
                                CnnXt.Event.fire("onCriticalError",
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
        });

        return deferred.promise();
    };

    var processSuccessfulLogin = function (type, data) {
        /// <summary>This is called when a user is successfully logged in (authenticated). This doesn't mean they have Premium access, this is what this function will determine. It also calls any UI related functions based on the result of checking access.</summary>
        /// <param name="type" type="String">This is the type of authentication method was used (will either be 'Form' or 'Token'</param>
        /// <param name="data" type="Object">The data returned from whatever was used to determine authentication (we'll use AUTH_TYPE to handle this object in the appropriate way).</param>
        /// <returns>None</returns>
        var fnName = "processSuccessfulLogin";

        try {
            USER_STATE = USER_STATES.LoggedIn;
            USER_DATA = CnnXt.Utils.ShapeUserData(data);

            CnnXt.Storage.SetUserData(USER_DATA);

            //CnnXt.Event.fire("onLoggedIn", { "MG2AccountData": USER_DATA, "AuthProfile": CnnXt.Storage.GetUserProfile(), "AuthSystem": USER_DATA.AuthSystem });

            LOGGER.debug(NAME, fnName, "type", type, "USER_DATA", USER_DATA);

            HandleUiLoggedInStatus(true);

            if (!USER_DATA.Subscriptions || USER_DATA.Subscriptions == null) {
                NOTIFICATION.show("NoSubscriptionData");
                //CnnXt.Event.fire("onAuthorized", { "UserState": USER_STATE, "MG2AccountData": USER_DATA });
            } else {
                //we have a USER_DATA.Subscriptions that is not an object, so parse it.
                if (!_.isObject(USER_DATA.Subscriptions)) {
                    USER_DATA.Subscriptions = $.parseJSON(USER_DATA.Subscriptions);
                }
                var zipCodes = _.map(USER_DATA.Subscriptions, function (subscription) {
                    return (subscription.BillingAddress && subscription.BillingAddress.ZipCode)
                        ? subscription.BillingAddress.ZipCode
                        : subscription.PostalCode;
                });
                CnnXt.Storage.SetUserZipCodes(zipCodes);
                $("#ddZipCode").html(zipCodes.toString());
            }
            //handle any AUTH_TYPE specific actions below.
            if (AUTH_TYPE.MG2) {
                if (USER_DATA.IgmRegID) {
                    CnnXt.Storage.SetigmRegID(USER_DATA.IgmRegID);
                }
                if (USER_DATA.IgmContent) {
                    CnnXt.Storage.SetIgmContent(USER_DATA.IgmContent);
                }
                //MG2 Auth
            } else if (AUTH_TYPE.Janrain) {
                //Janrain Auth
            } else if (AUTH_TYPE.GUP) {
                //GUP Auth
            } else if (AUTH_TYPE.Auth0) {
                //Auth0
            } else {
                //unknown AUTH_TYPE, fire critical event and .reject();
                CnnXt.Event.fire("onCriticalError", { 'function': "processAuthentication", 'error': "Unknown Registration Type" });
            }

            defineUserState(USER_DATA);

            if (isUserHasHighState()) {
                //var eventName = getEventNameForHighUserState();
                //CnnXt.Event.fire(eventName, USER_STATE);

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
                //CnnXt.Event.fire("onAuthorized", USER_STATE);
            }

            CnnXt.Storage.SetUserState(USER_STATE);
            CnnXt.API.SendViewData();
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var defineUserState = function (data) {
        var fnName = "defineUserState";
        try {
            if (!_.isEmpty(data.DigitalAccess.Errors)) {
                USER_STATE = USER_STATES.LoggedIn;
            } else if (!data.Subscriptions || data.Subscriptions.lenght == 0) {
                USER_STATE = USER_STATES.LoggedIn;
            } else if (data.DigitalAccess.AccessLevel.IsPremium) {
                USER_STATE = USER_STATES.Subscribed;
            } else if (data.DigitalAccess.AccessLevel.IsUpgrade) {
                USER_STATE = USER_STATES.SubscribedNotEntitled;
            } else if (data.DigitalAccess.AccessLevel.IsPurchase) {
                USER_STATE = USER_STATES.NoActiveSubscription;
            }
        } catch (e) {
            LOGGER.error(NAME, fnName, "EXCEPTION", e);
        }
    }

    var isUserHasHighState = function () {
        var highState = false;
        switch (USER_STATE) {
            case USER_STATES.Subscribed:
            case USER_STATES.SubscribedNotEntitled:
            case USER_STATES.NoActiveSubscription:
                highState = true;
                break;
        }
        return highState;
    }

    var getEventNameForHighUserState = function () {
        var eventName = 'onNotAuthorized';
        switch (USER_STATE) {
            case USER_STATES.LoggedIn:
                eventName = 'onAuthorized';
                break;
            case USER_STATES.Subscribed:
                eventName = 'onHasAccess';
                break;
            case USER_STATES.SubscribedNotEntitled:
                eventName = 'onHasAccessNotEntitled';
                break;
            case USER_STATES.NoActiveSubscription:
                eventName = 'onHasNoActiveSubscription';
                break;
        }
        return eventName;
    }

    //#endregion ACCESS Functions

    //#region USER Functions (handles attempting to try and determine a user based on any previous info).

    var getUserData = function () {
        /// <summary>This gets user data regardless of the AUTH_TYPE. This will use the appropraite method to getting UserData depending on AUTH_TYPE, since some AUTH_TYPES require ajax calls we use a deferred object for all responses.</summary>
        /// <param name="" type=""></param>
        /// <returns type="Object">Returns object with 2 props (type=AUTH_TYPE and value AUTH_TYPE related value.)</returns>
        var fnName = "getUserData";
        var deferred = $.Deferred();
        try {

            //NOTE: if we get successful USER_DATA we are calling 'resolve' and passing in this data. The function calling this one handles the type of data returned (for MG2 it is a userToken, for Janrain it is a UUID etc...)

            if (AUTH_TYPE.MG2) {
                var encryptedMasterId = CnnXt.Storage.GetigmRegID();
                if (encryptedMasterId) {
                    deferred.resolve(encryptedMasterId);
                } else {
                    deferred.reject("No MG2 UserToken");
                }
            } else if (AUTH_TYPE.Janrain) {
                if (window.JANRAIN) {
                    if (!window.localStorage.getItem("janrainCaptureToken")) {
                        USER_STATE = USER_STATES.NotLoggedIn;
                        CnnXt.Storage.SetUserState(USER_STATE);
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
                    CnnXt.Storage.SetUserState(USER_STATE);
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
            } else if (AUTH_TYPE.Auth0) {
                var domain = Connext.GetOptions().authSettings.domain;
                if (domain == null || domain == '') {
                    domain = Connext.GetOptions().authSettings.auth0.client
                        ? Connext.GetOptions().authSettings.auth0.client.baseOptions.domain
                        : Connext.GetOptions().authSettings.auth0._domain;
                }
                var url = 'https://' + domain + '/user/ssodata/';
                $.ajax({
                    url: url,
                    type: "GET",
                    withCredentials: true,
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        if (data && data.sso) {
                            try {
                                deferred.resolve(data.lastUsedUserID);
                            }
                            catch (ex) {
                                LOGGER.error(NAME, fnName, "auth0 parse response error", ex);
                                USER_STATE = USER_STATES.NotLoggedIn;
                                CnnXt.Storage.SetUserState(USER_STATE);
                                CnnXt.Storage.ClearUser();
                                deferred.reject(null);
                            }
                        }
                        else {
                            LOGGER.debug(NAME, fnName, "SSO - false", data);
                            USER_STATE = USER_STATES.NotLoggedIn;
                            CnnXt.Storage.SetUserState(USER_STATE);
                            CnnXt.Storage.ClearUser();
                            deferred.reject(null);
                        }
                    }
                });
            } else {
                //unknown AUTH_TYPE, fire critical event and .reject();
                CnnXt.Event.fire("onCriticalError", { 'function': "getUserData", 'error': "Unknown Registration Type" });
                deferred.reject("Unknown Registration Type");
            }
            return deferred.promise();

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }

    };

    var logoutUser = function () {
        var fnName = "logoutUser";

        try {
            LOGGER.debug(NAME, fnName);

            HandleUiLoggedInStatus(false);

            CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
            CnnXt.Run();
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
            var profileData = window.localStorage.getItem("janrainCaptureProfileData");

            if (profileData == null) {
                profileData = window.localStorage.getItem("janrainCaptureReturnExperienceData");
            }

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
            CnnXt.API.GetUserByMasterId({
                payload: { id: result.userData.uuid },
                onSuccess: function (data) {

                    data.AuthSystem = 'Janrain';

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
        var loginTab = window.open(
            GUP_SETTINGS.LoginServiceBasePath + "authenticate/?window-mode=popup",
            "_blank",
            "toolbar=no, scrollbars=yes, resizable=no, " +
            "width=" + popupWidth + ", " +
            "height=" + popupHeight + ", " +
            "top=" + popupPositionTop + ", " +
            "left=" + popupPositionLeft
        );
        loginTab.onunload = function (e) {
            LOGGER.debug(NAME, "<< GUP >>", e);
        }
        return;
    };

    var GetCurrentGupUser = function () {
        LOGGER.debug("User", "getCurrentGUPUser");
        return $.ajax({
            type: "POST",
            url: GUP_SETTINGS.UserServiceBasePath + "user/?callback=?", //need to update based on ADMIN settings.
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
                    CnnXt.Storage.SetUserState(USER_STATE);
                    //CnnXt.Event.fire("OnHasAccess", USER_STATE);
                    return true;
                } else {
                    //even though this user is logged in, they don't have access, so fire deferred.reject().
                    LOGGER.debug(NAME, fnName, "GUP User <<IS>> LOGGED IN, but doesnt have marketAccess");
                    USER_STATE = USER_STATES.LoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    //CnnXt.Event.fire("onAuthorized", USER_STATE);
                    ////deferred.reject();
                    return false;
                }
                //whether they have marketAccess or not, set logged in to true (so on login/logout click events we know logged in state and don't have to call GetUser again.;
                ////IS_LOGGED_IN = true;
            } else {
                //user is not logged into GUP.
                LOGGER.debug(NAME, fnName, "GUP User <<NOT>> LOGGED IN");
                USER_STATE = USER_STATES.NotLoggedIn;
                CnnXt.Storage.SetUserState(USER_STATE);
                //CnnXt.Event.fire("onNotAuthorized", USER_STATE);
                return false;
                ////IS_LOGGED_IN = false;
                ////deferred.reject();
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            USER_STATE = USER_STATES.NotLoggedIn;
            CnnXt.Storage.SetUserState(USER_STATE);
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
            var $el = $(UI.ActionShowLogin); //gets all the elements that have the selector for UI.ActionShowLogin. We will change their status based on 'isLoggedIn' argument.

            //set global status here (this is important since we use this var to determine the appropriate action when a user clicks the UI.ActionShowLogin element (should we show modal or log them out).
            IS_LOGGED_IN = isLoggedIn;

            if (isLoggedIn) {
                USER_STATE = USER_STATES.LoggedIn;
            } else {
                USER_STATE = USER_STATES.NotLoggedIn;
            }

            if (IS_LOGGED_IN) {
                //is logged in.
                $(UI.LogoutButton).show();
                $(UI.ActionShowLogin).hide();
                //sets the html to the data property for 'mg2-logged-in'. This lets the client to set this on their site and we will update accordingly (i.e Logout or Log Out or Sign Out etc..).
                $el.html($el.data("mg2-logged-in"));
                //CnnXt.Event.fire("onAuthorized", null);
            } else {
                //not logged in.
                $el.html($el.data("mg2-logged-out"));
                CnnXt.Storage.ClearUser();
                $(UI.LogoutButton).hide();
                $(UI.ActionShowLogin).show();
                //CnnXt.Event.fire("onNotAuthorized", null);
                $("#ddZipCode").html(CnnXt.Storage.GetActualZipCodes());
            }
        } catch (e) {
            LOGGER.debug(NAME, fnName, "EXCEPTION", e);
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
            CnnXt.API.GetUserByEmailAndPassword({
                payload: { email: email, password: password },
                onSuccess: function (data) {
                    data.Email = email;

                    data.AuthSystem = 'MG2';

                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    processSuccessfulLogin("Form", data);
                    $(UI.ActionShowLogin).hide();
                    $(UI.LogoutButton).show();
                    CnnXt.Run();
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
                                        errorMessage = incorrectCreditsMessage;
                                    }
                                }

                            } else {
                                errorMessage = err.responseJSON.Message;
                                var json = JSON.parse(err.responseJSON.Message);
                                if (json.Message) {
                                    errorMessage = json.Message;
                                    if (errorMessage == "UserName or Password invalid.") {
                                        errorMessage = incorrectCreditsMessage;
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

    //var LogoutGupUser = function () {
    //    LOGGER.debug("User", "logoutGUPUser");

    //    return $.ajax({
    //        type: "POST",
    //        url: GUP_SETTINGS.UserServiceBasePath +
    //        "user/logout/?callback=?", //need to update based on ADMIN settings.
    //        contentType: "application/json; charset=utf-8",
    //        dataType: "json",
    //        async: true
    //    });
    //};

    var showAuth0Login = function () {
        var authObj = CnnXt.GetOptions().authSettings;
        if (authObj.auth0Lock == null || authObj.auth0Lock == undefined) {
            LOGGER.warn('showAuth0Login', '', "<<EXCEPTION>>  Auth0Lock object is null", authObj.auth0Lock);
        }
        authObj.auth0Lock.show();
    };

    var clearUserStateIfWasRedirect = function () {
        var fnName = 'clearUserStateIfWasRedirect';
        try {
            LOGGER.debug('User', fnName);
            if (CnnXt.Utils.getUrlParam('clearUserState')) {
                CnnXt.Storage.SetUserData(null);
                CnnXt.Storage.SetUserState(null);
            }
        } catch (e) {
            console.error(NAME, fnName, 'EXCEPTION', e);
        }
    };
    //#endregion AJAX CALLS

    return {
        //main function to initiate the module
        init: function (options) {
            LOGGER = CnnXt.Logger;
            OPTIONS = (options) ? options : {}; //if not options set to blank object
            init();
            if (OPTIONS.Site.RegistrationTypeId == 3) {
                GUP_SETTINGS = {
                    'UserServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountService : "",
                    'LoginServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountLoginUrl : ""
                };
            }
            //return this;
        },
        CheckAccess: function () {
            var deferred = $.Deferred();
            checkAccess()
                .done(function () {
                    deferred.resolve();
                })
                .fail(function () {
                    deferred.reject();
                })
                .always(function () {
                    var registrationTypeId = Connext.Storage.GetLocalConfiguration().Site.RegistrationTypeId;
                    var AUTHSYSTEM = CnnXt.Common.RegistrationTypes[registrationTypeId];
                    var eventName = getEventNameForHighUserState();
                    if (CnnXt.Storage.GetUserState() != USER_STATES.NotLoggedIn &&
                        CnnXt.Storage.GetUserState() != null) {
                        CnnXt.Event.fire("onLoggedIn", {
                            AuthSystem: AUTHSYSTEM,
                            AuthProfile: CnnXt.Storage.GetUserProfile(),
                            MG2AccountData: Connext.Storage.GetUserData()
                        });
                    }

                    CnnXt.Event.fire(eventName, {
                        AuthSystem: AUTHSYSTEM,
                        AuthProfile: CnnXt.Storage.GetUserProfile(),
                        MG2AccountData: Connext.Storage.GetUserData()
                    });
                });
            return deferred.promise();
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
            return CnnXt.Storage.GetUserState();
        },
        onLogout: function () {
            LOGGER.debug(NAME, "onLogout");
            IS_LOGGED_IN = false;
            CnnXt.Storage.ClearUser();
            //Cookies.remove(Options.storageKeys.userRegId);
            //Cookies.remove(Options.storageKeys.userToken);
            //Cookies.remove(Options.storageKeys.accessToken);
        },
        getMasterId: function () {
            if (CnnXt.Storage.GetUserData())
                return CnnXt.Storage.GetUserData().IgmRegID ? CnnXt.Storage.GetUserData().IgmRegID : CnnXt.Storage.GetUserData().MasterId;
            return null;
        },
        isUserHasHighState: isUserHasHighState
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
                deferred.resolve();
            } else {
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
            var paramValue = CnnXt.Utils.GetUrlParam(segment.Options.ParamName);
            var qualifier = CnnXt.Common.QualifierMap[segment.Options.Qualifier];
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
                var qualifier = CnnXt.Common.QualifierMap[segment.Options.Qualifier];

                isPassed = eval("'" + hiddenFieldVal.toUpperCase() + "'" + qualifier + "'" + segment.Options.Val.toUpperCase() + "'");
            }

            if (isPassed) {
                deferred.resolve();
            } else {
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

            //LOGGER.debug(NAME, fnName, "-- Testing ---");

            var searchingVal = segment.Options.Val.toUpperCase();
            var sourceVal = window.location.hostname.toUpperCase(); // root domain won't be included
            var qualifier = segment.Options.Qualifier.toUpperCase();

            if (!((qualifier == "IN") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1))) {
                deferred.resolve();
            } else {
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

            var userZipCodes = CnnXt.Storage.GetActualZipCodes();

            if (userZipCodes && segment.Options.GeoQalifier !== undefined) {
                userZipCodes.forEach(function (zipCode) {
                    if (~segment.Options.Zipcodes.indexOf(zipCode)) {
                        isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                    } else if(segment.Options.Zipcodes.indexOf('*') >= 0){
                        var valueItems =segment.Options.Zipcodes.split(",") || segment.Options.Zipcodes.split("");
                        var foundZip =  valueItems.filter(function (value) {
                            var valueItem = value.split("");
                            var zipItems = zipCode.split("");
                            return zipItems.length != valueItem.length ? false : valueItem.every(function (item, i) {
                                return valueItem[i] === "*" ? true : item === zipItems[i];
                            });
                        });
                        if(foundZip.length > 0 ) {
                            isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                        }
                        else isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                    }else {
                        isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                    }
                });
            }

        } catch (e) {
            isPassed = false;
        }

        if (isPassed) {
            deferred.resolve();
        } else {
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
            if ($.isArray(jsValue)) {
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
                if (jsValue){
                    jsValue = jsValue.toString().toLowerCase();
                }

                if (segment.Options.Qualifier == "Contains" ||
                    segment.Options.Qualifier == "Doesn't contain") {
                    if (jsValue == undefined) {
                        isPassed = segment.Options.Qualifier == "Doesn't contain";
                    } else {
                        var delimiter, array;
                        delimiter = segment.Options.Delimiter ? new RegExp(segment.Options.Delimiter.replace(/space/g, '/\s'), 'g') : /[ ,;]/g;
                        array = jsValue.split(delimiter); //split(/[,;]/g);

                        if (array.indexOf(segment.Options.Val.toLowerCase()) >= 0) {
                            isPassed = segment.Options.Qualifier == "Contains";
                        } else {
                            isPassed = segment.Options.Qualifier == "Doesn't contain";
                        }
                    }
                } else {
                    if (CnnXt.Utils
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
                deferred.resolve();
            } else {
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
            var userState = CnnXt.User.getUserState();

            if (userState == null)
                userState = "Logged Out";
            var isPassed = true;// userState == segment.Options["User State"];

            if (!CnnXt.Utils
                .JSEvaluate(userState,
                    segment.Options['Qualifier'],
                    segment.Options["User State"],
                    "UserStateCriteria",
                    "string")) {
                isPassed = false;
            }


            if (isPassed) {
                deferred.resolve();
            } else {
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
            var adBlockDetected = CnnXt.Utils.detectAdBlock();
            var qualifier = segment.Options["Ad Block"].toUpperCase();
            if (!((qualifier == "DETECTED") ^ adBlockDetected)) {
                deferred.resolve();
            } else {
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
                metaArray = CnnXt.Utils.getMetaTagsWithKeywords(),
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
                deferred.resolve();
            } else {
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

                //set format for article check to DB value or if it does not exist or is set to empty string then use default value in CnnXt.Common.
                var format = (_.isNothing(options.Format) ? CnnXt.Common.DefaultArticleFormat : options.Format);
                LOGGER.info(NAME, fnName, "Using Format: ", format);
                var articleDateData;
                //get the article text based on the selector
                if (options.Selector.indexOf("$") > -1) {
                    articleDateData = eval(options.Selector);
                } else {
                    articleDateData = $(options.Selector).text();
                }

                LOGGER.info(NAME, fnName, "articleDateData", articleDateData);

                var articleDate = CnnXt.Utils.ParseCustomDates(articleDateData, format);

                var now = CnnXt.Utils.Now();

                var articleAgeInDays = CnnXt.Utils.Diff(now, articleDate);

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
            LOGGER = CnnXt.Logger;
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
            CnnXt.Storage.ClearOldCookies();
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
                CnnXt.Storage.SetCurrentConverstaion(null);
                //TODO: maybe add event firing here so we can update the 'Note' section on the debug panel letting user know that now conversation was found.
                //throw "No Conversation Found To Process"
                throw CnnXt.Common.ERROR.NO_CONVO_FOUND;

            } else {
                LOGGER.debug(NAME, fnName, "Conversation To Process", CURRENT_CONVERSATION);

                processConversation();

            }

        } catch (e) {
            console.warn(NAME, fnName, "EXCEPTION", e);
            CnnXt.Event.fire("onCriticalError", e);
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
            //handleArticleView();

            CnnXt.Storage.UpdateViewedArticles(CURRENT_CONVERSATION.id);
            updateArticleViewCount(CnnXt.Storage.GetCurrentConversationViewCount(CURRENT_CONVERSATION.id));

            //we have a current conversation (either stored or a new conversation). Fire onConversationDetermined event and Proccess it.
            CnnXt.Storage.SetCurrentConverstaion(CURRENT_CONVERSATION);

            //we now need to determine which actions within this conversation should be fired.
            var actions = determineConversationActions(),
                validActions = determineConversationActions(true);

            calculateArticleLeft(validActions);
            CnnXt.Storage.SetCurrentConverstaion(CURRENT_CONVERSATION);

            //we fire onConversationDetermined after the handleArticleView function because this even will update our Demo Debug details 'view' html.
            CnnXt.Event.fire("onConversationDetermined", CURRENT_CONVERSATION);

            if (actions.length > 0) {
                //we have at least one action to execute.
                LOGGER.debug(NAME, fnName, "ACTIONS DETERMINGED ---> ", actions);



                CnnXt.Action.ProcessActions(actions);

            } else {
                LOGGER.warn(NAME, fnName, "No 'Actions' to execute.");
            }

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var calculateArticleLeft = function (validActions) {
        var lastArticleNumber = 99999;
        var fnName = "calculateArticleLeft";
        var paywalls = _.where(validActions, { ActionTypeId: 3 });
        var paywallViews = [];

        LOGGER.debug(NAME, fnName, "Try to find paywalls");

        if (paywalls.length > 0) {
            LOGGER.debug(NAME, "paywalls found", paywalls);

            $.each(paywalls, function (key, paywall) {
                var paywallView = -1;

                if (paywall.Who.ViewsCriteria) {
                    $.each(paywall.Who.ViewsCriteria, function (key, view) {
                        if (view.Qualifier == "==" || view.Qualifier == ">=") {
                            paywallView = view.Val > paywallView ? view.Val : paywallView;
                        } else if (view.Qualifier == ">") {
                            paywallView = parseInt(view.Val) + 1 > paywallView ? parseInt(view.Val) + 1 : paywallView;
                        }

                        paywallViews.push(paywallView);
                    });
                }

                if (lastArticleNumber > paywallView) {
                    lastArticleNumber = paywallView;
                }
            });

            if (lastArticleNumber == -1) {
                lastArticleNumber = 99999;
            } else {
                lastArticleNumber = _.min(paywallViews);
            }

            CURRENT_CONVERSATION.Props.ArticleLeft = lastArticleNumber == 99999
                ? "unlimited"
                : lastArticleNumber - getCurrentConversationViewCount();

            if (CURRENT_CONVERSATION.Props.ArticleLeft < 0) {
                CURRENT_CONVERSATION.Props.ArticleLeft = 0;
            }

            $.each(validActions, function (key, val) {
                if (val.What.Html) {
                    val.What.Html = val.What.Html.replace(ArticleLeftString, CURRENT_CONVERSATION.Props.ArticleLeft);
                }
            });

        } else {
            CURRENT_CONVERSATION.Props.ArticleLeft = "unlimited";
        }

        $("#ddCurrentConversationArticleLeft").html(CURRENT_CONVERSATION.Props.ArticleLeft);

    };


    var getCurrentConversation = function () {
        /// <summary>This will get the conversation that we should use. This handles checking for stored conversations, validating them and handling any conversation expirations</summary>
        /// <param name="" type=""></param>
        /// <returns type="Object">Conversation object to process.</returns>
        var fnName = "getCurrentConversation";
        try {
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

                    //reset old conversation after expire - RETURN this in the future releases
                    //CnnXt.Storage.ResetConversationViews(CURRENT_CONVERSATION);

                    CURRENT_CONVERSATION = getNextConversation();

                    if (CURRENT_CONVERSATION) {
                        setDefaultConversationProps();
                        CnnXt.Storage.ResetConversationViews(CURRENT_CONVERSATION);
                        CnnXt.Event.fire("onDebugNote", "Conversation Expire: " + CURRENT_CONVERSATION.Props.expiredReason);
                        return CURRENT_CONVERSATION;
                    } else {
                        return storedConversation;
                    }

                }

            } else {
                //no stored conversation so we need to use the first conversation in the configuration.Campaign object (with this meter level).


                var allConversations = getAllConversationsByMeterLevel(METER_LEVEL);
                //var currentConversations = CnnXt.Storage.GetCampaignData().Conversations[METER_LEVEL];
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

                        //reset old conversation after expire - RETURN this in the future releases
                        //CnnXt.Storage.ResetConversationViews(CURRENT_CONVERSATION);

                        CURRENT_CONVO = getNextConversation();

                        if (CURRENT_CONVO) {
                            CnnXt.Storage.ResetConversationViews(CURRENT_CONVERSATION);
                            return CURRENT_CONVO;
                        }
                    }

                    //since we know this is a new conversation, set some values (like Date started, Expirate Date ect...). We also don't need to verify this conversation since this it is new.
                    return CURRENT_CONVERSATION;

                } else {
                    LOGGER.debug(NAME, fnName, "No Conversation for this meter level");
                }
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
        var fnName = "isConversationValid",
            ExpirationsObj = CURRENT_CONVERSATION.Options.Expirations;
        try {
            //LOGGER.debug(pName, fnName);
            //first we check we this was flagged for expiration from an USER_ACTION on a previous page load
            if (CURRENT_CONVERSATION.Props.isExpired) {
                //this was previously flagged to expire.
                LOGGER.debug(NAME, fnName, "Current conversation was previously set to expired.");
                return false;
            } else {
                //this was not flagged to expire, but we need to check that it is still valid based on the expiration date.
                if (ExpirationsObj.Time) {
                    //we have a 'Time' expiration type, so check against it.
                    var now = CnnXt.Utils.Now();

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
                if (ExpirationsObj.UserState) {
                    var stateExpiration = ExpirationsObj.UserState;
                    if (stateExpiration["User State"] == CnnXt.User.getUserState()) {
                        CURRENT_CONVERSATION.Props.isExpired = true;
                        CURRENT_CONVERSATION.Props.expiredReason = "UserState";
                        return false;
                    }
                    if (stateExpiration["User State"] == "Logged In" && CnnXt.User.getUserState() == "Subscribed") {
                        CURRENT_CONVERSATION.Props.isExpired = true;
                        CURRENT_CONVERSATION.Props.expiredReason = "UserState";
                        return false;
                    }
                }
                if (ExpirationsObj.Register) {
                    if (CnnXt.GetOptions().integrateFlittz && window.Flittz &&
                        (window.Flittz.FlittzUserStatus == 'FlittzLoggedIn')) {
                        CURRENT_CONVERSATION.Props.isExpired = true;
                        CURRENT_CONVERSATION.Props.expiredReason = "Register";
                        return false;
                    }
                }
                if (ExpirationsObj.JSVar) {

                    LOGGER.debug(NAME, fnName, "Checking Javascript Expiration Criteria: ", ExpirationsObj);

                    var varValue = ExpirationsObj.JSVar.JSVarName,
                        jsValue;

                    try {
                        jsValue = eval(varValue);
                    } catch (e) { }

                    if ($.isArray(jsValue)) {
                        jsValue = jsValue.map(function (item) {
                            return item.trim().toLowerCase();
                        });

                        if (ExpirationsObj.JSVar.JSVarQualifier == "In" || ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {
                            if (jsValue.indexOf(ExpirationsObj.JSVar.JSVarValue.toLowerCase()) >= 0) {
                                if (ExpirationsObj.JSVar.JSVarQualifier == "In") {
                                    CURRENT_CONVERSATION.Props.isExpired = true;
                                    CURRENT_CONVERSATION.Props.expiredReason = "JSVar";
                                    return false;
                                }
                            } else {
                                if (ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {
                                    CURRENT_CONVERSATION.Props.isExpired = true;
                                    CURRENT_CONVERSATION.Props.expiredReason = "JSVar";
                                    return false;
                                }
                            }
                        }

                    } else {

                        if (jsValue) {
                            jsValue = jsValue.toString().toLowerCase();
                        }

                        if (ExpirationsObj.JSVar.JSVarQualifier == "In" || ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {

                            var delimiter,
                                array;

                            delimiter = ExpirationsObj.JSVar.JSVarDelimiter ? new RegExp(ExpirationsObj.JSVar.JSVarDelimiter.replace(/space/g, '/\s'), 'g') : /[ ,;]/g;
                            array = jsValue.split(delimiter);

                            if (array.indexOf(ExpirationsObj.JSVar.JSVarValue.toLowerCase()) >= 0) {

                                if (ExpirationsObj.JSVar.JSVarQualifier == "In") {
                                    CURRENT_CONVERSATION.Props.isExpired = true;
                                    CURRENT_CONVERSATION.Props.expiredReason = "JSVar";
                                    return false;
                                }
                            } else {
                                if (ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {
                                    CURRENT_CONVERSATION.Props.isExpired = true;
                                    CURRENT_CONVERSATION.Props.expiredReason = "JSVar";
                                    return false;
                                }
                            }

                        } else {
                            if (CnnXt.Utils
                                .JSEvaluate(jsValue,
                                ExpirationsObj.JSVar.JSVarQualifier,
                                ExpirationsObj.JSVar.JSVarValue.toLowerCase(),
                                "JavascriptCriteria")) {
                                CURRENT_CONVERSATION.Props.isExpired = true;
                                CURRENT_CONVERSATION.Props.expiredReason = "JSVar";
                                return false;
                            }
                        }
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
                    CURRENT_CONVERSATION.Props.paywallLimit = (val.Who.ViewsCriteria) ? val.Who.ViewsCriteria[0].Val : Infinity;
                    saveCurrentConversation();
                }

                if (val.ActionTypeId == 3 && paywallActionFound) {
                    //This action is a 'Paywall' and we have already added a 'Paywall' type to the 'actions' array, so do nothing.
                } else {
                    var actionPassed = true;

                    try {
                        // we set this to true for each 'Action' we check against.  As soon as an 'Action' criteria fails we set this to false, so we don't process other criteria within this action (this way if an action has 3 different criteria and the first one fails, we don't bother checking the other 2 since all criteria must pass for this action to be used).
                        var who = val.Who; //set var to the Who object

                        if (who.ViewsCriteria && !ignoreViewsFlag) {
                            //even though 'ViewsCriteria' option is not optional, we still make sure this is set.
                            if (!_.isArray(who.ViewsCriteria)) {
                                who.ViewsCriteria = [who.ViewsCriteria];
                            }
                            //We have a 'ViewsCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.
                            who.ViewsCriteria.forEach(function (criteria) {
                                LOGGER.debug(NAME, fnName, "Checking ViewsCriteria", criteria);

                                if (CnnXt.Utils.JSEvaluate(parseInt(viewCount),
                                    criteria.Qualifier,
                                    parseInt(criteria.Val),
                                    "ArticleView",
                                    "integer")) {
                                    //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                } else {
                                    //this failed, so set actionPassed to false;
                                    actionPassed = false;
                                }
                            });

                        } else if (who.ViewsCriteria && ignoreViewsFlag) {
                            actionPassed = true;
                        }

                        if (who.HiddenFieldCriteria && actionPassed == true) {
                            //We have a 'HiddenField' criteria(s) and 'actionPassed' is still true so we need to check this.
                            if (!_.isArray(who.HiddenFieldCriteria)) {
                                who.HiddenFieldCriteria = [who.HiddenFieldCriteria];
                            }
                            who.HiddenFieldCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking HiddenFieldCriteria: ", criteria);

                                    if (CnnXt.Utils
                                        .JSEvaluate(CnnXt.Utils.GetHiddenFormFieldValue(criteria.Id),
                                        criteria.Qualifier,
                                        criteria.Val,
                                        "HiddenFormField")) {
                                        //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                    } else {
                                        //this failed, so set actionPassed to false;
                                        actionPassed = false;
                                    }
                                }
                            });
                        }

                        if (who.GeoCriteria && actionPassed == true) {
                            //We have a 'GeoCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.
                            try {
                                if (!_.isArray(who.GeoCriteria)) {
                                    who.GeoCriteria = [who.GeoCriteria];
                                }
                                who.GeoCriteria.forEach(function (criteria) {
                                    if (actionPassed) {
                                        LOGGER.debug(NAME, fnName, "Checking GeoCriteria: ", criteria);

                                        var userZipCodes = CnnXt.Storage.GetActualZipCodes();

                                        if (userZipCodes && criteria.Type !== undefined) {
                                            userZipCodes.forEach(function (zipCode) {
                                                if (~criteria.Zip.indexOf(zipCode)) {
                                                    actionPassed = criteria.Type.toUpperCase() == "IN";
                                                } else if (criteria.Zip.indexOf('*') >= 0) {
                                                    var valueItems = criteria.Zip.split(",") || criteria.Zip.split("");
                                                    var foundZip = valueItems.filter(function (value) {
                                                        var valueItem = value.split("");
                                                        var zipItems = zipCode.split("");
                                                        return zipItems.length != valueItem.length ? false : valueItem.every(function (item, i) {
                                                            return valueItem[i] === "*" ? true : item === zipItems[i];
                                                        });
                                                    });
                                                    if (foundZip.length > 0) {
                                                        actionPassed = criteria.Type.toUpperCase() == "IN";
                                                    }
                                                    else actionPassed = criteria.Type.toUpperCase() != "IN";
                                                }
                                                else {
                                                    actionPassed = criteria.Type.toUpperCase() != "IN";
                                                }
                                            });
                                        }
                                    }
                                });

                            } catch (e) {
                                actionPassed = false;
                            }
                        }

                        if (who.JavascriptCriteria && actionPassed == true) {
                            //We have a 'JavascriptCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.
                            try {
                                if (!_.isArray(who.JavascriptCriteria)) {
                                    who.JavascriptCriteria = [who.JavascriptCriteria];
                                }

                                who.JavascriptCriteria.forEach(function (criteria) {
                                    if (actionPassed) {
                                        LOGGER.debug(NAME, fnName, "Checking JavascriptCriteria: ", criteria);

                                        var varValue = criteria.Eval;
                                        var jsValue;

                                        try {
                                            jsValue = eval(varValue);
                                        } catch (e) { }

                                        if ($.isArray(jsValue)) {
                                            jsValue = jsValue.map(function (item) {
                                                return item.trim().toLowerCase();
                                            });

                                            if (criteria.Qualifier == "In" || criteria.Qualifier == "NotIn") {
                                                if (jsValue.indexOf(criteria.Val.toLowerCase()) >= 0) {
                                                    actionPassed = criteria.Qualifier == "In";
                                                } else {
                                                    actionPassed = criteria.Qualifier == "NotIn";
                                                }
                                            } else {
                                                actionPassed = criteria.Qualifier == "==";
                                            }
                                        } else {
                                            if (jsValue !== undefined && jsValue !== "") {
                                                jsValue = jsValue.toString().toLowerCase();
                                            }

                                            if (criteria.Qualifier == "In" || criteria.Qualifier == "NotIn") {
                                                if (jsValue == undefined) {
                                                    actionPassed = criteria.Qualifier == "NotIn";
                                                } else {
                                                    var delimiter,
                                                        array;

                                                    delimiter = criteria.Delimiter
                                                        ? new RegExp(criteria.Delimiter.replace(/space/g, '/\s'), 'g')
                                                        : /[ ,;]/g;
                                                    array = jsValue.split(delimiter);

                                                    if (array.indexOf(criteria.Val.toLowerCase()) >= 0) {
                                                        actionPassed = criteria.Qualifier == "In";
                                                    } else {
                                                        actionPassed = criteria.Qualifier == "NotIn";
                                                    }
                                                }
                                            } else {
                                                if (CnnXt.Utils
                                                    .JSEvaluate(jsValue,
                                                    criteria.Qualifier,
                                                    criteria.Val.toLowerCase(),
                                                    "JavascriptCriteria")) {
                                                    //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                                } else {
                                                    //this failed, so set actionPassed to false;
                                                    actionPassed = false;
                                                }
                                            }
                                        }
                                    }
                                });

                            } catch (e) {
                                LOGGER.debug(NAME, fnName, "Error evaluating javascript criteria.");
                                actionPassed = false; //the eval through an exception so this action doesn't pass.
                            }
                        }

                        if (who.ScreenSizeCriteria && actionPassed == true) {
                            //We have a 'ScreenSizeCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.
                            if (!_.isArray(who.ScreenSizeCriteria)) {
                                who.ScreenSizeCriteria = [who.ScreenSizeCriteria];
                            }
                            who.ScreenSizeCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking ScreenSizeCriteria: ", criteria);

                                    if (CnnXt.Utils.JSEvaluate(CnnXt.Utils.getDeviceType(),
                                        criteria.Qualifier,
                                        criteria.Value,
                                        "ScreenSizeCriteria",
                                        "string")) {
                                        //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                    } else {
                                        //this failed, so set actionPassed to false;
                                        actionPassed = false;
                                    }
                                }
                            });
                        }

                        if (who.UrlCriteria && actionPassed == true) {
                            //We have a 'UrlCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.

                            if (!_.isArray(who.UrlCriteria)) {
                                who.UrlCriteria = [who.UrlCriteria];
                            }

                            who.UrlCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking UrlCriteria", criteria);

                                    if (CnnXt.Utils.JSEvaluate(CnnXt.Utils.getUrlParam(criteria.Eval),
                                        criteria.Qualifier,
                                        criteria.Value,
                                        "UrlCriteria")) {
                                        //keep actionPassed in true state
                                    } else {
                                        //this failed, so set actionPassed to false;
                                        actionPassed = false;
                                    }
                                }
                            });
                        }

                        if (who.SubDomainCriteria && actionPassed == true) {
                            //We have a 'SubDomainCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.

                            if (!_.isArray(who.SubDomainCriteria)) {
                                who.SubDomainCriteria = [who.SubDomainCriteria];
                            }

                            who.SubDomainCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking SubDomainCriteria", criteria);

                                    var searchingVal = criteria.Value.toUpperCase();
                                    var sourceVal = window.location.hostname.toUpperCase();
                                    // root domain won't be included
                                    var qualifier = criteria.Qualifier.toUpperCase();

                                    if ((qualifier == "==") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1)) {
                                        actionPassed = false;
                                    }
                                }
                            });
                        }

                        if (who.MetaKeywordCriteria && actionPassed == true) {
                            //We have a 'MetaKeywordCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.

                            if (!_.isArray(who.MetaKeywordCriteria)) {
                                who.MetaKeywordCriteria = [who.MetaKeywordCriteria];
                            }

                            who.MetaKeywordCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking MetaKeywordCriteria: ", criteria);

                                    var metaArray = CnnXt.Utils.getMetaTagsWithKeywords();
                                    var evalResult = false;
                                    var regExpStr = "\\b" + criteria.Value + "\\b";
                                    var regExp = new RegExp(regExpStr);

                                    for (var i = 0; i < metaArray.length; i++) {
                                        if (regExp.test(metaArray[i].content)) {
                                            LOGGER.debug(NAME, fnName, "Found keyword", criteria.Value);
                                            evalResult = true;
                                            break;
                                        }
                                    }

                                    if (evalResult && criteria.Qualifier == "!=") {
                                        actionPassed = false;
                                    }

                                    if (!evalResult) {
                                        actionPassed = criteria.Qualifier == "!=" ? true : false;
                                    }
                                }
                            });
                        }

                        if (who.UserStateCriteria && actionPassed == true) {
                            //We have a 'UserStateCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.

                            if (!_.isArray(who.UserStateCriteria)) {
                                who.UserStateCriteria = [who.UserStateCriteria];
                            }

                            who.UserStateCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking UserStateCriteria", criteria);

                                    var userState = CnnXt.User.getUserState();

                                    if (!userState) {
                                        userState = "Logged Out";
                                    }

                                    if (!CnnXt.Utils.JSEvaluate(
                                        userState,
                                        criteria.Qualifier,
                                        criteria.Value,
                                        "UserStateCriteria",
                                        "string")) {

                                        actionPassed = false;
                                    }
                                }
                                //if (!CnnXt.Utils.JSEvaluate(userState, "==", criteria.Value)) {
                                //    actionPassed = false;
                                //}
                            });
                        }

                        if (who.AdBlockCriteria && actionPassed == true) {
                            //We have a 'AdBlockCriteria' criteria(s) and 'actionPassed' is still true so we need to check this.

                            if (!_.isArray(who.AdBlockCriteria)) {
                                who.AdBlockCriteria = [who.AdBlockCriteria];
                            }

                            who.AdBlockCriteria.forEach(function (criteria) {
                                if (actionPassed) {
                                    LOGGER.debug(NAME, fnName, "Checking AdBlockCriteria", criteria);

                                    var hasAdBlock = CnnXt.Utils.detectAdBlock();

                                    if (hasAdBlock && criteria.Value == "Detected") {
                                        //keep actionPassed in true state
                                    } else if (!hasAdBlock && criteria.Value == "Not Detected") {
                                        //keep actionPassed in true state
                                    } else {
                                        actionPassed = false;
                                    }
                                }
                            });
                        }

                    } catch (ex) {
                        actionPassed = false;
                        console.error(NAME, fnName, "EXCEPTION", ex);
                    }

                    //we are done with this action check
                    if (actionPassed) {
                        //if 'actionPassed' is still true, then we should execute this action.
                        LOGGER.debug(NAME, fnName, "===== ACTION PASSED =====", val);

                        if (val.ActionTypeId == 3 && !ignoreViewsFlag) {
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

            var currentConversations = CnnXt.Storage.GetCurrentConversations();
            LOGGER.debug(NAME, fnName, "currentConversations", currentConversations);


            if (currentConversations) {
                //we have stored conversations, check if we have one at this meterLevel
                foundConvo = currentConversations[meterlevel];
            } else {
                //we already set default to null, so do nothing
            }

            return foundConvo;

            //var allConversations = CnnXt.Storage.GetLocalConfiguration().Campaign.Conversations;
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
            return CnnXt.Storage.GetCampaignData().Conversations[meterlevel];
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
            var allcurrentConversations = CnnXt.Storage.GetCurrentConversations();
            //set the object with this meterlevel to the current conversation.
            allcurrentConversations[METER_LEVEL] = CURRENT_CONVERSATION;
            //re-set the entire conversations.current object back to local storage.
            CnnXt.Storage.SetCurrentConversations(allcurrentConversations);
            //$.jStorage.set(CnnXt.Common.StorageKeys.conversations.current, allcurrentConversations);
            //CnnXt.Storage.GetCurrentConversations()[METER_LEVEL];
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
            var now = CnnXt.Utils.Now(); //this sets current date/time (based on if we are debugging/manually setting time or using the real time.

            //set the date started.
            CURRENT_CONVERSATION.Props.Date.started = CURRENT_CONVERSATION.Props.Date.started ? CURRENT_CONVERSATION.Props.Date.started : CnnXt.Utils.Now();

            if (CURRENT_CONVERSATION.Options.Expirations.Time) {
                switch (CURRENT_CONVERSATION.Options.Expirations.Time.key) {
                    case "m": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setMinutes(now.getMinutes() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "h": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setHours(now.getHours() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "d": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setDate(now.getDate() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val))); break;
                    case "w": CURRENT_CONVERSATION.Props.Date.expiration = new Date(now.setDate(now.getDate() + parseInt(CURRENT_CONVERSATION.Options.Expirations.Time.val) * 7)); break;
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
        return CnnXt.Storage.GetCurrentConversationViewCount();
    };

    //#endregion HELPERS

    return {
        init: function (configSettings) {
            LOGGER = CnnXt.Logger;
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

var ConnextAction = function ($) {
    //region GLOBALS
    var NAME = "Action"; //base name for logging.
    //create local reference to logger
    var LOGGER;
    var DEFAULT_ACTION_ID = "ConneXt_Action_Id-";
    var CONTENT_SELECTOR, CONTENT_POSITION //holds reference to the selector used to hide the content (when it is hidden because of the paywall, so this is not set until we hide the content).  This is so we can call our public method 'ShowContent', allowing the client to show the content.
    var MASKING_METHOD; //holds refernce to the method we used to hide the content. This is so the public 'ShowContent' method can reveal the content the same way it was hidden.
    var CLOSE_CASES = {
        CloseButton: "closeButton",
        CloseSpan: "closeSpan",
        ClickOutside: "clickOutside",
        EscButton: "escButton"
    };
    var FlittzButton = "[data-fz-btn=smartAuth]";
    var ORIGINAL_CONTENT;

    var ACTION_TYPE = {
        Banner: 1,
        Modal: 2,
        Paywall: 3,
        Inline: 4,
        SmallInfoBox: 6,
        JSCall: 7,
        Newsletter: 11,
        Activation: 12
    }
    //endregion GLOBALS

    //#region FUNCTIONS

    var processActions = function (actions) {
        var fnName = "processActions";
        try {
            LOGGER.debug(NAME, fnName, actions);
            $.each(actions, function (key, action) {
                LOGGER.debug(NAME, fnName, "Actions.EACH", key, action);
                if (action.What.Html) {
                    //if action have Promise criteria
                    if (_.isObject(action.Who.PromiseCriteria)) {
                        //promise is undefined - don't show action
                        try {
                            var obj = eval(action.Who.PromiseCriteria.Name);
                            //convert object to promise (Promise.resolve)  and set up callback (.then)
                            LOGGER.debug(NAME, fnName, "promise object found");
                            var promise = Promise.resolve(obj);
                            promise.then(function (val) {
                                if (CnnXt.Utils
                                    .JSEvaluate(val,
                                    action.Who.PromiseCriteria.Qualifier,
                                    action.Who.PromiseCriteria.Value.toLowerCase(),
                                    "Promise")) {
                                    setupAction(action);
                                }
                            });
                        }
                        catch (e) {
                            // error of eval  - promise is or undefined null - don't show action
                            LOGGER.debug(NAME, fnName, "Promise object is null or undefined");
                            return false;
                        }
                    }
                    else {
                        setupAction(action);
                    }
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
            var actionCSS = action.What.CSS;
            var actionHtml = action.What.Html.trim(); //set html from action.What.Html prop.
            actionHtml = handleDynamicHtml(actionHtml);
            actionHtml = $(actionHtml).prop("id", DEFAULT_ACTION_ID + action.id);
            console.info("ACTION HTML", actionHtml);
            $(actionHtml).addClass("hide");
            $(actionHtml).prepend('<style id="' + action.id + '-mg2style' + '"' + '>' + actionCSS + '</style>');
            
            if ($("#themeLink").length == 0) {
                $("body").append(actionHtml);
            } else {
                $("#themeLink").before(actionHtml);
            }

            registerActionEvents(action);

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
        }
    };

    var executeAction = function (action) {
        var fnName = "executeAction";
        var e;

        try {
            LOGGER.debug(NAME, fnName, action);

            if (action.What.Type == ACTION_TYPE.Paywall) {
                hideContent(action);
            }

            var $action = $("#" + DEFAULT_ACTION_ID + action.id);

            $action.removeClass("hide");

            if (action.What.Type == ACTION_TYPE.Banner) {
                //set bannerLocation to stored value if it exists, if not set it to top (we do this in case there are template not stored correctly...really just needed since templates were created before option to place them was introduced in Admin).
                var bannerLocation = (action.What.Location) ? action.What.Location : "top";
                var animation = {};

                animation[bannerLocation] = "0px";

                //we need to set the intial location to a big negative and then remove the hide class.  
                //this will allow us to determine the actual height of the banner (calling height() or outerHeight() will return 0 if element is hidden).
                $action.css(bannerLocation, "-2500px").removeClass("hide");

                var height = $action.outerHeight();

                //we can now animate the banner in (notice we set the location to a negative of the height we just figured out. This will allow for a smooth animation for all banner heights.
                $action.css(bannerLocation, "-" + height + "px").animate(animation, function () {
                });
            }

            if (action.What.Type == ACTION_TYPE.Modal) {
                $action.addClass("in");
                $action.connextmodal({ backdrop: "true" });
                $action.resize();
                $action.css("display", "block");

                if (action.What["Transparent backdrop"] == "True" || action.What["Transparent backdrop"] == "true") {
                    $(".connext-modal-backdrop.fade.in").addClass("transparent");
                } else {
                    $(".connext-modal-backdrop.fade.in").removeClass("transparent");
                }

                $($action).on('keydown', function (e) {
                    if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                        action.closeEvent = CLOSE_CASES.EscButton;
                    }
                })
                        .on("hidden", function (e) {
                            if (action.closeEvent == null || action.closeEvent == undefined) {

                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            } else if (action.closeEvent === CLOSE_CASES.EscButton) {
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                        });
            
            }

            var parentWidth;
            var selectorFragment;

            if (action.What.Type == ACTION_TYPE.Paywall) {
                //a paywall can be either a 'modal' or 'inline', check the data-display-type property.
                var displayType = $action.data("display-type");
                LOGGER.debug(NAME, fnName, "displayType", displayType);

                if (displayType == "inline") { //this is an inline paywall.
                    CONTENT_SELECTOR = action.What.Selector;
                    CONTENT_POSITION = action.What.Position;
                    //now that the content is hidden, we can append the inline html.
                    if ($(CONTENT_SELECTOR).length == 0) {
                        LOGGER.debug(NAME, "not found element by current content selector", CONTENT_SELECTOR);
                        $action.remove();
                        return false;
                    }

                    //we now need to remove the original $action html from the DOM since it was added to the end of the body and a 'copy' of it has been placed in the appropriate location.
                    $action.remove();
                    parentWidth = $(CONTENT_SELECTOR).width();
                    selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00"; // take just first digit of width value and add '00' to get 600 from 654px for example 
                    $action.addClass("Mg2-inline-scale-" + selectorFragment); // now we add class depending on parent width, for example Mg2-inline-600 if parent width is between 600 and 700px

                    if ((CONTENT_POSITION) == 'before') {
                        $(CONTENT_SELECTOR).prepend($action);
                    } else {
                        $(CONTENT_SELECTOR).append($action);
                    }

                    $(window, CONTENT_SELECTOR).resize(function () {
                        var parentWidth = $(CONTENT_SELECTOR).width(),
                            selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                            classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");

                        $action.attr("class", classList);
                        $action.addClass("Mg2-inline-scale-" + selectorFragment);
                    });

                } else if (displayType == "modal") {
                    $action.addClass("in");

                    if (action.What["NotClosable_paywall"] == "True" || action.What["NotClosable_paywall"] == "true") {
                        $action.connextmodal({ backdrop: "static", keyboard:false });
                    } else {
                        $action.connextmodal({ backdrop: "true" });
                    }

                    if (action.What["Transparent_backdrop_paywall"] == "True" || action.What["Transparent_backdrop_paywall"] == "true") {
                        $(".connext-modal-backdrop.fade.in").addClass("transparent");
                    } else {
                        $(".connext-modal-backdrop.fade.in").removeClass("transparent");
                    }

                    $action.resize();
                    $action.css("display", "block");
                    
                    $($action)
                        .on('keydown', function (e) {
                            if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                                action.closeEvent = CLOSE_CASES.EscButton;
                            }
                        })
                        .on("hidden", function (e) {
                            if (action.closeEvent == null || action.closeEvent == undefined) {
                                if (action.What["NotClosable_paywall"] == "True" || action.What["NotClosable_paywall"] == "true") {
                                    return false;
                                }

                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            } else if (action.closeEvent === CLOSE_CASES.EscButton) {
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                        });
                } else if (displayType == "banner") {
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
                    });

                } else {
                    //the action html didn't have the data-display-type property, so do nothing, just Log it.
                    LOGGER.warn(NAME, fnName, "Can't determine display type.");
                }

                $("#ConneXt_Action_Id-" + action.id)
                    .find(FlittzButton)
                    .click(function (e) {
                        action.Conversation = CnnXt.Campaign.GetCurrentConversation();
                        action.Conversation.Campaign = CnnXt.Storage.GetCampaignData();
                        action.ButtonArgs = e;
                        action.ActionDom = $action;
                        if (CnnXt.GetOptions().integrateFlittz) {
                            CnnXt.Event.fire("onFlittzButtonClick", action);
                        }
                    });
            }

            if (action.What.Type == ACTION_TYPE.Inline) {
                CONTENT_SELECTOR = action.What.Selector;
                CONTENT_POSITION = action.What.Position;
                //now that the content is hidden, we can append the inline html.
                if ($(CONTENT_SELECTOR).length == 0) {
                    LOGGER.debug(NAME, "not found element by current content selector", CONTENT_SELECTOR);
                    $action.remove();
                    return false;
                }

                parentWidth = $(CONTENT_SELECTOR).width();
                selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00"; // take just first digit of width value and add '00' to get 600 from 654px for example 
                $action.addClass("Mg2-inline-scale-" + selectorFragment); // now we add class depending on parent width, for example Mg2-inline-600 if parent width is between 600 and 700px

                if ((CONTENT_POSITION) == 'before') {
                    $(CONTENT_SELECTOR).prepend($action);
                } else {
                    $(CONTENT_SELECTOR).append($action);
                }

                $(window, CONTENT_SELECTOR).resize(function () {
                    var parentWidth = $(CONTENT_SELECTOR).width(),
                        selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                        classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");

                    $action.attr("class", classList);
                    $action.addClass("Mg2-inline-scale-" + selectorFragment);
                });
            }

            if (action.What.Type == ACTION_TYPE.SmallInfoBox) {
                //a Small Info Box can be either a 'rounded' or 'squared'
                $action.removeClass("hide");
            }

            if (action.What.Type == ACTION_TYPE.JSCall) {
                $("#ConneXt_Action_Id-" + action.id).remove();

                try {
                    if (action.What.Javascript != undefined) {
                        try {
                            eval(action.What.Javascript);
                        } catch (e) { }
                    }
                }
                catch (e) {
                    console.error(NAME, fnName, "Custom JS Call exception", e);
                }
            }
            if (action.What.Type == ACTION_TYPE.Newsletter) {
                displayType = $action.data("display-type");

                if (displayType == "inline") {
                    CONTENT_SELECTOR = action.What.Selector;

                    //now that the content is hidden, we can append the inline html.
                    if ($(CONTENT_SELECTOR).length == 0) {
                        LOGGER.debug(NAME, "not found element by current content selector", CONTENT_SELECTOR);
                        $action.remove();
                        return false;
                    }

                    parentWidth = $(CONTENT_SELECTOR).width();
                    selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00"; // take just first digit of width value and add '00' to get 600 from 654px for example 
                    $action.addClass("Mg2-inline-scale-" + selectorFragment); // now we add class depending on parent width, for example Mg2-inline-600 if parent width is between 600 and 700px

                    $(CONTENT_SELECTOR).append($action);

                    $(window, CONTENT_SELECTOR).resize(function () {
                        var parentWidth = $(CONTENT_SELECTOR).width(),
                            selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                            classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");
                        $action.attr("class", classList);
                        $action.addClass("Mg2-inline-scale-" + selectorFragment);
                    });
                } else if (displayType == "modal") {
                    $action.addClass("in");
                    $action.connextmodal({ backdrop: "true" });
                    $action.resize();
                    $action.css("display", "block");

                    $($action)
                        .on('keydown', function (e) {
                            if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                                action.closeEvent = CLOSE_CASES.EscButton;
                            }
                        })
                        .on("hidden", function () {
                            if (action.closeEvent == null || action.closeEvent == undefined) {
                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                            else if (action.closeEvent === CLOSE_CASES.EscButton) {
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                        });
                }
            }

            var id = $action.attr("id");
            $("#" + id + " [data-dismiss=banner], #" + id + " [data-dismiss=info-box], #" + id + " [data-dismiss=inline], #" + id + "  [data-dismiss=modal]").on("click", function () {
                var $btn = $(this);
                action.closeEvent = CLOSE_CASES.CloseButton;
                $btn.closest(".Mg2-connext").addClass("hide");
                //fire close event & calculate total show time
                action.actionDom = $action;
                CnnXt.Event.fire("onActionClosed", action);
            });

            action.actionDom = $action;

            //fire show event & save start time
            CnnXt.Event.fire("onActionShown", action);
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
                        var repeatable = CnnXt.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).is(":not(:visible)")) {
                            if (action.When.EOS.Repeatable > action.count && action.When.EOS.RepeatableConv > repeatable) {
                                if (!action.inProggress) {
                                    action.inProggress = true;
                                    executeAction(action);
                                    action.count++;
                                    action.inProggress = false;
                                    CnnXt.Storage.UpdateRepeatablesInConv(action.id);

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
                        var repeatable = CnnXt.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).is(":not(:visible)")) {
                            if (numShown < action.When.Hover.Repeatable && action.When.Hover.RepeatableConv > repeatable) {
                                executeAction(action);
                                numShown++;
                                CnnXt.Storage.UpdateRepeatablesInConv(action.id);
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
            var regExp = new RegExp(/script|style|meta/i);

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
                for (var i = 0; i < childs.length; i++) {
                    var child = childs[i];

                    if (currentCharacterPosition >= allowedCharactersCount) {
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
                            } else {
                                child.classList.add("blurry-text");
                                mixContent(child);
                            }
                        } else {
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
                        } else {
                            currentCharacterPosition += child.length;

                            if (allowedCharactersCount <= currentCharacterPosition) {

                                var excess = currentCharacterPosition - allowedCharactersCount;
                                var trimmedText = child.textContent.substr(0, child.textContent.length - excess);
                                var cutPosition = Math.min(trimmedText.length, trimmedText.lastIndexOf(" "));
                                var excludedText;
                                if (cutPosition != -1) {
                                    trimmedText = trimmedText.substr(0, cutPosition) + TERMINATOR;
                                    excludedText = child.textContent.substr(cutPosition);
                                } else {
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

        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            throw { name: 'HideContentExeption', message: 'Cannot hide content!' };
        }
    };

    var mixContent = function (item) {
        if ($(item).children().length == 0) {
            var txt = $(item).text();
            if (txt) {
                for (var i = 0; i < txt.length; i++) {
                    txt = txt.replaceAt(i, CnnXt.Utils.GetNextLetter(txt[i]));
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
        var now = CnnXt.Utils.Now(),
            daysToExpire = new Date(currentConv.Props.Date.expiration),
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
            var currentConversationProps = CnnXt.Campaign.GetCurrentConversationProps(),
                currentConversation = CnnXt.Campaign.GetCurrentConversation();

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
            var hrefs = $html.find("[href]:not([data-dismiss])");
            $.each(hrefs,
                function (key, value) {
                    var href = $(value).attr("href");
                    href = CnnXt.Utils.AddReturnUrlParamToLink(href);
                    $(value).attr("href", href);
                });
            return $html[0].outerHTML; // returning html regardless.
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            return html; // returning html regardless.
        }
    };


    var initListeners = function () {
        $('body').on('click', '[data-mg2-action="click"]', commonClickHandler);

        $("body").on('click', '[data-mg2-action="login"], [data-mg2-action="submit"], [data-mg2-action="Zipcode"], [data-mg2-action="openNewsletterWidget"]',
            function (event) {
                event.preventDefault();

                commonClickHandler(event)
            });
    };

    function commonClickHandler(event) {
        var $target = $(event.target),
            parents = $target.parents('.Mg2-connext'),
            elementId,
            actionId;

        if (parents.length) {
            elementId = $(parents[0]).attr('id');
            if (elementId) {
                actionId = parseInt(elementId.split('-')[1]);
                event.actionId = actionId;
            }
        }

        CnnXt.Event.fire("onButtonClick", event);
    }

    //#endregion HELPERS

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
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

var ConnextWhitelist = function ($) {

    var NAME = "Whitelist",
        LOGGER,
        USER_IP = '',
        WHITELIST_SET = null;

    var CLOSE_TRIGGER = {
        CloseButton: "closeButton",
        ClickOutside: "clickOutside",
        EscButton: "escButton"
    };

    var TEMPLATE_CLOSED = true;

    var $tpl;
    var configuration;

    var wrongPinStatus = 100;

    var checkClientIp = function (config) {
        configuration = config;

        $.ajax({
            url: CnnXt.Common.IPInfo,
            type: "GET",
            success: function (data) {
                if (data && data.ip) {
                    USER_IP = data.ip;

                    if (config && config.WhitelistSets) {
                        config.WhitelistSets.forEach(function (set) {
                            if (set.IPs) {
                                if (_.find(set.IPs, function (item) { return item.IP == USER_IP }) != null) {
                                    WHITELIST_SET = set;
                                    return;
                                }
                            }
                        });
                    }
                }
                determinePinTemplate(WHITELIST_SET);
            },
            error: function () {
                console.log("IPERROR, ERROR DEFINING IP");
                determinePinTemplate(WHITELIST_SET);
            }
        });
    }

    function determinePinTemplate(whiteListSet) {
        var infoboxcookie = CnnXt.Storage.GetWhitelistInfoboxCookie();
        var needHidePinTemplate = CnnXt.Storage.GetNeedHidePinTemplateCookie();

        if (!needHidePinTemplate && whiteListSet) {
            if (whiteListSet.InfoBoxHtml && infoboxcookie) {

                $('body').append(whiteListSet.InfoBoxHtml);
                $tpl = $('.Mg2-pin-infobox');
                var someAttemptsLeft = checkPinAttempts();
                if (!someAttemptsLeft) {
                    noPinAttemptsLeft($tpl);
                }
                $tpl.show();
                fireShowEvent();
                TEMPLATE_CLOSED = false;
                CnnXt.ConnextContinueProcessing(configuration);

            } else if (whiteListSet.ModalHtml && !infoboxcookie) {

                $('body').append(whiteListSet.ModalHtml);
                $tpl = $('.Mg2-pin-modal');
                var someAttemptsLeft = checkPinAttempts();
                if (!someAttemptsLeft) {
                    noPinAttemptsLeft($tpl);
                }
                $tpl.on("show.bs.modal", function (e) {
                    fireShowEvent();
                    TEMPLATE_CLOSED = false;
                });
                $tpl.addClass("in");
                $tpl.connextmodal({ backdrop: "true" });
                $tpl.resize();
            } else {
                CnnXt.ConnextContinueProcessing(configuration);
            }

            setupPinCheckHandlers();
        } else {
            CnnXt.ConnextContinueProcessing(configuration);
        }

    };

    var checkPinAttempts = function () {
        var pinAttempts = CnnXt.Storage.GetPinAttempts();
        var someAttemptsLeft = true;
        if (pinAttempts && pinAttempts >= 5) {
            someAttemptsLeft = false;
        }
        return someAttemptsLeft;
    }

    var noPinAttemptsLeft = function ($tpl) {
        var $messageEl = $tpl.find('.Mg2-pin__message');
        $messageEl
            .text('You exceeded maximum amount of times. You will be allowed to try again in 15 minutes.')
            .addClass('Mg2-pin__message_error')
            .show();
        $tpl.find('.Mg2-pin__input').hide();
        $tpl.find('.Mg2-pin__button').hide();
    }

    var setupPinCheckHandlers = function () {
        var $pinModal = $('.Mg2-pin-modal'),
            $pinInfoBox = $('.Mg2-pin-infobox');

        $('.Mg2-pin__button').on('click', function () {
            var $tpl = $(this).parents('.Mg2-pin');
            var someAttemptsLeft = checkPinAttempts();

            if (!someAttemptsLeft) {
                noPinAttemptsLeft($tpl);
                return;
            }

            var $passwordEl = $tpl.find('.Mg2-pin__input[type="password"]');
            var $messageEl = $tpl.find('.Mg2-pin__message');

            $messageEl.hide().removeClass('Mg2-pin__message_error Mg2-pin__message_success');
            $passwordEl.removeClass('Mg2-pin__input_error');

            if ($passwordEl.val().length) {
                checkMg2Pin($passwordEl.val(), $messageEl, $passwordEl);
            } else {
                $passwordEl.addClass('Mg2-pin__input_error');
                $messageEl.text('Please enter code')
                .addClass('Mg2-pin__message_error')
                .show();
            }
        });

        $pinModal
     .on('keydown', function (e) {
         if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
             $pinModal.closeEvent = CLOSE_TRIGGER.EscButton;

         }
     })

     .on("hidden", function (e) {
         CnnXt.Storage.SetWhitelistInfoboxCookie(true);
         if ($pinModal.closeEvent == null || $pinModal.closeEvent == undefined) {
             fireCloseEvent(CLOSE_TRIGGER.ClickOutside);
         } else if ($pinModal.closeEvent == CLOSE_TRIGGER.EscButton) {
             fireCloseEvent(CLOSE_TRIGGER.EscButton);
         }

         CnnXt.ConnextContinueProcessing(configuration);
     })
     .on('click', '[data-dismiss]', function (e) {
         if ($(this).hasClass('proceed-without-pin')) {
             CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
         }
         $pinModal.closeEvent = CLOSE_TRIGGER.CloseButton;
         fireCloseEvent(CLOSE_TRIGGER.CloseButton);
     });

        $pinModal
            .on('keydown', function (e) {
                if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                    $pinModal.closeEvent = CLOSE_TRIGGER.EscButton;

                }
            })

            .on("hidden", function (e) {
                CnnXt.Storage.SetWhitelistInfoboxCookie(true);
                if ($pinModal.closeEvent == null || $pinModal.closeEvent == undefined) {
                    fireCloseEvent(CLOSE_TRIGGER.ClickOutside);
                } else if ($pinModal.closeEvent == CLOSE_TRIGGER.EscButton) {
                    fireCloseEvent(CLOSE_TRIGGER.EscButton);
                }

                CnnXt.ConnextContinueProcessing(configuration);
            })
            .on('click', '[data-dismiss]', function (e) {
                if ($(this).hasClass('proceed-without-pin')) {
                    CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
                }

                fireCloseEvent(CLOSE_TRIGGER.CloseButton);
            });

        $pinInfoBox
            .on('click', '[data-dismiss]', function (e) {
                $pinInfoBox.addClass("hide");
                fireCloseEvent(CLOSE_TRIGGER.CloseButton);
            })
            .on('click', '.proceed-without-pin', function (e) {
                CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
            });

        function checkMg2Pin(pin, $messageEl, $passwordEl) {
            $.ajax({
                method: "GET",
                url: CnnXt.GetOptions().api + "api/whitelist/check" + "?code=" + encodeURIComponent(pin) + "&setId=" + WHITELIST_SET.id + "&ip=" + USER_IP
            }).success(function (response) {
                CnnXt.Storage.SetWhitelistSetIdCookie(response.WhitelistSetId, new Date(response.expires));
                mg2PinSuccess($messageEl, { message: "Success! Now you have full access" });
            }).error(function (response) {
                var errorMessage = response.responseText ? JSON.parse(response.responseText).Message : response.statusText;
                var errorCode = response.responseText ? JSON.parse(response.responseText).ErrorCode : '';
                mg2PinFail($messageEl, { message: errorMessage, status: errorCode }, $passwordEl);
            });
        }

        function mg2PinSuccess($messageEl, params) {
            $messageEl
                .text(params.message)
                .addClass('Mg2-pin__message_success')
                .show();

            setTimeout(function () {
                $('.Mg2-pin-modal').connextmodal("hide");
                CnnXt.Run();
            }, 1000);
        };

        function mg2PinFail($messageEl, params, $passwordEl) {
            if (params.status == wrongPinStatus) {
                CnnXt.Storage.WrongPin();
            }
            $messageEl
                .text(params.message)
                .addClass('Mg2-pin__message_error')
                .show();
            $passwordEl.val('');
        };
    }

    function fireShowEvent() {
        var eventData = getEventData();

        CnnXt.Event.fire("onAccessTemplateShown", eventData);
    }

    function fireCloseEvent(closeTrigger) {
        if (TEMPLATE_CLOSED) {
            return;
        }

        var eventData = getEventData();

        eventData.closeEvent = closeTrigger;

        CnnXt.Event.fire("onAccessTemplateClosed", eventData);

        TEMPLATE_CLOSED = true;
    }

    function getEventData() {
        return {
            WhitelistSets: configuration.WhitelistSets,
            FoundInWhithelistSet: WHITELIST_SET,
            UserIP: USER_IP
        }
    }

    return {
        init: function (options) {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Whitelist.Init");
        },
        checkClientIp: checkClientIp
    };
};
var ConnextAppInsights = function ($) {

    var userId = null;
    var init = function () {

        var appInsights = window.appInsights || function (config) {
            function i(config) { t[config] = function () { var i = arguments; t.queue.push(function () { t[config].apply(t, i); if (t.context) { userId = t.context.user.id; } }) } }
            var t = { config: config }, u = document, e = window, o = "script", s = "AuthenticatedUserContext", h = "start", c = "stop", l = "Track", a = l + "Event", v = l + "Page",
                y = u.createElement(o), r, f; y.src = config.url || "https://az416426.vo.msecnd.net/scripts/a/ai.0.js"; u.getElementsByTagName(o)[0].parentNode.appendChild(y);
            try { t.cookie = u.cookie } catch (p) { } for (t.queue = [], t.version = "1.0", r = ["Event", "Exception", "Metric", "PageView", "Trace", "Dependency"]; r.length;)i("track" + r.pop());
            return i("set" + s), i("clear" + s), i(h + a), i(c + a), i(h + v), i(c + v), i("flush"), config.disableExceptionTracking || (r = "onerror", i("_" + r), f = e[r], e[r] = function (config, i, u, e, o)
            { var s = f && f(config, i, u, e, o); return s !== !0 && t["_" + r](config, i, u, e, o), s }), t
        }({
            instrumentationKey: CnnXt.Common.APPInsightKeys[CnnXt.GetOptions().environment]
        });

        window.appInsights = appInsights;
        appInsights.trackPageView();
    }

    var trackEvent = function (name, data) {
        var appInsightsData = getEventDataByName(name, data);

        appInsights.trackEvent(name, appInsightsData);
    }

    var getAppInsightsData = function (additionalData) {
        var config = CnnXt.Storage.GetLocalConfiguration(),
            conversation = CnnXt.Storage.GetCurrentConverstaion(),
            metaData = CnnXt.Utils.GetUserMeta(),
            userData = CnnXt.Storage.GetUserData(),
            meter = CnnXt.Storage.GetMeter();

        additionalData = additionalData || {};

        var janrainProfile = CnnXt.Storage.GetJanrainUser();
        var auth0Profile = CnnXt.Storage.GetUserProfile();
        var userProfile = CnnXt.Storage.GetUserData();

        var appInsightsData = {
            cnvid: (conversation) ? conversation.id : null, //conversation id
            cnvn: (conversation) ? conversation.Name : '',  //conversation name
            mlm: (meter) ? meter.method : '', //meter level method
            ml: CnnXt.GetOptions().currentMeterLevel, // current meter level
            artlft: (conversation) ? conversation.Props.ArticleLeft : null,  //articles left
            artc: CnnXt.Storage.GetCurrentConversationViewCount(), //acrticles count
            cmid: (config && config.Campaign) ? config.Campaign.id : null, //campaign id
            cmn: (config && config.Campaign) ? config.Campaign.Name : '', //campaign name
            dmid: (config && config.DynamicMeter) ? config.DynamicMeter.id : null, //dynamic meter id
            dmn: (config && config.DynamicMeter) ? config.DynamicMeter.Name : '', //dynamic meter name
            cnfc: (config && config.Settings) ? config.Settings.Code : '', //config code
            cnfn: (config && config.Settings) ? config.Settings.Name : '', //config name
            sc: (config && config.Site) ? config.Site.SiteCode : '', //site code
            at: (config && config.Site) ? CnnXt.Common.RegistrationTypes[config.Site.RegistrationTypeId] : '', //auth type
            crid: (userData) ? userData.MasterId : null, //customer registration id
            igmrid: (userData) ? userData.IgmRegID : null, //igmRegID
            us: CnnXt.Storage.GetUserState(), //user status
            em: (auth0Profile) ? auth0Profile.email : (janrainProfile) ? janrainProfile.email : (userProfile) ? userProfile.Email : '', //email
            ip: CnnXt.Utils.GetIP(), //IP
            zc: CnnXt.Storage.GetActualZipCodes(),  //zip codes
            did: CnnXt.GetOptions().deviceId, // device id
            dt: (metaData) ? metaData.deviceType : '', //device type
            os: (metaData) ? metaData.OS : '', // OS
            brw: (metaData) ? metaData.Browser : '', //browser
            url: (metaData) ? metaData.URL : '', //URL
            attr: CnnXt.GetOptions().attr, // device id
            stk: CnnXt.GetOptions().settingsKey //settings key 
        }

        return appInsightsData;
    }


    var getEventDataByName = function (name, innerdata) {
        var eventData = innerdata.EventData;
        var config = CnnXt.Storage.GetLocalConfiguration();
        var data = {
            cnfc: (config && config.Settings) ? config.Settings.Code : '', //config code
            sc: (config && config.Site) ? config.Site.SiteCode : '', //site code
            stk: CnnXt.GetOptions().settingsKey //settings key 
        };
        switch (name) {
            case "onDynamicMeterFound":
                data.dmn = eventData;  //dynamic meter name
                break;
            case "onCampaignFound":
                data.cmn = eventData.Name; //campaign name,
                data.cmid = eventData.id; //campaign id
                break;
            case "onMeterLevelSet":
                data.mlm = eventData.method; //dynamic meter method (default or dynamic)
                data.ml = eventData.level; //meter level id (1,2,3)
                data.rid = eventData.rule ? eventData.rule.id : null; //passed rule id. isn't empty if method is dynamic
                data.rn = eventData.rule ? eventData.rule.Name : null; //passed rule name. isn't empty if method is dynamic
                break;
            case "onConversationDetermined":
                data.cnvid = eventData.id; //convo id
                data.cnvn = eventData.Name; //convo name
                data.ml = eventData.MeterLevelId; //meter level
                data.vws = eventData.Props.views; //current views
                data.artlft = eventData.Props.ArticleLeft; //current articles  left
                break;
            case "onAuthorized":
            case "onHasAccess":
            case "onHasAccessNotEntitled":
            case "onHasNoActiveSubscription":
                data.crid = eventData.MG2AccountData ? eventData.MG2AccountData.MasterId : null; //customer registration id
                data.igmRegId = eventData.MG2AccountData ? eventData.MG2AccountData.IgmRegID : null; // ecrypteed customer registration id
                data.as = eventData.MG2AccountData ? eventData.MG2AccountData.AuthSystem : null; //current auth system
                break;
            case "onLoggedIn":
                data.crid = eventData.MG2AccountData ? eventData.MG2AccountData.MasterId : null; //customer registration id
                data.igmRegId = eventData.MG2AccountData ? eventData.MG2AccountData.IgmRegID : null; // ecrypteed customer registration id
                data.as = eventData.MG2AccountData ? eventData.MG2AccountData.AuthSystem : null; //current auth system
                data.us = CnnXt.Storage.GetUserState(); //current status of user
                break;
            case "onActionShown":
                data.actid = eventData.id //action id
                data.actn = eventData.Name;  //action name 
                data.actt = eventData.ActionTypeId;  //action type
                data.usdfdt = eventData.UserDefinedData; // user defined data
                data.artc = eventData.ArticlesViewed; //viewed articles count
                break;
            case "onActionClosed":
                data.actid = eventData.id; //action id
                data.actn = eventData.Name;  //action name 
                data.actt = eventData.ActionTypeId;  //action type
                data.usdfdt = eventData.UserDefinedData; // user defined data
                data.artc = eventData.ArticlesViewed; //viewed articles count
                data.clev = eventData.closeEvent; // close event 
                break;
            case "onButtonClick":
                data.udfat = eventData.UserDefinedDataAttr;  // user defined attribut
                data.actid = innerdata.Action ? innerdata.Action.id : null; //action id
                data.actn = innerdata.Action ? innerdata.Action.Name : null; //action name
                data.actt = innerdata.Action ? innerdata.Action.ActionTypeId : null; //action type
                data.btnhtml = eventData.ButtonHTML || ''; //button html
                break;
            case "onFinish":
                data = getAppInsightsData(innerdata);
                break;
        }
        return data;
    }

    return {
        init: init,
        trackEvent: trackEvent,
        getUserId: function () {
            return userId;
        }
    }
}
var CnnXt = function ($) {
    var VERSION = '1.10.4';
    var CONFIGURATION = null;
    var NAME = "Core";
    var LOGGER; //local reference to CnnXt.LOGGER
    var PROCESSTIME = {}; //holds properties for testing application speed.
    var isProcessed = false;
    var OPTIONS; //global OPTIONS variable. This will be merge/extended between default options and passed in options.
    var DEFAULT_OPTIONS = {
        debug: false,
        silentmode: false,
        integrateFlittz: false,
        environment: 'prod', //this is used for the base s3 bucket, defaults to production, which means we need to set in all text/dev environments.
        settingsKey: null, //we'll get system settigs from db by this key in API project. For example: different accout URLs for Bang and Lang
        configSettings: { //these are config level settings which should be merged with config settings from DB, used as backup.
            //AccessRules: { SubscriberStatus: "L" },
            EnforceUniqueArticles: false ///THIS IS NOT A DB Setting, but putting it here so it will get merged with the Configuration object and saved. This way i can look for this instead of a cookie setting. It also provides the option to put this in the Admin as an option in the future without updating the code.
        },
        authSettings: null,
        loadType: "ajax",//this is how a new article is loaded. If this is set to 'ajax' then we need to remove all html that this plugin added to the dom so there isn't duplicates.
        BatchCount: 5
    };
    var IS_CONNEXT_INITIALIZED = false;
    var S3_DATA;
    var RUN_TIMEOUT;
    var FIRST_RUN_EXECUTED = false;
    var defaultRunOffsetTime = 5000;

    var init = function () {
        /// <summary>Instantite the plugin.</summary>
        /// <param>Nothing</param>
        /// <returns>Nothing</returns>
        try {
            var fnName = "init";
            LOGGER = CnnXt.Logger;
            LOGGER.debug(fnName, "Initializing CnnXt...");
            //we use config code in upper case
            OPTIONS.configCode = OPTIONS.configCode.toUpperCase();

            //if CnnXt has been initialized already - don't initialize it again
            if (IS_CONNEXT_INITIALIZED) {
                LOGGER.debug(fnName, "Connext has already initialized, cancel initializing");
                CnnXt.Run();
            } else {
                PROCESSTIME.PluginStartTime = new Date();
                initAdBlockElement();
                getZipCode(checkRequirements);
                IS_CONNEXT_INITIALIZED = true;
            }
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
        testAd.style.bottom = "0px";
        testAd.style.zIndex = "-1";
        document.body.appendChild(testAd);
    }

    var closeAllTemplates = function (callback) {
        var fnName = "closeAllTemplates";
        LOGGER.debug(fnName, "Close all Connext Templates");

        if ($('.Mg2-connext.paywall.flittz:visible').length > 0 && OPTIONS.integrateFlittz) {
            var e = {};
            e.actionDom = $('.Mg2-connext.paywall.flittz:visible')[0];
            CnnXt.Event.fire("onFlittzPaywallClosed", e);
        }

        $(".Mg2-connext[data-display-type=inline]").addClass("hide");  //close inlines
        $(".Mg2-connext[data-display-type=info-box]").addClass("hide");    //close inlines
        $(".Mg2-connext[data-display-type=banner]").addClass("hide");  //close inlines

        var modals = $(".Mg2-connext.modal:visible");
        var listeners = modals.length;

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
        CnnXt.Action.IntegrateProduct();
    };

    var getZipCode = function (callback) {
        var fnName = "getZipCode";

        function setZipCode(zipCode) {
            if (zipCode.split(' ').length == 2) {
                zipCode = zipCode.split(' ')[0];
            }
            $.jStorage.set(CnnXt.Common.StorageKeys.customZip, zipCode);
        }

        try {
            LOGGER.debug(NAME, fnName);
            if ($.jStorage.get(CnnXt.Common.StorageKeys.customZip)) {
                if (_.isFunction(callback)) {
                    callback();
                }
            } else {
                $.ajax({
                    url: CnnXt.Common.IPInfo,
                    type: "GET",
                    success: function (data) {
                        if (data.ip) {
                            CnnXt.Utils.SetIP(data.ip);
                        }

                        if (data.zip_code) {
                            setZipCode(data.zip_code);
                        } else {
                            setZipCode("M6G");
                        }

                        if (_.isFunction(callback)) {
                            callback();
                        }
                    },
                    error: function () {
                        console.log("ZIPERROR, SETTING DEFAULT ZIP");
                        setZipCode("00000");

                        if (_.isFunction(callback)) {
                            callback();
                        }
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

            //if we intergrated with flittz 
            if (OPTIONS.integrateFlittz) {
                OPTIONS.silentmode = true; 
            }

            //check run settings
            if (OPTIONS.runSettings) {
                if (OPTIONS.runSettings.runPromise && _.isFunction(OPTIONS.runSettings.runPromise.then)) {
                    //In case if promise is defined on Options object, plugin should automatically start on silent mode
                    OPTIONS.silentmode = true;

                    OPTIONS.runSettings.hasValidPromise = true;

                    if (!_.isFunction(OPTIONS.runSettings.onRunPromiseResolved)) {
                        OPTIONS.runSettings.onRunPromiseResolved = $.noop;
                    }

                    if (!_.isFunction(OPTIONS.runSettings.onRunPromiseRejected)) {
                        OPTIONS.runSettings.onRunPromiseRejected = $.noop;
                    }
                } else {
                    OPTIONS.runSettings.hasValidPromise = false;

                    console.warn('No or invalid promise object in \'runSettings\'');
                }

                if (!_.isNumber(OPTIONS.runSettings.runOffset)) {
                    OPTIONS.runSettings.runOffset = defaultRunOffsetTime;
                }
            }

            //set loglevel
            LOGGER.setDebug(OPTIONS.debug);

            //init Utils
            CnnXt.Utils.init();

            if (CnnXt.Utils.GetUserMeta().OS == 'IOS') {
                $('body').addClass('ios-fix-body-styles');
            }

            if (OPTIONS.loadType == "ajax") {
                $("body").find(".mg2-Connext").remove();
                $("body").find(".debug_details").remove();
            }

            //if we are debugging then create debug panel, we do this here before checking other requirements because we can use the 'onCriticalError' event to populate the note section of this panel so the user knows of any errors.
            if (OPTIONS.debug) {
                //we are debugging, so add the debug details panel

                CnnXt.Utils.CreateDebugDetailPanel();

                var siteCode = CnnXt.Storage.GetSiteCode();
                var configCode = CnnXt.Storage.GetConfigCode();
                var isCustomConfiguration = CnnXt.Storage.GetIsCustomConfiguration();
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
                setDefaults();
            }

            if (OPTIONS.runSettings) {
                setupRunSettings();
            }

        } catch (e) {
            LOGGER.exception(NAME, fnName, e);
        }
    };

    var reInit = function () {
        CnnXt.CloseTemplates(function () {
            CnnXt.IntegrateProduct();
            if (isProcessed) {
                processConfiguration(CnnXt.Storage.GetLocalConfiguration());
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
                for (var i = 0; i < CnnXt.Common.Environments.length; i++) {
                    if (hostname.indexOf(CnnXt.Common.Environments[i]) >= 0) {
                        OPTIONS.environment = CnnXt.Common.Environments[i];
                        break;
                    }
                }
            }
            if (OPTIONS.environment == null) {
                OPTIONS.environment = "prod";
            }

            //set API server options based on Common.APIUrl object.
            OPTIONS.api = CnnXt.Common.APIUrl[OPTIONS.environment];


            //init API
            CnnXt.API.init(OPTIONS);

            //init Storage
            CnnXt.Storage.init();

            //init Events
            CnnXt.Event.init(OPTIONS);

            //init MeterCalculation
            CnnXt.MeterCalculation.init();

            //init AppInsights
            CnnXt.AppInsights.init();

            LOGGER.debug('OPTIONS.API', OPTIONS.api);
            if (!CnnXt.Storage.GetGuid()) {
                CnnXt.Storage.SetGuid(CnnXt.Utils.GenerateGuid());
            }
            Fprinting().init()
                .done(function (id) {
                    OPTIONS.deviceId = id;
                })
                .always(function () {
                    defineConfiguration();
                    CnnXt.AppInsights.trackEvent(CnnXt.Common.AppInsightEvents.LoadConnext,
                        CnnXt.Utils.GetUserMeta());
                    CnnXt.Utils.HangleMatherTool();
                });


        } catch (e) {
            LOGGER.exception(NAME, fnName, e);
        }
    };

    var setupRunSettings = function () {
        var fnName = "setupRunSettings";

        LOGGER.debug(NAME, fnName, "OPTIONS.runSettings", OPTIONS.runSettings);

        try {
            if (OPTIONS.runSettings.hasValidPromise) {
                OPTIONS.runSettings.runPromise.then(function (result) {
                    if (!FIRST_RUN_EXECUTED) {
                        OPTIONS.runSettings.onRunPromiseResolved(result);
                        CnnXt.Run();
                    }

                    clearTimeout(RUN_TIMEOUT);

                }, function (result) {
                    if (!FIRST_RUN_EXECUTED) {
                        OPTIONS.runSettings.onRunPromiseRejected(result);
                        CnnXt.Run();
                    }

                    clearTimeout(RUN_TIMEOUT);
                });
            }

            RUN_TIMEOUT = setTimeout(function () {
                if (!FIRST_RUN_EXECUTED) {
                    CnnXt.Run();
                }
            }, OPTIONS.runSettings.runOffset);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var defineConfiguration = function () {
        var fnName = "defineConfiguration";
        try {
            CnnXt.API.GetLastPublishDateS3()
                .done(function (data) {
                    LOGGER.debug(NAME, fnName, "CnnXt.API.GetLastPublishDateS3.Done", data);
                    try {
                        S3_DATA = $.parseJSON(data);
                        //temporary convert object keys to upper case
                        S3_DATA = CnnXt.Utils.ConvertObjectKeysToUpperCase(S3_DATA);
                        //
                        //if config code is found in config codes list - we get configuration, otherwise we don't get configuration
                        if (S3_DATA[OPTIONS.configCode.toUpperCase()]) {
                            //getConfigSettings (will check for local settings first and if none exist will attempt to get settings from database).
                            //we use deferred object since we might be making an async ajax call to get data and we need to wait for that to finish.
                            getConfiguration()
                                .done(function (configuration) {
                                    try {
                                        //this returns ConfigSettings regardless if it is from server or from local settings.
                                        var fnName = "setDefaults.defineConfiguration.getConfiguration() <<DONE>>";
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
                                                CnnXt.User.init(configuration.Settings);
                                                CnnXt.Campaign.init(configuration.Settings);
                                                CnnXt.Action.init(configuration.Settings);
                                                processConfiguration(configuration);
                                            } else {
                                                LOGGER.warn(NAME, fnName, 'CONFIGURATION IS INACTIVE');
                                                CnnXt.Event.fire("onDebugNote", "Configuration is inactive.");
                                            }
                                        } else {
                                            LOGGER.error(NAME, fnName, "No Config Settings Found");
                                            CnnXt.Event.fire("onNoConfigSettingFound", "No Config Settings Found");
                                        }
                                    } catch (e) {
                                        LOGGER.exception(NAME, fnName, 'getConfiguration.done <<EXCEPTION>>', e);
                                    }
                                })
                                .fail(function (err) {
                                    //console.error(NAME, fnName, 'getConfigSettings.Fail', msg);
                                    LOGGER.error(NAME, fnName, "No Config Settings Found", "Error getting Config Settings", err);
                                    CnnXt.Event.fire("onNoConfigSettingFound", "No Config Settings Found", err);
                                })
                                .always(function() {
                                    CnnXt.Event.fire("onInit", null);
                                });

                        } else {
                            LOGGER.warn(NAME, fnName, 'CONFIGURATION CODE IS NOT FOUND IN PUBLISH FILE');
                            CnnXt.Event.fire("onDebugNote", "Configuration code is not found in publish file.");
                        }
                    } catch (e) {
                        LOGGER.exception(NAME, fnName, 'GetLastPublishDateS3.done <<EXCEPTION>>', e);
                    }
                }).fail(function (data) {
                    LOGGER.error(NAME, fnName, "CnnXt.API.GetLastPublishDateS3.Fail", data);
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
            //var configuration = CnnXt.Storage.GetLocalConfiguration();
            var configuration = CnnXt.Storage.GetLocalConfiguration();
            var expired = new Date();
            expired.setMonth(expired.getMonth() + 1);
            expired = new Date(expired);
            LOGGER.debug(NAME, fnName, "localConfiguration", configuration);

            if (configuration) {
                //we have a locally stored configuration object
                LOGGER.debug(NAME, fnName, 'Found Local Configuration', configuration);
                CnnXt.API.meta.config.isExistsInLocalStorage = true;
                //we need to check if we have a 'LastPublishDate' cookie.
                var storedLastPublishDate = CnnXt.Storage.GetLastPublishDate(), customTime = CnnXt.Utils.ParseCustomDate($.jStorage.get('CustomTime')), normalizedLastPubDate = new Date(storedLastPublishDate);
                CnnXt.API.meta.config.localPublishDate = storedLastPublishDate;

                //if we set Custom Time date in Debug Panel, we need to check date of lastPublishDate and compare it with our configuration.Settings.LastPublishDate

                //we don't have a 'storedLastPublishDate' cookie or its expired (in 24 hours period), so we need to get the LastPublishDate from S3
                LOGGER.debug(NAME, fnName, "No 'storedLastPublishDate', getting LastPublishDate from S3");

                //we got data back from S3. This data will be a json string with key/vals of ConfigCode: 'LastPublishDate'.
                //we must first parse this into a json object (the 'data' arg is really just a json string).

                var s3DataConfigLastPublishDate = S3_DATA[OPTIONS.configCode.toUpperCase()];

                var isConfigOld = isConfigurationOld(S3_DATA, configuration.Settings.LastPublishDate);

                if (isConfigOld) {
                    //config data is old, so we need to get new data from the DB
                    CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.oldConfig;
                    //fire note for debug panel
                    CnnXt.Event.fire("onDebugNote", "Current config is old.");

                    //TODO: this is bad because we call this function here and below when we don't have a localStorage config. There are small differences, but we should create one function that handles both scenarios.
                    getConfigurationFromServer()
                        .done(function (newConfiguration) {
                            LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", newConfiguration);

                            //we now have a new (processed) configuration object.  We need to merge the current locally stored configuration with the one from the server.
                            //this will take the newConfiguration and save it locally and merge any existing saved conversations with new data from the newConfiguration Object, while preserving appropriate data.
                            CnnXt.Utils.MergeConfiguration(newConfiguration);
                            ////this is handled in 'MergeConfiguration', might want to move it out of there and do it here
                            if (_.isObject(s3DataConfigLastPublishDate)) {
                                if (s3DataConfigLastPublishDate.Reset && storedLastPublishDate != newConfiguration.Settings.LastPublishDate) {
                                    CnnXt.Storage.ResetConversationViews(null, newConfiguration.Settings.UseParentDomain);
                                }
                            }
                            CnnXt.Storage.SetLocalConfiguration(newConfiguration);
                            CnnXt.Storage.SetLastPublishDate(newConfiguration.Settings.LastPublishDate, expired);
                            ////clear articles value per another crossdomain mode
                            //if (CnnXt.Storage.GetCurrentConverstaion()) {
                            //    CnnXt.Storage.SetViewedArticles([], CnnXt.Storage.GetCurrentConverstaion().id, true);
                            //}
                            //resolve with configuration object.
                            deferred.resolve(newConfiguration);

                        }).fail(function (err) {
                            console.error(NAME, fnName, "getConfigurationFromServer", "<<FAILS>>", err);

                            //reject with err object.
                            deferred.reject(err);
                        });

                } else {
                    //configData is not old, so we set the lastPublishDate cookie, so we no longer check if config data is old (for this session).
                    CnnXt.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);
                    //we resolve with the locally stored configuration.
                    deferred.resolve(configuration);
                }

                LOGGER.debug(NAME, fnName, "isConfigOld", isConfigOld);
            }
            else {
                CnnXt.API.meta.config.isExistsInLocalStorage = false;
                CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.noLocalConfig;
                getConfigurationFromServer()
                    .done(function (configuration) {
                        LOGGER.debug(NAME, fnName, "getConfigurationFromServer", "<<DONE>>", configuration);

                        //we clear it to process conversations again 
                        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.conversations.current);

                        overrideRegistrationType(configuration);

                        //since we just got a new configuration from the server (and it has already been processed in the getConfigurationFromServer function, we need to store this configuration locally.
                        CnnXt.Storage.SetLocalConfiguration(configuration);
                        //processViews(configuration);
                        ///////////////.... look into moving this somewhere else so it is only called once
                        //set LastPublishDate cookie.
                        CnnXt.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);

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

    var overrideRegistrationType = function (configuration) {
        var registrationType = CnnXt.Storage.GetRegistrationType();

        if (registrationType.Id && registrationType.IsOverride) {
            configuration.Site.RegistrationTypeId = registrationType.Id;
        } else {
            $('#OverrideAuthType').prop('checked', false);
            $('#selAuthType').val(configuration.Site.RegistrationTypeId);
        }
    }

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
                var env = CnnXt.Common.CSSPluginUrl[OPTIONS.environment];
                if ($("#themeLink").length == 0) {


                    if ($("body > link").length == 0)
                        $("body").append('<link href="" id ="themeLink" rel="stylesheet" type="text/css">');
                    else {
                        $('<link href="" id ="themeLink" rel="stylesheet" type="text/css">').insertAfter($("body > link").last());
                    }
                }
                $("#themeLink").attr("href", env + configuration.Site.SiteTheme.ThemeUrl);
            } else if (configuration.Site.SiteTheme.ThemeUrl && configuration.Site.SiteTheme.ThemeUrl == "default") {
                $("#themeLink").remove();
            }
            CnnXt.Event.fire("onDynamicMeterFound", configuration.DynamicMeter.Name);
            //fireEvent that Campaign was found.
            CnnXt.Event.fire("onCampaignFound", configuration.Campaign);

            $.when(CnnXt.Storage.CheckCookie())
                .then(function () {
                    CnnXt.User.CheckAccess()
                        .done(function (data) {
                            LOGGER.debug(NAME, fnName, "User.CheckAccess.Done", data);
                        })
                        .fail(function () {
                            LOGGER.debug(NAME, fnName, "User.CheckAccess.Fail");
                        }).always(function () { //this is always fired, regardless if the user was authenticated. For now we only use this for the 'UserAuthTiming', but could use this for other things.
                            if (!CnnXt.Storage.GetWhitelistSetIdCookie()) {
                                CnnXt.Whitelist.checkClientIp(configuration);
                            } else {
                                connextFinishProcessing();
                            }
                            var UserAuthTime = CnnXt.User.GetAuthTiming();
                            LOGGER.debug(NAME, fnName, "User.CheckAccess.Always", "UserAuthTime", UserAuthTime);
                            var EndTime = new Date().getMilliseconds();
                            var ProcessingTime = EndTime - PROCESSTIME.StartProcessingTime.getMilliseconds();
                            var TotalTime = EndTime - PROCESSTIME.PluginStartTime.getMilliseconds();
                            $("#ddProcessingTime").html(ProcessingTime + "ms");
                            $("#ddTotalProcessingTime").html(TotalTime + "ms");
                        });
                });


        } catch (e) {
            console.log("Core.Init <<EXCEPTION>>", e);
        }

    };


    //#endregion MAIN FUNCTIONS

    //#region EVENT LISTENERS


    //#endregion EVENT LISTENERS

    //#region WEBSERVICE CALLS

    var connextContinueProcessing = function (configuration) {
        var fnName = "connextContinueProcessing";
        var meterLevel;
        if (!CnnXt.Storage.GetWhitelistSetIdCookie()) {
            CnnXt.MeterCalculation.CalculateMeterLevel(configuration.DynamicMeter.Rules)
                .done(function (rule) {
                    LOGGER.debug(NAME, fnName, "Determined meter level", rule);
                    meterLevel = rule.MeterLevelId;
                    CnnXt.Event.fire("onMeterLevelSet", { method: "Dynamic", level: meterLevel, rule: rule });
                })
                .fail(function () {
                    LOGGER.warn(NAME, fnName, "Failed to determined Meter Level...using default");
                    meterLevel = configuration.Settings.DefaultMeterLevel;
                    CnnXt.Event.fire("onMeterLevelSet", { method: "Default", level: meterLevel });
                }).always(function () { //this will always be called, so this is where we check if a User has access and if we should process a campaign (we only process a campaign if a user does not have access...this will change in v1.1)
                    LOGGER.info(NAME, fnName, "METER CALCULATION --- ALWAYS CALLED", meterLevel);
                    OPTIONS.currentMeterLevel = meterLevel;
                    CnnXt.Campaign.ProcessCampaign(CnnXt.Common.MeterLevels[meterLevel], configuration.Campaign);
                    connextFinishProcessing();
                });
        }
    }

    var getConfigurationFromServer = function (opts) {
        /// <summary></summary>
        /// <param name="" type=""></param>
        /// <returns>None</returns>
        var fnName = "getConfigurationFromServer";

        //create deferred object
        var deferred = $.Deferred();

        try {
            CnnXt.API.GetConfiguration({
                payload: { siteCode: OPTIONS.siteCode, configCode: OPTIONS.configCode },
                onSuccess: function (data) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "data", data);
                    //we got results from the server, we need to process them to create a friendlier json object.
                    var processedConfiguration = CnnXt.Utils.ProcessConfiguration(data);
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
                var s3DataConfigLastPublishDate;
                var temp = s3Data[OPTIONS.configCode.toUpperCase()];

                if (temp && temp.Date) {
                    s3DataConfigLastPublishDate = temp.Date;
                } else {
                    s3DataConfigLastPublishDate = temp;
                }

                if (s3DataConfigLastPublishDate) {
                    var serverLastPublishDate,
                        localLastPublishDate;
                    if (_.isObject(s3DataConfigLastPublishDate)) {
                        LOGGER.log(NAME, fnName, '.json file has a configCode property and its an object', s3DataConfigLastPublishDate);
                        //we have a property from s3Data based on the currentConfigCode, so we need to handle Reset property to reset Article views.

                        //set 'moment' object so we can compare with moment
                        serverLastPublishDate = new Date(Date.parse(s3DataConfigLastPublishDate.Date));
                        CnnXt.API.meta.config.publisfDate = serverLastPublishDate;
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
                    }


                } else {
                    CnnXt.API.meta.config.publisfDate = null;
                    CnnXt.API.meta.config.ex = 's3Data does not have the current configCode as a key ' + OPTIONS.configCode;
                    CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.noConfigCodeinPublish;
                    throw "s3Data does not have the current configCode as a key";
                }

            } else {
                CnnXt.API.meta.config.publisfDate = null;
                CnnXt.API.meta.config.ex = 's3Data is not an object';
                CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.parsePublishFailed;
                throw "s3Data is not an object";
            }
        } catch (e) {
            console.error(NAME, fnName, "EXCEPTION", e);
            //for all error we return true, which means the current data is old. This will force us getting new data from the server (we will still do a merge of this data, but it's safer to get new data and merge it when we have an error. Otherwise if this is because of a bug, we might never get new configuration data from the DB).
            return true;
        }
    };
    //var processViews = function(data) {
    //    if (data["Views"]) {
    //        $.each(Object.keys(data["Views"]),
    //            function(k, v) {
    //                var conversationId = v;
    //                var articles = data["Views"][v];
    //                CnnXt.Storage.SetViewedArticles(articles, conversationId);
    //            });
    //    }
    //};


    var connextFinishProcessing = function () {

        // send view data 
        if (CnnXt.Campaign.GetCurrentConversationViewCount() !== 1
            && CnnXt.Campaign.GetCurrentConversationViewCount() % CnnXt.GetOptions().BatchCount === 0) {
            CnnXt.API.SendViewData();
        }
        CnnXt.Event.fire("onFinish");
    };

    //#endregion HELPER FUNCTIONS

    return {
        //main function to initiate the module
        init: function (options) {
            OPTIONS = (options) ? options : {}; //if not options set to blank object

            init();

            Connext = {
                DisplayName: CnnXt.DisplayName,
                CloseTemplates: CnnXt.CloseTemplates,
                IntegrateProduct: CnnXt.IntegrateProduct,
                Run: CnnXt.Run,
                GetVersion: CnnXt.GetVersion,
                GetOptions: CnnXt.GetOptions,
                Storage: {
                    GetLastPublishDate: CnnXt.Storage.GetLastPublishDate,
                    GetSiteCode: function() { return CnnXt.Storage.GetLocalConfiguration().Site.SiteCode },
                    GetConfigCode: function () { return CnnXt.Storage.GetLocalConfiguration().Settings.Code },
                    GetLocalConfiguration: CnnXt.Storage.GetLocalConfiguration,
                    GetCurrentConversations: CnnXt.Storage.GetCurrentConversations,
                    GetCurrentConversation: CnnXt.Storage.GetCurrentConverstaion,
                    GetCurrentMeterLevel: function () {
                        var conversation = CnnXt.Storage.GetCurrentConverstaion();

                        if (conversation) {
                            return conversation.MeterLevelId;
                        } else {
                            return undefined;
                        }
                    },
                    GetCampaignData: CnnXt.Storage.GetCampaignData,
                    GetRegistrationType: CnnXt.Storage.GetRegistrationType,

                    //deprecated 12.11.2017. approved with Dael
                    //GetViewedArticles: function () {
                    //    var conversation = CnnXt.Storage.GetCurrentConverstaion();

                    //    if (conversation) {
                    //        return CnnXt.Storage.GetViewedArticles(conversation.id);
                    //    } else {
                    //        return [];
                    //    }
                    //},

                    GetCurrentConversationArticlesCount: CnnXt.Campaign.GetCurrentConversationViewCount,
                    GetArticlesLeft: function () {
                        var conversation = CnnXt.Storage.GetCurrentConverstaion();

                        if (conversation) {
                            return conversation.Props.ArticleLeft;
                        } else {
                            return undefined;
                        }
                    },
                    GetUserState: CnnXt.Storage.GetUserState,
                    GetUserZipCodes: CnnXt.Storage.GetUserZipCodes,
                    GetJanrainUser: CnnXt.Storage.GetJanrainUser,
                    GetUserData: CnnXt.Storage.GetUserData,
                    GetUserProfile: CnnXt.Storage.GetUserProfile,
                    GetConnextPaywallCookie: CnnXt.Storage.GetConnextPaywallCookie,
                    ClearUser: CnnXt.Storage.ClearUser
                }
            }

            return Connext;
        },

        ////set all other javascript classes within Connext object so we don't pollute the global scope with all of our js objects (all our js will be under CnnXt.)
        //most of these will pass in the jQuery $ variable. We do this because Connext passes in (jQuery) into this function which is then set to $, therefore $ is a local jQuery object and not the global one. This is necessary in case the client has set $.noConflict(true), which removes $ from the global scope.  If they do then the global $ is not available within this plugin. (CMG-Atlanta actually does this, which is how we found this out)
        Logger: ConnextLogger($), //pass in $ object for no-conflict
        Whitelist: ConnextWhitelist($),
        MeterCalculation: ConnextMeterCalculation($),
        Campaign: ConnextCampaign($),
        Action: ConnextAction($),
        Common: ConnextCommon(),
        Utils: ConnextUtils($), //pass in $ object for no-conflict
        API: ConnextAPI($), //pass in $ object for no-conflict
        Event: ConnextEvents($), //pass in $ object for no-conflict
        Storage: ConnextStorage($),
        User: ConnextUser($),
        AppInsights: ConnextAppInsights($),
        CloseTemplates: closeAllTemplates,
        IntegrateProduct: IntegrateProduct,
        Run: function () {
            reInit();
            CnnXt.Event.fire("onRun");
            FIRST_RUN_EXECUTED = true;
            clearTimeout(RUN_TIMEOUT);
        },
        ReInit: reInit,
        GetVersion: function () { return VERSION },
        GetOptions: function () { return OPTIONS; },
        //
        //Below are the main public methods the client will be calling, they simply route to the appropriate js class/method.
        //
        ShowContent: function () { //let's client show the hidden article text.
            CnnXt.Action.ShowContent();
        },
        fire: function (evt, data) {
            //this is the main public method the client will use to fire events inside of ConneXt.  
            //the 'evt' param will route to an appropriate method inside of ConneXt and pass in the 'data' param.
            //for example, a client would call mg2Connext.fire('onLogin', {uuid: 1234, fname: 'aaa', lname: 'bbb'}); And we would process the logging in of a user with the passed in data object.
        },
        EventCompleted: function (event) {
            CnnXt.Campaign.EventCompleted(event);
        },
        ConnextContinueProcessing: connextContinueProcessing,
        DisplayName: ConnextCommon().DisplayName
    };

}(jQuery);

var Connext = {
    init: CnnXt.init
};