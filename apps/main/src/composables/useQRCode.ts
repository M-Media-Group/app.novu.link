import type { QRDesign } from "@novulink/types";
import QRCodeStyling, { type FileExtension } from "qr-code-styling";
import { ref } from "vue";

const qrCode = new QRCodeStyling();

export const useQRCode = () => {

    const qrCodeDataURL = ref<string | null>(null);
    const isReady = ref(false);

    const updateQrCode = async (
        urlToEncode = "",
        color = "#000000",
        backgroundColor = "#ffffff",
        logoDataUrl: string | null = null,
        blockShape = "square" as QRDesign["block_shape"],
        cornerShape = "square" as QRDesign["corner_shape"],
        cornerDotShape = "square" as QRDesign["corner_dot_shape"],
        dimensions = 240,
        fileType = "png " as FileExtension,
        errorCorrectionLevel = "medium" as QRDesign["error_correction_level"],
        logoPunchout = true,
        isLogoUpdate = false // flag to check if this is a logo update
    ) => {
        qrCode.update({
            width: dimensions * 2,
            height: dimensions * 2,
            data: urlToEncode,
            image: isLogoUpdate ? logoDataUrl ?? undefined : undefined, // Render logo only on update
            margin: 2,
            dotsOptions: {
                color: color,
                type: blockShape === "circle" ? "dots" : blockShape,
            },
            backgroundOptions: {
                color: backgroundColor,
            },
            cornersSquareOptions: {
                color: color,
                type:
                    cornerShape === "circle"
                        ? "dot"
                        : cornerShape === "rounded"
                            ? "extra-rounded"
                            : cornerShape,
            },
            cornersDotOptions: {
                color: color,
                type: cornerDotShape === "circle" ? "dot" : cornerDotShape,
            },
            imageOptions: {
                hideBackgroundDots: logoPunchout,
                crossOrigin: "anonymous",
                margin: 2,
            },
            qrOptions: {
                errorCorrectionLevel: errorCorrectionLevel.charAt(0).toUpperCase() as
                    | "L"
                    | "M"
                    | "Q"
                    | "H",
            },
        });

        const data = (await qrCode.getRawData(fileType)) as Blob;
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
            qrCodeDataURL.value = reader.result as string;
            isReady.value = true;
        };
        return reader.result as string;
    };

    const compute2 = async (
        urlToEncode = "",
        color = "#ffffff",
        backgroundColor = "#000000",
        logoDataUrl: string | null = null,
        blockShape = "square" as QRDesign["block_shape"],
        cornerShape = "square" as QRDesign["corner_shape"],
        cornerDotShape = "square" as QRDesign["corner_dot_shape"],
        dimensions = 240,
        fileType = "png" as FileExtension,
        errorCorrectionLevel = "medium" as QRDesign["error_correction_level"],
        logoPunchout = true,
    ) => {
        // Render the QR code first without the logo
        await updateQrCode(
            urlToEncode,
            color,
            backgroundColor,
            null, // No logo initially
            blockShape,
            cornerShape,
            cornerDotShape,
            dimensions,
            fileType,
            errorCorrectionLevel,
            false // punchout needs to be false initially - some weird rendering bug otherwise
        );

        if (logoDataUrl) {
            // Re-render with the fetched logo
            await updateQrCode(
                urlToEncode,
                color,
                backgroundColor,
                logoDataUrl, // Fetched logo
                blockShape,
                cornerShape,
                cornerDotShape,
                dimensions,
                fileType,
                errorCorrectionLevel,
                logoPunchout,
                true // Logo update flag
            );
        }
    };
    return {
        qrCode,
        updateQrCode: compute2,
        qrCodeDataURL,
        isReady,
    };
}