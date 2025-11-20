import Helpers from './helpers.js';
import PaletteGenerator from './palette-gen.js';
import {
	renderPaletteControls,
	saveConstantsToStorage,
	getConstantsFromInputs,
	resetConstants,
	initializeConstants,
	setupConstantsEventListeners,
} from './controls.js';

window.colorsData = JSON.parse(
	`{"colors":[{"blue":{"name":"Синий","name_en":"Blue","hex":["#5199FF","#1771F1","#0260E8","#0351C1","#0043A4","#002D6D","#052555","#01142F","#2300B0","#242240","#2E3F7F","#4A69FF"]},"aqua":{"name":"Голубой","name_en":"Light blue","hex":["#E5F0FF","#B7D4FF","#7EB3FF","#51EAFF","#BDCCFF","#7AB1FF","#64C7FF","#D7FFFE","#D7E1E9","#F2F8FD","#AFCFEA","#1EC9E8"]},"mintgreen":{"name":"Мятный зелёный","name_en":"Mint","hex":["#E4FFF9","#B5FBDD","#76FEC5","#45D09E","#17F1D7","#00CF91","#48CFAF","#00848C","#AEE8E4","#00DFC8","#004156","#2398AB"]},"green":{"name":"Зелёный","name_en":"Green","hex":["#5BFF62","#41B619","#117243","#116315","#4BB462","#008736","#4D8802","#1E3C00","#00DC7D","#77BD8B","#70E852","#35D073"]},"lightgreen":{"name":"Салатовый","name_en":"Light green","hex":["#BEF761","#CEFF9D","#C9FFBF","#A7E541","#CBE724","#8CBA51","#8EAF0C","#748700"]},"yellow":{"name":"Желтый","name_en":"Yellow","hex":["#FFD600","#FFFCBB","#FED876","#FFE55E","#FFEB7F","#F4EDB2","#FFF851","#F7F272","#EEDC7C","#F5E027","#D6C21A","#D2AA1B","#FFC11E","#FFE9A0","#FBFF00","#EAE114"]},"peach":{"name":"Персиковый","name_en":"Peach","hex":["#FBE7B5","#FBCEB5","#FE9E76","#FFE0BC","#FF756B","#F85C50","#FB9F82","#FFA96B"]},"orange":{"name":"Оранжевый","name_en":"Orange","hex":["#FFC46B","#FFAF50","#FC9A40","#FF905A","#FFAD32","#DF8600","#FF7A2F","#FF6B00","#FFCB8B","#FE634E","#FDA371","#F39629"]},"pink":{"name":"Розовый","name_en":"Pink","hex":["#FFDFDC","#E8D5D5","#F5B2AC","#FF9CA1","#DCABAE","#FEAC92","#FF7272","#E85668","#FF2970","#DB6B88","#BE5D77","#F59BAF","#F6DDDF","#DEC0C1","#FF008B","#FF005C"]},"red":{"name":"Красный","name_en":"Red","hex":["#F6522E","#FF6E4E","#FF6A61","#E20338","#B40A1B","#EE3D48","#460000","#922D25","#FF0000","#BC0022","#CE3D1D","#D8664D"]},"purple":{"name":"Пурпурный","name_en":"Purple","hex":["#EF2FA2","#C23A94","#CA1A8E","#E47CCD","#B10361","#DC3790","#FD0079","#810B44","#A854A5","#FFBEED","#B9789F","#7C3668","#380438","#F375F3","#F375CF","#AE3F7B"]},"violet":{"name":"Фиолетовый","name_en":"Violet","hex":["#782FEF","#6E36CA","#4400B2","#A771FE","#2D1457","#761CEA","#852EBA","#3F0B81","#580BE4","#A400FF","#9A76B3","#940CFE"]},"darkgray":{"name":"Темные серые","name_en":"Dark gray","hex":["#231F20","#414042","#58595B","#6D6E71","#808285","#939598"]},"lightgray":{"name":"Светлые серые","name_en":"Light gray","hex":["#FFFFFF","#F1F2F2","#E6E7E8","#D1D3D4","#BCBEC0"]},"grayshades":{"name":"Фоновые серые оттенки","name_en":"Background gray shades","hex":["#FAFAF2","#F2F4F6","#F5F2F0","#F0F0F0","#F1F6FB","#EDEDED","#F7F7F2","#EEF0ED","#F2F2E5","#F0F6F4","#D4DADE","#FBF8F5","#C1BBB7","#F1EBE5","#EAE6E1","#EEEDEA","#4A586E","#2F3538","#DAE4E5","#D5D5D5","#1A2026","#BBC9DD","#2F3640","#D5D5D5","#8C8C8C","#535353","#DCE5E7","#404040"]}}]}`
);
window.backgroundColors = [];
window.accentColors = [];
window.darkBackgroundColors = [];
window.allColors = [];

