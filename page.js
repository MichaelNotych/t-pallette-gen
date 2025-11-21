const BLOCKS_DATA = JSON.parse(
	`[{"id":"1554719461","code":"ME201","elements":[{"className":".t456__horizontalline","fieldName":"color","styleName":"backgroundColor","colorName":"textColor"},{"className":".tmenu-mobile","fieldName":"menu_mob_bgcolor","styleName":"backgroundColor","colorName":"bgColor"},{"className":".t-menuburger span","fieldName":"menu_mob_burgercolor","styleName":"backgroundColor","colorName":"textColor"},{"className":".tmenu-mobile__burgerlogo__title","fieldName":"title_color","styleName":"color","colorName":"textColor"}]},{"id":"1554719501","code":"CR48","elements":[{"className":".t-btn","fieldName":"buttonbgcolor","styleName":"backgroundColor","colorName":"accentColor"}]},{"id":"1554719511","code":"AB607","elements":[{"className":".t814__blocktext","fieldName":"bgcolor","styleName":"backgroundColor","colorName":"secondColor"},{"className":".t814__line","fieldName":"color","styleName":"backgroundColor","colorName":"accentColor"}]},{"id":"1554719541","code":"HW405","elements":[{"className":".t948__textwrapper","fieldName":"bgcolor","styleName":"backgroundColor","colorName":"secondColor"},{"className":".t948__number","fieldName":"color3","styleName":"color","colorName":"textColor"},{"className":".t948__circle","fieldName":"color2","styleName":"borderColor","colorName":"textColor"}]},{"id":"1554719581","code":"TE230","elements":[{"className":".t902__content","fieldName":"color","styleName":"backgroundColor","colorName":"secondColor"},{"className":".t-btn","fieldName":"buttonbgcolor","styleName":"backgroundColor","colorName":"accentColor"}]},{"id":"1554719601","code":"CN106","elements":[{"className":".t-sociallinks__svg path","fieldName":"sociallinks_color","styleName":"fill","colorName":"accentColor"}]},{"id":"1554719611","code":"FT202","elements":[{"className":".t389__horizontalline","fieldName":"color2","styleName":"backgroundColor","colorName":"textColor"},{"className":".t389_scrolltop","fieldName":"descr_color","styleName":"color","colorName":"textColor"},{"className":".t389__icon svg path","fieldName":"descr_color","styleName":"fill","colorName":"textColor"}]}]`
);

window.BLOCKS_DATA = BLOCKS_DATA;

export class PaletteWidget {
	constructor() {
		this.sidebar = document.getElementById('palette-sidebar');
		this.toggleBtn = document.getElementById('palette-sidebar-toggle');
		this.closeBtn = document.getElementById('palette-sidebar-close');

		this.init();
	}

	init() {
		this.toggleBtn && this.toggleBtn.addEventListener('click', this.openSidebar.bind(this));
		this.closeBtn && this.closeBtn.addEventListener('click', this.closeSidebar.bind(this));

		// Handle window resize
		window.addEventListener('resize', () => {
			if (this.sidebar.classList.contains('open')) {
				const width = this.getSidebarWidth();
				if (width === '100%') {
					this.toggleBtn.style.left = '100%';
				} else {
					this.toggleBtn.style.left = '380px';
				}
			}
		});

		// Restore sidebar state from localStorage
		if (localStorage.getItem('palette-sidebar-open') === 'true') {
			this.openSidebar();
		}
	}

	getSidebarWidth() {
		return window.innerWidth <= 768 ? '100%' : '380px';
	}

	openSidebar() {
		this.sidebar.classList.add('open');
		document.body.classList.add('palette-sidebar-open');
		const width = this.getSidebarWidth();
		if (width === '100%') {
			this.toggleBtn.style.left = '100%';
		} else {
			this.toggleBtn.style.left = '380px';
		}
		// Store state in localStorage
		localStorage.setItem('palette-sidebar-open', 'true');
	}

	closeSidebar() {
		this.sidebar.classList.remove('open');
		document.body.classList.remove('palette-sidebar-open');
		this.toggleBtn.style.left = '0';
		// Store state in localStorage
		localStorage.setItem('palette-sidebar-open', 'false');
	}
}

