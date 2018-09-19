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
	let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-cell');
	let i = 0, cellInner;
	for(i = 0; i < cells.length; i++){
		cellInner = document.createElement('div');
		cellInner.style.marginLeft = 'auto';
		cellInner.style.marginRight = 'auto';
		miuAddClass(cellInner, 'miu-grid-cell-inner');
		miuWrap(cells[i], cellInner);
	}
};

let miuUpdateGridCellWidth = (grid, miuGridCellMaxWidth, miuGridCellPrefMargin) => {
	let miuGridSelector = grid.getAttribute('miugselector');
	let gridWidth = window.getComputedStyle(grid).getPropertyValue('width');
	gridWidth = parseFloat(gridWidth.substring(0, gridWidth.length - 2), 10);
	let numPerLine = Math.floor(gridWidth / (miuGridCellMaxWidth + 2 * miuGridCellPrefMargin));
	let newGcWidth = (gridWidth - 0.666 * numPerLine) / numPerLine;
	let newGcMargin = 0;
	if(newGcWidth >= (miuGridCellMaxWidth + 2 * miuGridCellPrefMargin)){
		newGcMargin = miuGridCellPrefMargin;
		newGcWidth -= 4 * miuGridCellPrefMargin;
	}
	
	let cellsInner = document.querySelectorAll(miuGridSelector + ' > .miu-grid-cell > .miu-grid-cell-inner');
	for(i = 0; i < cellsInner.length; i++){
		let cell = cellsInner[i].parentNode;
		let prop = miuGetProp(cell);
		cellsInner[i].style.width = (miuGridCellMaxWidth * prop) + 'px';
		let k = newGcMargin * (prop - 1);
		cell.style.width = (newGcWidth * prop + (2 * k)) + 'px';
		cell.style.marginLeft = newGcMargin + 'px';
		cell.style.marginRight = newGcMargin + 'px';
		cell.style.cssFloat = 'left';
	}
};

/* The function that inits the grid */
let miuInitGrid = (miuGridSelector, miuGridCellMaxWidth, miuGridCellPrefMargin) => {
	let grid = document.querySelector(miuGridSelector);
	if(grid){
		miuAddClass(grid, 'miu-grid');
		grid.setAttribute('miugselector', miuGridSelector);
		grid.setAttribute('miugcmw', miuGridCellMaxWidth);
		grid.setAttribute('miugcpm', miuGridCellPrefMargin);
		
		miuAddClearer(grid);
		
		miuWrapGridCell(miuGridSelector);
		
		miuUpdateGridCellWidth(grid, miuGridCellMaxWidth, miuGridCellPrefMargin);
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
				let miuGridCellMaxWidth = parseFloat(grid.getAttribute('miugcmw'), 10);
				let miuGridCellPrefMargin = parseFloat(grid.getAttribute('miugcpm'), 10);
				miuUpdateGridCellWidth(grid, miuGridCellMaxWidth, miuGridCellPrefMargin);
			}
		};
	}
};
