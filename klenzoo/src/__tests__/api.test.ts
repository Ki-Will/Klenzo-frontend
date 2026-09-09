import { ApiError } from "../lib/api";

describe("Frontend API Client Tests", () => {
  it("should format ApiError correctly", () => {
    const error = new ApiError(404, "Not Found", { details: "Item missing" });
    expect(error.name).toBe("ApiError");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.raw).toEqual({ details: "Item missing" });
  });
});