window.h = new Helpers();
const paletteGenerator = new PaletteGenerator(colorsData);

// Store original color arrays before any deletions
const originalAccentColors = [...window.accentColors];
const originalBackgroundColors = [...window.backgroundColors];
const originalDarkBackgroundColors = [...window.darkBackgroundColors];

// localStorage key for deleted colors
const DELETED_COLORS_STORAGE_KEY = 'paletteGeneratorDeletedColors';

// Load deleted colors from localStorage and filter them out
function loadDeletedColors() {
	try {
		const stored = localStorage.getItem(DELETED_COLORS_STORAGE_KEY);
		if (stored) {
			const deletedColors = JSON.parse(stored);
			// Filter out deleted colors from each array
			window.accentColors = window.accentColors.filter(color => !deletedColors.accentColors?.includes(color));
			window.backgroundColors = window.backgroundColors.filter(color => !deletedColors.backgroundColors?.includes(color));
			window.darkBackgroundColors = window.darkBackgroundColors.filter(color => !deletedColors.darkBackgroundColors?.includes(color));
		}
	} catch (e) {
		console.error('Error loading deleted colors from localStorage:', e);
	}
}

// Save deleted colors to localStorage
function saveDeletedColors() {
	try {
		const deletedColors = {
			accentColors: originalAccentColors.filter(color => !window.accentColors.includes(color)),
			backgroundColors: originalBackgroundColors.filter(color => !window.backgroundColors.includes(color)),
			darkBackgroundColors: originalDarkBackgroundColors.filter(color => !window.darkBackgroundColors.includes(color))
		};
		localStorage.setItem(DELETED_COLORS_STORAGE_KEY, JSON.stringify(deletedColors));
	} catch (e) {
		console.error('Error saving deleted colors to localStorage:', e);
	}
}

// Reset colors to original state
function resetColors() {
	localStorage.removeItem(DELETED_COLORS_STORAGE_KEY);
	window.accentColors = [...originalAccentColors];
	window.backgroundColors = [...originalBackgroundColors];
	window.darkBackgroundColors = [...originalDarkBackgroundColors];
	renderColorLists();
}

// Load deleted colors on page load
loadDeletedColors();

const container = document.getElementById('palettesContainer');
const stats = document.getElementById('stats');

// Render controls on page load
const paletteOptionsContainer = document.getElementById('paletteOptionsContainer');
if (paletteOptionsContainer) {
	renderPaletteControls(paletteOptionsContainer, {
		includeConstants: true,
		buttonGroupClass: 'button-group',
		generateBtnId: 'generateBtn',
		resetBtnId: 'resetBtn',
	});

	// Initialize constants from localStorage
	initializeConstants();

	// Set up event listeners for auto-save
	setupConstantsEventListeners();
}

// форматируем списки цветов
function renderColorLists() {
	const colorsSection = document.getElementById('colorsSection');
	if (!colorsSection) return;

	const categories = [
		{name: 'Accent Colors', colors: window.accentColors, description: 'L 36-90'},
		{name: 'Background Colors', colors: window.backgroundColors, description: 'L 91-97'},
		{name: 'Dark Background Colors', colors: window.darkBackgroundColors, description: 'L 0-35'},
	];

	let html = `
		<div class="colors-section-header-wrapper">
			<h2 class="colors-section-header">Available Colors</h2>
			<button class="reset-colors-btn" id="resetColorsBtn">Reset Colors</button>
		</div>
	`;

	categories.forEach(category => {
		if (category.colors.length === 0) return;

		html += `
			<div class="color-category">
				<h3 class="color-category-header">
					${category.name}
					<span class="color-category-count">(${category.colors.length} colors - ${category.description})</span>
				</h3>
				<div class="colors-grid">
		`;

		category.colors.forEach(color => {
			const hsl = window.h.hexToHsl(color);
			const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
			html += `
				<div class="color-item" title="${color} - ${hslString}">
					<div class="color-swatch" style="background-color: ${color}">
						<button class="delete-btn" data-color="${color}" data-category="${category.name}" title="Delete color">×</button>
					</div>
					<div class="color-value">${hslString}</div>
				</div>
			`;
		});

		html += `
				</div>
			</div>
		`;
	});

	colorsSection.innerHTML = html;

	// Add event listener to reset colors button
	const resetColorsBtn = document.getElementById('resetColorsBtn');
	if (resetColorsBtn) {
		resetColorsBtn.addEventListener('click', () => {
			resetColors();
		});
	}

	// Add event listeners to all delete buttons
	const deleteButtons = colorsSection.querySelectorAll('.delete-btn');
	deleteButtons.forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopPropagation(); // Prevent triggering color item click
			const colorHex = btn.getAttribute('data-color');
			const categoryName = btn.getAttribute('data-category');

			if (categoryName === 'Accent Colors') {
				window.accentColors = window.accentColors.filter(color => color !== colorHex);
			} else if (categoryName === 'Background Colors') {
				window.backgroundColors = window.backgroundColors.filter(color => color !== colorHex);
			} else if (categoryName === 'Dark Background Colors') {
				window.darkBackgroundColors = window.darkBackgroundColors.filter(color => color !== colorHex);
			}

			// Save deleted colors to localStorage
			saveDeletedColors();

			renderColorLists(); // Re-render the color lists
		});
	});
}

