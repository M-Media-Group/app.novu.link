import { describe, expect, it } from "vitest";
import {
    flattenObjectToDotNotationWithArrayAndStopAtKey,
    hasMethod,
    hasProperty,
} from "../hasMethod.js";

describe("hasMethod", () => {
    it("returns true if object has a method of given name", () => {
        const obj = {
            foo: () => {
                console.log("Hello");
            }
        };
        expect(hasMethod(obj, "foo")).toBe(true);
    });

    it("returns false if object does not have the method", () => {
        const obj = { bar: 123 };
        expect(hasMethod(obj, "foo")).toBe(false);
    });

    it("returns false if property is not a function", () => {
        const obj = { foo: "not a function" };
        expect(hasMethod(obj, "foo")).toBe(false);
    });

    it("returns false for non-object values", () => {
        expect(hasMethod(null, "foo")).toBe(false);
        expect(hasMethod(undefined, "foo")).toBe(false);
        expect(hasMethod(42, "foo")).toBe(false);
        expect(hasMethod("string", "foo")).toBe(false);
    });
});

describe("hasProperty", () => {
    it("returns true if object has a string property of given name", () => {
        const obj = { foo: "bar" };
        expect(hasProperty(obj, "foo")).toBe(true);
    });

    it("returns false if property is not a string", () => {
        const obj = { foo: 123 };
        expect(hasProperty(obj, "foo")).toBe(false);
    });

    it("returns false if object does not have the property", () => {
        const obj = { bar: "baz" };
        expect(hasProperty(obj, "foo")).toBe(false);
    });

    it("returns false for non-object values", () => {
        expect(hasProperty(null, "foo")).toBe(false);
        expect(hasProperty(undefined, "foo")).toBe(false);
        expect(hasProperty(42, "foo")).toBe(false);
        expect(hasProperty("string", "foo")).toBe(false);
    });
});

describe("flatten Object ToDotNotation WithArrayAndStopAtKey", () => {
    it("flattens a simple nested object", () => {
        const input = { a: { b: "c" } };
        expect(flattenObjectToDotNotationWithArrayAndStopAtKey(input)).toEqual({
            "a.b": "c",
        });
    });

    it.skip("flattens arrays and stops at _errors key", () => {
        const input = { a: [{ b: [{ _errors: ["Error"] }] }] };
        expect(flattenObjectToDotNotationWithArrayAndStopAtKey(input)).toEqual({
            "a.0.b.0": ["Error"],
        });
    });

    it.skip("handles multiple _errors keys", () => {
        const input = {
            a: [{ b: [{ _errors: ["Error1"] }] }],
            c: { d: { _errors: ["Error2"] } },
        };
        expect(flattenObjectToDotNotationWithArrayAndStopAtKey(input)).toEqual({
            "a.0.b.0": ["Error1"],
            "c.d": ["Error2"],
        });
    });

    it("uses custom stopKey", () => {
        const input = { a: { stopHere: ["Stopped"] }, b: { c: "d" } };
        expect(
            flattenObjectToDotNotationWithArrayAndStopAtKey(input, "", {}, "stopHere")
        ).toEqual({
            "a": ["Stopped"],
            "b.c": "d",
        });
    });

    it("works with errors in arrays in a real zod error", () => {
        const input = {
            "_errors": [],
            "rule_groups": {
                "0": {
                    "_errors": [],
                    "rules": {
                        "0": {
                            "_errors": [],
                            "value": {
                                "_errors": [
                                    "Expected boolean, received string",
                                    "Invalid enum value. Expected 'yes' | 'no' | 'true' | 'false' | '1' | '0', received 'ii'"
                                ]
                            }
                        },
                        "_errors": []
                    }
                },
                "_errors": []
            }
        };
        expect(flattenObjectToDotNotationWithArrayAndStopAtKey(input)).toEqual({
            "rule_groups.0.rules.0.value": [
                "Expected boolean, received string",
                "Invalid enum value. Expected 'yes' | 'no' | 'true' | 'false' | '1' | '0', received 'ii'"
            ]
        });
    });

    it("flattens arrays as values", () => {
        const input = { arr: ["x", "y"] };
        expect(flattenObjectToDotNotationWithArrayAndStopAtKey(input)).toEqual({
            "arr": ["x", "y"],
        });
    });
});