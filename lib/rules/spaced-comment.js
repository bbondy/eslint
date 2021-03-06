/**
 * @fileoverview Source code for spaced-comments rule
 * @author Gyandeep Singh
 * @copyright 2015 Gyandeep Singh. All rights reserved.
 * @copyright 2014 Greg Cochard. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    // Unless the first option is never, require a space
    var requireSpace = context.options[0] !== "never";

    // Default to match anything, so all will fail if there are no exceptions
    var exceptionMatcher = new RegExp(" ");

    // Grab the exceptions array and build a RegExp matcher for it
    var hasExceptions = context.options.length === 2;
    var unescapedExceptions = hasExceptions ? context.options[1].exceptions : [];
    var exceptions;

    if (unescapedExceptions.length) {
        exceptions = unescapedExceptions.map(function(s) {
            return s.replace(/([.*+?${}()|\^\[\]\/\\])/g, "\\$1");
        });
        exceptionMatcher = new RegExp("(^(" + exceptions.join(")+$)|(^(") + ")+$)");
    }


    function checkCommentForSpace(node) {
        var commentIdentifier = node.type === "Block" ? "/*" : "//";

        if (requireSpace) {

            // If length is zero, ignore it
            if (node.value.length === 0) {
                return;
            }

            // Space expected and not found
            if (node.value.indexOf(" ") !== 0 && node.value.indexOf("\t") !== 0 && node.value.indexOf("\n") !== 0) {

                /*
                 * Do two tests; one for space starting the line,
                 * and one for a comment comprised only of exceptions
                 */
                if (hasExceptions && !exceptionMatcher.test(node.value)) {
                    context.report(node, "Expected exception block, space or tab after " + commentIdentifier + " in comment.");
                } else if (!hasExceptions) {
                    context.report(node, "Expected space or tab after " + commentIdentifier + " in comment.");
                }
            }

        } else {

            if (node.value.indexOf(" ") === 0 || node.value.indexOf("\t") === 0) {
                context.report(node, "Unexpected space or tab after " + commentIdentifier + " in comment.");
            }
        }
    }

    return {

        "LineComment": checkCommentForSpace,
        "BlockComment": checkCommentForSpace

    };
};

module.exports.schema = [
    {
        "enum": ["always", "never"]
    },
    {
        "type": "object",
        "properties": {
            "exceptions": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "additionalProperties": false
    }
];
