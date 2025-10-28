import {
  calculateDays,
  calculateDurationInUnit,
  formatDuration,
  formatDurationCustom,
  getProjectDuration,
} from "../duration";

describe("duration utilities", () => {
  describe("calculateDays", () => {
    it("calculates days between two dates", () => {
      expect(calculateDays("2024-01-01", "2024-01-08")).toBe(7);
      expect(calculateDays("2024-01-01", "2024-02-01")).toBe(31);
    });

    it("handles same day", () => {
      expect(calculateDays("2024-01-01", "2024-01-01")).toBe(0);
    });

    it("works regardless of date order", () => {
      expect(calculateDays("2024-01-08", "2024-01-01")).toBe(7);
    });
  });

  describe("formatDuration", () => {
    it("formats days for short durations", () => {
      expect(formatDuration(0)).toBe("Less than a day");
      expect(formatDuration(1)).toBe("1 day");
      expect(formatDuration(10)).toBe("10 days");
      expect(formatDuration(13)).toBe("13 days");
    });

    it("formats weeks for medium durations", () => {
      expect(formatDuration(14)).toBe("2 weeks");
      expect(formatDuration(35)).toBe("5 weeks");
      expect(formatDuration(48)).toBe("7 weeks");
    });

    it("formats months for long durations", () => {
      expect(formatDuration(60)).toBe("2 months");
      expect(formatDuration(75)).toBe("2.5 months");
      expect(formatDuration(90)).toBe("3 months");
    });

    it("handles singular vs plural", () => {
      expect(formatDuration(1)).toBe("1 day");
      expect(formatDuration(7)).toBe("1 week");
      expect(formatDuration(14)).toBe("2 weeks");
      expect(formatDuration(30)).toBe("1 month");
      expect(formatDuration(60)).toBe("2 months");
    });
  });

  describe("getProjectDuration", () => {
    it("calculates and formats project duration", () => {
      const project = {
        projectDates: {
          start: "2024-01-01",
          end: "2024-01-15",
        },
      };
      expect(getProjectDuration(project)).toBe("2 weeks");
    });

    it("handles different date ranges", () => {
      const shortProject = {
        projectDates: {
          start: "2024-01-01",
          end: "2024-01-08",
        },
      };
      expect(getProjectDuration(shortProject)).toBe("7 days");

      const longProject = {
        projectDates: {
          start: "2024-01-01",
          end: "2024-03-15",
        },
      };
      expect(getProjectDuration(longProject)).toBe("2.5 months");
    });
  });

  describe("calculateDurationInUnit", () => {
    it("calculates in days", () => {
      expect(calculateDurationInUnit("2024-01-01", "2024-01-08", "days")).toBe(
        7
      );
    });

    it("calculates in weeks", () => {
      const weeks = calculateDurationInUnit(
        "2024-01-01",
        "2024-01-15",
        "weeks"
      );
      expect(weeks).toBeCloseTo(2, 1);
    });

    it("calculates in months", () => {
      const months = calculateDurationInUnit(
        "2024-01-01",
        "2024-03-01",
        "months"
      );
      expect(months).toBeCloseTo(2, 0);
    });
  });

  describe("formatDurationCustom", () => {
    it("uses preferred unit", () => {
      expect(formatDurationCustom(30, { preferredUnit: "days" })).toBe(
        "30 days"
      );
      expect(formatDurationCustom(30, { preferredUnit: "weeks" })).toBe(
        "4 weeks"
      );
      expect(formatDurationCustom(30, { preferredUnit: "months" })).toBe(
        "1 month"
      );
    });

    it("shows decimals when requested", () => {
      expect(
        formatDurationCustom(30, { preferredUnit: "weeks", showDecimals: true })
      ).toBe("4.3 weeks");
    });

    it("uses short form when requested", () => {
      expect(
        formatDurationCustom(30, { preferredUnit: "weeks", shortForm: true })
      ).toBe("4w");
      expect(
        formatDurationCustom(30, { preferredUnit: "months", shortForm: true })
      ).toBe("1mo");
    });
  });
});
