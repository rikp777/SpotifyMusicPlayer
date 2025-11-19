import { ref, watch, nextTick, readonly } from 'vue';
import type { Ref } from 'vue';
import { Vibrant } from 'node-vibrant/browser';

interface ColorPalette {
  text: string;
  background: string;
}

interface VibrantPalette {
  Vibrant?: VibrantSwatch;
  Muted?: VibrantSwatch;
  DarkVibrant?: VibrantSwatch;
  DarkMuted?: VibrantSwatch;
  LightVibrant?: VibrantSwatch;
  LightMuted?: VibrantSwatch;
  [key: string]: VibrantSwatch | undefined;
}

interface VibrantSwatch {
  getHex(): string;
  getTitleTextColor(): string;
  getBodyTextColor(): string;
}

const colorPalette = ref<ColorPalette | null>(null);

export function useAlbumColors(imageUrl: Ref<string | undefined>) {

  function setAppColors(palette: ColorPalette) {
    document.documentElement.style.setProperty(
      '--color-text-primary',
      palette.text
    );
    document.documentElement.style.setProperty(
      '--colour-background-now-playing',
      palette.background
    );
  }

  function handleAlbumPalette(palette: any) {
    const albumColours: ColorPalette[] = [];

    Object.keys(palette).forEach(key => {
      const swatch = palette[key];

      if (swatch) {

        const hex = typeof swatch.getHex === 'function' ? swatch.getHex() : swatch.hex;
        const text = typeof swatch.getTitleTextColor === 'function' ? swatch.getTitleTextColor() : swatch.titleTextColor;

        if (hex && text) {
          albumColours.push({
            text: text,
            background: hex
          });
        }
      }
    });

    if (albumColours.length === 0) {
      colorPalette.value = null;
      return;
    }

    colorPalette.value = albumColours[0];

    nextTick(() => {
      if (colorPalette.value) {
        setAppColors(colorPalette.value);
      }
    });
  }

  function getAlbumColours(url: string) {
    if (!url) {
      colorPalette.value = null;
      return;
    }


    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      Vibrant.from(img)
        .quality(1)
        .clearFilters()
        .getPalette()
        .then((palette) => {
          handleAlbumPalette(palette as unknown as VibrantPalette);
        })
        .catch(error => {
          console.error('Error with Vibrant.js:', error);
          colorPalette.value = null;
        });
    };

    img.onerror = () => {
      console.warn('Could not load image for colour extraction');
    }
  }

  watch(imageUrl, (newUrl) => {
    if (newUrl) {
      getAlbumColours(newUrl);
    }
  }, { immediate: true });

  return {
    colorPalette: readonly(colorPalette)
  };
}
