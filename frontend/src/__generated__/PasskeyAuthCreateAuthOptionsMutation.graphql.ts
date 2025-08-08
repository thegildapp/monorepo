/**
 * @generated SignedSource<<4750d5338366c4de581667ae7af6bf46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasskeyAuthCreateAuthOptionsMutation$variables = {
  email: string;
};
export type PasskeyAuthCreateAuthOptionsMutation$data = {
  readonly createPasskeyAuthenticationOptions: {
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type PasskeyAuthCreateAuthOptionsMutation = {
  response: PasskeyAuthCreateAuthOptionsMutation$data;
  variables: PasskeyAuthCreateAuthOptionsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "createPasskeyAuthenticationOptions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "publicKey",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PasskeyAuthCreateAuthOptionsMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PasskeyAuthCreateAuthOptionsMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "48e0de7bb892d94e71690d1b58bb2314",
    "id": null,
    "metadata": {},
    "name": "PasskeyAuthCreateAuthOptionsMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyAuthCreateAuthOptionsMutation(\n  $email: String!\n) {\n  createPasskeyAuthenticationOptions(email: $email) {\n    publicKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f9bb7555da17452f71e579272df9cc4";

export default node;
