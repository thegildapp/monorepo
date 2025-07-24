/**
 * @generated SignedSource<<0348eedf7c5777f1dfbe1d69a2b2a308>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type imageUploadGenerateUploadUrlMutation$variables = {
  contentType: string;
  filename: string;
};
export type imageUploadGenerateUploadUrlMutation$data = {
  readonly generateUploadUrl: {
    readonly key: string;
    readonly url: string;
  };
};
export type imageUploadGenerateUploadUrlMutation = {
  response: imageUploadGenerateUploadUrlMutation$data;
  variables: imageUploadGenerateUploadUrlMutation$variables;
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
    "name": "imageUploadGenerateUploadUrlMutation",
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
    "name": "imageUploadGenerateUploadUrlMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "50f66f315b25800192ec95bae3c950d5",
    "id": null,
    "metadata": {},
    "name": "imageUploadGenerateUploadUrlMutation",
    "operationKind": "mutation",
    "text": "mutation imageUploadGenerateUploadUrlMutation(\n  $filename: String!\n  $contentType: String!\n) {\n  generateUploadUrl(filename: $filename, contentType: $contentType) {\n    url\n    key\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8d574603e206df984bafc61c9d5df62";

export default node;
