// Default constants values
export const DEFAULT_CONSTANTS = {
	LIGHT_BG_LIGHTNESS: 97,
	ANALOGOUS_HUE_RANGE: 30,
	ACCENT_AND_BACKGROUND_CONTRAST_RATIO: 1.4,
	DEFAULT_DARK_BG_COLOR: '#292929'
};

/**
 * Renders palette generator controls into a container element
 * @param {HTMLElement} container - Container element where controls will be rendered
 * @param {Object} options - Options for rendering
 * @param {boolean} options.includeConstants - Whether to include algorithm constants section (default: true)
 * @param {string} options.buttonGroupClass - CSS class for button group container (default: 'button-group')
 * @param {string} options.generateBtnId - ID for generate button (default: 'generateBtn')
 * @param {string} options.resetBtnId - ID for reset button (default: 'resetBtn')
 */
export function renderPaletteControls(container, options = {}) {
	const {
		includeConstants = true,
		buttonGroupClass = 'button-group',
		generateBtnId = 'generateBtn',
		resetBtnId = 'resetBtn'
	} = options;

	let html = '';

	if (includeConstants) {
		html += `
			<div class="palette-option-group">
				<label class="palette-option-label">Algorithm Constants:</label>
				<div class="algorithm-constants-grid">
					<div class="constant-input-group">
						<label for="lightBgLightness">Light BG Lightness:</label>
						<input type="number" id="lightBgLightness" value="${DEFAULT_CONSTANTS.LIGHT_BG_LIGHTNESS}" min="0" max="100" step="1">
					</div>
					<div class="constant-input-group">
						<label for="analogousHueRange">Analogous Hue Range:</label>
						<input type="number" id="analogousHueRange" value="${DEFAULT_CONSTANTS.ANALOGOUS_HUE_RANGE}" min="0" max="360" step="1">
					</div>
					<div class="constant-input-group">
						<label for="contrastRatio">Contrast Ratio:</label>
						<input type="number" id="contrastRatio" value="${DEFAULT_CONSTANTS.ACCENT_AND_BACKGROUND_CONTRAST_RATIO}" min="0" max="10" step="0.1">
					</div>
					<div class="constant-input-group">
						<label for="defaultDarkBgColor">Default Dark BG Color:</label>
						<input type="color" id="defaultDarkBgColor" value="${DEFAULT_CONSTANTS.DEFAULT_DARK_BG_COLOR}">
					</div>
				</div>
			</div>
		`;
	}

	html += `
		<div class="${buttonGroupClass}">
			<button class="generate-btn" id="${generateBtnId}">Generate Palettes</button>
			<button class="reset-btn" id="${resetBtnId}">Reset Constants</button>
		</div>
	`;

	container.innerHTML = html;
}

// localStorage key
const STORAGE_KEY = 'paletteGeneratorConstants';

// Load constants from localStorage
export function loadConstantsFromStorage() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.error('Error loading constants from localStorage:', e);
	}
	return null;
}

// Save constants to localStorage
export function saveConstantsToStorage(constants) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(constants));
	} catch (e) {
		console.error('Error saving constants to localStorage:', e);
	}
}

// Get constants from form inputs
export function getConstantsFromInputs() {
	return {
		LIGHT_BG_LIGHTNESS: parseFloat(document.getElementById('lightBgLightness')?.value) || DEFAULT_CONSTANTS.LIGHT_BG_LIGHTNESS,
		ANALOGOUS_HUE_RANGE: parseFloat(document.getElementById('analogousHueRange')?.value) || DEFAULT_CONSTANTS.ANALOGOUS_HUE_RANGE,
		ACCENT_AND_BACKGROUND_CONTRAST_RATIO: parseFloat(document.getElementById('contrastRatio')?.value) || DEFAULT_CONSTANTS.ACCENT_AND_BACKGROUND_CONTRAST_RATIO,
		DEFAULT_DARK_BG_COLOR: document.getElementById('defaultDarkBgColor')?.value || DEFAULT_CONSTANTS.DEFAULT_DARK_BG_COLOR
	};
}

// Populate form inputs with constants
export function populateInputsFromConstants(constants) {
	const lightBgInput = document.getElementById('lightBgLightness');
	const analogousHueInput = document.getElementById('analogousHueRange');
	const contrastRatioInput = document.getElementById('contrastRatio');
	const defaultDarkBgInput = document.getElementById('defaultDarkBgColor');

	if (lightBgInput) lightBgInput.value = constants.LIGHT_BG_LIGHTNESS ?? DEFAULT_CONSTANTS.LIGHT_BG_LIGHTNESS;
	if (analogousHueInput) analogousHueInput.value = constants.ANALOGOUS_HUE_RANGE ?? DEFAULT_CONSTANTS.ANALOGOUS_HUE_RANGE;
	if (contrastRatioInput) contrastRatioInput.value = constants.ACCENT_AND_BACKGROUND_CONTRAST_RATIO ?? DEFAULT_CONSTANTS.ACCENT_AND_BACKGROUND_CONTRAST_RATIO;
	if (defaultDarkBgInput) defaultDarkBgInput.value = constants.DEFAULT_DARK_BG_COLOR ?? DEFAULT_CONSTANTS.DEFAULT_DARK_BG_COLOR;
}

// Reset constants to defaults
export function resetConstants() {
	localStorage.removeItem(STORAGE_KEY);
	populateInputsFromConstants(DEFAULT_CONSTANTS);
}

// Initialize constants on page load
export function initializeConstants() {
	const storedConstants = loadConstantsFromStorage();
	if (storedConstants) {
		populateInputsFromConstants(storedConstants);
	} else {
		populateInputsFromConstants(DEFAULT_CONSTANTS);
	}
}

// Set up event listeners for input changes to auto-save
export function setupConstantsEventListeners() {
	const constantInputs = [
		'lightBgLightness',
		'analogousHueRange',
		'contrastRatio',
		'defaultDarkBgColor'
	];

	constantInputs.forEach(inputId => {
		const input = document.getElementById(inputId);
		if (input) {
			input.addEventListener('change', () => {
				const constants = getConstantsFromInputs();
				saveConstantsToStorage(constants);
			});
			input.addEventListener('input', () => {
				const constants = getConstantsFromInputs();
				saveConstantsToStorage(constants);
			});
		}
	});
}

