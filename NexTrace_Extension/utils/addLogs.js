/*

This file handles logic for adding boilerplate for every file *except* the root file that is selected.
It uses a function "captureAndSend<NUMBER-HERE>" that is inserted after any console log or fetch/axios request found in the file and then dispatches the contents to the extension's server.
It works in tandem with removeLog.js, which gets rid of all the code added here.

*/

const addLogs = (file, api, path, i) => {
    const j = api.jscodeshift.withParser('tsx');
    const ast = j(file.source);

    const rootNode = ast.get().node.program;

    //Checks if code already has boilerplate written, if true then no changes are made
    const check = ast.find(j.FunctionDeclaration, {
        id: {
            type: "Identifier",
            name: name => /^captureAndSend\d+$/.test(name)
        }
    })
    if (check.__paths.length > 0) return ast.toSource();

    /*

    The following code is used in the ast.find() to create captureAndSend(<ARGUMENTS GO HERE>)

    */

    function createCaptureAndSendInvocation(args) {
        return j.expressionStatement(
            j.callExpression(
                j.identifier(`captureAndSend${i}`),
                args
            )
        )
    }

    //Helper function to append found content with new content. 'statementPath' refers to an individual node path, such as in the ast.find().
    function insertContentAfter(statementPath, newContent) {

        let parentPath = statementPath;
        if (parentPath.node.type === 'VariableDeclarator') {
            while (parentPath && parentPath.node.type !== 'VariableDeclaration') {
                parentPath = parentPath.parentPath;
            }
            if (parentPath.node.type === 'VariableDeclaration') {
                try {
                    const index = ast.__paths[0].__childCache.program.node.body.indexOf(parentPath.node);
                    if (index !== -1) {
                        ast.__paths[0].__childCache.program.node.body.splice(index + 1, 0, newContent);
                    }
                } catch (err) {
                    console.error('error: ', err);
                }

            }
        } else {
            while (parentPath && parentPath.node.type !== 'ExpressionStatement') {
                parentPath = parentPath.parentPath;
            }
            if (parentPath && parentPath.node.type === 'ExpressionStatement') {
                parentPath.insertAfter(newContent);
            }
        }
    }

    //Find all the console logs.
    ast.find(j.CallExpression, {
        callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "console" },
            property: { type: "Identifier", name: "log" },
        }
    }).forEach(log => {
        const logArguments = log.node.arguments;
        //Create a new instance of invoking captureAndSend
        const funcExpression = createCaptureAndSendInvocation(logArguments);
        insertContentAfter(log, funcExpression);
    })


    //Find all fetch statements.
    ast.find(j.CallExpression, {
        callee: {
            name: 'fetch'
        }
    }).forEach(fetch => {
        const thenCallback = j.arrowFunctionExpression(
            [j.identifier('responseNT')],
            j.blockStatement([
                j.expressionStatement(
                    j.callExpression(
                        j.identifier(`captureAndSend${i}`),
                        [
                            j.identifier(fetch.value.arguments[0].name || fetch.value.arguments[0].extra.raw),
                            j.memberExpression(j.identifier('responseNT'), j.identifier('status')),
                            j.literal('NTASYNC')
                        ]
                    )
                ),
                j.returnStatement(j.identifier('responseNT'))
            ])
        );

        // Create a then call and replace the original fetch call
        const thenCall = j.callExpression(
            j.memberExpression(fetch.node, j.identifier('then')),
            [thenCallback]
        );
        fetch.replace(thenCall);
    })

    ast.find(j.CallExpression, {
        callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'axios' },
            property: { type: 'Identifier', name: 'get' }
        }
    }).forEach(get => {
        const thenCallback = j.arrowFunctionExpression(
            [j.identifier('responseNT')],
            j.blockStatement([
                j.expressionStatement(
                    j.callExpression(
                        j.identifier(`captureAndSend${i}`),
                        [
                            j.identifier(get.value.arguments[0].name || get.value.arguments[0].extra.raw),
                            j.memberExpression(j.identifier('responseNT'), j.identifier('status')),
                            j.literal('NTASYNC')
                        ]
                    )
                ),
                j.returnStatement(j.identifier('responseNT'))
            ])
        );

        // Create a then call and replace the original get call
        const thenCall = j.callExpression(
            j.memberExpression(get.node, j.identifier('then')),
            [thenCallback]
        );
        get.replace(thenCall);
    })


    //SEPARATES CONCERN FOR AWAIT SYNTAX
    // ast.find(j.VariableDeclarator, {
    //     init: {
    //         type: 'AwaitExpression'
    //     }
    // }).forEach(fetch => {
    //     const sendVariable = fetch.value.id.name;
    //     const funcExpression = j.expressionStatement(
    //         j.callExpression(
    //             j.identifier(`captureAndSend${i}`),
    //             [j.literal(
    //                 path
    //             ),
    //             j.memberExpression(
    //                 j.identifier(sendVariable),
    //                 j.identifier('status')
    //             ),
    //             j.literal(
    //                 'NTASYNC'
    //             )
    //             ]
    //         )
    //     )
    //     //Needs to be inserted after fetch. . .
    //     insertContentAfter(fetch, funcExpression);
    // })


    const fetchStatement = j.expressionStatement(
        j.callExpression(
            j.identifier('fetch'),
            [
                j.literal(`http://localhost:3695/getLogs?nocache=${Date.now()}`),
                j.objectExpression([
                    j.property(
                        'init',
                        j.identifier('method'),
                        j.literal('POST')
                    ),
                    j.property(
                        'init',
                        j.identifier('headers'),
                        j.objectExpression([
                            j.property(
                                'init',
                                j.literal('Content-Type'),
                                j.literal('application/json')
                            )
                        ])
                    ),
                    j.property(
                        'init',
                        j.identifier('body'),
                        j.callExpression(
                            j.memberExpression(
                                j.identifier('JSON'),
                                j.identifier('stringify')), [
                            j.objectExpression([
                                j.property(
                                    'init',
                                    j.identifier('log'),
                                    j.identifier('content')
                                ),
                                j.property(
                                    'init',
                                    j.identifier('path'),
                                    j.literal(path)
                                )
                            ],
                            )
                        ]
                        )
                    )
                ])
            ]
        )
    )

    /*

    The following code generates this using jscodeshift:

    function captureAndSend<NUMBER-HERE>(...args) {
        const content = args.map(arg => JSON.stringify(arg));

        fetch("http://localhost:3695", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                log: content
                path: <PATH-ARGUMENT-HERE>
            })
        });
    }

    */

    const dispatchFunctionStatement = j.functionDeclaration(
        j.identifier(`captureAndSend${i}`),
        [j.restElement(j.identifier('args'))],
        j.blockStatement([
            j.variableDeclaration(
                'const',
                [
                    j.variableDeclarator(
                        j.identifier('content'),
                        j.callExpression(
                            j.memberExpression(
                                j.identifier('args'),
                                j.identifier('map')
                            ),
                            [
                                j.arrowFunctionExpression(
                                    [j.identifier('arg')],
                                    j.callExpression(
                                        j.memberExpression(j.identifier('JSON'), j.identifier('stringify')),
                                        [j.identifier('arg')]
                                    )
                                )
                            ]
                        )
                    )
                ]
            ),
            fetchStatement
        ])
    );

    rootNode.body.unshift(dispatchFunctionStatement);

    const transformedCode = ast.toSource();
    const cleanedCode = transformedCode.replace(';;', ';');
    return cleanedCode;
}

