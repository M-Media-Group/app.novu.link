import { describe, expect, it } from "vitest";

import {
    addProtocolIfMissing,
    formatUrl,
    hasProtocol,
    looksLikeStartingWithProtocol,
    removeProtocol,
    softlyAddProtocolIfMissing,
} from '../urlFormatter.js';

describe('urlFormatter', () => {
    describe('hasProtocol', () => {
        it('should return true for http:// URLs', () => {
            expect(hasProtocol('http://example.com')).toBe(true);
        });

        it('should return true for https:// URLs', () => {
            expect(hasProtocol('https://example.com')).toBe(true);
        });

        it('should return false for URLs without protocol', () => {
            expect(hasProtocol('example.com')).toBe(false);
        });

        it('should return false for other protocols', () => {
            expect(hasProtocol('ftp://example.com')).toBe(false);
        });
    });

    describe('removeProtocol', () => {
        it('should remove http:// from URL', () => {
            expect(removeProtocol('http://example.com')).toBe('example.com');
        });

        it('should remove https:// from URL', () => {
            expect(removeProtocol('https://example.com')).toBe('example.com');
        });

        it('should not change URL without protocol', () => {
            expect(removeProtocol('example.com')).toBe('example.com');
        });

        it('should return non-string input as is', () => {
            // @ts-expect-error since we are passing a non-string
            expect(removeProtocol(123)).toBe(123);

            // @ts-expect-error since we are passing a non-string
            expect(removeProtocol(null)).toBe(null);
        });
    });

    describe('addProtocolIfMissing', () => {
        it('should add https:// if missing', () => {
            expect(addProtocolIfMissing('example.com')).toBe('https://example.com');
        });

        it('should not add protocol if already present', () => {
            expect(addProtocolIfMissing('http://example.com')).toBe('http://example.com');
            expect(addProtocolIfMissing('https://example.com')).toBe('https://example.com');
        });

        it('should use custom protocol if provided', () => {
            expect(addProtocolIfMissing('example.com', 'http://')).toBe('http://example.com');
        });
    });

    describe('looksLikeStartingWithProtocol', () => {
        it('should return true for partial protocols', () => {
            expect(looksLikeStartingWithProtocol('h')).toBe(true);
            expect(looksLikeStartingWithProtocol('ht')).toBe(true);
            expect(looksLikeStartingWithProtocol('htt')).toBe(true);
            expect(looksLikeStartingWithProtocol('http')).toBe(true);
        });

        it('should return false for incorrect partials', () => {
            expect(looksLikeStartingWithProtocol('hot')).toBe(false);
            expect(looksLikeStartingWithProtocol('a')).toBe(false);
            expect(looksLikeStartingWithProtocol('htp')).toBe(false);
        });

        it('should return false for https:/a', () => {
            expect(looksLikeStartingWithProtocol('https:/a')).toBe(false);
        });

        it('should return true for full protocol', () => {
            expect(looksLikeStartingWithProtocol('https://')).toBe(true);
            expect(looksLikeStartingWithProtocol('http://')).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(looksLikeStartingWithProtocol('HTTP://')).toBe(true);
            expect(looksLikeStartingWithProtocol('HtTp://')).toBe(true);
        });
    });

    describe('softlyAddProtocolIfMissing', () => {
        it('should add protocol if not starting with protocol', () => {
            expect(softlyAddProtocolIfMissing('example.com')).toBe('https://example.com');
        });

        it('should not add protocol if looks like starting with protocol', () => {
            expect(softlyAddProtocolIfMissing('http')).toBe('http');
            expect(softlyAddProtocolIfMissing('https://example.com')).toBe('https://example.com');
        });

        it('should use custom protocol', () => {
            expect(softlyAddProtocolIfMissing('example.com', 'http://')).toBe('http://example.com');
        });
    });

    describe('formatUrl', () => {
        it('should add protocol, trim and remove spaces', () => {
            expect(formatUrl('  example.com  ')).toBe('https://example.com');
            expect(formatUrl(' example . com ')).toBe('https://example.com');
        });

        it('should not add protocol if looks like starting with protocol', () => {
            expect(formatUrl('http')).toBe('http');
            expect(formatUrl('https://example.com')).toBe('https://example.com');
        });

        it('should use custom protocol', () => {
            expect(formatUrl('example.com', 'http://')).toBe('http://example.com');
        });
    });
});