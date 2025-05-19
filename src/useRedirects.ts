const baseUrl = import.meta.env.VITE_API_URL;

export const getRedirectQrCodeDataUrl = (
  redirectId: string,
  designId?: string | number
) => {
  return `${getRedirectUrl(redirectId)}?nl_qr${
    designId ? `&nl_d=${designId}` : ""
  }`;
};

export const getRedirectUrl = (redirectId: string) => {
  return `${baseUrl}/l/${redirectId}`;
};
