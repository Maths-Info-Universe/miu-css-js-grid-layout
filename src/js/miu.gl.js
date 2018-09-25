/**
 *	Some reusable functions
**/

function miuLibFunctions () {
	/* A simple function to add a new class value to an element */
	this.miuAddClass = function(element, newClass) {
		var myArr = element.className.split(' ');
		if (myArr.indexOf(newClass) == -1) {
			element.className += ' ' + newClass;
		}
	};

	this.miuHasClass = function(element, classToCheck) {
		if(!element || !element.className)
			return false;
		var myArr = element.className.split(' ');
		return myArr.indexOf(classToCheck) != -1;
	};

	this.miuRemoveClass = function(element, classToRemove) {
		var myArr = element.className.split(' ');
		var i = 0, newClassName = '';
		for(i = 0; i < myArr.length; i++){
			if(myArr[i] !== classToRemove){
				newClassName += myArr[i] + ' ';
			}
		}
		element.className = newClassName.trim();
	};

	/* A simple function to wrap all innerHTML of an element into another element */
	this.miuWrap = function(toWrapParent, wrapper) {
		wrapper.innerHTML = toWrapParent.innerHTML;
		toWrapParent.innerHTML = '';
		toWrapParent.appendChild(wrapper);
	};

	this.miuGetComputedStyleNumValue = function(element, property) {
		var value = window.getComputedStyle(element).getPropertyValue(property);
		return parseFloat(value.substring(0, value.length - 2), 10);
	};
	
	this.miuGetClearer = function() {
		var clearer = document.createElement('div');
		this.miuAddClass(clearer, 'miu-clearer');
		clearer.style.clear = 'both';
		return clearer;
	};
	
	this.miuGetGap = function(width, height) {
		var gap = document.createElement('div');
		this.miuAddClass(gap, 'miu-gap');
		gap.style.width = (width == -1) ? 'auto' : width + 'px';
		gap.style.height = (height == -1) ? 'auto' : height + 'px';
		gap.style.marginTop = '0px';
		gap.style.marginBottom = '0px';
		gap.style.marginLeft = '0px';
		gap.style.marginRight = '0px';
		return gap;
	};

	this.miuAddClearer = function(element) {
		var clearer = this.miuGetClearer();
		element.appendChild(clearer);
	};
	
	this.miuAddGap = function(element, width, height) {
		var gap = this.miuGetGap(width, height);
		element.appendChild(gap);
	};
	
	this.miuRemoveChildsWithClass = function(parent, className) {
		var childs = parent.childNodes;
		var i = 0;
		for(i = 0; i < childs.length; i++){
			var child = childs[i];
			if(this.miuHasClass(child, className)){
				parent.removeChild(child);
			}
		}
	};
}
var miuLib = new miuLibFunctions;


