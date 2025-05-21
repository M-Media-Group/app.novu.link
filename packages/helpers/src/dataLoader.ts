
export const loadData = async (dataset = "features", localeToUse = "en") => {
  const module = await import(`@/data/${dataset}/${localeToUse}.json`) as {
    default: {
      name: string;
      description: string;
      [key: string]: number | string | object | boolean | null;
    }[];
  }
  return module.default;
};

/**
 *
 * @param asset - the asset to get
 */
export const assetUrl = (asset: string) =>
  new URL(
    `../assets/${asset}`,

    import.meta.url
  ).href;
