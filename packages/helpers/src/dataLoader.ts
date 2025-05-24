/**
 * A helper function to load data from a JSON file.
 *
 * @param dataset - the dataset to load, defaults to "features"
 * @param localeToUse - the locale to use, defaults to "en"
 * @param basePath - the base path to the data directory, defaults to '@/data'
 */
export const loadData = async <T = { name?: string; description?: string; [key: string]: number | string | object | boolean | null | undefined }>(
  dataset = "features",
  localeToUse = "en",
  basePath = '@/data'
): Promise<T[]> => {
  const module = await import(`${basePath}/${dataset}/${localeToUse}.json`) as { default: T[] };
  return module.default;
};

/**
 * A helper function to get the URL of an asset using a relative path and the current module's URL.
 *
 * @param asset - the asset to get
 * @param basePath - the base path to the assets directory, defaults to '../assets'
 * @return the URL of the asset
 */
export const assetUrl = (asset: string, basePath = '../assets'): string =>
  new URL(
    `${basePath}/${asset}`,
    import.meta.url
  ).href;
