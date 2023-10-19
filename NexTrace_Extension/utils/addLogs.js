const addLogs = (file, api, path, i) => {
    const j = api.jscodeshift.withParser('tsx');
    const ast = j(file.source);

    const rootNode = ast.get().node.program;

    //Checks if code already have boilerplate written, if true then returns back to source
    const check = ast.find(j.FunctionDeclaration, {
        id: {
            type: "Identifier",
            name: name => /^captureAndSend\d+$/.test(name)
        }
    })
    if(check.__paths.length > 0) return ast.toSource();

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
        while (parentPath && parentPath.node.type !== 'ExpressionStatement') {
            parentPath = parentPath.parentPath;
        }

        if (parentPath && parentPath.node.type === 'ExpressionStatement') {
            parentPath.insertAfter(newContent);
        }
    }

    //Find all the console logs and 

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

    const fetchStatement = j.expressionStatement(
        j.callExpression(
            j.identifier('fetch'),
            [
                j.literal('http://localhost:3695/getLogs'),
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

