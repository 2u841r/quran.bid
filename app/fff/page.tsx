'use client';
import { formConfig } from "./config.js"; // import the config
import React, { useState } from "react";

export default function MatrimonyForm() {
  const [values, setValues] = useState({});

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  // Calculate TLT options dynamically
  const getTLTOptions = () => {
    if (!values.marriageYear || !values.marriageMonth || !values.divorceYear || !values.divorceMonth) return { years: [], months: [] };
    const marriageDate = new Date(values.marriageYear, values.marriageMonth - 1);
    const divorceDate = new Date(values.divorceYear, values.divorceMonth - 1);
    let totalMonths = (divorceDate.getFullYear() - marriageDate.getFullYear()) * 12 + (divorceDate.getMonth() - marriageDate.getMonth());
    totalMonths = Math.max(totalMonths, 0);
    const maxYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const years = Array.from({ length: maxYears + 1 }, (_, i) => i);
    const months = Array.from({ length: 12 }, (_, i) => i).filter(
      (m) => !(values.timeTogetherYears === maxYears && m > remainingMonths)
    );
    return { years, months };
  };

  const { years: tltYears, months: tltMonths } = getTLTOptions();

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Matrimony Form</h2>
      {formConfig.map((field) => {
        if (field.showIf && !field.showIf(values)) return null;

        // Dynamic children age
        if (field.type === "dynamicSelect") {
          const count = values[field.countFrom] || 0;
          return (
            <div key={field.name} style={{ margin: "10px 0" }}>
              <label>{field.label}:</label>
              <div>
                {Array.from({ length: count }).map((_, i) => (
                  <select
                    key={i}
                    value={(values[field.name] || [])[i] || ""}
                    onChange={(e) => {
                      const arr = [...(values[field.name] || [])];
                      arr[i] = e.target.value;
                      handleChange(field.name, arr);
                    }}
                    style={{ marginRight: 5 }}
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          );
        }

        // TLT dropdowns
        if (["timeTogetherYears", "timeTogetherMonths"].includes(field.name)) {
          const options = field.name === "timeTogetherYears" ? tltYears : tltMonths;
          return (
            <div key={field.name} style={{ margin: "10px 0" }}>
              <label>{field.label}:</label>
              <select
                style={{ width: "100%" }}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
              >
                <option value="">Select</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }

        // Default select or number
        if (field.type === "select") {
          return (
            <div key={field.name} style={{ margin: "10px 0" }}>
              <label>{field.label}:</label>
              <select
                style={{ width: "100%" }}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">Select</option>
                {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          );
        }

        if (field.type === "number") {
          return (
            <div key={field.name} style={{ margin: "10px 0" }}>
              <label>{field.label}:</label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          );
        }

        return null;
      })}

      <button style={{ marginTop: 20 }} onClick={() => console.log(values)}>Submit</button>
    </div>
  );
}