new PaletteWidget();

class PagePainter {
	constructor() {
		this.init();
	}

	init() {
		document.addEventListener('click', event => {
			const paleteCard = event.target.closest('.palette-card');
			if (!paleteCard) return;
			const pastPaletteCard = document.querySelector('.palette-card.active');
			if (pastPaletteCard) {
				pastPaletteCard.classList.remove('active');
			}
			const paletteId = paleteCard.dataset.paletteId;
			const palette = window.palettes[paletteId];
			paleteCard.classList.add('active');
			if (!palette) return;
			this.paintPage(palette);
		});
	}

	paintPage(palette) {
		const paletteObject = {
			primary: {
				bgColor: palette.bgColor,
				textColor: palette.textColor,
				buttonColor: palette.buttonColor,
			},
			secondary: {
				bgColor: palette.secondBgColor,
				textColor: palette.secondTextColor,
				buttonColor: palette.secondButtonColor,
			},
		};

		// красим элементы блоков
		BLOCKS_DATA.forEach((block, i) => {
			const blockEl = document.getElementById('rec' + block.id);
			this.paintBlock(block, blockEl, i, paletteObject, BLOCKS_DATA);
		});
	}

	paintBlock(block, blockEl, index, palette, allBlocks) {
		const pageStartsWithHeaderAndCover = true;

		if (index === allBlocks.length - 1) {
			index += 1;
		}

		if (pageStartsWithHeaderAndCover && index < 3) {
			index = 0;
		}
		const blockPallete = index % 2 === 0 ? palette.primary : palette.secondary;
		const secondaryBlockPallete = index % 2 === 1 ? palette.primary : palette.secondary;
		if (!blockPallete || !secondaryBlockPallete) return;

		const currentBlockPaletteName = index % 2 === 0 ? 'primary' : 'secondary';
		const secondBlockPaletteName = index % 2 === 0 ? 'secondary' : 'primary';

		// красим фон блока
		blockEl.style.backgroundColor = blockPallete.bgColor;
		blockEl.setAttribute('data-bg-var', index % 2 === 0 ? 'primary' : 'secondary');
		blockEl.setAttribute('data-palette-var', currentBlockPaletteName);

		// меняем цвет элементов блока
		if (block.elements) {
			// Sort elements: those with colorName === 'textColor' or 'buttonColor' go last
			const sortedElements = [...block.elements].sort((a, b) => {
				const isA = a.colorName === 'textColor' || a.colorName === 'buttonColor';
				const isB = b.colorName === 'textColor' || b.colorName === 'buttonColor';
				if (isA && !isB) return 1;
				if (!isA && isB) return -1;
				return 0;
			});

			const colors = {
				accentColor: blockPallete.buttonColor,
				textColor: blockPallete.textColor,
				bgColor: blockPallete.bgColor,
				secondColor: blockPallete.buttonColor,
				strokeColor: blockPallete.buttonColor,
			};

			for (let i = 0; i < sortedElements.length; i++) {
				const {className, styleName, colorName} = sortedElements[i];
				let color = colors[/** @type {keyof typeof colors} */ (colorName)];
				if (colorName === 'secondColor') {
					color = secondaryBlockPallete.bgColor;
				}

				const elements = Array.from(blockEl.querySelectorAll(className));

				elements.forEach(el => {
					el.style.setProperty(
						styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
						color,
						'important'
					);
					if (styleName === 'backgroundColor') {
						el.setAttribute('data-bg-var', colorName);
						el.setAttribute(
							'data-palette-var',
							colorName === 'secondColor' ? secondBlockPaletteName : currentBlockPaletteName
						);
					}
					if (colorName === 'textColor' || colorName === 'accentColor') {
						const closestPaintedElement = el.parentElement.closest('[data-palette-var]');
						let paintedParentPalette = null;
						let paintedParentVar = null;
						if (closestPaintedElement) {
							paintedParentVar = closestPaintedElement.getAttribute('data-palette-var');
							paintedParentPalette = paintedParentVar.includes('second')
								? palette.secondary
								: palette.primary;
						}
						if (paintedParentPalette) {
							if (colorName === 'accentColor') {
								el.setAttribute(
									'data-palette-var',
									paintedParentVar
								);
								el.style[styleName] = paintedParentPalette.buttonColor;
							} else {
								el.style[styleName] = paintedParentPalette.textColor;
							}
						}
					}
				});
			}
		}

		// меняем цвет текста в зависимости от темы
		/** @type {{[key: string]: string}} */
		const textFieldsObj = {
			'[data-menu-submenu-hook]': 'menu_textcolor',

			'[field="title"]': 'title_color',
			'[field="subtitle"]': 'subtitle_color',
			'[field="descr"]': 'descr_color',
			'[field="text"]': 'text_color',
			'[field="btitle"]': 'btitle_color',
			'[field="bdescr"]': 'bdescr_color',

			'[field^="li_title"]': 'title_color',
			'[field^="li_subtitle"]': 'subtitle_color',
			'[field^="li_descr"]': 'descr_color',
			'[field^="li_text"]': 'text_color',
			'[field^="li_price"]': 'price_color',
			'[field^="li_name"]': 'subtitle_color',
			'[field^="li_time"]': 'subtitle_color',

			'[field^="li_persname"]': 'title_color',
			'[field^="li_persdescr"]': 'descr_color',

			'[field="text2"]': 'descr_color',
			'.t-btnflex__text': 'descr_color',
		};

		Object.keys(textFieldsObj).forEach(selector => {
			const elements = blockEl.querySelectorAll(selector);
			if (elements.length === 0) return;

			elements.forEach(element => {
				if (!(element instanceof HTMLElement)) return;

				const closestPaintedElement = element.parentElement.closest('[data-palette-var]');
				let paintedParentPalette = null;
				if (closestPaintedElement) {
					const paintedParentVar = closestPaintedElement.getAttribute('data-palette-var');
					paintedParentPalette = paintedParentVar.includes('second')
						? palette.secondary
						: palette.primary;
				}

				if (selector.includes('btn')) {
					element.style.color = this.checkContrast(paintedParentPalette.buttonColor, '#ffffff') > this.checkContrast(paintedParentPalette.buttonColor, '#000000') ? '#ffffff' : '#000000';
				} else {
					element.style.color = paintedParentPalette.textColor;
				}
			});
		});
	}

