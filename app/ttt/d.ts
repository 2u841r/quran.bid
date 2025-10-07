const formConfig = [
    {
        step: 1,
        title: "Basic Info",
        fields: [
            {
                name: "fullName",
                label: "Full Name",
                type: "text",
                placeholder: "Enter your full name",
                required: true,
                validate: (value) => value.trim().length >= 3 || "Name must be at least 3 chars",
            },
            {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "example@mail.com",
                required: true,
                validate: (value) => /\S+@\S+\.\S+/.test(value) || "Enter a valid email",
            },
        ],
    },
    {
        step: 2,
        title: "Location Details",
        fields: [
            {
                name: "country",
                label: "Country",
                type: "dropdown",
                options: ["USA", "India", "Canada"], // Can be fetched dynamically
                required: true,
            },
            {
                name: "state",
                label: "State",
                type: "dropdown",
                getOptions: (values) => {
                    // Dynamically fetch states based on selected country
                    if (values.country === "USA") return usaStates;
                    if (values.country === "India") return indianStates;
                    if (values.country === "Canada") return canadianStates;
                    return [];
                },
                required: true,
                dependsOn: "country",
            },
        ],
    },
    {
        step: 3,
        title: "Preferences",
        fields: [
            {
                name: "hobbies",
                label: "Select Hobbies",
                type: "checkbox",
                options: ["Reading", "Traveling", "Cooking", "Music"],
                maxSelect: 2, // User can select max 2
                errorMessage: "You can select up to 2 hobbies only",
            },
        ],
    },
];
