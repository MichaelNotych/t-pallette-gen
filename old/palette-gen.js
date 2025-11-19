export default class PaletteGenerator {
	constructor(data) {
		this.accents = data.accentColors;
	}

	generate() {
		return this.accents.map(accent => {
			const monochromaticPalette = this.getMonochromaticPalette(accent);
			const analogousPalettes = this.getAnalogousPalettes(accent);
			const complementaryPalettes = this.getComplementaryPalettes(accent);
			return [monochromaticPalette, ...analogousPalettes, ...complementaryPalettes];
		})
	}

	getMonochromaticPalette(accentColor) {
		const accentHsl = this.hexToHslString(accentColor);
		const bgColor = this.hslToHex(accentHsl.h, accentHsl.s, 95)
		const palette = {
			buttonColor: accentColor,
			bgColor: bgColor,
			textColor: this.getContrastRatio(bgColor, '#000000') > 4 ? '#000000' : '#FFFFFF',
			secondButtonColor: bgColor,
			secondBgColor: accentColor,
			secondTextColor: this.getContrastRatio(accentColor, '#000000') > 4 ? '#000000' : '#FFFFFF',
			method: 'Monochromatic',
		}

		return palette;
	}

	getAnalogousPalettes(accentColor) {
		const accentHsl = this.hexToHslString(accentColor);
		const secondAccentHsl1 = this.hslToHex((accentHsl.h - 40) % 360, accentHsl.s, accentHsl.l)
		const bgColor1 = this.hslToHex(accentHsl.h, 60, 92)
		const bgColor2 = this.hslToHex(accentHsl.h, 60, 33)
		const secondBgColor1 = this.hslToHex((accentHsl.h - 40) % 360, accentHsl.s, 92)
		console.log(this.getContrastRatio(bgColor1, '#FFFFFF'), this.getContrastRatio(bgColor1, '#000000'))
		console.log(this.getContrastRatio(secondBgColor1, '#FFFFFF'), this.getContrastRatio(secondBgColor1, '#000000'))
		const palette1 = {
			buttonColor: accentColor,
			bgColor: bgColor1,
			textColor: this.getContrastRatio(bgColor1, '#FFFFFF') > this.getContrastRatio(bgColor1, '#000000') ? '#FFFFFF' : '#000000',
			secondButtonColor: secondAccentHsl1,
			secondBgColor: secondBgColor1,
			secondTextColor: this.getContrastRatio(secondBgColor1, '#FFFFFF') > this.getContrastRatio(secondBgColor1, '#000000') ? '#FFFFFF' : '#000000',
			method: 'Analogous',
		}
		const secondAccentHsl2 = this.hslToHex((accentHsl.h + 40) % 360, accentHsl.s, accentHsl.l)
		const secondBgColor2 = this.hslToHex((accentHsl.h + 40) % 360, accentHsl.s, 33)
		const palette2 = {
			buttonColor: accentColor,
			bgColor: bgColor2,
			textColor: this.getContrastRatio(bgColor2, '#FFFFFF') > this.getContrastRatio(bgColor2, '#000000') ? '#FFFFFF' : '#000000',
			secondButtonColor: secondAccentHsl2,
			secondBgColor: secondBgColor2,
			secondTextColor: this.getContrastRatio(secondBgColor2, '#FFFFFF') > this.getContrastRatio(secondBgColor2, '#000000') ? '#FFFFFF' : '#000000',
			method: 'Analogous',
		}

		console.log('palette1', palette1)
		console.log('palette2', palette2)

		return [palette1, palette2];
	}

	getComplementaryPalettes(accentColor) {
		const accentHsl = this.hexToHslString(accentColor);
		const bgColor1 = this.hslToHex(accentHsl.h, 60, 33)
		const bgColor2 = this.hslToHex(accentHsl.h, 60, 92)
		const secondAccentHex = this.hslToHex((accentHsl.h - 180) % 360, accentHsl.s, accentHsl.l)
		const secondAccentHsl = {
			h: (accentHsl.h - 180) % 360,
			s: accentHsl.s,
			l: accentHsl.l
		}
		const secondBgColor1 = this.hslToHex(secondAccentHsl.h, secondAccentHsl.s, 33)
		const secondBgColor2 = this.hslToHex(secondAccentHsl.h, secondAccentHsl.s, 92)
		const palette1 = {
			buttonColor: accentColor,
			bgColor: bgColor1,
			textColor: this.getContrastRatio(bgColor1, '#FFFFFF') > this.getContrastRatio(bgColor1, '#000000') ? '#FFFFFF' : '#000000',
			secondButtonColor: secondAccentHex,
			secondBgColor: secondBgColor1,
			secondTextColor: this.getContrastRatio(secondBgColor1, '#FFFFFF') > this.getContrastRatio(secondBgColor1, '#000000') ? '#FFFFFF' : '#000000',
			method: 'Complementary',
		}
		const palette2 = {
			buttonColor: accentColor,
			bgColor: bgColor2,
			textColor: this.getContrastRatio(bgColor2, '#FFFFFF') > this.getContrastRatio(bgColor2, '#000000') ? '#FFFFFF' : '#000000',
			secondButtonColor: secondAccentHex,
			secondBgColor: secondBgColor2,
			secondTextColor: this.getContrastRatio(secondBgColor2, '#FFFFFF') > this.getContrastRatio(secondBgColor2, '#000000') ? '#FFFFFF' : '#000000',
			method: 'Complementary',
		}

		return [palette1, palette2];
	}

	getContrastRatio(color1, color2) {
		const lum1 = this.getLuminance(this.hexToRgb(color1));
		const lum2 = this.getLuminance(this.hexToRgb(color2));
		const lighter = Math.max(lum1, lum2);
		const darker = Math.min(lum1, lum2);
		return (lighter + 0.05) / (darker + 0.05);
	}

	hexToHslString(hex) {
		const rgb = this.hexToRgb(hex);
		if (!rgb) return '';
		const hsl = this.rgbToHsl(rgb);
		return {
			h: hsl.h,
			s: hsl.s,
			l: hsl.l,
		}
	}

	hslToHex(/** @type {number} */ h, /** @type {number} */ s, /** @type {number} */ l) {
		l /= 100;
		const a = (s * Math.min(l, 1 - l)) / 100;
		const f = (/** @type {number} */ n) => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0'); // convert to Hex and prefix "0" if needed
		};
		return `#${f(0)}${f(8)}${f(4)}`;
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

	rgbToHsl(rgb) {
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
			h: h * 360,
			s: s * 100,
			l: l * 100,
		};
	}

	getLuminance(rgb) {
		if (!rgb) return 0;
		const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
			val = val / 255;
			return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}
	
}

