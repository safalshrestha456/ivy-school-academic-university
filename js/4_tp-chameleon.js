(function ($) {
	'use strict'
	$(document).ready(function () {
		jQuery('#tp_style_selector').each(function () {
			var wrapper = jQuery(this);
			$('.style-toggle.toggle-demo').click(function (e) {
				e.preventDefault();
				wrapper.toggleClass('show');
			});
			// Close the demo selector on click on overlay.
			jQuery('body').on('click', '.tp-style-selector.show', function (e) {
				if (jQuery(e.target).hasClass('show')) {
					jQuery(e.target).find('.style-toggle.toggle-demo').trigger('click');
				}
			});

			// Close the demo selector on esc key.
			jQuery(document).on('keyup', function (e) {
				if (27 === e.keyCode && wrapper.hasClass('show')) {
					wrapper.find('.style-toggle.toggle-demo').trigger('click');
				}
			});
		});

		if ('loading' in HTMLImageElement.prototype) {
			const images = document.querySelectorAll("img.lazyload");
			images.forEach(img => {
				img.src = img.dataset.src;
			});
		} else {
			// Dynamically import the LazySizes library
			let script = document.createElement("script");
			script.async = true;
			script.src =
				"https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.8/lazysizes.min.js";
			document.body.appendChild(script);
		}

		// Handle localStorage buy_prev logic (8 hours expiry) - LiteSpeed Cache & Storage Partitioning Compatible
		function handleBuyPrev() {
			var STORAGE_KEY = 'buy_prev';
			var TTL = 8 * 60 * 60 * 1000; // 8 hours in ms

			// 1. Check query param ?prev=
			try {
				var urlParams = new URLSearchParams(window.location.search);
				if (urlParams.has('prev')) {
					var prevParam = urlParams.get('prev');
					localStorage.setItem(STORAGE_KEY, JSON.stringify({
						value: prevParam,
						expiry: Date.now() + TTL
					}));
				}
			} catch (e) {}

			// 2. Check preview.themeforest.net URL, referrer, ancestorOrigins, or iframe.full-screen-preview__frame
			var isTfPreview = false;
			try {
				if (window.location.href.indexOf('preview.themeforest.net') !== -1 || window.location.href.indexOf('themeforest.net') !== -1) {
					isTfPreview = true;
				}
				if (document.referrer && (document.referrer.indexOf('preview.themeforest.net') !== -1 || document.referrer.indexOf('themeforest.net') !== -1)) {
					isTfPreview = true;
				}
				if (window.location && window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
					for (var i = 0; i < window.location.ancestorOrigins.length; i++) {
						if (window.location.ancestorOrigins[i].indexOf('themeforest.net') !== -1) {
							isTfPreview = true;
							break;
						}
					}
				}
				if (window.self !== window.top) {
					try {
						if (window.parent && window.parent.document && window.parent.document.querySelector('iframe.full-screen-preview__frame')) {
							isTfPreview = true;
						}
					} catch (err) {
						if (document.referrer && document.referrer.indexOf('themeforest.net') !== -1) {
							isTfPreview = true;
						}
					}
				}

				if (isTfPreview) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify({
						value: 'tf',
						expiry: Date.now() + TTL
					}));
				}
			} catch (e) {}

			// 3. Read value from localStorage
			var buyPrevVal = null;
			try {
				var item = localStorage.getItem(STORAGE_KEY);
				if (item) {
					var data = JSON.parse(item);
					if (data && data.expiry) {
						if (Date.now() > data.expiry) {
							localStorage.removeItem(STORAGE_KEY);
						} else {
							buyPrevVal = data.value;
						}
					} else {
						buyPrevVal = item;
					}
				}
			} catch (e) {
				buyPrevVal = localStorage.getItem(STORAGE_KEY);
			}

			// 4. If inside ThemeForest iframe or preview, append ?prev=tf to internal demo links
			// so when user clicks any demo link, it passes prev=tf to 1st-party localStorage on the main domain
			if (window.self !== window.top || isTfPreview) {
				try {
					var origin = window.location.origin;
					$('a[href]').each(function () {
						var $a = $(this);
						var href = $a.attr('href');
						if (href && (href.indexOf(origin) === 0 || href.indexOf('/') === 0) && href.indexOf('prev=') === -1 && href.indexOf('#') !== 0 && href.indexOf('javascript:') !== 0) {
							var sep = href.indexOf('?') !== -1 ? '&' : '?';
							$a.attr('href', href + sep + 'prev=tf');
						}
					});
				} catch (e) {}
			}

			// 5. Determine if target is ThemeForest ('tf')
			var isTf = (buyPrevVal === 'tf');

			// Toggle visibility for .buy_thimpress and .buy_themeforest
			if (isTf) {
				$('.buy_thimpress').hide();
				$('.buy_themeforest').show();
			} else {
				$('.buy_themeforest').hide();
				$('.buy_thimpress').show();
			}

			// Update Buy Now link targets including links with href="#tp_chameleon_popup"
			$('a[href="#tp_chameleon_popup"]').attr('target', '_blank');

			var $buyLinks = $('.style-toggle.toggle-buynow a, .btn-link-buy a, a.btn-buy, a[data-url-tf], a[href="#tp_chameleon_popup"]');
			$buyLinks.each(function () {
				var $link = $(this);
				var urlTf = $link.attr('data-url-tf') || (typeof tpChameleon !== 'undefined' && tpChameleon.buyUrls ? tpChameleon.buyUrls.tf : '');
				var urlThimpress = $link.attr('data-url-thimpress') || (typeof tpChameleon !== 'undefined' && tpChameleon.buyUrls ? tpChameleon.buyUrls.thimpress : '');

				var targetUrl = isTf ? urlTf : (urlThimpress || urlTf);
				if (targetUrl) {
					$link.attr('href', targetUrl);
				}
				if ($link.attr('href') === '#tp_chameleon_popup') {
					$link.attr('target', '_blank');
				}
			});
		}

		// Handle click on links with href="#tp_chameleon_popup" to redirect directly to buy URL in new tab
		$(document).on('click', 'a[href="#tp_chameleon_popup"]', function (e) {
			e.preventDefault();
			var $link = $(this);
			$link.attr('target', '_blank');

			var isTf = false;
			try {
				var item = localStorage.getItem('buy_prev');
				if (item) {
					var data = JSON.parse(item);
					isTf = (data && data.value === 'tf') || item === 'tf';
				}
			} catch (err) {}

			var urlTf = $link.attr('data-url-tf') || (typeof tpChameleon !== 'undefined' && tpChameleon.buyUrls ? tpChameleon.buyUrls.tf : '');
			var urlThimpress = $link.attr('data-url-thimpress') || (typeof tpChameleon !== 'undefined' && tpChameleon.buyUrls ? tpChameleon.buyUrls.thimpress : '');
			var targetUrl = isTf ? urlTf : (urlThimpress || urlTf);

			if (targetUrl && targetUrl !== '#tp_chameleon_popup') {
				window.open(targetUrl, '_blank');
			}
		});

		// Run immediately and on all readiness events
		handleBuyPrev();
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', handleBuyPrev);
		}
		window.addEventListener('pageshow', handleBuyPrev);
	});


	jQuery(document).ready(function () {
		var timeouts = [];
		jQuery('.tp-filters-wrapper .tp-filters-cats input').on('change', function (e) {
			var wrapper = jQuery(this).closest('.tp-style-selector'),
				demos = wrapper.find('.tp-demo'),
				filterGroups = wrapper.find('.tp-filters-cats'),
				selections = {},
				counter = 1;
			e.preventDefault();

			var $this = jQuery(this);
			if ($this.is(':checked')) {
				if ($this.val() === 'all') {
					$this.closest('.tp-filters-cats').find('input').not($this).prop('checked', false);
				} else {
					$this.closest('.tp-filters-cats').find('input[value="all"]').prop('checked', false);
				}
			} else {
				if ($this.closest('.tp-filters-cats').find('input:checked').length === 0) {
					$this.closest('.tp-filters-cats').find('input[value="all"]').prop('checked', true);
				}
			}

			// Add active class to list item
			jQuery(this).closest('.tp-filters-cats').find('li').removeClass('active');
			jQuery(this).closest('.tp-filters-cats').find('input:checked').not('[value="all"]').closest('li').addClass('active');

			filterGroups.each(function (e) {
				var filterWrapper = jQuery(this),
					filterType = filterWrapper.data('type'),
					selected = new Array();

				// Get currently checked filters.
				filterWrapper.find('input:checked').each(function () {
					if ('all' === this.value) {
						return false;
					}
					selected.push(this.value);
				});

				// Add to the main selctions object.
				if (0 < selected.length) {
					selections[filterType] = selected;
				}
			});
			jQuery.each(timeouts, function (index, value) {
				clearTimeout(value);
			});

			// Hide all demos.
			demos.hide().addClass('demo-hidden');
			demos.each(function () {
				var demo = jQuery(this),
					compareData = demo.data(),
					selectionCount = 0;
				jQuery.each(compareData, function (filterType, selected) {
					var selectedString;

					// Return early if the data field is not present in the filter selection.
					if ('undefined' === typeof selections[filterType]) {
						return;
					}
					// Return early if selected is empty.
					if ('' === selected) {
						return;
					} else if (-1 === selected.indexOf(',')) {
						selected += ',';
					}

					selectedString = selected.split(',');
					jQuery.each(selectedString, function (index, value) {
						if (-1 !== jQuery.inArray(value, selections[filterType])) {
							selectionCount++;
							return false;
						}
					});
				});
				if (selectionCount === Object.keys(selections).length) {
					demo.show();
					timeouts.push(
						setTimeout(function () {
							demo.removeClass('demo-hidden');
						}, counter * 50)
					);
					counter++;
				}
			});
		});
	});
})(jQuery);
