/**
 * @generated SignedSource<<e45283dd578001d43e591a03d0ed2a06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type authGenerateAvatarUploadUrlMutation$variables = {
  contentType: string;
  filename: string;
};
export type authGenerateAvatarUploadUrlMutation$data = {
  readonly generateAvatarUploadUrl: {
    readonly key: string;
    readonly url: string;
  };
};
export type authGenerateAvatarUploadUrlMutation = {
  response: authGenerateAvatarUploadUrlMutation$data;
  variables: authGenerateAvatarUploadUrlMutation$variables;
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
    "name": "generateAvatarUploadUrl",
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
    "name": "authGenerateAvatarUploadUrlMutation",
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
    "name": "authGenerateAvatarUploadUrlMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6a7270854dbea8e950d7e45dcf2f7f72",
    "id": null,
    "metadata": {},
    "name": "authGenerateAvatarUploadUrlMutation",
    "operationKind": "mutation",
    "text": "mutation authGenerateAvatarUploadUrlMutation(\n  $filename: String!\n  $contentType: String!\n) {\n  generateAvatarUploadUrl(filename: $filename, contentType: $contentType) {\n    url\n    key\n  }\n}\n"
  }
};
})();

(node as any).hash = "829e4d1ee1e15054a66829bade1a9558";

export default node;