window.PaletteGenerator = PaletteGenerator;
// MONO
// accent
// hsl(215, 100%, 66%)
// bg
// hsl(215, 100%, 95%)
// 2 accent
// hsl(205, 100%, 90%)
// 2 bg
// hsl(205, 50%, 50%)

// ANALOG 1
// accent
// hsl(215, 100%, 66%)
// bg
// hsl(215, 60%, 33%)
// 2 accent
// hsl(255, 100%, 66%)
// 2 bg
// hsl(255, 100%, 95%)

// ANALOG 2
// accent
// hsl(215, 100%, 66%)
// bg
// hsl(215, 60%, 33%)
// 2 accent
// (расчитываем акцентный и пытаемся найти похожий цвет в тильде (погрещность +-5 на все пункты))
// hsl(175, 100%, 66%)
// 2 bg
// hsl(175, 100%, 95%)

// COMPLIMENTAR 1
// accent
// hsl(215, 100%, 66%)
// bg
// hsl(215, 60%, 33%)
// 2 accent
// hsl(35, 100%, 66%)
// 2 bg
// hsl(35, 100%, 33%)
// COMPLIMENTAR 2
// accent
// hsl(215, 100%, 66%)
// bg
// hsl(215, 60%, 90%)
// 2 accent
// hsl(35, 100%, 66%)
// 2 bg
// hsl(35, 100%, 90%)