renderColorLists();

function addEvents() {
	const generateBtn = document.getElementById('generateBtn');
	const resetBtn = document.getElementById('resetBtn');
	if (generateBtn) {
		generateBtn.addEventListener('click', () => {
			generateAndDisplay();
		});
	}

	if (resetBtn) {
		resetBtn.addEventListener('click', () => {
			resetConstants();
		});
	}

	container.addEventListener('click', e => {
		if (e.target.classList.contains('delete-btn')) {
			const colorHex = e.target.getAttribute('data-color');
			const categoryName = e.target.getAttribute('data-category');
			deleteColor(colorHex, categoryName);
		}
	});
}

addEvents();

function generateAndDisplay() {
	container.innerHTML = '<div class="loading">Generating palettes...</div>';
	stats.textContent = '';

	// Get algorithm constants
	const constants = getConstantsFromInputs();

	// Save constants to localStorage when generating
	saveConstantsToStorage(constants);

	const startTime = performance.now();

	// Generate palettes using algorithm method
	const palettes = paletteGenerator.generatePalettes(constants);

	const endTime = performance.now();
	const generationTime = ((endTime - startTime) / 1000).toFixed(2);

	container.innerHTML = '';

	const palettesGrid = document.createElement('div');
	palettesGrid.className = 'palettes-grid';

	const timestamp = Date.now();
	const palettesSortedByColors = {};
	window.palettes = {};
	palettes.forEach((palette, index) => {
		const paletteId = `palette-${timestamp}-${index}`;
		palette.id = paletteId;
		window.palettes[paletteId] = palette;
	});
	palettes.forEach(palette => {
		const colorName = palette.colorName;
		if (!palettesSortedByColors[colorName]) {
			palettesSortedByColors[colorName] = [];
		}
		palettesSortedByColors[colorName].push(palette);
	});

	Object.keys(palettesSortedByColors).forEach(colorName => {
		const colorPalettes = palettesSortedByColors[colorName];
		const colorCardHTML = `
			<div class="palette-category" data-color-name="${colorName}">
				<h3 class="palette-category-header">${colorName} (${colorPalettes.length} palettes)</h3>
			</div>
		`;
		palettesGrid.insertAdjacentHTML('beforeend', colorCardHTML);
	});
	let prevAccentColor = '';
	palettes.forEach(palette => {
		let accentCircle = '';
		if (prevAccentColor !== palette.accent) {
			accentCircle = `<div style="width: 100%"></div><div class="palette-accent" style="background-color: ${palette.accent}">${palette.accent}</div>`;
			prevAccentColor = palette.accent;
		}
		const cardHTML = `
			${accentCircle}
			<div class="palette-card" data-palette-id="${palette.id}">
				<div class="palette-preview">
					<div class="palette-bg" style="background-color: ${palette.bgColor}">
						<div class="palette-text" style="color: ${palette.textColor}">Aa</div>
						<div class="button-circle" style="background-color: ${palette.buttonColor}"></div>
					</div>
					<div class="palette-bg" style="background-color: ${palette.secondBgColor}">
						<div class="palette-text" style="color: ${palette.secondTextColor}">Aa</div>
						<div class="button-circle" style="background-color: ${palette.secondButtonColor}"></div>
					</div>
				</div>
			</div>
		`;
		const colorCategoryEl = palettesGrid.querySelector(`[data-color-name="${palette.colorName}"]`);
		if (colorCategoryEl) {
			colorCategoryEl.insertAdjacentHTML('beforeend', cardHTML);
		}
		//palettesGrid.insertAdjacentHTML('beforeend', cardHTML);
	});

	container.appendChild(palettesGrid);

	stats.textContent = `Generated ${palettes.length} palettes in ${generationTime}s`;
}
