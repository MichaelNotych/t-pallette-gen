export default class PaletteGenerator {

	constructor(data) {
		this.parseColors(data.colors[0]);
	}

	// #region parsing

	/**
	 *
	 * @param {Object} colors
	 * @param {string} colors.name
	 * @param {string} colors.name_en
	 * @param {string[]} colors.hex
	 */
	parseColors(colors) {
		console.log(colors);
		for (const category in colors) {
			const hexArray = colors[category].hex;
			for (let i = 0; i < hexArray.length; i++) {
				const hex = hexArray[i];
				const hsl = this.hexToHsl(hex);
				const lightness = hsl.l;
				const saturation = hsl.s;
				// Categorize colors
				if (lightness > 97) {
					// Exclude - don't use
					continue;
				} else if (lightness >= 88 && lightness <= 97) {
					window.backgroundColors.push(hex);
				} else if (lightness >= 34 && lightness <= 87 && saturation > 20) {
					window.accentColors.push(hex);
				} else if (lightness >= 0 && lightness < 34) {
					window.darkBackgroundColors.push(hex);
				}

				window.allColors.push(hex);
			}
		}
	}

	hexToHsl(hex) {
		const hexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		const rgb = {
			r: parseInt(hexResult[1], 16),
			g: parseInt(hexResult[2], 16),
			b: parseInt(hexResult[3], 16),
		};
		const r = rgb.r / 255;
		const g = rgb.g / 255;
		const b = rgb.b / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h,
			s,
			l = (max + min) / 2;
		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
					break;
				case g:
					h = ((b - r) / d + 2) / 6;
					break;
				case b:
					h = ((r - g) / d + 4) / 6;
					break;
			}
		}

		return {
			h: Math.floor(h * 360),
			s: Math.floor(s * 100),
			l: Math.floor(l * 100),
		};
	}

	// #endregion

	// #region generate 2
	generatePalettes() {
		let palettes = [];

		for (let i = 0; i < window.accentColors.length; i++) {
			const accentColor = window.accentColors[i];
			const newPalettes = this.generateSinglePalette(accentColor);
			palettes = palettes.concat(newPalettes);
		}

		return palettes;
	}
	generateSinglePalette(accentColor) {
		const accentHsl = this.hexToHsl(accentColor);
		const basePalettes = {
			light: {
				bgColor: this.hslToHex(accentHsl.h, accentHsl.s, 97),
				buttonColor: accentColor,
				textColor: this.hslToHex(accentHsl.h, accentHsl.s, 18),

				secondBgColor: '#FFFFFF',
				secondButtonColor: accentColor,
				secondTextColor: this.hslToHex(accentHsl.h, accentHsl.s, 18),
			},
			dark: {
				bgColor: '#292929',
				buttonColor: accentColor,
				textColor: '#FFFFFF',

				secondBgColor: this.hslToHex(accentHsl.h, accentHsl.s, 97),
				secondButtonColor: accentColor,
				secondTextColor: '#292929',
			},
			bright: {
				bgColor: accentColor,
				buttonColor: this.getContrastRatio(accentColor, '#ffffff') > this.getContrastRatio(accentColor, '#000000') ? '#FFFFFF' : '#000000',
				textColor: this.getContrastRatio(accentColor, '#ffffff') > this.getContrastRatio(accentColor, '#000000') ? '#FFFFFF' : '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: accentColor,
				secondTextColor: '#000000',
			},
		}

		const secondAccentColors = window.accentColors.filter(color => {
			const colorHsl = this.hexToHsl(color);
			const hueRange = [(accentHsl.h + 165) % 360, (accentHsl.h + 195) % 360];
			return colorHsl.h >= hueRange[0] && colorHsl.h <= hueRange[1];
		});
		let secondAccentColor = null;
		let secondPalettes = null;

		if (secondAccentColors.length === 0) {
			return [basePalettes.light, basePalettes.dark,  basePalettes.bright];
		} else {
			secondAccentColor = secondAccentColors[Math.floor(Math.random() * secondAccentColors.length)];
			secondPalettes = {
				light: {
					bgColor: this.hslToHex(accentHsl.h, accentHsl.s, 97),
					buttonColor: secondAccentColor,
					textColor: '#000000',

					secondBgColor: '#FFFFFF',
					secondButtonColor: secondAccentColor,
					secondTextColor: '#000000',
				},
				dark: {
					bgColor: '#292929',
					buttonColor: secondAccentColor,
					textColor: '#FFFFFF',

					secondBgColor: this.hslToHex(secondAccentColor.h, secondAccentColor.s, 5),
					secondButtonColor: accentColor,
					secondTextColor: '#000000',
				},
				bright: {
					bgColor: accentColor,
					buttonColor: secondAccentColor,
					textColor: this.getContrastRatio(secondAccentColor, '#ffffff') > this.getContrastRatio(secondAccentColor, '#000000') ? '#FFFFFF' : '#000000',

					secondBgColor: '#FFFFFF',
					secondButtonColor: secondAccentColor,
					secondTextColor: '#000000',
				},
				bright2: {
					bgColor: this.hslToHex(accentHsl.h, accentHsl.s, 10),
					buttonColor: secondAccentColor,
					textColor: '#FFFFFF',

					secondBgColor: this.hslToHex(accentHsl.h, accentHsl.s, 15),
					secondButtonColor: secondAccentColor,
					secondTextColor: '#FFFFFF',
				},
			};
		}
		return [basePalettes.light, basePalettes.dark,  basePalettes.bright, secondPalettes.light, secondPalettes.dark, secondPalettes.bright, secondPalettes.bright2];
	}
	// #endregion

	getLuminance(rgb) {
		const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
			val = val / 255;
			return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	getContrastRatio(color1, color2) {
		const lum2 = this.getLuminance(this.hexToRgb(color2));
		const lum1 = this.getLuminance(this.hexToRgb(color1));
		const lighter = Math.max(lum1, lum2);
		const darker = Math.min(lum1, lum2);
		return (lighter + 0.05) / (darker + 0.05);
	}

	meetsWCAG(color1, color2) {
		return this.getContrastRatio(color1, color2) >= 4.5;
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: null;
	}

	hslToHex(h, s, l) {
		// h: 0..360, s/l: 0..100
		s = s / 100;
		l = l / 100;

		let c = (1 - Math.abs(2 * l - 1)) * s;
		let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		let m = l - c / 2;
		let r1, g1, b1;

		if (h >= 0 && h < 60) {
			r1 = c;
			g1 = x;
			b1 = 0;
		} else if (h >= 60 && h < 120) {
			r1 = x;
			g1 = c;
			b1 = 0;
		} else if (h >= 120 && h < 180) {
			r1 = 0;
			g1 = c;
			b1 = x;
		} else if (h >= 180 && h < 240) {
			r1 = 0;
			g1 = x;
			b1 = c;
		} else if (h >= 240 && h < 300) {
			r1 = x;
			g1 = 0;
			b1 = c;
		} else {
			r1 = c;
			g1 = 0;
			b1 = x;
		}

		let r = Math.round((r1 + m) * 255);
		let g = Math.round((g1 + m) * 255);
		let b = Math.round((b1 + m) * 255);

		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
	}

	getBrightness(color) {
		const rgb = this.hexToRgb(color);
		return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	}

	// #region harmony methods
	findAnalogousColors(accentColor) {
		const accentHsl = this.hexToHsl(accentColor);
		const analogousColors = [];
		for (let i = 0; i < this.allColors.length; i++) {
			const color = this.allColors[i];
			const hsl = this.hexToHsl(color);
			const hueDiff = Math.abs(hsl.h - accentHsl.h);
			const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
			if (normalizedDiff <= 40) {
				analogousColors.push(color);
			}
		}
		return analogousColors;
	}

	findComplementaryColors(accentColor) {
		const accentHsl = this.hexToHsl(accentColor);
		const complementaryColors = [];
		for (let i = 0; i < this.allColors.length; i++) {
			const color = this.allColors[i];
			const hsl = this.hexToHsl(color);
			const hueRange = [(accentHsl.h + 165) % 360, (accentHsl.h + 195) % 360];
			if (hsl.h >= hueRange[0] && hsl.h <= hueRange[1]) {
				complementaryColors.push(color);
			}
		}
		return complementaryColors;
	}

	findMonochromaticColors(accentColor) {
		const accentHsl = this.hexToHsl(accentColor);
		const monochromaticColors = [];
		for (const color of this.allColors) {
			const hsl = this.hexToHsl(color);
			const hDiff = Math.abs(hsl.h - accentHsl.h);
			const sDiff = Math.abs(hsl.s - accentHsl.s);
			const lDiff = Math.abs(hsl.l - accentHsl.l);
			const normalizedDiffH = Math.min(hDiff, 360 - hDiff);
			const normalizedDiffS = Math.min(sDiff, 100 - sDiff);
			const normalizedDiffL = Math.min(lDiff, 100 - lDiff);

			const totalColorDiff = normalizedDiffH + normalizedDiffL + normalizedDiffS;

			// Same hue (within 10 degrees), different saturation/brightness
			if (normalizedDiffH <= 10 && normalizedDiffS < 50 && normalizedDiffL < 50 && totalColorDiff > 25) {
				monochromaticColors.push(color);
			}
		}
		return monochromaticColors;
	}
	// #endregion
}
