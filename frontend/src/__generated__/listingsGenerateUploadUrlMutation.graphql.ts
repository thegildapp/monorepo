/**
 * @generated SignedSource<<6221f3c67614f8d25c1285be903e30ef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type listingsGenerateUploadUrlMutation$variables = {
  contentType: string;
  filename: string;
};
export type listingsGenerateUploadUrlMutation$data = {
  readonly generateUploadUrl: {
    readonly key: string;
    readonly url: string;
  };
};
export type listingsGenerateUploadUrlMutation = {
  response: listingsGenerateUploadUrlMutation$data;
  variables: listingsGenerateUploadUrlMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "contentType"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filename"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "contentType",
        "variableName": "contentType"
      },
      {
        "kind": "Variable",
        "name": "filename",
        "variableName": "filename"
      }
    ],
    "concreteType": "UploadUrl",
    "kind": "LinkedField",
    "name": "generateUploadUrl",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "url",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "key",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsGenerateUploadUrlMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "listingsGenerateUploadUrlMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "9a4f018b18931b8a0b0de165b948ad0e",
    "id": null,
    "metadata": {},
    "name": "listingsGenerateUploadUrlMutation",
    "operationKind": "mutation",
    "text": "mutation listingsGenerateUploadUrlMutation(\n  $filename: String!\n  $contentType: String!\n) {\n  generateUploadUrl(filename: $filename, contentType: $contentType) {\n    url\n    key\n  }\n}\n"
  }
};
})();

(node as any).hash = "76be4890526ea8caac0243cb1d75ebc2";

export default node;
