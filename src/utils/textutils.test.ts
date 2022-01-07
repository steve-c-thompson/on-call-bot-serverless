import {TextUtils} from "./textutils";

describe("doDateSubstitution", () => {
    const inputText = "Text is ${label1} and ${label2}";
    const label1 = "${label1}";
    const label2 = "${label2}";
    // 0-based months and 1-based days
    const d1 = new Date(2021, 7, 5);
    const d2 = new Date(2021, 11, 14);
    it("handles empty map to return input string", () => {
        const map = new Map();

        const output = TextUtils.doDateSubstitution(inputText, map);
        expect(output).toBe(inputText);
    });
    it("handles and formats dates as M/D by default", () => {
        const map = new Map();
        map.set(label1, d1);
        map.set(label2, d2);

        const output = TextUtils.doDateSubstitution(inputText, map);
        expect(output).toBe("Text is 8/5 and 12/14");
    });
    it("handles and formats dates according to passed format", () => {
        const map = new Map();
        map.set(label1, d1);
        map.set(label2, d2);

        const format = "MM/DD/YYYY";
        const output = TextUtils.doDateSubstitution(inputText, map, format);
        expect(output).toBe("Text is 08/05/2021 and 12/14/2021");

        const format2 = "M/D/YYYY";
        const output2 = TextUtils.doDateSubstitution(inputText, map, format2);
        expect(output2).toBe("Text is 8/5/2021 and 12/14/2021");
    });
    });

