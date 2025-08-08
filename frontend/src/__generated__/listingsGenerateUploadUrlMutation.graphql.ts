/**
 * @generated SignedSource<<794ada191cc00ae9e1300475d974190d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type listingsGenerateUploadUrlMutation$variables = {
  contentType: string;
  fileSize?: number | null | undefined;
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
  "name": "fileSize"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filename"
},
v3 = [
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
        "name": "fileSize",
        "variableName": "fileSize"
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
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "listingsGenerateUploadUrlMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "listingsGenerateUploadUrlMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "d761a0d32f121caf7eff711958a9d064",
    "id": null,
    "metadata": {},
    "name": "listingsGenerateUploadUrlMutation",
    "operationKind": "mutation",
    "text": "mutation listingsGenerateUploadUrlMutation(\n  $filename: String!\n  $contentType: String!\n  $fileSize: Int\n) {\n  generateUploadUrl(filename: $filename, contentType: $contentType, fileSize: $fileSize) {\n    url\n    key\n  }\n}\n"
  }
};
})();

(node as any).hash = "73205d99541c1400815d2eaf3d92b1ba";

export default node;
