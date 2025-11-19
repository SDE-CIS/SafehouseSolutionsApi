export const messages = {
    success: {
        added: "{{entity}} added successfully!",
        updated: "{{entity}} updated successfully!",
        deleted: "{{entity}} deleted successfully!",
        retrieved: "{{entity}} retrieved successfully!",
        productAdded: "Product added to {{entity}} successfully!",
        productRemoved: "Product removed from {{entity}} successfully!",
    },
    error: {
        notFound: "{{entity}} not found.",
        failed: "Failed to {{action}} {{entity}}.",
        invalidData: "Invalid {{entity}} data.",
        typeError: "Type schema error.",
        requiredParam: "{{param}} is required."
    }
};

export const getMessage = (template, replacements) => { return template.replace(/{{(\w+)}}/g, (_, key) => replacements[key] || '');};