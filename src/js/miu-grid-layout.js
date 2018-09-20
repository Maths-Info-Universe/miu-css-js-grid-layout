/**
 *	Some reusable functions
**/

function miuLibFunctions () {
	/* A simple function to add a new class value to an element */
	this.miuAddClass = function(element, newClass) {
		let arr = element.className.split(' ');
		if (arr.indexOf(newClass) == -1) {
			element.className += ' ' + newClass;
		}
	};

	this.miuHasClass = function(element, classToCheck) {
		let arr = element.className.split(' ');
		return arr.indexOf(classToCheck) != -1;
	};

	this.miuRemoveClass = function(element, classToRemove) {
		let arr = element.className.split(' ');
		let i = 0, newClassName = '';
		for(i = 0; i < arr.length; i++){
			if(arr[i] !== classToRemove){
				newClassName += arr[i] + ' ';
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
		let value = window.getComputedStyle(element).getPropertyValue(property);
		return parseFloat(value.substring(0, value.length - 2), 10);
	};

	this.miuAddClearer = function(grid) {
		let clearer = document.createElement('div');
		clearer.style.clear = 'both';
		grid.appendChild(clearer);
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
	let miuGetProp = (cell) => {
		let arr = cell.className.split(' ');
		let i = 0;
		for(i = 0; i < arr.length; i++){
			let propClass = arr[i];
			if(/miu-grid-cell-[0-9]{0,1}(d[1-9]){0,1}/.test(propClass)){
				let prop = propClass.replace('miu-grid-cell-', '');
				prop = prop.replace('d', '.');
				prop = parseFloat(prop, 10);
				return prop;
			}
		}
		return 1;
	};

	let miuWrapGridCell = (miuGridSelector) => {
		let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
		let i = 0, cellInner;
		for(i = 0; i < cells.length; i++){
			cellInner = document.createElement('div');
			cellInner.style.marginLeft = 'auto';
			cellInner.style.marginRight = 'auto';
			miuLib.miuAddClass(cellInner, 'miu-grid-cell-inner');
			miuLib.miuWrap(cells[i], cellInner);
		}
	};

	let miuWrapGrid = (grid) => {
		let gridInner = document.createElement('div');
		gridInner.style.marginLeft = 'auto';
		gridInner.style.marginRight = 'auto';
		miuLib.miuAddClass(gridInner, 'miu-grid-inner');
		miuLib.miuWrap(grid, gridInner);
	}

	let miuUpdateGridCellWidth = (grid, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuAutoFillSpaces, miuLtr) => {
		let miuGridSelector = grid.getAttribute('miugSelector');
		let gridWidth = miuLib.miuGetComputedStyleNumValue(grid, 'width');
		let numPerLine = Math.floor(gridWidth / (miuGridCellMaxWidth + 2 * miuGridCellPrefMarginLR));
		let newGcWidth = (gridWidth - 0.333 * numPerLine) / numPerLine;
		let newGcMargin = 0;
		if(newGcWidth >= (miuGridCellMaxWidth + 2 * miuGridCellPrefMarginLR)){
			newGcMargin = miuGridCellPrefMarginLR;
			newGcWidth -= 4 * miuGridCellPrefMarginLR;
		}
		
		document.querySelector(miuGridSelector + ' > .miu-grid-inner').style.width = Math.floor(((newGcWidth + 1 + 2 * newGcMargin) * numPerLine)) + 'px';
		
		let cellsInner = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell > .miu-grid-cell-inner');
		for(i = 0; i < cellsInner.length; i++){
			let cell = cellsInner[i].parentNode;
			let prop = miuGetProp(cell);
			cellsInner[i].style.width = (miuGridCellMaxWidth * prop) + 'px';
			let k = newGcMargin * (prop - 1);
			let toRemove = miuLib.miuGetComputedStyleNumValue(cell, 'padding-left');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'padding-right');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-left-width');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-right-width');
			let cellWidth = newGcWidth * prop + (2 * k) - toRemove;
			cell.style.width = cellWidth + 'px';
			cell.style.marginLeft = newGcMargin + 'px';
			cell.style.marginRight = newGcMargin + 'px';
			cell.style.marginTop = miuGridCellPrefMarginTB + 'px';
			cell.style.marginBottom = miuGridCellPrefMarginTB + 'px';
			cell.style.cssFloat = miuLtr;
		}
	};

	/* The function that inits the grid */
	this.miuInitGrid = function (params){
		if(params && params.selector){
			let miuGridSelector = params.selector;
			let grids = document.querySelectorAll(miuGridSelector);
			let i = 0;
			for(i = 0; i < grids.length; i++){
				let grid = grids[i];
				if(!miuLib.miuHasClass(grid, 'miu-grid')){
					let miuGridCellMaxWidth = params.gridRefWidth ? params.gridRefWidth : ((grid.getAttribute('miugGridRefWidth')) ? parseFloat(grid.getAttribute('miugGridRefWidth'), 10) : 200);
					let miuGridCellPrefMarginLR = params.cellLeftRightGap ? params.cellLeftRightGap / 2 : ((grid.getAttribute('miugCellLeftRightGap')) ? parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2 : 0);
					let miuGridCellPrefMarginTB = params.cellTopBottomGap ? params.cellTopBottomGap / 2 : ((grid.getAttribute('miugCellTopBottomGap')) ? parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2 : 0);
					let miuManageSpaces = params.manageSpaces ? params.manageSpaces : ((grid.getAttribute('miugManageSpaces')) ? grid.getAttribute('miugManageSpaces') : 'table');
					let miuLtr = params.ltr ? params.ltr : ((grid.getAttribute('miugLtr')) ? grid.getAttribute('miugLtr') : 'ltr');
					
					if(grid){
						miuLib.miuAddClass(grid, 'miu-grid');
						let uniqueClass = 'miu-grid-' + (2475 + document.querySelectorAll('.miu-grid').length);
						miuLib.miuAddClass(grid, uniqueClass);
						let gSelector = '.' + uniqueClass;
						grid.setAttribute('miugSelector', gSelector);
						grid.setAttribute('miugGridRefWidth', miuGridCellMaxWidth);
						grid.setAttribute('miugCellLeftRightGap', miuGridCellPrefMarginLR * 2);
						grid.setAttribute('miugCellTopBottomGap', miuGridCellPrefMarginTB * 2);
						grid.setAttribute('miugManageSpaces', miuManageSpaces);
						grid.setAttribute('miugLtr', miuLtr);
						miuLtr = miuLtr === 'rtl' ? 'right' : 'left';
						
						miuLib.miuAddClearer(grid);
						
						miuWrapGrid(grid);
						
						miuWrapGridCell(gSelector);
						
						miuUpdateGridCellWidth(grid, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuManageSpaces, miuLtr);
					}
				}
			}
		}
	};

	/* We listen to window resize event so to update our grids */
	document.onreadystatechange = () => {
		if (document.readyState === 'interactive') {
			let gridsToInit = document.querySelectorAll('.miu-grid-container');
			let i = 0;
			for(i = 0; i < gridsToInit.length; i++){
				let gridToInit = gridsToInit[i];
				if(!miuLib.miuHasClass(gridToInit, 'miu-grid')){
					miuLib.miuAddClass(gridToInit, 'miu-grid-auto-initiated');
					let autoInitClass = 'miu-grid-auto-initiated-' + (1356 + i);
					miuLib.miuAddClass(gridToInit, autoInitClass);
					this.miuInitGrid({selector: '.' + autoInitClass});
					miuLib.miuRemoveClass(gridToInit, autoInitClass);
				}
			}
			window.onresize = (e) => {
				let grids = document.querySelectorAll('.miu-grid');
				let i = 0;
				for(i = 0; i < grids.length; i++){
					let grid = grids[i];
					let miuGridCellMaxWidth = parseFloat(grid.getAttribute('miugGridRefWidth'), 10);
					let miuGridCellPrefMarginLR = parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2;
					let miuGridCellPrefMarginTB = parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2;
					let miuManageSpaces = grid.getAttribute('miugManageSpaces');
					let miuLtr = grid.getAttribute('miugLtr') === 'rtl' ? 'right' : 'left';
					miuUpdateGridCellWidth(grid, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuManageSpaces, miuLtr);
				}
			};
		}
	};
};
var miuGrid = new miuGridProcessor;