const detransformer = (file, api, path) => {
    const j = api.jscodeshift.withParser('tsx');
    const ast = j(file.source);

    /*

    The code below erases this line:

    captureAndSend(<ANY ARGUMENTS>);

    */

    ast.find(j.CallExpression, {
        callee: {
            type: "Identifier",
            name: "captureAndSendNT"
        }
    }).forEach(path => {
        j(path).remove();
    });

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

    /*

    The code below erases this line:

    provider.register();

    */

    ast.find(j.CallExpression, {
        callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "provider" },
            property: { type: "Identifier", name: "register" }
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

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

    ast.find(j.FunctionDeclaration, {
        id: {
            type: "Identifier",
            name: "captureAndSendNT"
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    */

    ast.find(j.CallExpression, {
        callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "provider" },
            property: { type: "Identifier", name: "addSpanProcessor" }
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    trace.setGlobalTracerProvider(provider);

    */

    ast.find(j.CallExpression, {
        callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "trace" },
            property: { type: "Identifier", name: "setGlobalTracerProvider" }
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    const exporter = new OTLPTraceExporter(collectorOptions);

    */

    ast.find(j.VariableDeclarator, {
        id: {
            type: "Identifier",
            name: "exporter"
        },
        init: {
            type: "NewExpression",
            callee: { type: "Identifier", name: "OTLPTraceExporter" }
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    const provider = new BasicTracerProvider();

    */

    ast.find(j.VariableDeclarator, {
        id: { type: "Identifier", name: "provider" },
        init: {
            type: "NewExpression",
            callee: {
                type: "Identifier",
                name: "BasicTracerProvider"
            }
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    const collectorOptions = {
        url: "http://localhost:3695/otel"
    };

    */

    ast.find(j.VariableDeclarator, {
        id: { type: "Identifier", name: "collectorOptions" },
        init: {
            type: "ObjectExpression",
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    const {
        BasicTracerProvider: BasicTracerProvider,
        SimpleSpanProcessor: SimpleSpanProcessor
    } = require("@opentelemetry/sdk-trace-base");

    */

    ast.find(j.VariableDeclarator, {
        id: {
            type: "ObjectPattern",
            properties: [{
                key: {
                    type: "Identifier",
                    name: "BasicTracerProvider"
                },
                value: {
                    type: "Identifier",
                    name: "BasicTracerProvider"
                }
            },
            {
                key: {
                    type: "Identifier",
                    name: "SimpleSpanProcessor"
                },
                value: {
                    type: "Identifier",
                    name: "SimpleSpanProcessor"
                }
            }
            ]
        }
    }).forEach(path => {
        j(path).remove();
    });


    /*

    The code below erases this line:

    const {
        OTLPTraceExporter: OTLPTraceExporter
    } = require("@opentelemetry/exporter-trace-otlp-http");

    */

    ast.find(j.VariableDeclarator, {
        id: {
            type: "ObjectPattern",
            properties: [{
                key: {
                    type: "Identifier",
                    name: "OTLPTraceExporter"
                },
                value: {
                    type: "Identifier",
                    name: "OTLPTraceExporter"
                }
            }]
        }
    }).forEach(path => {
        j(path).remove();
    });

    /*

    The code below erases this line:

    const {
        trace: trace
    } = require("@opentelemetry/api");

    */

    ast.find(j.VariableDeclarator, {
        id: {
            type: "ObjectPattern",
            properties: [{
                key: {
                    type: "Identifier",
                    name: "trace"
                },
                value: {
                    type: "Identifier",
                    name: "trace"
                }
            }]
        }
    }).forEach(path => {
        j(path).remove();
    })

    return ast.toSource();
}

module.exports = { detransformer };
