export default [
    {
        name: "get_weather",
        type: "function",
        description: "Determine weather in my location",
        strict: true,
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city and state e.g. San Francisco, CA",
                },
                unit: {
                    type: "string",
                    enum: ["c", "f"],
                },
            },
            additionalProperties: false,
            required: ["location", "unit"],
        },
    },
];
