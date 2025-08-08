/**
 * @generated SignedSource<<1d189d6e8d1b023a8f68a2c2a7a6714c>>
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
export type passkeyVerifyAuthenticationMutation$variables = {
  input: VerifyPasskeyAuthenticationInput;
};
export type passkeyVerifyAuthenticationMutation$data = {
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
export type passkeyVerifyAuthenticationMutation = {
  response: passkeyVerifyAuthenticationMutation$data;
  variables: passkeyVerifyAuthenticationMutation$variables;
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
    "name": "passkeyVerifyAuthenticationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "passkeyVerifyAuthenticationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4ec5fbd88c2aa82a4b636e305430d00e",
    "id": null,
    "metadata": {},
    "name": "passkeyVerifyAuthenticationMutation",
    "operationKind": "mutation",
    "text": "mutation passkeyVerifyAuthenticationMutation(\n  $input: VerifyPasskeyAuthenticationInput!\n) {\n  verifyPasskeyAuthentication(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      phone\n      avatarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2d5793861dd487219481908436239c62";

export default node;
