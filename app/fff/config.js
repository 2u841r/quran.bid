export const formConfig = [
  {
    name: "maritalStatus",
    label: "Marital Status",
    type: "select",
    options: ["Single", "Married", "Divorced", "Widow/Widower"],
    required: true
  },
  {
    name: "numSons",
    label: "Number of Sons",
    type: "number",
    min: 0,
    max: 20,
    showIf: (values) => values.maritalStatus !== "Single"
  },
  {
    name: "numDaughters",
    label: "Number of Daughters",
    type: "number",
    min: 0,
    max: 20,
    showIf: (values) => values.maritalStatus !== "Single"
  },
  {
    name: "sonsAge",
    label: "Sons Age",
    type: "dynamicSelect",
    options: Array.from({ length: 50 }, (_, i) => i + 1),
    countFrom: "numSons",
    showIf: (values) => values.numSons > 0
  },
  {
    name: "daughtersAge",
    label: "Daughters Age",
    type: "dynamicSelect",
    options: Array.from({ length: 50 }, (_, i) => i + 1),
    countFrom: "numDaughters",
    showIf: (values) => values.numDaughters > 0
  },
  {
    name: "marriageYear",
    label: "Marriage Year",
    type: "select",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (values) => ["Married", "Divorced", "Widow/Widower"].includes(values.maritalStatus)
  },
  {
    name: "marriageMonth",
    label: "Marriage Month",
    type: "select",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (values) => ["Married", "Divorced", "Widow/Widower"].includes(values.maritalStatus)
  },
  {
    name: "divorceYear",
    label: "Divorce Year",
    type: "select",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (values) => values.maritalStatus === "Divorced"
  },
  {
    name: "divorceMonth",
    label: "Divorce Month",
    type: "select",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (values) => values.maritalStatus === "Divorced"
  },
  {
    name: "divorceReason",
    label: "Reason for Divorce",
    type: "select",
    options: ["Incompatibility", "Financial issues", "Disclose later", "Other"],
    showIf: (values) => values.maritalStatus === "Divorced"
  },
  {
    name: "timeTogetherYears",
    label: "Time Lived Together - Years",
    type: "select",
    options: [], // dynamically calculated from marriage/divorce date
    showIf: (values) =>
      values.maritalStatus === "Divorced" &&
      values.marriageYear && values.marriageMonth &&
      values.divorceYear && values.divorceMonth
  },
  {
    name: "timeTogetherMonths",
    label: "Time Lived Together - Months",
    type: "select",
    options: [], // dynamically calculated
    showIf: (values) =>
      values.maritalStatus === "Divorced" &&
      values.marriageYear && values.marriageMonth &&
      values.divorceYear && values.divorceMonth
  },
  {
    name: "deathYear",
    label: "Death Year",
    type: "select",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (values) => values.maritalStatus === "Widow/Widower"
  },
  {
    name: "deathMonth",
    label: "Death Month",
    type: "select",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (values) => values.maritalStatus === "Widow/Widower"
  },
  {
    name: "deathReason",
    label: "Cause of Death",
    type: "select",
    options: ["Illness", "Accident", "Disclose later", "Other"],
    showIf: (values) => values.maritalStatus === "Widow/Widower"
  }
];
