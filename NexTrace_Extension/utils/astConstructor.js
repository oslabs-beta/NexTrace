const transformer = (file, api, path) => {
    const j = api.jscodeshift.withParser('tsx');
    const ast = j(file.source);

    const rootNode = ast.get().node.program;

    //Checks if code already have boilerplate written, if true then returns back to source
    const check = ast.find(j.VariableDeclarator, {
        id: { type: "Identifier", name: "collectorOptions" },
        init: {
            type: "ObjectExpression",
        }
    });
    if (check.__paths.length > 0) return ast.toSource();



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
                        j.identifier(`captureAndSendNT`),
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
                        j.identifier(`captureAndSendNT`),
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

    /*

    The following code generates this using jscodeshift:
     const {
        trace: trace
        } = require("@opentelemetry/api");

    */
    const traceRequireStatement = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.objectPattern([
                    j.property(
                        'init',
                        j.identifier('trace'),
                        j.identifier('trace')
                    )
                ]),
                j.callExpression(
                    j.identifier('require'),
                    [j.literal('@opentelemetry/api')]
                )
            )
        ]
    );

    /*

    The following code generates this using jscodeshift:

    const { OTLPTraceExporter: OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-http');

    */
    const OTLPTraceExporterRequireStatement = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.objectPattern([
                    j.property(
                        'init',
                        j.identifier('OTLPTraceExporter'),
                        j.identifier('OTLPTraceExporter')
                    )
                ]),
                j.callExpression(
                    j.identifier('require'),
                    [j.literal('@opentelemetry/exporter-trace-otlp-http')]
                )
            )
        ]
    );

    /*

    The following code generates this using jscodeshift:
    
    const {
    BasicTracerProvider: BasicTracerProvider,
    SimpleSpanProcessor: SimpleSpanProcessor
    } = require("@opentelemetry/sdk-trace-base");

    */
    const traceBaseRequireStatemt = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.objectPattern([
                    j.property(
                        'init',
                        j.identifier('BasicTracerProvider'),
                        j.identifier('BasicTracerProvider')
                    ),
                    j.property(
                        'init',
                        j.identifier('SimpleSpanProcessor'),
                        j.identifier('SimpleSpanProcessor')
                    )
                ]),
                j.callExpression(
                    j.identifier('require'),
                    [j.literal('@opentelemetry/sdk-trace-base')]
                )
            )
        ]
    )

    /*

    The following code generates this using jscodeshift:

    const collectorOptions = {
  url: 'http://localhost:3695/otel', 
};

    */

    const collectorOptionsDeclaration = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.identifier('collectorOptions'),
                j.objectExpression(
                    [
                        j.property(
                            'init',
                            j.identifier('url'),
                            j.literal('http://localhost:3695/otel')
                        )
                    ]
                )
            )
        ]
    )

    /*

    The following code generates this using jscodeshift:

    const provider = new BasicTracerProvider();

    */

    const providerDeclarationStatement = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.identifier('provider'),
                j.newExpression(
                    j.identifier('BasicTracerProvider'),
                    []
                )
            )
        ]
    )

    /*

    The following code generates this using jscodeshift:

    const exporter = new OTLPTraceExporter(collectorOptions);

    */

    const exporterDeclarationStatement = j.variableDeclaration(
        'const',
        [
            j.variableDeclarator(
                j.identifier('exporter'),
                j.newExpression(
                    j.identifier('OTLPTraceExporter'),
                    [j.identifier('collectorOptions')]
                )
            )
        ]
    )

    /*
 
    The following code generates this using jscodeshift:

    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    */

    const setGlobalTracerStatement = j.expressionStatement(
        j.callExpression(
            j.memberExpression(
                j.identifier('trace'), j.identifier('setGlobalTracerProvider')
            ),
            [j.identifier('provider')]
        )
    )

    /*
    
    The following code generates this using jscodeshift:

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    */

    const addSpanProcessorStatement = j.expressionStatement(
        j.callExpression(
            j.memberExpression(
                j.identifier('provider'), j.identifier('addSpanProcessor')
            ),
            [
                j.newExpression(
                    j.identifier('SimpleSpanProcessor'),
                    [
                        j.identifier('exporter')
                    ]
                )
            ]
        )
    )

    /*
    
    The following code generates this using jscodeshift:

    provider.register();

    */

    const providerRegisterStatement = j.expressionStatement(
        j.callExpression(
            j.memberExpression(
                j.identifier('provider'), j.identifier('register')
            ), []
        )
    )

    /*

    The following code generates this using jscodeshift:
    
    fetch("http://localhost:3695/getLogs?nocache=<DATE-HERE>", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            log: content
        })
    });

    */

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
                                    j.literal(`${path}`)
                                )
                            ])
                        ]
                        )
                    )
                ])
            ]
        )
    )

    /*

    The following code generates this using jscodeshift:

    function captureAndSend(...args) {
        const content = args.map(arg => JSON.stringify(arg));

        fetch("http://localhost:3695", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                log: content
            })
        });
    }

    */

    const dispatchFunctionStatement = j.functionDeclaration(
        j.identifier('captureAndSendNT'),
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


    const processExpression = (node) => {
        if (node.type === 'Literal') {
            return node;
        }
        else if (node.type === 'Identifier') {
            return node.name;
        }
        else if (node.type === 'BinaryExpression') {
            const left = processExpression(node.left);
            const operator = node.operator;
            const right = processExpression(node.right);
            return j.binaryExpression(node.operator, processExpression(node.left), processExpression(node.right));
        }
        else if (node.type === 'CallExpression') {
            const callee = processExpression(node.callee);
            const args = node.arguments.map(processExpression).join(', ');
            return j.callExpression(processExpression(node.callee), node.arguments.map(processExpression));
        }
        else if (node.type === 'MemberExpression') {
            const object = processExpression(node.object);
            const property = node.computed ? `[${processExpression(node.property)}]` : `.${processExpression(node.property)}`;
            return `${object}${property}`;
        }
    }

    /*

    The following code is used in the ast.find() to create captureAndSend(<ARGUMENTS GO HERE>)

    */

    function createCaptureAndSendInvocation(args) {
        return j.expressionStatement(
            j.callExpression(
                j.identifier('captureAndSendNT'),
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

    rootNode.body.unshift(dispatchFunctionStatement);
    rootNode.body.unshift(providerRegisterStatement);
    rootNode.body.unshift(setGlobalTracerStatement);
    rootNode.body.unshift(addSpanProcessorStatement);
    rootNode.body.unshift(exporterDeclarationStatement);
    rootNode.body.unshift(providerDeclarationStatement);
    rootNode.body.unshift(collectorOptionsDeclaration);
    rootNode.body.unshift(traceBaseRequireStatemt);
    rootNode.body.unshift(OTLPTraceExporterRequireStatement);
    rootNode.body.unshift(traceRequireStatement);

    return ast.toSource();

}

module.exports = { transformer };


/*

---BELOW IS THE STRATEGY---

(***user logs console***)
const arg1 = 'hello world.';
console.log(arg1);

(***we capture it and dispatch it to our helper function***)
captureAndSend(arg1) // --> hello world.


---THE BOILER-PLATE CODE WE WANT TO PREPEND---

const { trace } = require('@opentelemetry/api');
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');
 const provider = new BasicTracerProvider();
 provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));  ---WAIT FOR THIS ONE
 trace.setGlobalTracerProvider(provider);


*/

//Babel parser.
//npx jscodeshift -t utils/astConstructor.js utils/testFile.ts --parser=babel

//If the babel parser fails, try the ts parser.
//npx jscodeshift -t utils/astConstructor.js utils/testFile.ts --parser=ts