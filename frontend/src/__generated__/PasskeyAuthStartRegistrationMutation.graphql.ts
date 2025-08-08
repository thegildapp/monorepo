/**
 * @generated SignedSource<<00a8d19e1515b834ab5a1b0c33bf14bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PasskeyAuthStartRegistrationMutation$variables = {
  email: string;
  name: string;
};
export type PasskeyAuthStartRegistrationMutation$data = {
  readonly startPasskeyRegistration: {
    readonly publicKey: string | null | undefined;
  } | null | undefined;
};
export type PasskeyAuthStartRegistrationMutation = {
  response: PasskeyAuthStartRegistrationMutation$data;
  variables: PasskeyAuthStartRegistrationMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
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
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "startPasskeyRegistration",
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
    "name": "PasskeyAuthStartRegistrationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PasskeyAuthStartRegistrationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "318aa1860e8508ca7565d863a3dcfe94",
    "id": null,
    "metadata": {},
    "name": "PasskeyAuthStartRegistrationMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyAuthStartRegistrationMutation(\n  $email: String!\n  $name: String!\n) {\n  startPasskeyRegistration(email: $email, name: $name) {\n    publicKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "7ff16b14d8f595f525d9a72f8e2692fc";

export default node;
