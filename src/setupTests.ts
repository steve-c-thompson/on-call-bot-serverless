// organize-imports-ignore
import { config } from "dotenv";
// When running tests from the command line or IDE our env might not be set yet. So, if that's the case, then load
// it manually from the file system.
// if (process.env.STAGE === undefined) {
//   config({ path: "./env/test.env" });
// }
// import "src/env";

expect.extend({
  /**
   * Meant to be a version of jest's toHaveProperty which checks the property
   * value is included in a set of possible values.
   *
   * Needs enhancement to have some of the more robust features of toHaveProperty.
   * @param propertyPath property name to check. TODO: Actually support paths.
   * @param values array of values which the propertyPath value must be within
   */
  toHavePropertyInValues(actual: any, propertyPath: string, values: any[]) {
    const propertyValue = actual[propertyPath];
    if (!propertyValue) {
      return {
        pass: false,
        message: () => `property "${propertyPath}" is not present in "${JSON.stringify(actual)}"`,
      };
    }
    if (!values.includes(propertyValue)) {
      return {
        pass: false,
        message: () =>
          `property value "${propertyPath}"="${propertyValue}" is not within the expected values "${values}" on object: ${JSON.stringify(
            actual,
          )}`,
      };
    }
    return {
      pass: true,
      message: () => "",
    };
  },
});