	/**
	 * Конвертация цвета из формата HEX в RGB
	 * @param {string} hex - цвет в формате HEX
	 */
	hexToRgb(hex) {
		if (hex.startsWith('rgb')) return hex;
		if (hex.length === 4) hex = '#' + hex.replace('#', '') + hex.replace('#', '');
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
			: null;
	}

	checkContrast(color1, color2) {
		if (!color1 || !color2) return 0;

		if (color1.startsWith('#')) {
			color1 = this.hexToRgb(color1);
		}
		if (color2.startsWith('#')) {
			color2 = this.hexToRgb(color2);
		}

		if (!color1 || !color2) return 0;

		let [luminance1, luminance2] = [color1, color2].map(color => {
			/* Remove the rgb */
			color = color.replace('rgba(', '').replace('rgb(', '').replace(')', '');

			let r = color.split(',')[0].trim();
			let g = color.split(',')[1].trim();
			let b = color.split(',')[2].trim();

			return luminance(r, g, b);
		});

		return contrastRatio(luminance1, luminance2);

		function contrastRatio(luminance1, luminance2) {
			let lighterLum = Math.max(luminance1, luminance2);
			let darkerLum = Math.min(luminance1, luminance2);

			return (lighterLum + 0.05) / (darkerLum + 0.05);
		}

		function luminance(r, g, b) {
			let [lumR, lumG, lumB] = [r, g, b].map(component => {
				let proportion = component / 255;

				return proportion <= 0.03928 ? proportion / 12.92 : Math.pow((proportion + 0.055) / 1.055, 2.4);
			});

			return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
		}
	}
}

new PagePainter();