module.exports = { addLogs };


//EXTRA STUFF

/*


    //Adding the dispatcher function to each file.  Problem?
    // rootNode.body.unshift(dispatchFunctionStatement);


    // const transformedCode = ast.toSource();
    // const cleanedCode = transformedCode.replace(';;', ';');
    // return transformedCode;
    // return cleanedCode;

//  /*

//     The following code generates this using jscodeshift:

//     fetch("http://localhost:3695", {
//         method: "POST",

//         headers: {
//             "Content-Type": "application/json"
//         },

//         body: JSON.stringify({
//             log: content,
//             path: <PATH-ARGUMENT-HERE>
//         })
//     });

//     */

//     const fetchStatement = j.expressionStatement(
//         j.callExpression(
//             j.identifier('fetch'),
//             [
//                 j.literal('http://localhost:3695'),
//                 j.objectExpression([
//                     j.property(
//                         'init',
//                         j.identifier('method'),
//                         j.literal('POST')
//                     ),
//                     j.property(
//                         'init',
//                         j.identifier('headers'),
//                         j.objectExpression([
//                             j.property(
//                                 'init',
//                                 j.literal('Content-Type'),
//                                 j.literal('application/json')
//                             )
//                         ])
//                     ),
//                     j.property(
//                         'init',
//                         j.identifier('body'),
//                         j.callExpression(
//                             j.memberExpression(
//                                 j.identifier('JSON'),
//                                 j.identifier('stringify')), [
//                             j.objectExpression([
//                                 j.property(
//                                     'init',
//                                     j.identifier('log'),
//                                     j.identifier('content')
//                                 )
//                             ],
//                                 j.property(
//                                     'init',
//                                     j.identifier('path'),
//                                     j.literal(path)
//                                 )
//                             )
//                         ]
//                         )
//                     )
//                 ])
//             ]
//         )
//     )

//     /*

//     The following code generates this using jscodeshift:

//     function captureAndSend(...args) {
//         const content = args.map(arg => JSON.stringify(arg));

//         fetch("http://localhost:3695", {
//             method: "POST",

//             headers: {
//                 "Content-Type": "application/json"
//             },

//             body: JSON.stringify({
//                 log: content
//                 path: <PATH-ARGUMENT-HERE>
//             })
//         });
//     }

//     */

//     const dispatchFunctionStatement = j.functionDeclaration(
//         j.identifier('captureAndSend'),
//         [j.restElement(j.identifier('args'))],
//         j.blockStatement([
//             j.variableDeclaration(
//                 'const',
//                 [
//                     j.variableDeclarator(
//                         j.identifier('content'),
//                         j.callExpression(
//                             j.memberExpression(
//                                 j.identifier('args'),
//                                 j.identifier('map')
//                             ),
//                             [
//                                 j.arrowFunctionExpression(
//                                     [j.identifier('arg')],
//                                     j.callExpression(
//                                         j.memberExpression(j.identifier('JSON'), j.identifier('stringify')),
//                                         [j.identifier('arg')]
//                                     )
//                                 )
//                             ]
//                         )
//                     )
//                 ]
//             ),
//             fetchStatement
//         ])
//     );

