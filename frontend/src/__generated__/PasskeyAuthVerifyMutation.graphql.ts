/**
 * @generated SignedSource<<c39d0c5d8896cfa9bf80360bec313d23>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VerifyPasskeyAuthenticationInput = {
  email: string;
  response: string;
};
export type PasskeyAuthVerifyMutation$variables = {
  input: VerifyPasskeyAuthenticationInput;
};
export type PasskeyAuthVerifyMutation$data = {
  readonly verifyPasskeyAuthentication: {
    readonly token: string | null | undefined;
    readonly user: {
      readonly avatarUrl: string | null | undefined;
      readonly email: string;
      readonly id: string;
      readonly name: string;
      readonly phone: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type PasskeyAuthVerifyMutation = {
  response: PasskeyAuthVerifyMutation$data;
  variables: PasskeyAuthVerifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "verifyPasskeyAuthentication",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "token",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "phone",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "avatarUrl",
            "storageKey": null
          }
        ],
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
    "name": "PasskeyAuthVerifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PasskeyAuthVerifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6626ddc9a9bf5d13bef1ea40a4824e15",
    "id": null,
    "metadata": {},
    "name": "PasskeyAuthVerifyMutation",
    "operationKind": "mutation",
    "text": "mutation PasskeyAuthVerifyMutation(\n  $input: VerifyPasskeyAuthenticationInput!\n) {\n  verifyPasskeyAuthentication(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca4b2c3aa97962404648fc874bc90392";

export default node;
