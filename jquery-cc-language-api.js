(function($) {

	$.dictionary = function(lang) {
		return new Dictionary(lang);
	};

	function Dictionary(lang) {
		this.lang = lang;
	}
	
	var types = {
			Adjektiv: Adjektiv,
			Substantiv: Substantiv
	};

	Dictionary.prototype.findWord = function(prefix, type, options) {
		var url = 'http://api.creativecouple.de/language/'+encodeURIComponent(this.lang)+'/'+encodeURIComponent(type)+'.php/'+encodeURIComponent(prefix);
		return $.ajax({
			url : url,
			data : $.extend(options, {typ:options.comparatio}),
			dataType: "jsonp"
		}).then(function(data) {		
			console.log(url, data);
			if (!data.flex) {
				return null;
			}
			var X = types[type] || Word;
			return new X(data).flex(options);
		});
	};
	
	$.each(['Substantiv','Adjektiv'], function(i, type, options){
		Dictionary.prototype['find'+type] = function(prefix, options){
			return this.findWord(prefix, type, options);
		};
	});

	function Word(data) {
		this.casus = 'nominativ';
		this.numerus = 'singular';
		this.genus = 'maskulinum';
		this.beugung = 'schwach';
		this.article = true;

		$.extend(this, {source : data.flex});
	}

	Word.prototype.flex = function(options) {
		return $.extend(this, options);
	};

	$.each([ 'nominativ', 'genitiv', 'dativ', 'accusativ' ], function(i, casus) {
		Word.prototype[casus] = function() {
			return this.flex({
				casus : casus
			});
		};
	});
	
	$.each([ 'stark', 'schwach', 'gemischt' ], function(i, beugung) {
		Word.prototype[beugung] = function() {
			return this.flex({
				beugung : beugung
			});
		};
	});

	$.each([ 'maskulinum', 'femininum', 'neutrum' ], function(i, genus) {
		Word.prototype[genus] = function() {
			return this.flex({
				genus : genus
			});
		};
	});

	$.each([ 'singular', 'plural' ], function(i, numerus) {
		Word.prototype[numerus] = function() {
			return this.flex({
				numerus : numerus
			});
		};
	});	

	Word.prototype.noArticle = function() {
		return this.flex({
			article : false
		});
	};
	
	Word.prototype.withArticle = function() {
		return this.flex({
			article : true
		});
	};
	
	function Adjektiv(data) {
		Word.call(this, data);
		for (var comparatio in this.source) {
			this.comparatio = comparatio;
			break;
		}
	}
	Adjektiv.prototype = new Word({});
	
	Adjektiv.prototype.hasNumerus = function(numerus) {
		return numerus === 'singular' || numerus === 'plural';
	};
	
	Adjektiv.prototype.toString = function(){
		var gen = (this.numerus == 'plural') ? 'plural' : this.genus;
		var variant = this.source[this.comparatio][this.beugung][gen][this.casus];
		return String(this.article ? variant[1]+' '+variant[0] : variant[0]);
	};

	$.each([ 'positiv', 'komparativ', 'superlativ' ], function(i, comparatio) {
		Adjektiv.prototype[comparatio] = function() {
			return this.flex({
				comparatio : comparatio
			});
		};
	});	
	
	function Substantiv(data) {
		Word.call(this, data);
		for (var genus in this.source) {
			this.genus = genus;
			for (var numerus in this.source[genus][this.beugung]) {
				this.numerus = numerus;
				break;
			}
			break;
		}
	}
	Substantiv.prototype = new Word({});

	Substantiv.prototype.hasNumerus = function(numerus) {
		return !!this.source[this.genus][this.beugung][numerus];
	};

	Substantiv.prototype.toString = function(){
		var variant = this.source[this.genus][this.beugung][this.numerus][this.casus];
		return String((this.article && variant[1]) ? variant[1]+' '+variant[0] : variant[0]);
	};

})(jQuery);
