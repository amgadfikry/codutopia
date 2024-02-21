import Global from "../../server/utils/global.js";
import { expect } from "chai";
import sinon from "sinon";

// unit tests for the Global class methods
describe("Unittest of Global methods", () => {
  // Test case for prepareDataToRedis method
  it('when provided data contain password, _id, list', () => {
    const data = {
      _id: "60f3e3e3e3e3e3e3e3e3e3e3",
      email: "email",
      role: "user",
      userName: "userName",
      list: ["one", "two", "three"],
      password: 'password'
    };
    const result = Global.prepareDataToRedis(data);
    expect(result).to.deep.equal({
      id: "60f3e3e3e3e3e3e3e3e3e3e3",
      email: "email",
      role: "user",
      userName: "userName",
      list: JSON.stringify(data.list)
    });
  });
});