/**
 *	JS Processor for MIU Grid Component
**/
function miuGridProcessor () {
	if(typeof miuDomLib === 'undefined') {
		throw new Error('MIU DOM Library is required for MIU Grid')
	}
	
	/* A simple function to get the proportion of a c */
	var getProp = function(c) {
		var myArr = c.className.split(' '),
			i = 0;
		for(i = 0; i < myArr.length; i++){
			var propClass = myArr[i];
			if(/miu-g-cell-[0-9]{0,1}(d[1-9]){0,1}/.test(propClass)){
				var p = propClass.replace('miu-g-cell-', '');
				p = p.replace('d', '.');
				p = parseFloat(p, 10);
				return p;
			}
		}
		return 1;
	};

	var wrapGridCells = function(selector) {
		var cs = document.querySelectorAll(selector + ' > .miu-g-in > .miu-g-cell'),
			i = 0, cIn;
		for(i = 0; i < cs.length; i++){
			cIn = document.createElement('div');
			cIn.style.marginLeft = 'auto';
			cIn.style.marginRight = 'auto';
			miuDomLib.addClass(cIn, 'miu-g-cell-in');
			miuDomLib.wrap(cs[i], cIn);
		}
	};

	var wrapGrid = function(g) {
		var gIn = document.createElement('div');
		gIn.style.marginLeft = 'auto';
		gIn.style.marginRight = 'auto';
		miuDomLib.addClass(gIn, 'miu-g-in');
		miuDomLib.wrap(g, gIn);
	};

	var updateGridCW = function(g, gcwf, gcmw, gcpmlr, gcpmtb, afs, gfr, ltr) {
		var gcr = gcwf === 'responsive',
			selector = g.getAttribute('miu-g-selector'),
			gwd = miuDomLib.getStyleVal(g, 'width') + 5,
			npl = Math.floor(gwd / ((gcmw) + 2 * gcpmlr));
			if(npl < 1) npl = 1;
		var ngcwd = (gwd / npl) - (2 * gcpmlr),
			ngcmg = gcpmlr,
			gIn = document.querySelector(selector + ' > .miu-g-in'),
			gInWd = Math.floor(((ngcwd + 1 + 2 * ngcmg) * npl));
		gIn.style.width = gInWd + 'px';
		var cs = document.querySelectorAll(selector + ' > .miu-g-in > .miu-g-cell'),
			multi = false,
			i = 0;
		for(i = 0; i < cs.length; i++){
			if(getProp(cs[i]) != 1){
				multi = true;
				break;
			}
		}
		if(gfr && afs === 'autofill' && !multi){
			console.log('Full responsive is useless in autofill display mode without multicol and/or splitted cs! Disabling...');
			gfr = false;
			g.setAttribute('miu-g-fullresp', gfr);
			console.log('Full responsive disabled!');
		}
		var csIn = document.querySelectorAll(selector + ' > .miu-g-in > .miu-g-cell > .miu-g-cell-in'),
			lcs = [], j = 0, psum = 0;
		for(i = 0; i < csIn.length; i++){
			var c = csIn[i].parentNode, p = getProp(c);
			csIn[i].style.width = (gcmw * p) + 'px';
			var k = ngcmg * (p - 1);
			var toRem = miuDomLib.getStyleVal(c, 'padding-left');
			toRem += miuDomLib.getStyleVal(c, 'padding-right');
			toRem += miuDomLib.getStyleVal(c, 'border-left-width');
			toRem += miuDomLib.getStyleVal(c, 'border-right-width');
			var cellWd = ngcwd * p + (2 * k) - toRem;
			if(!gfr && cellWd < gcmw){cellWd = gcmw;}
			if(gfr && cellWd >= (gInWd - 2 * ngcmg)){
				cellWd = (gInWd - 2 * ngcmg);
				csIn[i].style.width = cellWd + 'px';
			}
			if(gcr){csIn[i].style.width = cellWd + 'px';}
			c.style.width = cellWd + 'px';
			c.style.height = 'auto';
			c.style.position = 'relative';
			c.style.marginLeft = (ngcmg) + 'px';
			c.style.marginRight = (ngcmg) + 'px';
			c.style.marginTop = gcpmtb + 'px';
			c.style.marginBottom = gcpmtb + 'px';
			c.style.cssFloat = ltr;
			if(gfr){
				if(psum < npl && (psum + p > npl)){
					var remSpace = gInWd - ((ngcwd + lcs.length) * psum  + (lcs.length * 2 * ngcmg)),
						toAdd = remSpace / lcs.length, k = 0;
					for(k = 0; k < lcs.length; k++){
						if(gcr){
							csIn[lcs[k].index].style.width = (miuDomLib.getStyleVal(csIn[lcs[k].index], 'width') + toAdd) + 'px';
						}
						lcs[k].c.style.width = (miuDomLib.getStyleVal(lcs[k].c, 'width') + toAdd) + 'px';
					}
					lcs = [{'index': i, 'c': c}]; j = 1; psum = p;
				}else{
					if(psum == npl){
						j = 1; psum = p; lcs = [{'index': i, 'c': c}];
					}else{
						psum += p; lcs[j++] = {'index': i, 'c': c};
					}
				}
			}
		}
		if(gfr){
			if(psum < npl){
				var remSpace = gInWd - ((ngcwd + lcs.length) * psum  + (lcs.length * 2 * ngcmg)),
					toAdd = remSpace / lcs.length, k = 0;
				for(k = 0; k < lcs.length; k++){
					if(gcr){
						csIn[lcs[k].index].style.width = (miuDomLib.getStyleVal(csIn[lcs[k].index], 'width') + toAdd) + 'px';
					}
					lcs[k].c.style.width = (miuDomLib.getStyleVal(lcs[k].c, 'width') + toAdd) + 'px';
				}
			}
		}
		gd(g, afs, npl, gcpmtb, ltr);
	};
	
	var gd = function(g, afs, npl, gcpmtb, ltr) {
		if(afs === 'table'){
			remClrs(g); addClrs(g, npl);
		}
		if(afs === 'autofill'){
			remClrs(g); addClrs(g, npl); processAfs(g, npl, gcpmtb, ltr);
		}
	};
	
	var remClrs = function(g) {
		var selector = g.getAttribute('miu-g-selector'),
			gIn = document.querySelector(selector + ' > .miu-g-in');
		miuDomLib.remChildsWithClass(gIn, 'miu-clr');
	};
	
	var addClrs = function(g, npl) {
		if(npl > 1){
			var selector = g.getAttribute('miu-g-selector'),
				gIn = document.querySelector(selector + ' > .miu-g-in'),
				cs = document.querySelectorAll(selector + ' > .miu-g-in > .miu-g-cell');
			var i = 0, ttlProp = 0;
			for(i = 0; i < cs.length; i++){
				var c = cs[i], p = getProp(c);
				if(ttlProp + p > npl){
					gIn.insertBefore(miuDomLib.getClr(), c); ttlProp = p;
				}else{ttlProp += p;}
			}
		}
	};
	
	var processAfs = function(g, npl, gcpmtb, ltr) {
		if(npl > 1){
			var selector = g.getAttribute('miu-g-selector'),
				gIn = document.querySelector(selector + ' > .miu-g-in'),
				cs = document.querySelectorAll(selector + ' > .miu-g-in > .miu-g-cell');
			if(cs.length > 1){
				var i = 0, j = 0;
				for(i = 0; i < cs.length; i++){
					var p = getProp(cs[i]);
					if(p != 1){
						console.log('Autofill blank spaces option is not supported for multicol and splitted c.');
						return false;
					}
				}
				var toRet = [];
				for(i = 0; i < npl; i++){
					toRet[i] = 0;
				}
				for(i = 0; i < cs.length; i += npl){
					var lineHs = [], maxH = 0;
					for(j = 0; j < npl; j++){
						var c = cs[i + j];
						if(c){
							lineHs[j] = miuDomLib.getStyleVal(c, 'height');
							maxH = (maxH < lineHs[j]) ? lineHs[j] : maxH;
							if(toRet[j] > 0){
								c.style.marginTop = (-toRet[j]) + 'px';
							}
						}else{
							lineHs[j] = 0;
						}
					}
					for(j = 0; j < npl; j++){
						var c = cs[i + j];
						if(c){
							c.style.height = (maxH + toRet[j]) + 'px';
							toRet[j] += (maxH - lineHs[j] - gcpmtb + miuDomLib.getStyleVal(c, 'border-bottom-width'));
						}
					}
				}
			}
		}
	};

	/* The function that inits the g */
	this.initGrid = function (p){
		if(p && p.selector){
			var selector = p.selector,
				gs = document.querySelectorAll(selector),
				i = 0;
			for(i = 0; i < gs.length; i++){
				var g = gs[i];
				if(!miuDomLib.hasClass(g, 'miu-g')){
					var gcwf = p.cwfixed ? p.cwfixed : ((g.getAttribute('miu-g-cwfixed')) ? g.getAttribute('miu-g-cwfixed') : 'fixed');
					var gcmw = p.refwidth ? p.refwidth : ((g.getAttribute('miu-g-refwidth')) ? parseFloat(g.getAttribute('miu-g-refwidth'), 10) : 200);
					var gcpmlr = p.lrgap ? p.lrgap / 2 : ((g.getAttribute('miu-g-lrgap')) ? parseFloat(g.getAttribute('miu-g-lrgap'), 10) / 2 : 0);
					var gcpmtb = p.tbgap ? p.tbgap / 2 : ((g.getAttribute('miu-g-tbgap')) ? parseFloat(g.getAttribute('miu-g-tbgap'), 10) / 2 : 0);
					var gd = p.display ? p.display : ((g.getAttribute('miu-g-display')) ? g.getAttribute('miu-g-display') : 'table');
					var gfr = p.fullresp ? p.fullresp : ((g.getAttribute('miu-g-fullresp')) ? (g.getAttribute('miu-g-fullresp') == 'true' ? true : false) : false);
					var ltr = p.ltr ? p.ltr : ((g.getAttribute('miu-g-ltr')) ? g.getAttribute('miu-g-ltr') : 'ltr');
					if(g){
						miuDomLib.addClass(g, 'miu-g');
						var uqClass = 'miu-g-' + (2475 + document.querySelectorAll('.miu-g').length);
						miuDomLib.addClass(g, uqClass);
						var gSel = '.' + uqClass;
						g.setAttribute('miu-g-selector', gSel);
						g.setAttribute('miu-g-cwfixed', gcwf);
						g.setAttribute('miu-g-refwidth', gcmw);
						g.setAttribute('miu-g-lrgap', gcpmlr * 2);
						g.setAttribute('miu-g-btgap', gcpmtb * 2);
						g.setAttribute('miu-g-display', gd);
						g.setAttribute('miu-g-fullresp', gfr);
						g.setAttribute('miu-g-ltr', ltr);
						ltr = ltr === 'rtl' ? 'right' : 'left';
						
						wrapGrid(g);
						miuDomLib.addClr(g);
						wrapGridCells(gSel);
						updateGridCW(g, gcwf, gcmw, gcpmlr, gcpmtb, gd, gfr, ltr);
					}
				}
			}
		}
	};

	/* We listen to window resize event so to update our gs */
	document.onreadystatechange = function() {
		if (document.readyState === 'interactive') {
			var gsToInit = document.querySelectorAll('.miu-g-container'),
				i = 0;
			for(i = 0; i < gsToInit.length; i++){
				var gToInit = gsToInit[i];
				if(!miuDomLib.hasClass(gToInit, 'miu-g')){
					miuDomLib.addClass(gToInit, 'miu-g-ai');
					var aiClass = 'miu-g-ai-' + (1356 + i);
					miuDomLib.addClass(gToInit, aiClass);
					miuGrid.initGrid({selector: '.' + aiClass});
					miuDomLib.remClass(gToInit, aiClass);
				}
			}
			window.onresize = function(e) {
				var gs = document.querySelectorAll('.miu-g'),
					i = 0;
				for(i = 0; i < gs.length; i++){
					var g = gs[i],
						gcwf = g.getAttribute('miu-g-cwfixed'),
						gcmw = parseFloat(g.getAttribute('miu-g-refwidth'), 10),
						gcpmlr = parseFloat(g.getAttribute('miu-g-lrgap'), 10) / 2,
						gcpmtb = parseFloat(g.getAttribute('miu-g-btgap'), 10) / 2,
						gd = g.getAttribute('miu-g-display'),
						gfr = g.getAttribute('miu-g-fullresp') === 'true',
						ltr = g.getAttribute('miu-g-ltr') === 'rtl' ? 'right' : 'left';
					updateGridCW(g, gcwf, gcmw, gcpmlr, gcpmtb, gd, gfr, ltr);
				}
			};
		}
	};
};
var miuGrid = new miuGridProcessor;