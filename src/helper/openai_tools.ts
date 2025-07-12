export default [
    {
        name: "web_search",
        type: "function",
        description: "Perform a search on the web",
        strict: true,
        parameters: {
            type: "object",
            properties: {
                keyword: {
                    type: "string",
                    description: "Search keyword to look up on the web",
                },
            },
            additionalProperties: false,
            required: ["keyword"],
        },
    },
];
