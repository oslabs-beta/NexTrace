/*

This file handles logic for removing boilerplate for every file *except* the root file that is selected.
It works in tandem with addLog.js, which added of all the code that gets removed here.

*/

const removeLogs = (file, api, i) => {
    const j = api.jscodeshift.withParser('tsx');
    const ast = j(file.source);

    ast.find(j.FunctionDeclaration, {
        id: {
            type: "Identifier",
            name: name => /^captureAndSend\d+$/.test(name)
        }
    }).forEach(path => {
        j(path).remove();
    });


    /*
    
    The code below erases this line:
    
    captureAndSend(<ANY ARGUMENTS>);
    
    */

    ast.find(j.CallExpression, {
        callee: {
            type: "Identifier",
            name: name => /^captureAndSend\d+$/.test(name)
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below reverts fetch call expressions back to their original form.

    */

    ast.find(j.CallExpression, {
        callee: {
            type: 'MemberExpression',
            property: {
                type: 'Identifier',
                name: 'then'
            }
        },
        arguments: {
            0: {
                type: 'ArrowFunctionExpression',
                params: [
                    {
                        type: 'Identifier',
                        name: 'responseNT'
                    }
                ]
            }
        }
    }).forEach(path => {
        path.replace(path.node.callee.object);
    })

    const transformedCode = ast.toSource();
    const cleanedCode = transformedCode.replace(';;', ';');
    return cleanedCode;

}

module.exports = { removeLogs };
