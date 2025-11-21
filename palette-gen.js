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
		window.colorName = {};
		for (const category in colors) {
			const hexArray = colors[category].hex;
			for (let i = 0; i < hexArray.length; i++) {
				const hex = hexArray[i];
				const hsl = window.h.hexToHsl(hex);
				const lightness = hsl.l;
				const saturation = hsl.s;
				// Categorize colors
				if (lightness > 97) {
					// Exclude - don't use
					continue;
				} else if (lightness >= 88 && lightness <= 97) {
					window.backgroundColors.push(hex);
					window.colorName[hex] = colors[category].name;
				} else if (lightness >= 34 && lightness <= 87 && saturation > 30) {
					if (category.includes('grayshades')) continue;
					window.accentColors.push(hex);
					window.colorName[hex] = colors[category].name;
				} else if (lightness >= 0 && lightness < 34) {
					window.darkBackgroundColors.push(hex);
					window.colorName[hex] = colors[category].name;
				}

				window.allColors.push(hex);
			}
		}
	}

	// #endregion

	// #region generate 2
	generatePalettes(constants = {}) {
		let palettes = [];

		// Default values
		const defaultConstants = {
			LIGHT_BG_LIGHTNESS: 97,
			ANALOGOUS_HUE_RANGE: 30,
			ACCENT_AND_BACKGROUND_CONTRAST_RATIO: 1.4,
			DEFAULT_DARK_BG_COLOR: '#292929',
		};

		const mergedConstants = {...defaultConstants, ...constants};

		for (let i = 0; i < window.accentColors.length; i++) {
			const accentColor = window.accentColors[i];
			const newPalettes = this.generatePalettesWithAlgorithm_v2(accentColor, mergedConstants);
			palettes = palettes.concat(newPalettes);
		}

		return palettes;
	}

	generatePalettesWithAlgorithm_v2(accentColor, constants = {}) {
		const LIGHT_BG_LIGHTNESS = constants.LIGHT_BG_LIGHTNESS ?? 97;
		const ANALOGOUS_HUE_RANGE = constants.ANALOGOUS_HUE_RANGE ?? 30;
		const ACCENT_AND_BACKGROUND_CONTRAST_RATIO = constants.ACCENT_AND_BACKGROUND_CONTRAST_RATIO ?? 1.4;
		const DEFAULT_DARK_BG_COLOR = constants.DEFAULT_DARK_BG_COLOR ?? '#292929';

		const accentHsl = window.h.hexToHsl(accentColor);

		// Create base palettes
		const lightBgColor = window.h.hslToHex(accentHsl.h, accentHsl.s, LIGHT_BG_LIGHTNESS);
		const darkBgColor = DEFAULT_DARK_BG_COLOR;
		const accentColorName = window.colorName[accentColor];

		// new colors
		const complementaryAccentColors = window.accentColors.filter(color => {
			const colorHsl = window.h.hexToHsl(color);
			const hueRange = [
				(accentHsl.h + 180 - ANALOGOUS_HUE_RANGE) % 360,
				(accentHsl.h + 180 + ANALOGOUS_HUE_RANGE) % 360,
			];
			let colorInRange = false;
			if (hueRange[0] < hueRange[1]) {
				colorInRange = colorHsl.h >= hueRange[0] && colorHsl.h <= hueRange[1];
			} else {
				colorInRange = colorHsl.h >= hueRange[0] || colorHsl.h <= hueRange[1];
			}
			return colorInRange && window.h.getContrastRatio(color, '#FFFFFF') > ACCENT_AND_BACKGROUND_CONTRAST_RATIO;
		});
		const secondAccentColor =
			complementaryAccentColors[Math.floor(Math.random() * complementaryAccentColors.length)];
		const secondAccentColorHsl = window.h.hexToHsl(secondAccentColor);

		let analogousBackAccentColors = window.accentColors.filter(color => {
			const colorHsl = window.h.hexToHsl(color);
			return (
				accentHsl.h - colorHsl.h > ANALOGOUS_HUE_RANGE &&
				accentHsl.h - colorHsl.h < ANALOGOUS_HUE_RANGE * 2 &&
				window.h.getContrastRatio(accentColor, color) > ACCENT_AND_BACKGROUND_CONTRAST_RATIO
			);
		});
		const analogousBackSecondAccentColor =
			analogousBackAccentColors[Math.floor(Math.random() * analogousBackAccentColors.length)];
		const analogousBackSecondAccentColorHsl = window.h.hexToHsl(analogousBackSecondAccentColor);
		let analogousForwardAccentColors = window.accentColors.filter(color => {
			const colorHsl = window.h.hexToHsl(color);
			return (
				colorHsl.h - accentHsl.h > ANALOGOUS_HUE_RANGE &&
				colorHsl.h - accentHsl.h < ANALOGOUS_HUE_RANGE * 2 &&
				window.h.getContrastRatio(accentColor, color) > ACCENT_AND_BACKGROUND_CONTRAST_RATIO
			);
		});
		const analogousForwardSecondAccentColor =
			analogousForwardAccentColors[Math.floor(Math.random() * analogousForwardAccentColors.length)];
		const analogousForwardSecondAccentColorHsl = window.h.hexToHsl(analogousForwardSecondAccentColor);

		const basePalettes = {
			light: {
				bgColor: lightBgColor,
				buttonColor: accentColor,
				textColor: '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: accentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			},
			dark: {
				bgColor: darkBgColor,
				buttonColor: accentColor,
				textColor: '#FFFFFF',

				secondBgColor: window.h.hslToHex(accentHsl.h, accentHsl.s, LIGHT_BG_LIGHTNESS),
				secondButtonColor: accentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			},
			bright: {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: accentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			},
			text: {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: secondAccentColor,

				secondBgColor: '#FFFFFF',
				secondButtonColor: secondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			},
		};

		if (secondAccentColorHsl) {
			basePalettes['light_2'] = {
				bgColor: lightBgColor,
				buttonColor: accentColor,
				textColor: '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: secondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
			basePalettes['dark_2'] = {
				bgColor: darkBgColor,
				buttonColor: accentColor,
				textColor: '#FFFFFF',

				secondBgColor: window.h.hslToHex(secondAccentColorHsl.h, secondAccentColorHsl.s, LIGHT_BG_LIGHTNESS),
				secondButtonColor: secondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['bright_2'] = {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				secondBgColor: secondAccentColor,
				secondButtonColor:
					window.h.getContrastRatio(secondAccentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				secondTextColor: window.h.getContrastRatio(secondAccentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['text_2'] = {
				bgColor: lightBgColor,
				buttonColor: accentColor,
				textColor: '#000000',

				secondBgColor: window.h.hslToHex(secondAccentColorHsl.h, secondAccentColorHsl.s, LIGHT_BG_LIGHTNESS),
				secondButtonColor: '#000000',
				secondTextColor: window.h.hslToHex(secondAccentColorHsl.h, secondAccentColorHsl.s, 40),

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
		}

		if (analogousBackSecondAccentColor) {
			basePalettes['light_3'] = {
				bgColor: lightBgColor,
				buttonColor: accentColor,
				textColor: '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: analogousBackSecondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
			basePalettes['dark_3'] = {
				bgColor: darkBgColor,
				buttonColor: accentColor,
				textColor: '#FFFFFF',

				secondBgColor: window.h.hslToHex(
					analogousBackSecondAccentColorHsl.h,
					analogousBackSecondAccentColorHsl.s,
					LIGHT_BG_LIGHTNESS
				),
				secondButtonColor: analogousBackSecondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['bright_3'] = {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				secondBgColor: analogousBackSecondAccentColor,
				secondButtonColor:
					window.h.getContrastRatio(analogousBackSecondAccentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				secondTextColor:
					window.h.getContrastRatio(analogousBackSecondAccentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['text_3'] = {
				bgColor: darkBgColor,
				buttonColor: accentColor,
				textColor: window.h.hslToHex(
					analogousBackSecondAccentColorHsl.h,
					analogousBackSecondAccentColorHsl.s,
					LIGHT_BG_LIGHTNESS - 12
				),

				secondBgColor: '#FFFFFF',
				secondButtonColor: accentColor,
				secondTextColor: window.h.hslToHex(
					analogousBackSecondAccentColorHsl.h,
					analogousBackSecondAccentColorHsl.s,
					20
				),

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
		}
		if (analogousForwardSecondAccentColor) {
			basePalettes['light_4'] = {
				bgColor: lightBgColor,
				buttonColor: accentColor,
				textColor: '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: analogousForwardSecondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
			basePalettes['dark_4'] = {
				bgColor: darkBgColor,
				buttonColor: accentColor,
				textColor: '#FFFFFF',

				secondBgColor: window.h.hslToHex(
					analogousForwardSecondAccentColorHsl.h,
					analogousForwardSecondAccentColorHsl.s,
					LIGHT_BG_LIGHTNESS
				),
				secondButtonColor: analogousForwardSecondAccentColor,
				secondTextColor: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['bright_4'] = {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				secondBgColor: analogousForwardSecondAccentColor,
				secondButtonColor:
					window.h.getContrastRatio(analogousForwardSecondAccentColor, '#ffffff') > 2.5
						? '#FFFFFF'
						: '#000000',
				secondTextColor:
					window.h.getContrastRatio(analogousForwardSecondAccentColor, '#ffffff') > 2.5
						? '#FFFFFF'
						: '#000000',

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};

			basePalettes['text_4'] = {
				bgColor: accentColor,
				buttonColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',
				textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 2.5 ? '#FFFFFF' : '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: analogousForwardSecondAccentColor,
				secondTextColor: analogousForwardSecondAccentColor,

				colorName: accentColorName,
				accent: accentColor,
				isGoodPalette: true,
			};
		}

		return Object.keys(basePalettes).map(key => basePalettes[key]);
	}

	generatePalettesWithAlgorithm(accentColor) {
		const accentHsl = window.h.hexToHsl(accentColor);

		// Create base palettes
		const lightBgColor = window.h.hslToHex(accentHsl.h, accentHsl.s, 97);
		const darkBgColor = '#292929';

		// Adjust accent color for contrast with backgrounds
		const adjustedAccentForLight = this.adjustColorForContrast(accentColor, lightBgColor);
		const adjustedAccentForDark = this.adjustColorForContrast(accentColor, darkBgColor);
		const adjustedAccentForWhite = this.adjustColorForContrast(accentColor, '#FFFFFF');

		const basePalettes = {
			light: {
				bgColor: lightBgColor,
				buttonColor: adjustedAccentForLight,
				textColor: window.h.hslToHex(accentHsl.h, accentHsl.s, 18),

				secondBgColor: '#FFFFFF',
				secondButtonColor: adjustedAccentForWhite,
				secondTextColor: window.h.hslToHex(accentHsl.h, accentHsl.s, 18),
			},
			dark: {
				bgColor: darkBgColor,
				buttonColor: adjustedAccentForDark,
				textColor: '#FFFFFF',

				secondBgColor: window.h.hslToHex(accentHsl.h, accentHsl.s, 97),
				secondButtonColor: adjustedAccentForLight,
				secondTextColor: '#292929',
			},
			bright: {
				bgColor: accentColor,
				buttonColor:
					window.h.getContrastRatio(accentColor, '#ffffff') >
					window.h.getContrastRatio(accentColor, '#000000')
						? '#FFFFFF'
						: '#000000',
				textColor:
					window.h.getContrastRatio(accentColor, '#ffffff') >
					window.h.getContrastRatio(accentColor, '#000000')
						? '#FFFFFF'
						: '#000000',

				secondBgColor: '#FFFFFF',
				secondButtonColor: adjustedAccentForWhite,
				secondTextColor: '#000000',
			},
		};

		const secondAccentColors = window.accentColors.filter(color => {
			const colorHsl = window.h.hexToHsl(color);
			const hueRange = [(accentHsl.h + 165) % 360, (accentHsl.h + 195) % 360];
			return colorHsl.h >= hueRange[0] && colorHsl.h <= hueRange[1];
		});
		let secondAccentColor = null;
		let secondPalettes = null;

		if (secondAccentColors.length === 0) {
			return [basePalettes.light, basePalettes.dark, basePalettes.bright];
		} else {
			secondAccentColor = secondAccentColors[Math.floor(Math.random() * secondAccentColors.length)];
			const secondAccentHsl = window.h.hexToHsl(secondAccentColor);

			// Adjust second accent color for contrast with backgrounds
			const adjustedSecondAccentForLight = this.adjustColorForContrast(secondAccentColor, lightBgColor);
			const adjustedSecondAccentForDark = this.adjustColorForContrast(secondAccentColor, darkBgColor);
			const adjustedSecondAccentForWhite = this.adjustColorForContrast(secondAccentColor, '#FFFFFF');
			const adjustedSecondAccentForBright = this.adjustColorForContrast(secondAccentColor, accentColor);

			const bright2BgColor = window.h.hslToHex(accentHsl.h, accentHsl.s, 10);
			const bright2SecondBgColor = window.h.hslToHex(accentHsl.h, accentHsl.s, 15);
			const adjustedSecondAccentForBright2 = this.adjustColorForContrast(secondAccentColor, bright2BgColor);
			const adjustedSecondAccentForBright2Second = this.adjustColorForContrast(
				secondAccentColor,
				bright2SecondBgColor
			);

			const darkSecondBgColor = window.h.hslToHex(secondAccentHsl.h, secondAccentHsl.s, 97);
			const adjustedAccentForDarkSecond = this.adjustColorForContrast(accentColor, darkSecondBgColor);

			secondPalettes = {
				light: {
					bgColor: lightBgColor,
					buttonColor: adjustedSecondAccentForLight,
					textColor: '#000000',

					secondBgColor: '#FFFFFF',
					secondButtonColor: adjustedSecondAccentForWhite,
					secondTextColor: '#000000',
				},
				dark: {
					bgColor: darkBgColor,
					buttonColor: adjustedSecondAccentForDark,
					textColor: '#FFFFFF',

					secondBgColor: darkSecondBgColor,
					secondButtonColor: adjustedAccentForDarkSecond,
					secondTextColor: '#292929',
				},
				bright: {
					bgColor: accentColor,
					buttonColor: adjustedSecondAccentForBright,
					textColor: window.h.getContrastRatio(accentColor, '#ffffff') > 4 ? '#FFFFFF' : '#000000',

					secondBgColor: '#FFFFFF',
					secondButtonColor: adjustedSecondAccentForWhite,
					secondTextColor: '#000000',
				},
				bright2: {
					bgColor: bright2BgColor,
					buttonColor: adjustedSecondAccentForBright2,
					textColor: '#FFFFFF',

					secondBgColor: bright2SecondBgColor,
					secondButtonColor: adjustedSecondAccentForBright2Second,
					secondTextColor: '#FFFFFF',
				},
			};
		}
		return [
			basePalettes.light,
			basePalettes.dark,
			basePalettes.bright,
			secondPalettes.light,
			secondPalettes.dark,
			secondPalettes.bright,
			secondPalettes.bright2,
		];
	}
	// #endregion

	// #region random generation
	/**
	 * Generates random palettes using colors from categorized arrays
	 * @param {number} count - Number of palettes to generate (default: 10)
	 * @returns {Array} Array of palette objects
	 */
	generateRandomPalettes(count = 100) {
		const palettes = [];
		const harmonyRatio = 0.3; // 30% harmonious, 70% random
		let tries = 0;
		while (palettes.length < count) {
			const useHarmony = Math.random() < harmonyRatio;
			const palette = this.generateRandomPalette(useHarmony);
			if (palette) {
				palettes.push(palette);
			}
			tries++;
		}

		console.log(`Generated ${palettes.length} palettes in ${tries} tries`);

		return palettes;
	}

	/**
	 * Determines palette type based on color HSL values
	 * @param {string} color - Hex color string
	 * @returns {string} 'light', 'dark', or 'bright'
	 */
	determinePaletteType(color) {
		const hsl = window.h.hexToHsl(color);
		const lightness = hsl.l;
		const saturation = hsl.s;

		// Bright: high saturation and medium-high lightness (vibrant colors)
		if (saturation > 40 && lightness >= 40 && lightness <= 80) {
			return 'bright';
		}
		// Dark: low lightness
		if (lightness < 40) {
			return 'dark';
		}
		// Light: default for lighter colors
		return 'light';
	}

	/**
	 * Generates a single random palette with contrast validation
	 * @param {boolean} useHarmony - Whether to use harmonious color combinations
	 * @returns {Object|null} Palette object or null if generation fails
	 */
	generateRandomPalette(useHarmony = false) {
		// Check if we have enough colors
		if (window.accentColors.length === 0) {
			return null;
		}

		// Select primary accent color
		let primaryAccent = window.accentColors[Math.floor(Math.random() * window.accentColors.length)];

		// Optionally use harmony to find related colors
		if (useHarmony) {
			const harmoniousColors = [
				...this.findComplementaryColors(primaryAccent),
				...this.findAnalogousColors(primaryAccent),
				...this.findMonochromaticColors(primaryAccent),
			].filter(color => window.accentColors.includes(color));

			if (harmoniousColors.length > 0) {
				primaryAccent = harmoniousColors[Math.floor(Math.random() * harmoniousColors.length)];
			}
		}

		const suggestedType = this.determinePaletteType(primaryAccent);
		const primaryHsl = window.h.hexToHsl(primaryAccent);

		// Weighted random selection to increase dark palette generation
		// Dark: 40%, Light: 35%, Bright: 25%
		const random = Math.random();
		let paletteType = suggestedType;

		if (random < 0.4) {
			// 40% chance for dark palette
			paletteType = 'dark';
		} else if (random < 0.75) {
			// 35% chance for light palette
			paletteType = 'light';
		} else {
			// 25% chance for bright palette
			paletteType = 'bright';
		}

		let palette = null;

		switch (paletteType) {
			case 'light':
				palette = this.generateLightPalette(primaryAccent, primaryHsl, useHarmony);
				break;
			case 'dark':
				palette = this.generateDarkPalette(primaryAccent, primaryHsl, useHarmony);
				break;
			case 'bright':
				palette = this.generateBrightPalette(primaryAccent, primaryHsl, useHarmony);
				break;
		}

		// Validate contrast and return if valid
		if (palette && this.validatePaletteContrast(palette)) {
			return palette;
		}

		// If validation failed, try generating a simpler fallback palette
		return this.generateFallbackPalette(primaryAccent, primaryHsl);
	}

	/**
	 * Generates a light palette
	 */
	generateLightPalette(accentColor, accentHsl, useHarmony) {
		// Select background color from backgroundColors array
		let bgColor = '#FFFFFF';
		if (window.backgroundColors.length > 0) {
			bgColor = window.backgroundColors[Math.floor(Math.random() * window.backgroundColors.length)];
		}

		// Generate text color with good contrast
		const textColor = this.findContrastingColor(bgColor, [
			'#000000',
			'#292929',
			window.h.hslToHex(accentHsl.h, accentHsl.s, 18),
		]);

		// Select second accent
		let secondAccent = accentColor;
		if (window.accentColors.length > 1) {
			if (useHarmony) {
				const complementary = this.findComplementaryColors(accentColor).filter(c =>
					window.accentColors.includes(c)
				);
				if (complementary.length > 0) {
					secondAccent = complementary[Math.floor(Math.random() * complementary.length)];
				} else {
					// Fallback to random if no complementary colors found
					const availableAccents = window.accentColors.filter(c => c !== accentColor);
					secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
				}
			} else {
				// Random selection
				const availableAccents = window.accentColors.filter(c => c !== accentColor);
				secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
			}
		}

		// Second background
		let secondBgColor = '#FFFFFF';
		if (window.backgroundColors.length > 0) {
			const availableBgs = window.backgroundColors.filter(c => c !== bgColor);
			if (availableBgs.length > 0) {
				secondBgColor = availableBgs[Math.floor(Math.random() * availableBgs.length)];
			}
		}

		const secondTextColor = this.findContrastingColor(secondBgColor, [
			'#000000',
			'#292929',
			window.h.hslToHex(accentHsl.h, accentHsl.s, 18),
		]);

		return {
			bgColor,
			buttonColor: accentColor,
			textColor,
			secondBgColor,
			secondButtonColor: secondAccent,
			secondTextColor,
		};
	}

	/**
	 * Generates a dark palette
	 */
	generateDarkPalette(accentColor, accentHsl, useHarmony) {
		// Select dark background
		let bgColor = '#292929';
		if (window.darkBackgroundColors.length > 0) {
			bgColor = window.darkBackgroundColors[Math.floor(Math.random() * window.darkBackgroundColors.length)];
		}

		const textColor = '#FFFFFF';

		// Select second accent
		let secondAccent = accentColor;
		if (window.accentColors.length > 1) {
			if (useHarmony) {
				const analogous = this.findAnalogousColors(accentColor).filter(c => window.accentColors.includes(c));
				if (analogous.length > 0) {
					secondAccent = analogous[Math.floor(Math.random() * analogous.length)];
				} else {
					// Fallback to random if no analogous colors found
					const availableAccents = window.accentColors.filter(c => c !== accentColor);
					secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
				}
			} else {
				// Random selection
				const availableAccents = window.accentColors.filter(c => c !== accentColor);
				secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
			}
		}

		// Second background - use dark background
		let secondBgColor = '#292929';
		if (window.darkBackgroundColors.length > 0) {
			const availableDarkBgs = window.darkBackgroundColors.filter(c => c !== bgColor);
			if (availableDarkBgs.length > 0) {
				secondBgColor = availableDarkBgs[Math.floor(Math.random() * availableDarkBgs.length)];
			}
		}

		const secondTextColor = '#FFFFFF';

		return {
			bgColor,
			buttonColor: accentColor,
			textColor,
			secondBgColor,
			secondButtonColor: secondAccent,
			secondTextColor,
		};
	}

	/**
	 * Generates a bright palette
	 */
	generateBrightPalette(accentColor, accentHsl, useHarmony) {
		// Use accent color as background
		const bgColor = accentColor;

		// Find best contrasting text/button color
		const whiteContrast = window.h.getContrastRatio(accentColor, '#FFFFFF');
		const blackContrast = window.h.getContrastRatio(accentColor, '#000000');
		const contrastColor = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';

		const textColor = contrastColor;
		const buttonColor = contrastColor;

		// Select second accent
		let secondAccent = accentColor;
		if (window.accentColors.length > 1) {
			if (useHarmony) {
				const complementary = this.findComplementaryColors(accentColor).filter(c =>
					window.accentColors.includes(c)
				);
				if (complementary.length > 0) {
					secondAccent = complementary[Math.floor(Math.random() * complementary.length)];
				} else {
					// Fallback to random if no complementary colors found
					const availableAccents = window.accentColors.filter(c => c !== accentColor);
					secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
				}
			} else {
				// Random selection
				const availableAccents = window.accentColors.filter(c => c !== accentColor);
				secondAccent = availableAccents[Math.floor(Math.random() * availableAccents.length)];
			}
		}

		// Second background - use light background
		let secondBgColor = '#FFFFFF';
		if (window.backgroundColors.length > 0) {
			secondBgColor = window.backgroundColors[Math.floor(Math.random() * window.backgroundColors.length)];
		}

		const secondTextColor = this.findContrastingColor(secondBgColor, ['#000000', '#292929']);

		return {
			bgColor,
			buttonColor,
			textColor,
			secondBgColor,
			secondButtonColor: secondAccent,
			secondTextColor,
		};
	}

	/**
	 * Finds a color with good contrast from a list of candidates
	 */
	findContrastingColor(backgroundColor, candidates) {
		let bestColor = candidates[0];
		let bestContrast = 0;

		for (const candidate of candidates) {
			const contrast = window.h.getContrastRatio(backgroundColor, candidate);
			if (contrast > bestContrast) {
				bestContrast = contrast;
				bestColor = candidate;
			}
		}

		// If best contrast doesn't meet WCAG, try white/black
		if (bestContrast < 4.5) {
			const whiteContrast = window.h.getContrastRatio(backgroundColor, '#FFFFFF');
			const blackContrast = window.h.getContrastRatio(backgroundColor, '#000000');
			return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
		}

		return bestColor;
	}

	/**
	 * Adjusts HSL parameters of a color to improve contrast with a background
	 * @param {string} color - Hex color to adjust
	 * @param {string} backgroundColor - Background color to contrast against
	 * @param {number} minContrast - Minimum contrast ratio required (default: 3)
	 * @returns {string} Adjusted hex color
	 */
	adjustColorForContrast(color, backgroundColor, minContrast = 3) {
		const currentContrast = window.h.getContrastRatio(color, backgroundColor);

		// If contrast is already sufficient, return original color
		if (currentContrast >= minContrast) {
			return color;
		}

		const colorHsl = window.h.hexToHsl(color);
		const bgHsl = window.h.hexToHsl(backgroundColor);
		const bgLuminance = window.h.getLuminance(window.h.hexToRgb(backgroundColor));

		// Determine if background is light or dark
		const isLightBackground = bgLuminance > 0.5;

		let adjustedHsl = {...colorHsl};
		const maxIterations = 20;
		let iterations = 0;

		console.log('change color', JSON.stringify(adjustedHsl));

		// Adjust lightness to improve contrast
		while (iterations < maxIterations) {
			const testColor = window.h.hslToHex(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
			const testContrast = window.h.getContrastRatio(testColor, backgroundColor);

			if (testContrast >= minContrast) {
				return testColor;
			}

			// For light backgrounds, make color darker (decrease lightness)
			// For dark backgrounds, make color lighter (increase lightness)
			if (isLightBackground) {
				adjustedHsl.l = Math.max(0, adjustedHsl.l - 5);
			} else {
				adjustedHsl.l = Math.min(100, adjustedHsl.l + 5);
			}

			// If we've gone too far, try adjusting saturation instead
			if ((isLightBackground && adjustedHsl.l < 20) || (!isLightBackground && adjustedHsl.l > 80)) {
				// Increase saturation to maintain color vibrancy while adjusting lightness
				adjustedHsl.s = Math.min(100, adjustedHsl.s + 5);
				// Reset lightness to a more moderate value
				adjustedHsl.l = isLightBackground ? 30 : 70;
			}

			iterations++;
		}

		console.log('klkl change color', JSON.stringify(adjustedHsl));

		// If we couldn't achieve good contrast, return a high-contrast version
		// For light backgrounds, return a very dark version
		// For dark backgrounds, return a very light version
		if (isLightBackground) {
			return window.h.hslToHex(adjustedHsl.h, Math.min(100, adjustedHsl.s + 10), 20);
		} else {
			return window.h.hslToHex(adjustedHsl.h, Math.min(100, adjustedHsl.s + 10), 80);
		}
	}

	/**
	 * Validates that all color combinations in a palette meet WCAG AA (4.5:1)
	 */
	validatePaletteContrast(palette) {
		// Check primary palette
		if (!window.h.meetsWCAG(palette.bgColor, palette.textColor)) {
			return false;
		}
		if (!window.h.meetsWCAG(palette.bgColor, palette.buttonColor)) {
			return false;
		}

		// Check secondary palette
		if (!window.h.meetsWCAG(palette.secondBgColor, palette.secondTextColor)) {
			return false;
		}
		if (!window.h.meetsWCAG(palette.secondBgColor, palette.secondButtonColor)) {
			return false;
		}

		// Check that both background colors have at least 1.0 contrast ratio
		const bgContrast = window.h.getContrastRatio(palette.bgColor, palette.secondBgColor);
		if (bgContrast < 1.2) {
			return false;
		}

		return true;
	}

	/**
	 * Generates a simple fallback palette if main generation fails
	 */
	generateFallbackPalette(accentColor, accentHsl) {
		const bgColor =
			window.backgroundColors.length > 0
				? window.backgroundColors[Math.floor(Math.random() * window.backgroundColors.length)]
				: '#FFFFFF';

		const textColor = this.findContrastingColor(bgColor, ['#000000', '#292929']);

		const secondBgColor =
			window.backgroundColors.length > 0 && window.backgroundColors.length > 1
				? window.backgroundColors.filter(c => c !== bgColor)[
						Math.floor(Math.random() * (window.backgroundColors.length - 1))
				  ]
				: '#FFFFFF';

		const secondTextColor = this.findContrastingColor(secondBgColor, ['#000000', '#292929']);

		const palette = {
			bgColor,
			buttonColor: accentColor,
			textColor,
			secondBgColor,
			secondButtonColor: accentColor,
			secondTextColor,
		};

		// If still doesn't meet contrast, return null
		if (!this.validatePaletteContrast(palette)) {
			return null;
		}

		return palette;
	}
	// #endregion

	// #region harmony methods
	findAnalogousColors(accentColor) {
		const accentHsl = window.h.hexToHsl(accentColor);
		const analogousColors = [];
		for (let i = 0; i < window.allColors.length; i++) {
			const color = window.allColors[i];
			const hsl = window.h.hexToHsl(color);
			const hueDiff = Math.abs(hsl.h - accentHsl.h);
			const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
			if (normalizedDiff <= 40) {
				analogousColors.push(color);
			}
		}
		return analogousColors;
	}

	findComplementaryColors(accentColor) {
		const accentHsl = window.h.hexToHsl(accentColor);
		const complementaryColors = [];
		for (let i = 0; i < window.allColors.length; i++) {
			const color = window.allColors[i];
			const hsl = window.h.hexToHsl(color);
			const targetHue = (accentHsl.h + 180) % 360;
			const hueDiff = Math.abs(hsl.h - targetHue);
			const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
			// Colors within 15 degrees of complementary (180 degrees away)
			if (normalizedDiff <= 15) {
				complementaryColors.push(color);
			}
		}
		return complementaryColors;
	}

	findMonochromaticColors(accentColor) {
		const accentHsl = window.h.hexToHsl(accentColor);
		const monochromaticColors = [];
		for (const color of window.allColors) {
			const hsl = window.h.hexToHsl(color);
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
