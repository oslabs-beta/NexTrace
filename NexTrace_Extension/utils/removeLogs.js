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


    const transformedCode = ast.toSource();
    const cleanedCode = transformedCode.replace(';;', ';');
    return cleanedCode;

}

module.exports = { removeLogs };


// /*

// The code below erases this line:

// function captureAndSend(...args) {
// const content = args.map(arg => JSON.stringify(arg));

// fetch("http://localhost:3695", {
//     method: "POST",

//     headers: {
//         "Content-Type": "application/json"
//     },

//     body: JSON.stringify({
//         log: content
//         })
//     });
// }

// */

// ast.find(j.FunctionDeclaration, {
//     id: {
//         type: "Identifier",
//         name: "captureAndSend"
//     }
// }).forEach(path => {
//     j(path).remove();
// });