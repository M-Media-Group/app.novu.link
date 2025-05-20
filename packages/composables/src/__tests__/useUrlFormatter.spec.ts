import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUrlFormatter } from "../useUrlFormatter.js";

// Mock debounce and formatUrl
vi.mock("@novulink/helpers/debounce", () => ({
    debounce: vi.fn((fn) => fn),
}));
vi.mock("@novulink/helpers/urlFormatter", () => ({
    formatUrl: vi.fn((url: string) => `formatted:${url}`),
}));

describe("useUrlFormatter", () => {
    let composable: ReturnType<typeof useUrlFormatter>;

    beforeEach(() => {
        composable = useUrlFormatter();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize endpointUrl as null", () => {
        expect(composable.endpointUrl.value).toBeNull();
    });

    it("should update endpointUrl with formatted url when debounceAddProtocolIfMissing is called", () => {
        composable.debounceAddProtocolIfMissing("http://test.com");
        expect(composable.endpointUrl.value).toBe("formatted:http://test.com");
    });

    it("should not update endpointUrl if it is undefined", () => {
        composable.endpointUrl.value = undefined;
        composable.debounceAddProtocolIfMissing("http://test.com");
        // Should not update if value is undefined
        expect(composable.endpointUrl.value).toBeUndefined();
    });

    it("should update endpointUrl if it is null", () => {
        composable.endpointUrl.value = null;
        composable.debounceAddProtocolIfMissing("abc.com");
        expect(composable.endpointUrl.value).toBe("formatted:abc.com");
    });
});