import moment from "moment";

export namespace TextUtils {
    export function doDateSubstitution(inputText: string, keysAndDates: Map<string, Date>, formatString = "M/D"): string {
        if (!keysAndDates.size) {
            return inputText;
        }
        keysAndDates.forEach((value, key) => {
            let transformedDate = moment(value).format(formatString);
            inputText = inputText.replace(key, transformedDate);
        })

        return inputText;
    }
}