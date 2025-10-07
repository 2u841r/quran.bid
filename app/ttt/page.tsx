'use client';
import React, { useState } from "react";

// Form config
const maritalStatusFields = [
  {
    name: "maritalStatus",
    label: "Marital Status",
    type: "dropdown",
    options: ["Single", "Married", "Divorced", "Widow/Widower"],
    required: true,
  },

  // Marriage related
  {
    name: "marriedReasons",
    label: "Reasons for Marriage",
    type: "checkbox",
    options: ["Companionship", "Family pressure", "Other"],
    showIf: (v) => v.maritalStatus === "Married",
  },
  {
    name: "ifWifeAgrees",
    label: "Wife agrees?",
    type: "boolean",
    showIf: (v) => v.maritalStatus === "Married",
  },
  {
    name: "marriageMonth",
    label: "Marriage Month",
    type: "dropdown",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (v) => v.maritalStatus === "Married",
  },
  {
    name: "marriageYear",
    label: "Marriage Year",
    type: "dropdown",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (v) => v.maritalStatus === "Married",
  },

  // Children
  {
    name: "numSons",
    label: "Number of Sons",
    type: "number",
    min: 0,
    max: 20,
    showIf: (v) => v.maritalStatus !== "Single",
  },
  {
    name: "numDaughters",
    label: "Number of Daughters",
    type: "number",
    min: 0,
    max: 20,
    showIf: (v) => v.maritalStatus !== "Single",
  },
  {
    name: "sonsAge",
    label: "Sons Age",
    type: "dropdown-multiple",
    options: Array.from({ length: 50 }, (_, i) => i + 1),
    showIf: (v) => v.maritalStatus !== "Single" && v.numSons > 0,
  },
  {
    name: "daughtersAge",
    label: "Daughters Age",
    type: "dropdown-multiple",
    options: Array.from({ length: 50 }, (_, i) => i + 1),
    showIf: (v) => v.maritalStatus !== "Single" && v.numDaughters > 0,
  },

  // Divorce
  {
    name: "divorceReason",
    label: "Reason for Divorce",
    type: "dropdown",
    options: ["Incompatibility", "Financial issues", "Disclose later", "Other"],
    showIf: (v) => v.maritalStatus === "Divorced",
  },
  {
    name: "divorceMonth",
    label: "Divorce Month",
    type: "dropdown",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (v) => v.maritalStatus === "Divorced",
  },
  {
    name: "divorceYear",
    label: "Divorce Year",
    type: "dropdown",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (v) => v.maritalStatus === "Divorced",
  },

  // Widow/Widower
  {
    name: "deathReason",
    label: "Cause of Spouse's Death",
    type: "dropdown",
    options: ["Illness", "Accident", "Disclose later", "Other"],
    showIf: (v) => v.maritalStatus === "Widow/Widower",
  },
  {
    name: "deathMonth",
    label: "Death Month",
    type: "dropdown",
    options: Array.from({ length: 12 }, (_, i) => i + 1),
    showIf: (v) => v.maritalStatus === "Widow/Widower",
  },
  {
    name: "deathYear",
    label: "Death Year",
    type: "dropdown",
    options: Array.from({ length: 100 }, (_, i) => 2025 - i),
    showIf: (v) => v.maritalStatus === "Widow/Widower",
  },

  // Time Lived Together (optional for divorced/widow)
  {
    name: "timeLivedTogetherMonths",
    label: "Time Lived Together (Months)",
    type: "number",
    min: 0,
    max: 12,
    showIf: (v) =>
      (v.maritalStatus === "Divorced" || v.maritalStatus === "Widow/Widower") &&
      v.marriageMonth &&
      v.marriageYear,
  },
  {
    name: "timeLivedTogetherYears",
    label: "Time Lived Together (Years)",
    type: "number",
    min: 0,
    max: 10,
    showIf: (v) =>
      (v.maritalStatus === "Divorced" || v.maritalStatus === "Widow/Widower") &&
      v.marriageMonth &&
      v.marriageYear,
  },
];

export default function MatrimonyForm() {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleCheckboxChange = (name, option) => {
    const selected = values[name] || [];
    handleChange(
      name,
      selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]
    );
  };

  const handleSubmit = () => {
    // calculate total children
    const totalChildren = Number(values.numSons || 0) + Number(values.numDaughters || 0);
    console.log("Submitted form:", { ...values, totalChildren });
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Matrimony Form</h2>

      {maritalStatusFields.map((field) => {
        if (field.showIf && !field.showIf(values)) return null;
        const value = values[field.name] || "";

        switch (field.type) {
          case "text":
          case "number":
            return (
              <div key={field.name} style={{ margin: "10px 0" }}>
                <label>{field.label}:</label>
                <input
                  type={field.type}
                  value={value}
                  min={field.min}
                  max={field.max}
                  onChange={(e) =>
                    handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </div>
            );

          case "dropdown":
            return (
              <div key={field.name} style={{ margin: "10px 0" }}>
                <label>{field.label}:</label>
                <select
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">Select</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );

          case "checkbox":
            return (
              <div key={field.name} style={{ margin: "10px 0" }}>
                <label>{field.label}:</label>
                <div>
                  {field.options.map((opt) => (
                    <label key={opt} style={{ marginRight: 10 }}>
                      <input
                        type="checkbox"
                        checked={(values[field.name] || []).includes(opt)}
                        onChange={() => handleCheckboxChange(field.name, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            );

          case "boolean":
            return (
              <div key={field.name} style={{ margin: "10px 0" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                  />{" "}
                  {field.label}
                </label>
              </div>
            );

          case "dropdown-multiple":
            const count = values[field.name.replace("Age", field.name.includes("Sons") ? "numSons" : "numDaughters")] || 0;
            return (
              <div key={field.name} style={{ margin: "10px 0" }}>
                <label>{field.label}:</label>
                <div>
                  {Array.from({ length: count }, (_, i) => (
                    <select
                      key={i}
                      value={value[i] || ""}
                      onChange={(e) => {
                        const arr = [...(value || [])];
                        arr[i] = e.target.value;
                        handleChange(field.name, arr);
                      }}
                      style={{ marginRight: 5 }}
                    >
                      <option value="">Age</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        Submit
      </button>

      {submitted && <p style={{ color: "green" }}>Form submitted successfully!</p>}
    </div>
  );
}
