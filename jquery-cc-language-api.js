(function($) {

	$.dictionary = function(lang) {
		return new Dictionary(lang);
	};

	function Dictionary(lang) {
		this.lang = lang;
	}

	Dictionary.prototype.findWord = function(prefix, type) {
		return $.ajax().then(function(data) {
			return new Word(data);
		});
	};

	function Word(data) {
		$.extend(this, data);
		if (!this.numerusExists()) {
			this.fixNumerus();
		}
	}

	Word.prototype.casus = 'nominativ';

	Word.prototype.numerus = 'singular';

	Word.prototype.numerusExists = function() {
		return typeof this[this.numerus] !== 'undefined';
	};

	Word.prototype.fixNumerus = function() {
		return this['singular'] ? 'singular' : 'plural';
	};

	Word.prototype.flex = function(options) {
		return $.extend(this, options);
	};

	$.each([ 'singular', 'plural' ], function(i, numerus) {
		Word.prototype[numerus] = function() {
			return this.flex({
				numerus : numerus
			});
		};
	});
	$.each([ 'nominativ', 'genitiv', 'dativ', 'accusativ' ],
			function(i, casus) {
				Word.prototype[casus] = function() {
					return this.flex({
						casus : casus
					});
				};
			});

})(jQuery);