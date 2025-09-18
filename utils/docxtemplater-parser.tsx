/**
 * A robust custom parser for Docxtemplater that gracefully handles unresolved tags,
 * including nested properties (e.g., `{{user.name}}`).
 *
 * If a tag in the template is not found in the provided data, instead of throwing
 * a "Scope parser execution failed" error, this parser will leave the original tag
 * in the document (e.g., `{{unresolved_tag}}`). This makes debugging template
 * issues much easier and prevents the dreaded "Multi error".
 *
 * @param tag The placeholder tag found in the document (e.g., "nome_cliente" or "user.address.city").
 * @returns A parser object with a `get` method.
 */
export const docxParser = (tag: string) => {
    return {
        get(scope: any) {
            // The tag `.` is a special case for the current scope in loops.
            if (tag === '.') {
                return scope;
            }

            // Short-circuit for simple, non-nested tags for performance.
            if (tag.indexOf('.') === -1) {
                if (scope != null && Object.prototype.hasOwnProperty.call(scope, tag)) {
                    const value = scope[tag];
                    if (value !== null && value !== undefined) {
                        return value;
                    }
                }
            } else {
                // Handle nested tags like `user.name`
                try {
                    const keys = tag.split('.');
                    let value = scope;

                    for (const key of keys) {
                        // Check for null or undefined at each level of nesting.
                        if (value === null || typeof value === 'undefined') {
                            throw new Error('Property not found');
                        }
                        value = value[key];
                    }

                    // If the final value is null or undefined, treat it as unresolved.
                    if (value === null || typeof value === 'undefined') {
                        throw new Error('Property is null or undefined');
                    }
                    return value;
                } catch (e) {
                    // Fall through to the warning and return the tag
                }
            }

            // If the tag is unresolved, log a warning for debugging and return
            // the original tag so it appears in the output document.
            console.warn(`[Docxtemplater] Unresolved tag: "${tag}"`);
            return `{{${tag}}}`;
        },
    };
};
