export default class Helpers {
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

	hexToHsl(hex) {
		if (!hex) {
			return null;
		}
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
}