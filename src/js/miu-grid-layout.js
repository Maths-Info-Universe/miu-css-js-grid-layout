/**
 *	JS Processor for MIU Grid Component
**/

/* A simple function to add a new class value to an element */
let miuAddClass = (element, newClass) => {
    let arr = element.className.split(" ");
    if (arr.indexOf(newClass) == -1) {
        element.className += " " + newClass;
    }
};

/* A simple function to wrap all innerHTML of an element into another element */
let miuWrap = (toWrapParent, wrapper) => {
	wrapper.innerHTML = toWrapParent.innerHTML;
    toWrapParent.innerHTML = '';
	toWrapParent.appendChild(wrapper);
};

/* A simple function to get the proportion of a cell */
let miuGetProp = (cell) => {
	let arr = cell.className.split(" ");
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

let miuAddClearer = (grid) => {
	let clearer = document.createElement('div');
	clearer.style.clear = 'both';
	grid.appendChild(clearer);
};

let miuWrapGridCell = (miuGridSelector) => {
	let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
	let i = 0, cellInner;
	for(i = 0; i < cells.length; i++){
		cellInner = document.createElement('div');
		cellInner.style.marginLeft = 'auto';
		cellInner.style.marginRight = 'auto';
		miuAddClass(cellInner, 'miu-grid-cell-inner');
		miuWrap(cells[i], cellInner);
	}
};

let miuWrapGrid = (grid) => {
	let gridInner = document.createElement('div');
	gridInner.style.marginLeft = 'auto';
	gridInner.style.marginRight = 'auto';
	miuAddClass(gridInner, 'miu-grid-inner');
	miuWrap(grid, gridInner);
}

let miuGetComputedStyleNumValue = (element, property) => {
	let value = window.getComputedStyle(element).getPropertyValue(property);
	return parseFloat(value.substring(0, value.length - 2), 10);
};

let miuUpdateGridCellWidth = (grid, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuAutoFillSpaces, miuLtr) => {
	let miuGridSelector = grid.getAttribute('miugSelector');
	let gridWidth = miuGetComputedStyleNumValue(grid, 'width');
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
		let toRemove = miuGetComputedStyleNumValue(cell, 'padding-left');
		toRemove += miuGetComputedStyleNumValue(cell, 'padding-right');
		toRemove += miuGetComputedStyleNumValue(cell, 'border-left-width');
		toRemove += miuGetComputedStyleNumValue(cell, 'border-right-width');
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
let miuInitGrid = (params) => {
	if(params && params.selector){
		let miuGridSelector = params.selector;
		let grids = document.querySelectorAll(miuGridSelector);
		let i = 0;
		for(i = 0; i < grids.length; i++){
			let grid = grids[i];
			let miuGridCellMaxWidth = params.gridRefWidth ? params.gridRefWidth : ((grid.getAttribute('miugGridRefWidth')) ? parseFloat(grid.getAttribute('miugGridRefWidth'), 10) : 200);
			let miuGridCellPrefMarginLR = params.cellLeftRightGap ? params.cellLeftRightGap / 2 : ((grid.getAttribute('miugCellLeftRightGap')) ? parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) : 0);
			let miuGridCellPrefMarginTB = params.cellTopBottomGap ? params.cellTopBottomGap / 2 : ((grid.getAttribute('miugCellTopBottomGap')) ? parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) : 0);
			let miuManageSpaces = params.manageSpaces ? params.manageSpaces : ((grid.getAttribute('miugManageSpaces')) ? grid.getAttribute('miugManageSpaces') : 'table');
			let miuLtr = params.ltr ? params.ltr : ((grid.getAttribute('miugLtr')) ? grid.getAttribute('miugLtr') : 'ltr');
			
			if(grid){
				miuAddClass(grid, 'miu-grid');
				let uniqueClass = 'miu-grid-' + (2475 + document.querySelectorAll('.miu-grid').length);
				miuAddClass(grid, uniqueClass);
				let gSelector = '.' + uniqueClass;
				grid.setAttribute('miugSelector', gSelector);
				grid.setAttribute('miugGridRefWidth', miuGridCellMaxWidth);
				grid.setAttribute('miugCellLeftRightGap', miuGridCellPrefMarginLR * 2);
				grid.setAttribute('miugCellTopBottomGap', miuGridCellPrefMarginTB * 2);
				grid.setAttribute('miugManageSpaces', miuManageSpaces);
				grid.setAttribute('miugLtr', miuLtr);
				miuLtr = miuLtr === 'rtl' ? 'right' : 'left';
				
				miuAddClearer(grid);
				
				miuWrapGrid(grid);
				
				miuWrapGridCell(gSelector);
				
				miuUpdateGridCellWidth(grid, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuManageSpaces, miuLtr);
			}
		}
	}
};

/* We listen to window resize event so to update our grids */
document.onreadystatechange = () => {
	if (document.readyState === 'interactive') {
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