/**
 *	JS Processor for MIU Grid Component
**/
function miuGridProcessor () {
	if(!miuLib){
		console.log('MIU Library is required');
		return false;
	}
	
	/* A simple function to get the proportion of a cell */
	var miuGetProp = (cell) => {
		var myArr = cell.className.split(' ');
		var i = 0;
		for(i = 0; i < myArr.length; i++){
			var propClass = myArr[i];
			if(/miu-grid-cell-[0-9]{0,1}(d[1-9]){0,1}/.test(propClass)){
				var prop = propClass.replace('miu-grid-cell-', '');
				prop = prop.replace('d', '.');
				prop = parseFloat(prop, 10);
				return prop;
			}
		}
		return 1;
	};

	var miuWrapGridCells = (miuGridSelector) => {
		var cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
		var i = 0, cellInner;
		for(i = 0; i < cells.length; i++){
			cellInner = document.createElement('div');
			cellInner.style.marginLeft = 'auto';
			cellInner.style.marginRight = 'auto';
			miuLib.miuAddClass(cellInner, 'miu-grid-cell-inner');
			miuLib.miuWrap(cells[i], cellInner);
		}
	};

	var miuWrapGrid = (grid) => {
		var gridInner = document.createElement('div');
		gridInner.style.marginLeft = 'auto';
		gridInner.style.marginRight = 'auto';
		miuLib.miuAddClass(gridInner, 'miu-grid-inner');
		miuLib.miuWrap(grid, gridInner);
	}

	var miuUpdateGridCellsWidth = (grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuAutoFillSpaces, miuGridFullResponsive, miuLtr) => {
		var miuGridIsResponsive = miuGridContentWidthFixed === 'responsive';
		var miuGridSelector = grid.getAttribute('miugSelector');
		var gridWidth = miuLib.miuGetComputedStyleNumValue(grid, 'width') + 5;
		var numPerLine = Math.floor(gridWidth / ((miuGridCellMaxWidth) + 2 * miuGridCellPrefMarginLR));
		var newGcWidth = (gridWidth / numPerLine) - (2 * miuGridCellPrefMarginLR);
		var newGcMargin = miuGridCellPrefMarginLR;
		
		var gridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
		var gridInnerWidth = Math.floor(((newGcWidth + 1 + 2 * newGcMargin) * numPerLine));
		gridInner.style.width = gridInnerWidth + 'px';
		
		var cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
		var multi = false;
		var i = 0;
		for(i = 0; i < cells.length; i++){
			if(miuGetProp(cells[i]) != 1){
				multi = true;
				break;
			}
		}
		
		if(miuGridFullResponsive && miuAutoFillSpaces === 'autofill' && !multi){
			console.log('Full responsive is useless in autofill display mode without multicol and/or splitted cells! Disabling...');
			miuGridFullResponsive = false;
			grid.setAttribute('miugGridFullResponsive', miuGridFullResponsive);
			console.log('Full responsive disabled!');
		}
		
		var cellsInner = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell > .miu-grid-cell-inner');
		var lineCells = [], j = 0, propSum = 0;
		for(i = 0; i < cellsInner.length; i++){
			var cell = cellsInner[i].parentNode;
			var prop = miuGetProp(cell);
			cellsInner[i].style.width = (miuGridCellMaxWidth * prop) + 'px';
			var k = newGcMargin * (prop - 1);
			var toRemove = miuLib.miuGetComputedStyleNumValue(cell, 'padding-left');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'padding-right');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-left-width');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-right-width');
			var cellWidth = newGcWidth * prop + (2 * k) - toRemove;
			if(cellWidth < (miuGridCellMaxWidth * prop))
				cellsInner[i].style.width = cellWidth + 'px';
			if(miuGridFullResponsive && cellWidth >= (gridInnerWidth - 2 * newGcMargin)){
				cellWidth = (gridInnerWidth - 2 * newGcMargin);
				cellsInner[i].style.width = cellWidth + 'px';
			}
			if(miuGridIsResponsive){
				cellsInner[i].style.width = cellWidth + 'px';
			}
			cell.style.width = cellWidth + 'px';
			cell.style.height = 'auto';
			cell.style.position = 'relative';
			cell.style.marginLeft = (newGcMargin) + 'px';
			cell.style.marginRight = (newGcMargin) + 'px';
			cell.style.marginTop = miuGridCellPrefMarginTB + 'px';
			cell.style.marginBottom = miuGridCellPrefMarginTB + 'px';
			cell.style.cssFloat = miuLtr;
			if(miuGridFullResponsive){
				if(propSum < numPerLine && (propSum + prop > numPerLine)){
					var remSpace = gridInnerWidth - ((newGcWidth + lineCells.length) * propSum  + (lineCells.length * 2 * newGcMargin));
					var toAdd = remSpace / lineCells.length;
					var k = 0;
					for(k = 0; k < lineCells.length; k++){
						if(miuGridIsResponsive){
							cellsInner[lineCells[k].index].style.width = (miuLib.miuGetComputedStyleNumValue(cellsInner[lineCells[k].index], 'width') + toAdd) + 'px';
						}
						lineCells[k].cell.style.width = (miuLib.miuGetComputedStyleNumValue(lineCells[k].cell, 'width') + toAdd) + 'px';
					}
					lineCells = [{'index': i, 'cell': cell}];
					j = 1;
					propSum = prop;
				}else{
					if(propSum == numPerLine){
						j = 1;
						propSum = prop;
						lineCells = [{'index': i, 'cell': cell}];
					}else{
						propSum += prop;
						lineCells[j++] = {'index': i, 'cell': cell};
					}
				}
			}
		}
		if(miuGridFullResponsive){
			if(propSum < numPerLine){
				var remSpace = gridInnerWidth - ((newGcWidth + lineCells.length) * propSum  + (lineCells.length * 2 * newGcMargin));
				var toAdd = remSpace / lineCells.length;
				var k = 0;
				for(k = 0; k < lineCells.length; k++){
					if(miuGridIsResponsive){
						cellsInner[lineCells[k].index].style.width = (miuLib.miuGetComputedStyleNumValue(cellsInner[lineCells[k].index], 'width') + toAdd) + 'px';
					}
					lineCells[k].cell.style.width = (miuLib.miuGetComputedStyleNumValue(lineCells[k].cell, 'width') + toAdd) + 'px';
				}
			}
		}
		miuGridDisplay(grid, miuAutoFillSpaces, numPerLine, miuGridCellPrefMarginTB, miuLtr);
	};
	
	var miuGridDisplay = (grid, miuAutoFillSpaces, numPerLine, miuGridCellPrefMarginTB, miuLtr) => {
		if(miuAutoFillSpaces === 'table'){
			miuRemoveClearers(grid);
			miuAddClearers(grid, numPerLine);
		}
		
		if(miuAutoFillSpaces === 'autofill'){
			miuRemoveClearers(grid);
			miuAddClearers(grid, numPerLine);
			miuProcessAutoFillSpaces(grid, numPerLine, miuGridCellPrefMarginTB, miuLtr);
		}
	};
	
	var miuRemoveClearers = (grid) => {
		var miuGridSelector = grid.getAttribute('miugSelector');
		var miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
		miuLib.miuRemoveChildsWithClass(miuGridInner, 'miu-clearer');
	};
	
	var miuAddClearers = (grid, numPerLine) => {
		if(numPerLine > 1){
			var miuGridSelector = grid.getAttribute('miugSelector');
			var miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
			var cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
			var i = 0, totalProp = 0;
			for(i = 0; i < cells.length; i++){
				var cell = cells[i];
				var prop = miuGetProp(cell);
				if(totalProp + prop > numPerLine){
					miuGridInner.insertBefore(miuLib.miuGetClearer(), cell);
					totalProp = prop;
				}else{
					totalProp += prop;
				}
			}
		}
	};
	
	var miuProcessAutoFillSpaces = (grid, numPerLine, miuGridCellPrefMarginTB, miuLtr) => {
		if(numPerLine > 1){
			var miuGridSelector = grid.getAttribute('miugSelector');
			var miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
			var cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
			if(cells.length > 1){
				var i = 0, j = 0;
				for(i = 0; i < cells.length; i++){
					var prop = miuGetProp(cells[i]);
					if(prop != 1){
						console.log('Autofill blank spaces option is not supported for multicol and splitted cell.');
						return false;
					}
				}
				var toRetrieve = [];
				for(i = 0; i < numPerLine; i++){
					toRetrieve[i] = 0;
				}
				for(i = 0; i < cells.length; i += numPerLine){
					var lineHeights = [], maxHeight = 0;
					for(j = 0; j < numPerLine; j++){
						var cell = cells[i + j];
						if(cell){
							lineHeights[j] = miuLib.miuGetComputedStyleNumValue(cell, 'height');
							maxHeight = (maxHeight < lineHeights[j]) ? lineHeights[j] : maxHeight;
							if(toRetrieve[j] > 0){
								cell.style.marginTop = (-toRetrieve[j]) + 'px';
							}
						}else{
							lineHeights[j] = 0;
						}
					}
					for(j = 0; j < numPerLine; j++){
						var cell = cells[i + j];
						if(cell){
							cell.style.height = (maxHeight + toRetrieve[j]) + 'px';
							toRetrieve[j] += (maxHeight - lineHeights[j] - miuGridCellPrefMarginTB + miuLib.miuGetComputedStyleNumValue(cell, 'border-bottom-width'));
						}
					}
				}
			}
		}
	};

	/* The function that inits the grid */
	this.miuInitGrid = function (params){
		if(params && params.selector){
			var miuGridSelector = params.selector;
			var grids = document.querySelectorAll(miuGridSelector);
			var i = 0;
			for(i = 0; i < grids.length; i++){
				var grid = grids[i];
				if(!miuLib.miuHasClass(grid, 'miu-grid')){
					var miuGridContentWidthFixed = params.gridContentWidthFixed ? params.gridContentWidthFixed : ((grid.getAttribute('miugGridContentWidthFixed')) ? grid.getAttribute('miugGridContentWidthFixed') : 'fixed');
					var miuGridCellMaxWidth = params.gridRefWidth ? params.gridRefWidth : ((grid.getAttribute('miugGridRefWidth')) ? parseFloat(grid.getAttribute('miugGridRefWidth'), 10) : 200);
					var miuGridCellPrefMarginLR = params.cellLeftRightGap ? params.cellLeftRightGap / 2 : ((grid.getAttribute('miugCellLeftRightGap')) ? parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2 : 0);
					var miuGridCellPrefMarginTB = params.cellTopBottomGap ? params.cellTopBottomGap / 2 : ((grid.getAttribute('miugCellTopBottomGap')) ? parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2 : 0);
					var miuGridDisplay = params.gridDisplay ? params.gridDisplay : ((grid.getAttribute('miugGridDisplay')) ? grid.getAttribute('miugGridDisplay') : 'table');
					var miuGridFullResponsive = params.gridFullResponsive ? params.gridFullResponsive : ((grid.getAttribute('miugGridFullResponsive')) ? grid.getAttribute('miugGridFullResponsive') : false);
					var miuLtr = params.ltr ? params.ltr : ((grid.getAttribute('miugLtr')) ? grid.getAttribute('miugLtr') : 'ltr');
					
					if(grid){
						miuLib.miuAddClass(grid, 'miu-grid');
						var uniqueClass = 'miu-grid-' + (2475 + document.querySelectorAll('.miu-grid').length);
						miuLib.miuAddClass(grid, uniqueClass);
						var gSelector = '.' + uniqueClass;
						grid.setAttribute('miugSelector', gSelector);
						grid.setAttribute('miugGridContentWidthFixed', miuGridContentWidthFixed);
						grid.setAttribute('miugGridRefWidth', miuGridCellMaxWidth);
						grid.setAttribute('miugCellLeftRightGap', miuGridCellPrefMarginLR * 2);
						grid.setAttribute('miugCellTopBottomGap', miuGridCellPrefMarginTB * 2);
						grid.setAttribute('miugGridDisplay', miuGridDisplay);
						grid.setAttribute('miugGridFullResponsive', miuGridFullResponsive);
						grid.setAttribute('miugLtr', miuLtr);
						miuLtr = miuLtr === 'rtl' ? 'right' : 'left';
						
						miuWrapGrid(grid);
						
						miuLib.miuAddClearer(grid);
						
						miuWrapGridCells(gSelector);
						
						miuUpdateGridCellsWidth(grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuGridDisplay, miuGridFullResponsive, miuLtr);
					}
				}
			}
		}
	};

	/* We listen to window resize event so to update our grids */
	document.onreadystatechange = () => {
		if (document.readyState === 'interactive') {
			var gridsToInit = document.querySelectorAll('.miu-grid-container');
			var i = 0;
			for(i = 0; i < gridsToInit.length; i++){
				var gridToInit = gridsToInit[i];
				if(!miuLib.miuHasClass(gridToInit, 'miu-grid')){
					miuLib.miuAddClass(gridToInit, 'miu-grid-auto-initiated');
					var autoInitClass = 'miu-grid-auto-initiated-' + (1356 + i);
					miuLib.miuAddClass(gridToInit, autoInitClass);
					this.miuInitGrid({selector: '.' + autoInitClass});
					miuLib.miuRemoveClass(gridToInit, autoInitClass);
				}
			}
			window.onresize = (e) => {
				var grids = document.querySelectorAll('.miu-grid');
				var i = 0;
				for(i = 0; i < grids.length; i++){
					var grid = grids[i];
					var miuGridContentWidthFixed = grid.getAttribute('miugGridContentWidthFixed');
					var miuGridCellMaxWidth = parseFloat(grid.getAttribute('miugGridRefWidth'), 10);
					var miuGridCellPrefMarginLR = parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2;
					var miuGridCellPrefMarginTB = parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2;
					var miuGridDisplay = grid.getAttribute('miugGridDisplay');
					var miuGridFullResponsive = grid.getAttribute('miugGridFullResponsive') === 'true';
					var miuLtr = grid.getAttribute('miugLtr') === 'rtl' ? 'right' : 'left';
					miuUpdateGridCellsWidth(grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuGridDisplay, miuGridFullResponsive, miuLtr);
				}
			};
		}
	};
};
var miuGrid = new miuGridProcessor;